import { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import toast from 'react-hot-toast';
import { callOpenAIBridge } from '../../../utils/openaiBridge';

const RECIPE_STYLES = ['grelhado(a)', 'refogado(a)', 'assado(a) no forno', 'na air fryer', 'cru(a) em salada', 'cozido(a) no vapor', 'em formato de wrap/enrolado', 'em formato de omelete/frittata', 'em formato de bowl'];

// Compartilhado entre QuestBoard.jsx (check-in do dia) e DietPlan.jsx (plano
// completo) — os dois precisam gerar/regenerar a mesma "Receita da IA" por
// refeição, com a mesma lógica de variedade e o mesmo histórico salvo no
// perfil do paciente.
export function useAiRecipe(activePatient) {
  const { updatePatient } = useAppContext();
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [loadingMealIdx, setLoadingMealIdx] = useState(null);

  const toggleRecipe = (mIdx) => {
    setExpandedRecipes(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));
  };

  const getSavedRecipe = (recipeTitle, mealName) => activePatient.aiRecipes?.[`${recipeTitle}-${mealName}`];

  const handleGenerateRecipe = async (meal, mIdx, recipeTitle) => {
    setLoadingMealIdx(mIdx);
    setIsRecipeLoading(true);
    setExpandedRecipes(prev => ({ ...prev, [mIdx]: true }));

    try {
      const foodsList = meal.foods
        ? meal.foods.map(f => `${f.amount}g de ${f.name}`).join(', ')
        : (meal.desc || 'alimentos variados');
      const aversions = activePatient?.aversions || 'Nenhuma aversão registrada';
      // Regerar pede exatamente os mesmos ingredientes de novo -- sem sinalizar
      // isso pro modelo, ele converge quase sempre pra mesma sugestão óbvia
      // (ex: ovo+aveia+banana -> panqueca, toda vez). Passamos a receita
      // anterior como exemplo do que NÃO repetir, mais uma dica de estilo
      // sorteada, pra forçar variedade real em vez de depender só do random
      // da API.
      const recipeKey = `${recipeTitle}-${meal.name}`;
      const previousRecipe = activePatient.aiRecipes?.[recipeKey];
      const suggestedStyle = RECIPE_STYLES[Math.floor(Math.random() * RECIPE_STYLES.length)];

      let prompt = `Você é um Chef Nutricional da Nutrivvo. Sua missão é sugerir uma receita prática e rápida utilizando os seguintes ingredientes: ${foodsList}. Se precisar, pode adicionar temperos básicos (sal, pimenta, azeite, ervas).
      INSTRUÇÕES:
      - O paciente NÃO COME (aversões/restrições): ${aversions}. JAMAIS use esses ingredientes.
      - Retorne em formato Markdown (## Nome da Receita, ### Ingredientes, ### Modo de Preparo).
      - Mantenha a resposta super focada na praticidade para o dia a dia.
      - Experimente um preparo no estilo "${suggestedStyle}" pra trazer variedade.`;

      if (previousRecipe) {
        prompt += `\n\nIMPORTANTE: o paciente já viu a receita abaixo e pediu uma NOVA opção. NÃO repita o mesmo nome nem o mesmo modo de preparo -- gere algo genuinamente diferente:\n---\n${previousRecipe}\n---`;
      }

      const data = await callOpenAIBridge({
        system_prompt: "Você é um assistente culinário focado em dietas de alta performance. Você é criativo e nunca repete a mesma sugestão duas vezes para o mesmo pedido.",
        messages: [{ role: 'user', content: prompt }]
      });
      const content = data.choices[0].message.content;

      // Salva no banco de dados do paciente para não perder ao trocar de aba
      const newAiRecipes = { ...(activePatient.aiRecipes || {}) };
      newAiRecipes[recipeKey] = content;

      // Histórico completo (aiRecipes só guarda a última por refeição -- toda
      // vez que o paciente "Regerar", a anterior some. Guardamos cada geração
      // aqui pra ele poder buscar receitas antigas depois.)
      const newAiRecipeHistory = [
        ...(activePatient.aiRecipeHistory || []),
        { id: Date.now().toString(), mealName: meal.name, recipeTitle, content, date: new Date().toISOString() }
      ];

      updatePatient(activePatient.id, { aiRecipes: newAiRecipes, aiRecipeHistory: newAiRecipeHistory });

    } catch (err) {
      console.error('Erro ao gerar receita com IA:', err);
      toast.error(err.message || 'Infelizmente não foi possível gerar a receita no momento. Verifique sua conexão e tente novamente.');
      setExpandedRecipes(prev => ({ ...prev, [mIdx]: false }));
    } finally {
      setIsRecipeLoading(false);
      setLoadingMealIdx(null);
    }
  };

  return { expandedRecipes, toggleRecipe, isRecipeLoading, loadingMealIdx, handleGenerateRecipe, getSavedRecipe };
}
