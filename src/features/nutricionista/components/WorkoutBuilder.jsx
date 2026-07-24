import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import exercisesDb from '../../../data/exercises.json';

export default function WorkoutBuilder({ day, onChange, onDeleteDay }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setExerciseName(val); // Permite texto livre se não clicar na busca

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const term = val.toLowerCase();
    const results = exercisesDb.filter(ex => 
      ex.name.toLowerCase().includes(term) || ex.group.toLowerCase().includes(term)
    ).slice(0, 8); // Top 8 resultados
    setSearchResults(results);
  };

  const handleSelectExercise = (ex) => {
    setExerciseName(ex.name);
    setSearchTerm(ex.name);
    setSearchResults([]);
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      alert("Por favor, informe o nome do exercício.");
      return;
    }

    const newExercise = {
      name: exerciseName,
      sets: sets || '3',
      reps: reps || '10 a 12'
    };

    const newExercisesList = [...(day.exercises || []), newExercise];
    onChange({ ...day, exercises: newExercisesList });
    
    // Reset form
    setSearchTerm('');
    setExerciseName('');
    setSets('');
    setReps('');
  };

  const handleRemoveExercise = (idx) => {
    const newExercises = [...day.exercises];
    newExercises.splice(idx, 1);
    onChange({ ...day, exercises: newExercises });
  };

  return (
    <div style={{ padding: '16px', backgroundColor: 'var(--crm-surface-2)', borderRadius: '8px', marginBottom: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <input 
          type="text" 
          style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--crm-primary)', border: 'none', background: 'transparent', outline: 'none', borderBottom: '1px solid var(--crm-border)', width: '60%', padding: '4px' }}
          value={day.dayName || ''}
          onChange={(e) => onChange({ ...day, dayName: e.target.value })}
          placeholder="Nome do Dia (ex: Treino A - Peito)"
        />
        <button onClick={onDeleteDay} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Trash2 size={16} /> <span style={{fontSize: '0.85rem'}}>Remover Dia</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexWrap: 'wrap' }} ref={searchRef}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--crm-surface)', border: '1px solid var(--crm-border)', borderRadius: '4px', padding: '0 8px' }}>
            <Search size={16} color="var(--crm-text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar exercício (ou digite livremente)..." 
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
                  onClick={() => handleSelectExercise(res)}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: 'var(--crm-text-main)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--crm-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong>{res.name}</strong> <span style={{fontSize: '0.8rem', color: 'var(--crm-text-muted)'}}>({res.group})</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <input 
          type="text" 
          placeholder="Séries (ex: 4)" 
          value={sets}
          onChange={e => setSets(e.target.value)}
          style={{ width: '90px', padding: '8px', border: '1px solid var(--crm-border)', borderRadius: '4px', backgroundColor: 'var(--crm-surface)', color: 'var(--crm-text-main)' }}
        />
        
        <input 
          type="text" 
          placeholder="Reps / Instruções (ex: 10 a 12)" 
          value={reps}
          onChange={e => setReps(e.target.value)}
          style={{ width: '150px', padding: '8px', border: '1px solid var(--crm-border)', borderRadius: '4px', backgroundColor: 'var(--crm-surface)', color: 'var(--crm-text-main)', flex: '1 1 120px' }}
        />
        
        <button 
          onClick={handleAddExercise} 
          style={{ padding: '8px 12px', backgroundColor: 'var(--crm-accent)', color: 'var(--crm-surface)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {(day.exercises && day.exercises.length > 0) && (
        <div style={{ marginTop: '16px' }}>
          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--crm-border)', textAlign: 'left', color: 'var(--crm-text-muted)' }}>
                <th style={{ padding: '8px 4px' }}>Exercício</th>
                <th style={{ padding: '8px 4px' }}>Séries</th>
                <th style={{ padding: '8px 4px' }}>Reps / Instruções</th>
                <th style={{ padding: '8px 4px', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {day.exercises.map((ex, idx) => {
                // Suporte para o formato antigo de string, se existir
                const isObj = typeof ex === 'object';
                const name = isObj ? ex.name : ex;
                const setVal = isObj ? (ex.sets || '-') : '-';
                const repVal = isObj ? (ex.reps || '-') : '-';
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--crm-border)', color: 'var(--crm-text-main)' }}>
                    <td style={{ padding: '8px 4px', fontWeight: '500' }}>{name}</td>
                    <td style={{ padding: '8px 4px' }}>{setVal}</td>
                    <td style={{ padding: '8px 4px' }}>{repVal}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      <button onClick={() => handleRemoveExercise(idx)} style={{ background: 'none', border: 'none', color: 'var(--crm-danger)', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
