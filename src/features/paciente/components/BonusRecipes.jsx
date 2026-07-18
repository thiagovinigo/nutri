import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Plus, Save, ChefHat } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

export default function BonusRecipes({ activePatient }) {
  const { updatePatient } = useAppContext();
  const nutriRecipes = activePatient?.bonusRecipes || [];
  const personalRecipes = activePatient?.personalRecipes || [];
  
  const [activeTab, setActiveTab] = useState('nutri'); // 'nutri' or 'personal'
  const [expandedId, setExpandedId] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAddPersonalRecipe = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newRecipe = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedPersonal = [...personalRecipes, newRecipe];
    updatePatient(activePatient.id, { ...activePatient, personalRecipes: updatedPersonal });
    
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const renderRecipeList = (recipesList) => {
    if (recipesList.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ backgroundColor: '#f1f5f9', width: '80px', height: '80px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <BookOpen size={40} color="#94a3b8" />
          </div>
          <h2 style={{ color: '#334155', marginBottom: '8px', fontSize: '1.4rem' }}>Nenhuma receita aqui</h2>
          <p style={{ color: '#64748b' }}>
            {activeTab === 'nutri' 
              ? 'Seu nutricionista ainda não adicionou receitas bônus para você.' 
              : 'Você ainda não salvou nenhuma receita pessoal.'}
          </p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {recipesList.map((recipe) => (
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
    );
  };

  return (
    <div className="animate-pop-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChefHat size={24} color="#3b82f6" /> Biblioteca de Receitas
        </h2>
        
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('nutri')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'nutri' ? '#fff' : 'transparent', color: activeTab === 'nutri' ? '#3b82f6' : '#64748b', boxShadow: activeTab === 'nutri' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            Da Nutri
          </button>
          <button 
            onClick={() => setActiveTab('personal')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'personal' ? '#fff' : 'transparent', color: activeTab === 'personal' ? '#3b82f6' : '#64748b', boxShadow: activeTab === 'personal' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            Minhas Receitas
          </button>
        </div>
      </div>

      {activeTab === 'nutri' && renderRecipeList(nutriRecipes)}
      
      {activeTab === 'personal' && (
        <div>
          {!showAddForm ? (
            <button className="btn-3d" onClick={() => setShowAddForm(true)} style={{ width: '100%', marginBottom: '16px', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed' }}>
              <Plus size={20} /> Salvar Nova Receita Livre
            </button>
          ) : (
            <div className="animate-pop-in" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Nova Receita</h3>
              <form onSubmit={handleAddPersonalRecipe} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Nome do Prato (ex: Lasanha de Berinjela)" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
                <textarea 
                  placeholder="Ingredientes e modo de preparo..." 
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '120px', resize: 'vertical' }}
                  required
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" className="btn-3d" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Save size={18}/> Salvar</button>
                </div>
              </form>
            </div>
          )}
          
          {renderRecipeList(personalRecipes)}
        </div>
      )}
    </div>
  );
}
