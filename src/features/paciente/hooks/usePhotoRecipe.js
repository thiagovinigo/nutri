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

// Feature independente "Receita por Foto": o paciente fotografa os
// ingredientes que tem disponíveis (geladeira, despensa, bancada) e a IA
// sugere uma receita pronta com eles. Histórico fica em
// activePatient.photoRecipes -- campo próprio, separado de aiRecipes /
// aiRecipeHistory (regeneração da dieta, usada em DietPlan/QuestBoard) e dos
// foodLogs do diário alimentar (análise de refeição já feita). Nenhum desses
// fluxos existentes é lido ou alterado por este hook.
export function usePhotoRecipe(activePatient) {
  const { updatePatient } = useAppContext();
  const [analyzing, setAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const fileInputRef = useRef(null);

  const photoRecipes = activePatient?.photoRecipes || [];

  const triggerPhotoSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    setAnalyzing(true);
    setPreviewImage(URL.createObjectURL(file));

    try {
      const base64Image = await compressImageFile(file);
      const aversions = activePatient?.aversions || 'Nenhuma aversão registrada';
      const restrictions = activePatient?.restrictions || 'Nenhuma restrição registrada';

      const promptText = `Você é um Chef Nutricional da Nutrivvo. O usuário fotografou os ingredientes que tem disponíveis agora (geladeira, despensa, bancada).
INSTRUÇÕES:
1) Liste em tópicos os ingredientes que você reconhece na foto.
2) Sugira UMA receita prática e rápida usando o máximo possível desses ingredientes. Pode complementar com temperos básicos (sal, pimenta, azeite, ervas) e itens simples de despensa.
3) O paciente NÃO PODE comer (restrições/aversões): ${restrictions} | ${aversions}. JAMAIS use esses ingredientes, mesmo que apareçam na foto.
4) Se a foto não tiver ingredientes reconhecíveis o suficiente para montar uma receita, explique isso educadamente em vez de inventar.
Retorne em formato Markdown (## Nome da Receita, ### Ingredientes Identificados, ### Modo de Preparo).`;

      const data = await callOpenAIBridge({
        system_prompt: 'Você é um assistente culinário da Nutrivvo, especialista em criar receitas práticas a partir de ingredientes disponíveis, sempre respeitando restrições alimentares do paciente.',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: promptText },
            { type: 'image_url', image_url: { url: base64Image } }
          ]
        }]
      });

      const content = data.choices[0].message.content;
      const newEntry = { id: Date.now().toString(), content, date: new Date().toLocaleDateString('pt-BR') };
      const updatedList = [newEntry, ...photoRecipes];

      updatePatient(activePatient.id, { photoRecipes: updatedList });
      setExpandedId(newEntry.id);
    } catch (err) {
      console.error('Erro ao gerar receita por foto:', err);
      toast.error(err.message || 'Não consegui analisar essa foto agora. Tente novamente em instantes.');
    } finally {
      setAnalyzing(false);
      setPreviewImage(null);
    }
  };

  return { analyzing, previewImage, expandedId, setExpandedId, fileInputRef, photoRecipes, triggerPhotoSelect, handleFileChange };
}
