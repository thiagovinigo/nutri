import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Utensils, RefreshCw, X, ShoppingCart, Printer } from 'lucide-react';
import tacoData from '../../../data/taco.json';

export default function DietPlan({ activePatient }) {
  const [subModal, setSubModal] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [shoppingDays, setShoppingDays] = useState(7);

  const handleOpenSub = (food) => {
    // Find alternatives in the same category
    const baseForAlts = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);
    const alts = tacoData.filter(t => t.category === baseForAlts?.category && String(t.id) !== String(food.foodId));
    
    // Calculate new amounts to match the main macro (or kcal)
    const baseDbFood = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);
    if (!baseDbFood) return;

    let mainMacro = 'kcal';
    if (baseDbFood.category === 'Carboidratos' || baseDbFood.category === 'Frutas') mainMacro = 'carb';
    if (baseDbFood.category === 'Proteínas') mainMacro = 'protein';
    if (baseDbFood.category === 'Gorduras') mainMacro = 'fat';

    const targetValue = food[mainMacro];

    const calculatedAlts = alts.map(alt => {
      const altValuePer100g = alt[mainMacro] || 1; 
      const requiredGrams = Math.round((targetValue * 100) / altValuePer100g);
      return {
        ...alt,
        suggestedAmount: requiredGrams
      };
    }).sort((a,b) => a.name.localeCompare(b.name));

    setSubModal({
      original: food,
      alternatives: calculatedAlts,
      mainMacro
    });
  };

  const currentRecipe = activePatient?.recipes?.slice(-1)[0];

  const generateShoppingList = () => {
    if (!currentRecipe || !currentRecipe.meals) return [];
    
    const aggregated = {};
    
    currentRecipe.meals.forEach(m => {
      if (m.foods) {
        m.foods.forEach(f => {
          const dbFood = tacoData.find(db => String(db.id) === String(f.foodId) || db.name === f.name);
          const category = dbFood ? dbFood.category : 'Outros';
          
          if (!aggregated[f.name]) {
            aggregated[f.name] = { amount: 0, category };
          }
          aggregated[f.name].amount += parseFloat(f.amount);
        });
      }
    });

    const list = Object.keys(aggregated).map(name => ({
      name,
      totalAmount: Math.ceil(aggregated[name].amount * shoppingDays),
      category: aggregated[name].category
    }));

    // Group by category
    const byCategory = {};
    list.forEach(item => {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    });

    return byCategory;
  };

  const shoppingListGroups = showShoppingList ? generateShoppingList() : {};

  return (
    <div className="animate-pop-in" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}><Utensils color="#3b82f6" /> Prescrição Completa</h2>
        {currentRecipe && (
          <button className="btn-3d" onClick={() => setShowShoppingList(true)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 #059669' }}>
            <ShoppingCart size={18} /> Lista de Mercado
          </button>
        )}
      </div>
      
      {activePatient.recipes.length === 0 ? (
        <p style={{color: '#64748b'}}>Nenhum plano alimentar recebido ainda.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {activePatient.recipes.slice().reverse().map((r, idx) => (
            <div key={idx} style={{...styles.card, flexDirection: 'column', alignItems: 'stretch'}}>
              <strong style={{fontSize: '1.2rem', marginBottom: r.description ? '8px' : '16px', display: 'block'}}>{r.title}</strong>
              {r.description && <p style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '16px', marginTop: 0}}>{r.description}</p>}
              
              {r.meals?.map((m, mIdx) => (
                <div key={mIdx} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0'}}>
                  <strong style={{color: '#3b82f6'}}>{m.name}</strong>
                  
                  {m.foods && m.foods.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {m.foods.map((f, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <div>
                            <strong style={{ color: '#1E293B', display: 'block' }}>{f.amount}g - {f.name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{f.kcal} kcal | C: {f.carb}g | P: {f.protein}g | G: {f.fat}g</span>
                          </div>
                          <button onClick={() => handleOpenSub(f)} style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <RefreshCw size={14} /> Substituir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.desc && <p style={{margin: '8px 0 0 0', fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap'}}>{m.desc}</p>}
                </div>
              ))}
              
              {r.supplements && (
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px' }}>
                  <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    Vitaminas e Suplementos
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#15803D', whiteSpace: 'pre-wrap' }}>{r.supplements}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Substitutions Modal */}
      {subModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }} onClick={() => setSubModal(null)}>
          <div className="animate-pop-in" style={{ backgroundColor: '#FFF', width: '100%', maxWidth: '600px', borderRadius: '20px 20px 0 0', padding: '24px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Substituir {subModal.original.name}</h3>
              <button onClick={() => setSubModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><X size={20} color="#64748b" /></button>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Opções equivalentes para manter sua dieta balanceada na mesma proporção de <strong>{subModal.mainMacro === 'kcal' ? 'Calorias' : subModal.mainMacro === 'carb' ? 'Carboidratos' : subModal.mainMacro === 'protein' ? 'Proteínas' : 'Gorduras'}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {subModal.alternatives.map(alt => (
                <div key={alt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{alt.suggestedAmount}g</strong>
                  <span style={{ color: '#334155', flex: 1, marginLeft: '12px' }}>de {alt.name}</span>
                </div>
              ))}
              {subModal.alternatives.length === 0 && (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhuma substituição encontrada nesta categoria.</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Shopping List Modal */}
      {showShoppingList && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }} onClick={() => setShowShoppingList(false)}>
          <div className="animate-pop-in" style={{ backgroundColor: '#FFF', width: '100%', maxWidth: '600px', borderRadius: '20px 20px 0 0', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart color="#10b981" /> Lista de Supermercado</h3>
              <button onClick={() => setShowShoppingList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><X size={20} color="#64748b" /></button>
            </div>
            
            <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px' }}>
              <label style={{ color: '#475569', fontWeight: 600 }}>Calcular compras para:</label>
              <select value={shoppingDays} onChange={(e) => setShoppingDays(Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                <option value={7}>7 Dias (Semanal)</option>
                <option value={15}>15 Dias (Quinzena)</option>
                <option value={30}>30 Dias (Mensal)</option>
              </select>
            </div>

            {Object.keys(shoppingListGroups).length === 0 ? (
              <p style={{ color: '#64748b' }}>Nenhum alimento estruturado encontrado na dieta para gerar a lista.</p>
            ) : (
              <div id="shopping-list-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.keys(shoppingListGroups).sort().map(category => (
                  <div key={category}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#3b82f6', borderBottom: '2px solid #e2e8f0', paddingBottom: '4px' }}>{category.toUpperCase()}</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {shoppingListGroups[category].map((item, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                          <span style={{ color: '#334155', fontWeight: 500 }}>{item.name}</span>
                          <strong style={{ color: '#10b981' }}>{item.totalAmount > 1000 ? (item.totalAmount / 1000).toFixed(1).replace('.0','') + ' kg' : item.totalAmount + ' g'}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-3d" onClick={() => window.print()} style={{ marginTop: '24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '12px', width: '100%', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 #2563eb' }}>
              <Printer size={18} /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>,
        document.body
      )}

      <h2 style={{...styles.sectionTitle, marginTop: '32px'}}><Utensils color="#f59e0b" /> Histórico de Refeições (IA)</h2>
      {(!activePatient.foodLogs || activePatient.foodLogs.length === 0) ? (
        <p style={{color: '#64748b'}}>Nenhuma refeição enviada para análise ainda.</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {activePatient.foodLogs.slice().reverse().map((log, idx) => (
            <div key={idx} style={{...styles.card, flexDirection: 'column', alignItems: 'stretch', borderColor: log.type === 'extra' ? '#f59e0b' : '#3b82f6'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <strong style={{color: '#1e293b'}}>{log.mealName}</strong>
                <span style={{fontSize: '0.85rem', color: '#64748b'}}>{log.date} às {log.time}</span>
              </div>
              <p style={{margin: '0', fontSize: '0.95rem', color: '#334155', whiteSpace: 'pre-wrap'}}>{log.log}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  sectionTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' },
  card: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '20px', border: '2px solid #e2e8f0', boxShadow: '0 4px 0 #cbd5e1', marginBottom: '16px', display: 'flex' }
};

