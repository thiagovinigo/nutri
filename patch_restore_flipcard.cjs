const fs = require('fs');

let code = fs.readFileSync('src/features/paciente/components/DietPlan.jsx', 'utf8');

const targetStr = `return (
                <div key={mIdx} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0'}}>
                  <strong style={{color: '#3b82f6'}}>{m.name}</strong>`;

const replaceStr = `return (
                <div key={mIdx} style={{marginBottom: '16px'}}>
                  <div className={\`flip-card \${flippedCards[mIdx] ? 'flipped' : ''}\`}>
                    <div className="flip-card-inner">
                      {/* FRONT OF CARD */}
                      <div className="flip-card-front" style={{backgroundColor: 'var(--crm-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px'}}>
                        <strong style={{color: '#3b82f6'}}>{m.name}</strong>`;

code = code.replace(targetStr, replaceStr);

const targetBtnStr = `{m.desc && <p style={{margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--crm-text-main)', whiteSpace: 'pre-wrap'}}>{m.desc}</p>}
                  
                  <div style={{ marginTop: '16px' }}>
                    <button 
                      onClick={() => handleGenerateRecipe(m, mIdx)} 
                      disabled={isRecipeLoading}
                      className="btn-3d" 
                      style={{ 
                        backgroundColor: '#8b5cf6', 
                        color: '#FFF', 
                        border: 'none', 
                        padding: '8px 16px', 
                        borderRadius: '12px', 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        cursor: isRecipeLoading ? 'wait' : 'pointer', 
                        boxShadow: '0 4px 0 #7c3aed',
                        fontSize: '0.85rem'
                      }}
                    >
                      {isRecipeLoading && loadingMealIdx === mIdx ? (
                        <><Loader2 size={16} className="spin" /> Gerando Receita...</>
                      ) : (
                        <><Sparkles size={16} /> Gerar Receita com IA</>
                      )}
                    </button>
                  </div>

                </div>)}`;

const replaceBtnStr = `{m.desc && <p style={{margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--crm-text-main)', whiteSpace: 'pre-wrap'}}>{m.desc}</p>}
                        
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                          {m.aiRecipe ? (
                            <button onClick={() => toggleFlip(mIdx)} className="btn-3d" style={{ backgroundColor: '#8b5cf6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed', fontSize: '0.85rem' }}>
                              <Sparkles size={16} /> Ver Receita da IA
                            </button>
                          ) : (
                            <button onClick={() => handleGenerateRecipe(m, mIdx)} disabled={isRecipeLoading} className="btn-3d" style={{ backgroundColor: '#8b5cf6', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 0 #7c3aed', fontSize: '0.85rem' }}>
                              {isRecipeLoading && loadingMealIdx === mIdx ? <><Loader2 size={16} className="spin" /> Gerando Receita...</> : <><Sparkles size={16} /> Gerar Receita com IA</>}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* BACK OF CARD */}
                      <div className="flip-card-back" style={{backgroundColor: 'var(--crm-surface)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column'}}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', paddingBottom: '12px' }}>
                          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                            <Sparkles size={20} /> Receita da IA
                          </h3>
                          <button onClick={() => toggleFlip(mIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--crm-text-muted)' }}><X size={20} /></button>
                        </div>
                        
                        <div className="ai-synthesis" style={{ flex: 1, overflowY: 'auto' }}>
                          {isRecipeLoading && loadingMealIdx === mIdx ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: '#8b5cf6' }}>
                              <Loader2 size={32} className="spin" style={{ marginBottom: '16px' }} />
                              <strong>Chef IA preparando algo delicioso...</strong>
                            </div>
                          ) : m.aiRecipe ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.aiRecipe.content || ''}</ReactMarkdown>
                          ) : (
                            <p style={{color: 'var(--crm-text-muted)'}}>Nenhuma receita gerada ainda.</p>
                          )}
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(139, 92, 246, 0.3)', paddingTop: '16px' }}>
                          <button onClick={() => handleGenerateRecipe(m, mIdx)} disabled={isRecipeLoading} className="btn-3d" style={{ backgroundColor: 'var(--crm-surface-2, #f1f5f9)', color: '#8b5cf6', border: '1px solid #8b5cf6', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Regerar
                          </button>
                          <button onClick={() => toggleFlip(mIdx)} className="btn-3d btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                            Concluído
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}`;

code = code.replace(targetBtnStr, replaceBtnStr);

// Also need to restore isMealDone / Substituir button logic!
const targetSubstStr = `<button onClick={() => handleOpenSub(f)} style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <RefreshCw size={14} /> Substituir
                          </button>`;

const replaceSubstStr = `{isMealDone(m.name) ? (
                            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(16,185,129,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                              ✅ Concluída Hoje
                            </span>
                          ) : (
                            <button onClick={() => handleOpenSub(m, mIdx, f, fIdx)} style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                              <RefreshCw size={14} /> Substituir
                            </button>
                          )}`;

code = code.replace(targetSubstStr, replaceSubstStr);

fs.writeFileSync('src/features/paciente/components/DietPlan.jsx', code, 'utf8');
console.log("Flip card restored successfully");
