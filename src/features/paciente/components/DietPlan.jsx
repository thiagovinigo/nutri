import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Utensils, RefreshCw, X, ShoppingCart, Printer, Sparkles, Loader2, History, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import tacoData from '../../../data/taco.json';
import { useAppContext } from '../../../context/AppContext';

export default function DietPlan({ activePatient }) {
  const { updatePatient } = useAppContext();
  const todayFormatted = new Date().toLocaleDateString('pt-BR');
  const [subModal, setSubModal] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [shoppingDays, setShoppingDays] = useState(7);
  const [recipeModal, setRecipeModal] = useState(null);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [loadingMealIdx, setLoadingMealIdx] = useState(null);
  const [selectedPlanDay, setSelectedPlanDay] = useState(1);
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (mIdx) => {
    setFlippedCards(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));
  };

  const isMealDone = (mealName) => {
    return (activePatient.foodLogs || []).some(
      log => log.date === todayFormatted && log.mealName === mealName
    );
  };

  const handleGenerateRecipe = async (meal, mIdx) => {
    setLoadingMealIdx(mIdx);
    setIsRecipeLoading(true);
    setFlippedCards(prev => ({ ...prev, [mIdx]: true }));

    try {
      const foodsList = meal.foods
        ? meal.foods.map(f => `${f.amount}g de ${f.name}`).join(', ')
        : (meal.desc || 'alimentos variados');
      const aversions = activePatient?.aversions || 'Nenhuma aversão registrada';
      const prompt = `Você é um Chef Nutricional da Vytal. Sua missão é sugerir uma receita prática e rápida utilizando os seguintes ingredientes: ${foodsList}. Se precisar, pode adicionar temperos básicos (sal, pimenta, azeite, ervas).
      INSTRUÇÕES:
      - O paciente NÃO COME (aversões/restrições): ${aversions}. JAMAIS use esses ingredientes.
      - Retorne em formato Markdown (## Nome da Receita, ### Ingredientes, ### Modo de Preparo).
      - Mantenha a resposta super focada na praticidade para o dia a dia.`;

      const response = await fetch('/api/openai-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: "Você é um assistente culinário focado em dietas de alta performance.",
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const content = data.choices[0].message.content;
      setRecipeModal({ mIdx, content });
    } catch (err) {
      setRecipeModal({ mIdx, content: 'Infelizmente não foi possível gerar a receita no momento. Verifique sua conexão e tente novamente.' });
    } finally {
      setIsRecipeLoading(false);
      setLoadingMealIdx(null);
    }
  };

  const handleOpenSub = (food) => {
    const baseDbFood = tacoData.find(db => String(db.id) === String(food.foodId) || db.name === food.name);
    if (!baseDbFood) {
      alert('Não foi possível encontrar opções de substituição automática para este item. Por favor, consulte sua Nutricionista.');
      return;
    }
    let mainMacro = 'kcal';
    if (baseDbFood.category === 'Carboidratos' || baseDbFood.category === 'Frutas') mainMacro = 'carb';
    if (baseDbFood.category === 'Proteínas') mainMacro = 'protein';
    if (baseDbFood.category === 'Gorduras') mainMacro = 'fat';
    const targetValue = food[mainMacro] || 0;
    const alts = tacoData
      .filter(t => t.category === baseDbFood.category && String(t.id) !== String(food.foodId))
      .map(alt => {
        const altValuePer100g = alt[mainMacro] || 1;
        return { ...alt, suggestedAmount: Math.round((targetValue * 100) / altValuePer100g) };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    setSubModal({ original: food, alternatives: alts, mainMacro, mealName: food._mealName, rIdx: food._rIdx, mIdx: food._mIdx, fIdx: food._fIdx });
  };

  // Apply substitution — writes back to Firebase
  const handleApplySub = async (alt) => {
    if (!subModal) return;
    const { rIdx, mIdx, fIdx } = subModal;
    // Deep-clone recipes to avoid mutation
    const newRecipes = JSON.parse(JSON.stringify(activePatient.recipes || []));
    const reversed = [...activePatient.recipes].reverse();
    const realRIdx = activePatient.recipes.length - 1 - rIdx; // reverse() offset
    const target = newRecipes[realRIdx]?.meals?.[mIdx]?.foods?.[fIdx];
    if (!target) { alert('Não foi possível aplicar a substituição.'); return; }
    target.name = alt.name;
    target.amount = alt.suggestedAmount;
    target.foodId = alt.id;
    // Recalculate macros for the new amount
    const factor = alt.suggestedAmount / 100;
    target.kcal = Math.round((alt.kcal || 0) * factor);
    target.carb = Math.round((alt.carb || 0) * factor * 10) / 10;
    target.protein = Math.round((alt.protein || 0) * factor * 10) / 10;
    target.fat = Math.round((alt.fat || 0) * factor * 10) / 10;
    await updatePatient(activePatient.id, { recipes: newRecipes });
    setSubModal(null);
  };
  const currentRecipe = activePatient?.recipes?.slice(-1)[0];

  const generateShoppingList = () => {
    if (!currentRecipe || !currentRecipe.meals) return {};
    const aggregated = {};
    currentRecipe.meals.forEach(m => {
      if (m.foods) {
        m.foods.forEach(f => {
          const dbFood = tacoData.find(db => String(db.id) === String(f.foodId) || db.name === f.name);
          const category = dbFood ? dbFood.category : 'Outros';
          if (!aggregated[f.name]) aggregated[f.name] = { amount: 0, category };
          aggregated[f.name].amount += parseFloat(f.amount) || 0;
        });
      }
    });
    const list = Object.keys(aggregated).map(name => ({
      name,
      totalAmount: Math.ceil(aggregated[name].amount * shoppingDays),
      category: aggregated[name].category
    }));
    const byCategory = {};
    list.forEach(item => {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    });
    return byCategory;
  };

  const shoppingListGroups = showShoppingList ? generateShoppingList() : {};
  const foodLogs = activePatient?.foodLogs || [];

  if (!activePatient) return null;

  return (
    <div className="animate-pop-in" style={{ position: 'relative' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--patient-text)' }}>
          <Utensils color="var(--primary-color)" size={22} /> Prescrição Completa
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* History button */}
          {foodLogs.length > 0 && (
            <button
              className="btn-3d btn-secondary"
              onClick={() => setShowHistory(true)}
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
            >
              <History size={16} />
              Histórico
              <span style={{ backgroundColor: 'var(--primary-color)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', position: 'absolute', top: '-6px', right: '-6px' }}>
                {foodLogs.length > 99 ? '99+' : foodLogs.length}
              </span>
            </button>
          )}
          {/* Shopping list button */}
          {currentRecipe && (
            <button className="btn-3d" onClick={() => setShowShoppingList(true)}
              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 0 #059669', fontSize: '0.85rem' }}>
              <ShoppingCart size={16} /> Lista de Mercado
            </button>
          )}
        </div>
      </div>

      {/* ── Plans list ── */}
      {(!activePatient.recipes || activePatient.recipes.length === 0) ? (
        <div className="patient-card patient-glass" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Utensils size={48} color="var(--glass-border)" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--patient-text)', margin: '0 0 8px 0' }}>Sem Plano Ativo</h3>
          <p style={{ color: 'var(--patient-text-muted)', margin: 0 }}>Sua nutricionista ainda não liberou sua prescrição.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activePatient.recipes.slice().reverse().map((r, idx) => {
            const dayMatches = (r.meals || [])
              .map(m => (m.name || '').match(/Dia (\d+)/i))
              .filter(Boolean);
            const maxDays = dayMatches.length > 0
              ? Math.max(...dayMatches.map(m => parseInt(m[1], 10)))
              : 0;

            return (
              <div key={idx}>
                {/* Plan title card */}
                <div className="patient-card patient-glass" style={{ marginBottom: '12px', background: 'linear-gradient(135deg, rgba(var(--primary-rgb, 0,188,212),0.15), transparent)', borderColor: 'rgba(var(--primary-rgb, 0,188,212),0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--patient-text)', display: 'block' }}>{r.title}</strong>
                      {r.description && <p style={{ fontSize: '0.85rem', color: 'var(--patient-text-muted)', margin: '4px 0 0 0' }}>{r.description}</p>}
                    </div>
                    <Utensils size={28} color="var(--primary-color)" style={{ opacity: 0.6, flexShrink: 0 }} />
                  </div>
                </div>

                {/* Day carousel navigator */}
                {maxDays > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', justifyContent: 'center' }}>
                    {/* Prev button */}
                    <button
                      onClick={() => setSelectedPlanDay(d => Math.max(1, d - 1))}
                      disabled={selectedPlanDay === 1}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                        backgroundColor: selectedPlanDay === 1 ? 'var(--patient-surface-2)' : 'var(--primary-color)',
                        color: selectedPlanDay === 1 ? 'var(--patient-text-muted)' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: selectedPlanDay === 1 ? 'default' : 'pointer',
                        opacity: selectedPlanDay === 1 ? 0.4 : 1,
                        transition: 'all 0.2s', flexShrink: 0,
                        boxShadow: selectedPlanDay === 1 ? 'none' : '0 2px 8px rgba(0,188,212,0.4)'
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Counter pill */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      backgroundColor: 'var(--patient-surface-2)',
                      borderRadius: '16px', padding: '8px 24px',
                      border: '1px solid var(--glass-border)', minWidth: '110px'
                    }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary-color)', lineHeight: 1 }}>
                        Dia {selectedPlanDay}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--patient-text-muted)', marginTop: '2px', letterSpacing: '0.05em' }}>
                        {selectedPlanDay} / {maxDays} dias
                      </span>
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => setSelectedPlanDay(d => Math.min(maxDays, d + 1))}
                      disabled={selectedPlanDay === maxDays}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                        backgroundColor: selectedPlanDay === maxDays ? 'var(--patient-surface-2)' : 'var(--primary-color)',
                        color: selectedPlanDay === maxDays ? 'var(--patient-text-muted)' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: selectedPlanDay === maxDays ? 'default' : 'pointer',
                        opacity: selectedPlanDay === maxDays ? 0.4 : 1,
                        transition: 'all 0.2s', flexShrink: 0,
                        boxShadow: selectedPlanDay === maxDays ? 'none' : '0 2px 8px rgba(0,188,212,0.4)'
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {/* Meals */}
                {(r.meals || []).map((m, mIdx) => {
                  const hasDayPrefix = /Dia \d+/i.test(m.name || '');
                  if (hasDayPrefix && !new RegExp(`Dia ${selectedPlanDay}\\b`, 'i').test(m.name || '')) return null;
                  const isFlipped = !!flippedCards[mIdx];
                  const savedRecipe = recipeModal?.mIdx === mIdx ? recipeModal.content : null;
                  const done = isMealDone(m.name);

                  return (
                    <div key={mIdx} style={{ marginBottom: '12px' }}>
                      <div className={`flip-card${isFlipped ? ' flipped' : ''}`}>
                        <div className="flip-card-inner">

                          {/* ── FRONT ── */}
                          <div className="flip-card-front patient-card patient-glass" style={{ borderRadius: '16px', padding: '16px', borderColor: done ? 'var(--primary-color)' : 'var(--glass-border)' }}>
                            {/* Meal header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h4 style={{ margin: 0, color: done ? 'var(--primary-color)' : 'var(--patient-text)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {done && <span>✅</span>} {m.name}
                              </h4>
                              {done && (
                                <span style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--primary-color)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  CONCLUÍDA
                                </span>
                              )}
                            </div>

                            {/* Food items */}
                            {m.foods && m.foods.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                {m.foods.map((f, fIdx) => (
                                  <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--patient-surface-2)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                                    <div style={{ flex: 1 }}>
                                      <strong style={{ color: 'var(--patient-text)', display: 'block', fontSize: '0.88rem' }}>{f.amount}g — {f.name}</strong>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--patient-text-muted)' }}>
                                        {f.kcal} kcal&nbsp;|&nbsp;C: {f.carb}g&nbsp;|&nbsp;P: {f.protein}g&nbsp;|&nbsp;G: {f.fat}g
                                      </span>
                                    </div>
                                    {!done && (
                                      <button onClick={() => handleOpenSub({ ...f, _rIdx: idx, _mIdx: mIdx, _fIdx: fIdx })}
                                        style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '8px' }}>
                                        <RefreshCw size={11} /> Sub.
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {m.desc && (
                              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--patient-text-muted)', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                                💬 {m.desc}
                              </p>
                            )}

                            {/* IA Recipe button */}
                            <button
                              onClick={() => savedRecipe ? toggleFlip(mIdx) : handleGenerateRecipe(m, mIdx)}
                              disabled={isRecipeLoading && loadingMealIdx === mIdx}
                              style={{ backgroundColor: '#8b5cf6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 3px 0 #7c3aed', fontSize: '0.82rem', transition: 'all 0.2s' }}
                            >
                              {isRecipeLoading && loadingMealIdx === mIdx
                                ? <><Loader2 size={14} className="spin" /> Gerando...</>
                                : savedRecipe
                                  ? <><Sparkles size={14} /> Ver Receita IA</>
                                  : <><Sparkles size={14} /> Gerar Receita com IA</>
                              }
                            </button>
                          </div>

                          {/* ── BACK (Recipe) ── */}
                          <div className="flip-card-back patient-card patient-glass" style={{ borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(139,92,246,0.3)', paddingBottom: '10px' }}>
                              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', fontSize: '0.95rem' }}>
                                <Sparkles size={16} /> Receita da IA — {m.name}
                              </h4>
                              <button onClick={() => toggleFlip(mIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--patient-text-muted)', padding: '4px' }}>
                                <X size={18} />
                              </button>
                            </div>

                            <div className="markdown-content" style={{ flex: 1, overflowY: 'auto', color: 'var(--patient-text)', fontSize: '0.9rem' }}>
                              {isRecipeLoading && loadingMealIdx === mIdx ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', color: '#8b5cf6' }}>
                                  <Loader2 size={28} className="spin" style={{ marginBottom: '12px' }} />
                                  <strong>Chef IA preparando algo delicioso...</strong>
                                </div>
                              ) : savedRecipe ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{savedRecipe}</ReactMarkdown>
                              ) : (
                                <p style={{ color: 'var(--patient-text-muted)' }}>Nenhuma receita gerada ainda.</p>
                              )}
                            </div>

                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid rgba(139,92,246,0.3)', paddingTop: '12px' }}>
                              <button onClick={() => handleGenerateRecipe(m, mIdx)} disabled={isRecipeLoading} className="btn-3d btn-secondary" style={{ padding: '7px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={13} /> Regerar
                              </button>
                              <button onClick={() => toggleFlip(mIdx)} className="btn-3d btn-primary" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>
                                Fechar
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}

                {r.supplements && (
                  <div className="patient-card" style={{ marginBottom: '8px', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', padding: '14px' }}>
                    <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.9rem' }}>
                      💊 Vitaminas e Suplementos
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--patient-text)', whiteSpace: 'pre-wrap' }}>{r.supplements}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL — Histórico de Refeições
      ══════════════════════════════════════════ */}
      {showHistory && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowHistory(false)}
        >
          <div
            className="animate-pop-in"
            style={{ backgroundColor: 'var(--patient-surface)', width: '100%', maxWidth: '480px', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '20px 0 0 20px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, color: 'var(--patient-text)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem' }}>
                <History size={20} color="var(--primary-color)" />
                Histórico de Refeições IA
                <span style={{ backgroundColor: 'var(--patient-surface-2)', color: 'var(--patient-text-muted)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.78rem', fontWeight: 'normal' }}>
                  {foodLogs.length} registros
                </span>
              </h3>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--patient-text-muted)', padding: '4px' }}>
                <X size={22} />
              </button>
            </div>

            {/* Drawer content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {foodLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <History size={40} color="var(--glass-border)" style={{ marginBottom: '12px' }} />
                  <p style={{ color: 'var(--patient-text-muted)', margin: 0 }}>Nenhuma refeição registrada ainda.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {foodLogs.slice().reverse().map((log, i) => (
                    <div key={i} className="patient-card patient-glass" style={{ padding: '14px 16px', borderLeft: `4px solid ${log.type === 'extra' ? 'var(--accent-color)' : 'var(--primary-color)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong style={{ color: 'var(--patient-text)', fontSize: '0.9rem' }}>{log.mealName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--patient-text-muted)', whiteSpace: 'nowrap', marginLeft: '8px' }}>{log.date} · {log.time}</span>
                      </div>
                      <div className="markdown-content" style={{ fontSize: '0.85rem', color: 'var(--patient-text)' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{log.log}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════
          MODAL — Substituições
      ══════════════════════════════════════════ */}
      {subModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }} onClick={() => setSubModal(null)}>
          <div className="animate-pop-in" style={{ backgroundColor: 'var(--patient-surface)', width: '100%', maxWidth: '580px', borderRadius: '20px 20px 0 0', padding: '24px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: 'var(--patient-text)', fontSize: '1rem' }}>🔄 Substituir {subModal.original.name}</h3>
              <button onClick={() => setSubModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--patient-text-muted)' }}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--patient-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Equivalentes em <strong style={{ color: 'var(--patient-text)' }}>{subModal.mainMacro === 'kcal' ? 'Calorias' : subModal.mainMacro === 'carb' ? 'Carboidratos' : subModal.mainMacro === 'protein' ? 'Proteínas' : 'Gorduras'}</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {subModal.alternatives.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--patient-text-muted)' }}>Nenhuma substituição encontrada.</p>
              )}
              {subModal.alternatives.map(alt => (
                <div key={alt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid var(--glass-border)', borderRadius: '12px', backgroundColor: 'var(--patient-surface-2)' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--primary-color)', fontSize: '1rem' }}>{alt.suggestedAmount}g</strong>
                    <span style={{ color: 'var(--patient-text)', fontSize: '0.9rem', marginLeft: '6px' }}>de {alt.name}</span>
                  </div>
                  <button
                    onClick={() => handleApplySub(alt)}
                    style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    <CheckCircle2 size={13} /> Usar este
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════
          MODAL — Lista de Mercado
      ══════════════════════════════════════════ */}
      {showShoppingList && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }} onClick={() => setShowShoppingList(false)}>
          <div className="animate-pop-in" style={{ backgroundColor: 'var(--patient-surface)', width: '100%', maxWidth: '580px', borderRadius: '20px 20px 0 0', padding: '24px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--patient-text)', display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart color="#10b981" size={20} /> Lista de Supermercado</h3>
              <button onClick={() => setShowShoppingList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--patient-text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--patient-surface-2)', padding: '10px 14px', borderRadius: '12px' }}>
              <label style={{ color: 'var(--patient-text)', fontWeight: 600, fontSize: '0.9rem' }}>Compras para:</label>
              <select value={shoppingDays} onChange={(e) => setShoppingDays(Number(e.target.value))}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--glass-border)', fontWeight: 'bold', backgroundColor: 'var(--patient-surface)', color: 'var(--patient-text)', flex: 1 }}>
                <option value={7}>7 Dias (Semanal)</option>
                <option value={15}>15 Dias (Quinzena)</option>
                <option value={30}>30 Dias (Mensal)</option>
              </select>
            </div>
            {Object.keys(shoppingListGroups).length === 0 ? (
              <p style={{ color: 'var(--patient-text-muted)' }}>Nenhum alimento estruturado encontrado na dieta.</p>
            ) : (
              <div id="shopping-list-print" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(shoppingListGroups).sort().map(category => (
                  <div key={category}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '4px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category}</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {shoppingListGroups[category].map((item, i) => (
                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px dashed var(--glass-border)' }}>
                          <span style={{ color: 'var(--patient-text)', fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</span>
                          <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>{item.totalAmount > 1000 ? (item.totalAmount / 1000).toFixed(1).replace('.0', '') + ' kg' : item.totalAmount + ' g'}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-3d btn-primary" onClick={() => window.print()}
              style={{ marginTop: '20px', width: '100%', borderRadius: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}>
              <Printer size={16} /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
