import React, { useState, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Plus, Save, ChefHat, Camera, ScanText, Loader2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import PhotoRecipeGenerator from './PhotoRecipeGenerator';
import { callOpenAIBridge } from '../../../utils/openaiBridge';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function compressImageFile(file, maxDimension = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
        else { width = Math.round((width * maxDimension) / height); height = maxDimension; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export default function BonusRecipes({ activePatient }) {
  const { updatePatient } = useAppContext();
  const nutriRecipes = activePatient?.bonusRecipes || [];
  const personalRecipes = activePatient?.personalRecipes || [];
  
  const [activeTab, setActiveTab] = useState('nutri'); // 'nutri' or 'personal'
  const [expandedId, setExpandedId] = useState(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanRecipe = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    const toastId = toast.loading('Lendo receita com IA...');
    try {
      const base64Image = await compressImageFile(file);
      const data = await callOpenAIBridge({
        system_prompt: 'Você é um assistente culinário. O usuário enviou a foto de uma receita (ou um prato e você deve adivinhar a receita). Extraia e formate a receita em Markdown (Ingredientes e Modo de Preparo). Retorne um JSON com os campos `title` (nome sugerido da receita) e `content` (a receita completa em Markdown).',
        messages: [{ role: 'user', content: [{ type: 'text', text: 'Extraia esta receita:' }, { type: 'image_url', image_url: { url: base64Image } }] }],
        format_json: true
      });
      const parsed = JSON.parse(data.choices[0].message.content);
      setNewTitle(parsed.title || '');
      setNewContent(parsed.content || '');
      setShowAddForm(true);
      toast.success('Receita extraída com sucesso! Revise antes de salvar.', { id: toastId });
    } catch (error) {
      console.error(error);
      let errMsg = error.message;
      if (errMsg.includes('413')) errMsg = 'Foto muito grande. Tente outra.';
      toast.error(errMsg || 'Erro ao ler a receita.', { id: toastId });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
          <div style={{ backgroundColor: 'var(--crm-surface-2)', width: '80px', height: '80px', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <BookOpen size={40} color='var(--crm-text-muted)' />
          </div>
          <h2 style={{ color: 'var(--crm-text-main)', marginBottom: '8px', fontSize: '1.4rem' }}>Nenhuma receita aqui</h2>
          <p style={{ color: 'var(--crm-text-muted)' }}>
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
              backgroundColor: 'var(--crm-surface)'
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
                <h3 style={{ margin: '0 0 4px 0', color: 'var(--crm-text-main)', fontSize: '1.1rem', fontWeight: '700' }}>{recipe.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>Adicionado em {recipe.date}</span>
              </div>
              <div style={{ color: 'var(--primary-color)', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', padding: '8px', borderRadius: '50%' }}>
                {expandedId === recipe.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {expandedId === recipe.id && (
              <div style={{ padding: '0 20px 20px 20px', color: 'var(--crm-text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <div style={{ height: '1px', backgroundColor: 'var(--crm-surface-2)', marginBottom: '16px' }}></div>
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{recipe.content}</ReactMarkdown>
                </div>
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
        <h2 style={{ color: 'var(--crm-text-main)', fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChefHat size={24} color="var(--primary-color)" /> Biblioteca de Receitas
        </h2>
        
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--crm-surface-2)', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('nutri')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'nutri' ? 'var(--crm-surface)' : 'transparent', color: activeTab === 'nutri' ? 'var(--primary-color)' : 'var(--crm-text-muted)', boxShadow: activeTab === 'nutri' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            Da Nutri
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === 'personal' ? 'var(--crm-surface)' : 'transparent', color: activeTab === 'personal' ? 'var(--primary-color)' : 'var(--crm-text-muted)', boxShadow: activeTab === 'personal' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            Minhas Receitas
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', backgroundColor: activeTab === 'photo' ? 'var(--crm-surface)' : 'transparent', color: activeTab === 'photo' ? 'var(--primary-color)' : 'var(--crm-text-muted)', boxShadow: activeTab === 'photo' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
          >
            <Camera size={16} /> Por Foto
          </button>
        </div>
      </div>

      {activeTab === 'nutri' && renderRecipeList(nutriRecipes)}

      {activeTab === 'photo' && <PhotoRecipeGenerator activePatient={activePatient} />}

      {activeTab === 'personal' && (
        <div>
          {!showAddForm ? (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input type="file" accept="image/*" capture="environment" ref={fileInputRef} style={{ display: 'none' }} onChange={handleScanRecipe} />
              <button className="btn-3d" onClick={() => fileInputRef.current?.click()} disabled={isScanning} style={{ flex: 1, backgroundColor: 'var(--crm-surface)', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', padding: '14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 rgba(0,0,0,0.1)' }}>
                {isScanning ? <Loader2 size={20} className="spinner" /> : <ScanText size={20} />}
                Escanear (IA)
              </button>
              <button className="btn-3d" onClick={() => setShowAddForm(true)} style={{ flex: 1, backgroundColor: 'var(--primary-color)', color: 'var(--crm-surface)', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 var(--primary-shadow)' }}>
                <Plus size={20} /> Digitar Receita
              </button>
            </div>
          ) : (
            <div className="animate-pop-in" style={{ backgroundColor: 'var(--crm-surface)', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--crm-text-main)' }}>Nova Receita</h3>
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
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--crm-surface)', color: 'var(--crm-text-muted)', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                  <button type="submit" className="btn-3d" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'var(--crm-surface)', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 0 var(--primary-shadow)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}><Save size={18}/> Salvar</button>
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
