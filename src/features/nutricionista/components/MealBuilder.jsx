import React, { useState } from 'react';
import { Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import tacoData from '../../../data/taco.json';
import toast from 'react-hot-toast';

export default function MealBuilder({ meal, onChange, onDelete, aversions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [amount, setAmount] = useState('');
  const [subFoodIdx, setSubFoodIdx] = useState(null);

  const aversionList = (aversions || '').split(/[,;\n]+/).map(a => a.trim().toLowerCase()).filter(a => a);

  const getSubstitutes = (food) => {
    const baseDbFood = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);
    if (!baseDbFood) return { alternatives: [], mainMacro: 'kcal' };
    let mainMacro = 'kcal';
    if (baseDbFood.category === 'Carboidratos' || baseDbFood.category === 'Frutas') mainMacro = 'carb';
    if (baseDbFood.category === 'Proteínas') mainMacro = 'protein';
    if (baseDbFood.category === 'Gorduras') mainMacro = 'fat';
    const targetValue = food[mainMacro] || 0;
    const alternatives = tacoData
      .filter(t => t.category === baseDbFood.category && String(t.id) !== String(food.foodId))
      .filter(t => !aversionList.some(av => t.name.toLowerCase().includes(av)))
      .map(alt => ({ ...alt, suggestedAmount: Math.round((targetValue * 100) / (alt[mainMacro] || 1)) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { alternatives, mainMacro };
  };

  const handleApplySub = (idx, alt) => {
    const factor = alt.suggestedAmount / 100;
    const newFoods = [...(meal.foods || [])];
    newFoods[idx] = {
      foodId: alt.id,
      name: alt.name,
      amount: alt.suggestedAmount,
      kcal: Number((alt.kcal * factor).toFixed(1)),
      carb: Number((alt.carb * factor).toFixed(1)),
      protein: Number((alt.protein * factor).toFixed(1)),
      fat: Number((alt.fat * factor).toFixed(1)),
    };
    onChange({ ...meal, foods: newFoods });
    setSubFoodIdx(null);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 2) {
      const results = tacoData.filter(food => food.name.toLowerCase().includes(term.toLowerCase()));
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
    setSearchResults([]);
    if (!amount) {
      setAmount('100');
    }
  };

  const handleAddFood = () => {
    if (!selectedFood) {
      toast.error("Por favor, selecione um alimento na lista que aparece ao digitar.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Por favor, informe a quantidade em gramas.");
      return;
    }
    
    const factor = amount / 100;
    
    if (aversions && selectedFood.name) {
      const aversionList = aversions.split(/[,;\n]+/).map(a => a.trim().toLowerCase()).filter(a => a);
      const foodNameLower = selectedFood.name.toLowerCase();
      const hasAversion = aversionList.some(av => foodNameLower.includes(av));
      if (hasAversion) {
        toast.error(`⚠️ Atenção: "${selectedFood.name}" contém uma palavra que está na lista de aversões do paciente!`);
      }
    }

    const newFoodEntry = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      amount: Number(amount),
      kcal: Number((selectedFood.kcal * factor).toFixed(1)),
      carb: Number((selectedFood.carb * factor).toFixed(1)),
      protein: Number((selectedFood.protein * factor).toFixed(1)),
      fat: Number((selectedFood.fat * factor).toFixed(1)),
    };

    const currentFoods = meal.foods || [];
    onChange({
      ...meal,
      foods: [...currentFoods, newFoodEntry]
    });

    setSelectedFood(null);
    setSearchTerm('');
    setAmount('');
  };

  const handleRemoveFood = (idx) => {
    const newFoods = [...(meal.foods || [])];
    newFoods.splice(idx, 1);
    onChange({
      ...meal,
      foods: newFoods
    });
  };

  const totalKcal = (meal.foods || []).reduce((acc, curr) => acc + curr.kcal, 0);
  const totalCarb = (meal.foods || []).reduce((acc, curr) => acc + curr.carb, 0);
  const totalProtein = (meal.foods || []).reduce((acc, curr) => acc + curr.protein, 0);
  const totalFat = (meal.foods || []).reduce((acc, curr) => acc + curr.fat, 0);

  return (
    <div
      style={{ padding: '16px', backgroundColor: 'var(--crm-surface)', border: '2px dashed var(--crm-border)', borderRadius: '8px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input 
          type="text" 
          className="crm-input" 
          style={{ fontWeight: '600', border: 'none', padding: 0, borderBottom: '1px solid var(--crm-border)', borderRadius: 0, width: '60%', background: 'transparent' }} 
          value={meal.name || ''} 
          onChange={(e) => onChange({ ...meal, name: e.target.value })} 
          placeholder="Nome da Refeição (ex: Almoço)" 
        />
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Trash2 size={16} /> <span style={{fontSize: '0.85rem'}}>Remover</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', border: '1px solid var(--crm-border)', borderRadius: '4px', padding: '0 8px' }}>
            <Search size={16} color="var(--crm-text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar alimento (TACO)..." 
              value={searchTerm}
              onChange={handleSearch}
              style={{ border: 'none', padding: '8px', background: 'transparent', width: '100%', outline: 'none', color: 'var(--crm-text-main)' }}
            />
          </div>
          {searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--crm-surface)', border: '1px solid var(--crm-border)', borderRadius: '4px', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => handleSelectFood(res)}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--crm-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong>{res.name}</strong> <span style={{fontSize: '0.8rem', color: 'var(--crm-text-muted)'}}>({res.kcal}kcal/100g)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <input 
          type="number" 
          placeholder="Gramas" 
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ width: '80px', padding: '8px', border: '1px solid var(--crm-border)', borderRadius: '4px' }}
        />
        <button 
          onClick={handleAddFood} 
          style={{ padding: '8px 12px', backgroundColor: 'var(--crm-accent)', color: 'var(--crm-surface)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {(meal.foods && meal.foods.length > 0) && (
        <div style={{ marginTop: '8px' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--crm-border)', textAlign: 'left', color: 'var(--crm-text-muted)' }}>
                <th style={{ padding: '4px' }}>Alimento</th>
                <th style={{ padding: '4px' }}>Qtd (g)</th>
                <th style={{ padding: '4px' }}>Kcal</th>
                <th style={{ padding: '4px' }}>Carb (g)</th>
                <th style={{ padding: '4px' }}>Ptn (g)</th>
                <th style={{ padding: '4px' }}>Gord (g)</th>
                <th style={{ padding: '4px' }}></th>
              </tr>
            </thead>
            <tbody>
              {meal.foods.map((food, idx) => (
                <React.Fragment key={idx}>
                  <tr style={{ borderBottom: subFoodIdx === idx ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 4px' }}>{food.name}</td>
                    <td style={{ padding: '8px 4px' }}>{food.amount}g</td>
                    <td style={{ padding: '8px 4px' }}>{food.kcal}</td>
                    <td style={{ padding: '8px 4px' }}>{food.carb}</td>
                    <td style={{ padding: '8px 4px' }}>{food.protein}</td>
                    <td style={{ padding: '8px 4px' }}>{food.fat}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setSubFoodIdx(subFoodIdx === idx ? null : idx)} title="Substituir" style={{ background: 'none', border: 'none', color: 'var(--crm-accent)', cursor: 'pointer', marginRight: '8px' }}>
                        <RefreshCw size={14} />
                      </button>
                      <button onClick={() => handleRemoveFood(idx)} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                  {subFoodIdx === idx && (() => {
                    const { alternatives } = getSubstitutes(food);
                    return (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td colSpan="7" style={{ padding: '8px 4px 12px' }}>
                          {alternatives.length === 0 ? (
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--crm-text-muted)' }}>Nenhum substituto equivalente encontrado (ou todos batem com alguma aversão/alergia do paciente).</p>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {alternatives.slice(0, 6).map(alt => (
                                <button
                                  key={alt.id}
                                  onClick={() => handleApplySub(idx, alt)}
                                  style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))', border: '1px solid var(--crm-border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--crm-text-main)' }}
                                >
                                  {alt.name} <span style={{ color: 'var(--crm-text-muted)' }}>({alt.suggestedAmount}g)</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })()}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--crm-surface-2, var(--crm-bg))' }}>
                <td colSpan="2" style={{ padding: '8px 4px' }}>TOTAL DA REFEIÇÃO</td>
                <td style={{ padding: '8px 4px' }}>{totalKcal.toFixed(1)}</td>
                <td style={{ padding: '8px 4px' }}>{totalCarb.toFixed(1)}</td>
                <td style={{ padding: '8px 4px' }}>{totalProtein.toFixed(1)}</td>
                <td style={{ padding: '8px 4px' }}>{totalFat.toFixed(1)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Instruções, sugestão ou modo de preparo */}
      <textarea 
        className="crm-input" 
        style={{ width: '100%', minHeight: '110px', resize: 'vertical', background: 'transparent', border: '1px solid var(--crm-border)', fontSize: '0.85rem', lineHeight: '1.4' }} 
        value={meal.desc || ''} 
        onChange={(e) => onChange({ ...meal, desc: e.target.value })} 
        placeholder="Sugestão de consumo ou modo de preparo completo (pode usar quebras de linha)..." 
      />
    </div>
  );
}

