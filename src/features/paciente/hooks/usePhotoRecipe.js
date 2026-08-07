import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../../context/AppContext';
import { callOpenAIBridge } from '../../../utils/openaiBridge';

// Fotos de câmera podem chegar com vários MB; a Vercel rejeita (413) requisições
// acima de ~4.5MB antes mesmo de chegar na função serverless. Reduzimos a imagem
// no navegador antes de enviar para a IA, evitando o estouro do limite.
// (Cópia local proposital -- este hook é uma feature nova e independente,
// não deve depender de QuestBoard.jsx nem alterá-lo.)
const MAX_PHOTO_DIMENSION = 1280;
const PHOTO_JPEG_QUALITY = 0.75;
// Limite de fotos por geração: mantém o payload da requisição (base64 x N)
// dentro do limite de ~4.5MB da Vercel com folga.
export const MAX_PHOTOS = 4;

function compressImageFile(file, maxDimension = MAX_PHOTO_DIMENSION, quality = PHOTO_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível processar essa foto.'));
    };
    img.src = objectUrl;
  });
}

/**
 * Extrai o título (primeiro "## Título" markdown) do conteúdo gerado pela IA
 * para exibir como cabeçalho do card, com fallback caso a IA fuja do formato.
 * @param {string} content
 * @returns {string}
 */
export function extractRecipeTitle(content) {
  const match = content.match(/^##\s+(.+)$/m);
  return match ? match[1].trim() : 'Receita por Foto';
}

function buildPrompt({ restrictions, aversions, previousContent }) {
  const regenInstruction = previousContent
    ? `\n5) Esta é uma REGERAÇÃO: o paciente não gostou da sugestão anterior e quer outra opção. Sugira uma receita DIFERENTE da anterior, sem repetir o mesmo prato. Receita anterior (para você não repetir):\n${previousContent}`
    : '';

  return `Você é um Chef Nutricional da Nutrivvo. O usuário fotografou os ingredientes que tem disponíveis agora (geladeira, despensa, bancada) -- pode ser mais de uma foto do mesmo ambiente, de ângulos ou prateleiras diferentes.
INSTRUÇÕES:
1) Liste em tópicos os ingredientes que você reconhece no conjunto de fotos.
2) Sugira UMA receita prática e rápida usando o máximo possível desses ingredientes. Pode complementar com temperos básicos (sal, pimenta, azeite, ervas) e itens simples de despensa.
3) O paciente NÃO PODE comer (restrições/aversões): ${restrictions} | ${aversions}. JAMAIS use esses ingredientes, mesmo que apareçam nas fotos.
4) Se as fotos não tiverem ingredientes reconhecíveis o suficiente para montar uma receita, explique isso educadamente em vez de inventar.${regenInstruction}
Retorne em formato Markdown (## Nome da Receita, ### Ingredientes Identificados, ### Modo de Preparo).`;
}

// Feature independente "Receita por Foto": o paciente fotografa os
// ingredientes que tem disponíveis (geladeira, despensa, bancada) e a IA
// sugere uma receita pronta com eles. Histórico fica em
// activePatient.photoRecipes -- campo próprio, separado de aiRecipes /
// aiRecipeHistory (regeneração da dieta, usada em DietPlan/QuestBoard) e dos
// foodLogs do diário alimentar (análise de refeição já feita). Nenhum desses
// fluxos existentes é lido ou alterado por este hook.
export function usePhotoRecipe(activePatient) {
  const { updatePatient } = useAppContext();
  const [stagedPhotos, setStagedPhotos] = useState([]); // [{ id, base64 }]
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  // Guarda as fotos já comprimidas da última geração desta sessão, pra permitir
  // "Regerar" sem re-pedir foto nem persistir imagens no Firestore. Só vale
  // pra receita mais recente gerada agora -- histórico antigo não tem mais as
  // fotos em memória, então não oferece regeneração.
  const [regenContext, setRegenContext] = useState(null); // { recipeId, photos: [base64,...] }
  const fileInputRef = useRef(null);

  const photoRecipes = activePatient?.photoRecipes || [];

  const triggerPhotoSelect = () => {
    if (stagedPhotos.length >= MAX_PHOTOS) {
      toast.error(`Você pode enviar no máximo ${MAX_PHOTOS} fotos por vez.`);
      return;
    }
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const base64 = await compressImageFile(file);
      setStagedPhotos(prev => [...prev, { id: `${Date.now()}-${prev.length}`, base64 }]);
    } catch (err) {
      toast.error(err.message || 'Não foi possível processar essa foto.');
    }
  };

  const removeStagedPhoto = (photoId) => {
    setStagedPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const runGeneration = async (photos, previousContent = null) => {
    setAnalyzing(true);
    try {
      const restrictions = activePatient?.restrictions || 'Nenhuma restrição registrada';
      const aversions = activePatient?.aversions || 'Nenhuma aversão registrada';
      const promptText = buildPrompt({ restrictions, aversions, previousContent });

      const data = await callOpenAIBridge({
        system_prompt: 'Você é um assistente culinário da Nutrivvo, especialista em criar receitas práticas a partir de ingredientes disponíveis, sempre respeitando restrições alimentares do paciente.',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            ...photos.map(base64 => ({ type: 'image_url', image_url: { url: base64 } })),
          ],
        }],
      });

      return data.choices[0].message.content;
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRecipe = async () => {
    if (stagedPhotos.length === 0 || analyzing) return;
    const photos = stagedPhotos.map(p => p.base64);

    try {
      const content = await runGeneration(photos);
      const newEntry = { id: Date.now().toString(), content, date: new Date().toLocaleDateString('pt-BR') };
      updatePatient(activePatient.id, { photoRecipes: [newEntry, ...photoRecipes] });
      setExpandedId(newEntry.id);
      setRegenContext({ recipeId: newEntry.id, photos });
      setStagedPhotos([]);
    } catch (err) {
      console.error('Erro ao gerar receita por foto:', err);
      toast.error(err.message || 'Não consegui analisar essas fotos agora. Tente novamente em instantes.');
    }
  };

  const canRegenerate = (recipeId) => !analyzing && regenContext?.recipeId === recipeId;

  const regenerateRecipe = async (recipeId) => {
    if (!canRegenerate(recipeId)) return;
    const current = photoRecipes.find(r => r.id === recipeId);

    try {
      const content = await runGeneration(regenContext.photos, current?.content);
      const updatedList = photoRecipes.map(r => (
        r.id === recipeId ? { ...r, content, date: new Date().toLocaleDateString('pt-BR') } : r
      ));
      updatePatient(activePatient.id, { photoRecipes: updatedList });
      setExpandedId(recipeId);
    } catch (err) {
      console.error('Erro ao regerar receita por foto:', err);
      toast.error(err.message || 'Não consegui gerar uma nova opção agora. Tente novamente em instantes.');
    }
  };

  const deleteRecipe = (recipeId) => {
    updatePatient(activePatient.id, { photoRecipes: photoRecipes.filter(r => r.id !== recipeId) });
    if (regenContext?.recipeId === recipeId) setRegenContext(null);
    if (expandedId === recipeId) setExpandedId(null);
    if (editingId === recipeId) setEditingId(null);
  };

  const saveEditedRecipe = (recipeId, newContent) => {
    const trimmed = newContent.trim();
    if (!trimmed) return;
    const updatedList = photoRecipes.map(r => (r.id === recipeId ? { ...r, content: trimmed } : r));
    updatePatient(activePatient.id, { photoRecipes: updatedList });
    setEditingId(null);
  };

  return {
    analyzing,
    stagedPhotos,
    expandedId, setExpandedId,
    editingId, setEditingId,
    fileInputRef,
    photoRecipes,
    triggerPhotoSelect,
    handleFileChange,
    removeStagedPhoto,
    generateRecipe,
    regenerateRecipe,
    deleteRecipe,
    saveEditedRecipe,
    canRegenerate,
  };
}
