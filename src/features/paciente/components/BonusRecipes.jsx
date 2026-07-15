import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function BonusRecipes({ activePatient }) {
  const recipes = activePatient?.bonusRecipes || [];
  const [expandedId, setExpandedId] = useState(null);

  if (recipes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: '#f1f5f9', width: '80px', height: '80px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <BookOpen size={40} color="#94a3b8" />
        </div>
        <h2 style={{ color: '#334155', marginBottom: '8px', fontSize: '1.4rem' }}>Nenhuma receita extra</h2>
        <p style={{ color: '#64748b' }}>Seu nutricionista ainda não adicionou receitas bônus para você. Elas aparecerão aqui quando forem recomendadas!</p>
      </div>
    );
  }

  return (
    <div className="animate-pop-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={24} color="#3b82f6" /> Receitas Bônus
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Opções extras sugeridas especialmente para você.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recipes.map((recipe) => (
          <div 
            key={recipe.id} 
            className="glass-panel"
            style={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff'
            }}
          >
            <button 
              onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}
              style={{ 
                width: '100%', 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '1.1rem', fontWeight: '700' }}>{recipe.title}</h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Adicionado em {recipe.date}</span>
              </div>
              <div style={{ color: '#3b82f6', backgroundColor: '#eff6ff', padding: '8px', borderRadius: '50%' }}>
                {expandedId === recipe.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {expandedId === recipe.id && (
              <div style={{ padding: '0 20px 20px 20px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                <div style={{ height: '1px', backgroundColor: '#f1f5f9', marginBottom: '16px' }}></div>
                {recipe.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
