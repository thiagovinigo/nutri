import React, { useState } from 'react';
import { Camera, Loader2, ChevronDown, ChevronUp, ImagePlus, X, ChefHat, Pencil, Trash2, RefreshCw, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePhotoRecipe, extractRecipeTitle, MAX_PHOTOS } from '../hooks/usePhotoRecipe';

// Aba "Por Foto" dentro da área Receitas: paciente fotografa os ingredientes
// disponíveis (geladeira/despensa) e a IA sugere uma receita pronta. Feature
// nova e independente -- não compartilha estado nem lógica com a geração de
// receita do plano (DietPlan/useAiRecipe) nem com a análise de refeição já
// comida (QuestBoard "Foto IA").
export default function PhotoRecipeGenerator({ activePatient }) {
  const {
    analyzing, stagedPhotos, expandedId, setExpandedId, editingId, setEditingId,
    fileInputRef, photoRecipes, triggerPhotoSelect, handleFileChange, removeStagedPhoto,
    generateRecipe, regenerateRecipe, deleteRecipe, saveEditedRecipe, canRegenerate,
  } = usePhotoRecipe(activePatient);

  const [editDraft, setEditDraft] = useState('');

  const startEditing = (recipe) => {
    setEditDraft(recipe.content);
    setEditingId(recipe.id);
  };

  const handleDelete = (recipeId) => {
    if (window.confirm('Excluir esta receita? Essa ação não pode ser desfeita.')) {
      deleteRecipe(recipeId);
    }
  };

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
          Fotografe os ingredientes que você tem disponíveis (geladeira, despensa) e a IA sugere uma receita prática pra você. Você pode tirar até {MAX_PHOTOS} fotos antes de gerar.
        </p>

        {stagedPhotos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
            {stagedPhotos.map((photo) => (
              <div key={photo.id} style={{ position: 'relative', width: '72px', height: '72px' }}>
                <img
                  src={photo.base64}
                  alt="Ingrediente fotografado"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                />
                <button
                  onClick={() => removeStagedPhoto(photo.id)}
                  disabled={analyzing}
                  aria-label="Remover foto"
                  style={{
                    position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px',
                    borderRadius: '50%', border: 'none', backgroundColor: 'var(--crm-text-main)', color: 'var(--crm-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexDirection: stagedPhotos.length > 0 ? 'row' : 'column' }}>
          <button
            className="btn-3d"
            style={{
              flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              padding: '12px', borderRadius: '10px', border: '1px solid var(--primary-color)',
              background: 'transparent', color: 'var(--primary-color)', fontWeight: 'bold', cursor: 'pointer'
            }}
            onClick={triggerPhotoSelect}
            disabled={analyzing || stagedPhotos.length >= MAX_PHOTOS}
          >
            <Camera size={18} />
            {stagedPhotos.length > 0 ? 'Adicionar Foto' : 'Tirar Foto dos Ingredientes'}
          </button>

          {stagedPhotos.length > 0 && (
            <button
              className="btn-3d btn-primary"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              onClick={generateRecipe}
              disabled={analyzing}
            >
              {analyzing ? <Loader2 size={18} className="spin" /> : <ChefHat size={18} />}
              {analyzing ? 'Gerando...' : 'Gerar com ChefIA'}
            </button>
          )}
        </div>
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

                  {editingId === recipe.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '200px', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
                      />
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--crm-surface)', color: 'var(--crm-text-muted)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => saveEditedRecipe(recipe.id, editDraft)}
                          className="btn-3d"
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'var(--crm-surface)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                          <Save size={16} /> Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe.content}</ReactMarkdown>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--crm-surface-2)' }}>
                        {canRegenerate(recipe.id) && (
                          <button
                            onClick={() => regenerateRecipe(recipe.id)}
                            disabled={analyzing}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--primary-color)', background: 'transparent', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            {analyzing ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />} Regerar
                          </button>
                        )}
                        <button
                          onClick={() => startEditing(recipe)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', color: 'var(--crm-text-muted)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          <Pencil size={14} /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
