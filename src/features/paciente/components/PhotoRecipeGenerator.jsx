import React from 'react';
import { Camera, Loader2, ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePhotoRecipe, extractRecipeTitle } from '../hooks/usePhotoRecipe';

// Aba "Por Foto" dentro da área Receitas: paciente fotografa os ingredientes
// disponíveis (geladeira/despensa) e a IA sugere uma receita pronta. Feature
// nova e independente -- não compartilha estado nem lógica com a geração de
// receita do plano (DietPlan/useAiRecipe) nem com a análise de refeição já
// comida (QuestBoard "Foto IA").
export default function PhotoRecipeGenerator({ activePatient }) {
  const {
    analyzing, previewImage, expandedId, setExpandedId,
    fileInputRef, photoRecipes, triggerPhotoSelect, handleFileChange
  } = usePhotoRecipe(activePatient);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div
        className="glass-panel"
        style={{
          borderRadius: '16px', padding: '20px', border: '1px dashed var(--primary-color)',
          backgroundColor: 'var(--crm-surface)', marginBottom: '20px', textAlign: 'center'
        }}
      >
        <ImagePlus size={32} color="var(--primary-color)" style={{ marginBottom: '8px' }} />
        <p style={{ margin: '0 0 16px 0', color: 'var(--crm-text-muted)', fontSize: '0.9rem' }}>
          Fotografe os ingredientes que você tem disponíveis (geladeira, despensa) e a IA sugere uma receita prática pra você.
        </p>
        <button
          className="btn-3d btn-primary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          onClick={triggerPhotoSelect}
          disabled={analyzing}
        >
          {analyzing ? <Loader2 size={18} className="spin" /> : <Camera size={18} />}
          {analyzing ? 'Analisando ingredientes...' : 'Tirar Foto dos Ingredientes'}
        </button>
        {previewImage && analyzing && (
          <img
            src={previewImage}
            alt="Pré-visualização da foto dos ingredientes enviada"
            style={{ marginTop: '16px', maxWidth: '100%', maxHeight: '180px', borderRadius: '12px', objectFit: 'cover' }}
          />
        )}
      </div>

      {photoRecipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <p style={{ color: 'var(--crm-text-muted)' }}>Nenhuma receita gerada por foto ainda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {photoRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="glass-panel"
              style={{
                borderRadius: '16px', overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0', backgroundColor: 'var(--crm-surface)'
              }}
            >
              <button
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
                style={{
                  width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: 'var(--crm-text-main)', fontSize: '1.1rem', fontWeight: '700' }}>
                    {extractRecipeTitle(recipe.content)}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>Gerada em {recipe.date}</span>
                </div>
                <div style={{ color: 'var(--primary-color)', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', padding: '8px', borderRadius: '50%' }}>
                  {expandedId === recipe.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {expandedId === recipe.id && (
                <div style={{ padding: '0 20px 20px 20px', color: 'var(--crm-text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <div style={{ height: '1px', backgroundColor: 'var(--crm-surface-2)', marginBottom: '16px' }}></div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe.content}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
