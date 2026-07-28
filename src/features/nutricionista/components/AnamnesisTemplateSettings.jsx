import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, GripVertical } from 'lucide-react';

const FIELD_TYPES = [
  { value: 'texto_curto', label: 'Texto Curto' },
  { value: 'texto_longo', label: 'Texto Longo' },
  { value: 'escolha_unica', label: 'Escolha Única' },
];

export const DEFAULT_TEMPLATE = [
  { id: 'campo_historico_saude', label: 'Histórico de Saúde', type: 'texto_longo', options: [] },
  { id: 'campo_habitos_alimentares', label: 'Hábitos Alimentares', type: 'texto_longo', options: [] },
  { id: 'campo_objetivos', label: 'Objetivos', type: 'texto_curto', options: [] },
  { id: 'campo_restricoes_alergias', label: 'Restrições / Alergias', type: 'texto_longo', options: [] },
  { id: 'campo_medicamentos', label: 'Medicamentos em Uso', type: 'texto_longo', options: [] },
];

export default function AnamnesisTemplateSettings({ clinicConfig, updateClinicConfig, addNotification }) {
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('texto_curto');
  const [fieldOptionsText, setFieldOptionsText] = useState('');

  const fields = (clinicConfig?.anamnesisTemplate && clinicConfig.anamnesisTemplate.length > 0)
    ? clinicConfig.anamnesisTemplate
    : DEFAULT_TEMPLATE;

  const fieldTypeLabel = (value) => FIELD_TYPES.find(t => t.value === value)?.label || value;

  const handleOpenNewField = () => {
    setEditingField(null);
    setFieldLabel('');
    setFieldType('texto_curto');
    setFieldOptionsText('');
    setShowFieldModal(true);
  };

  const handleOpenEditField = (field) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldOptionsText((field.options || []).join(', '));
    setShowFieldModal(true);
  };

  const handleSaveField = async (e) => {
    e.preventDefault();
    if (!fieldLabel) return;

    const newFieldObj = {
      id: editingField ? editingField.id : 'campo_' + Date.now(),
      label: fieldLabel,
      type: fieldType,
      options: fieldType === 'escolha_unica'
        ? fieldOptionsText.split(',').map(o => o.trim()).filter(Boolean)
        : [],
    };

    let newFieldsArray;
    if (editingField) {
      newFieldsArray = fields.map(f => f.id === editingField.id ? newFieldObj : f);
    } else {
      newFieldsArray = [...fields, newFieldObj];
    }

    await updateClinicConfig({ anamnesisTemplate: newFieldsArray });
    if (addNotification) addNotification(editingField ? 'Campo atualizado com sucesso!' : 'Novo campo adicionado ao formulário!');
    setShowFieldModal(false);
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Deseja realmente remover este campo do formulário de anamnese?')) return;
    const newFieldsArray = fields.filter(f => f.id !== id);
    await updateClinicConfig({ anamnesisTemplate: newFieldsArray });
    if (addNotification) addNotification('Campo removido.');
  };

  return (
    <div>
      <div className="settings-content-header">
        <h2>Formulário de Anamnese</h2>
        <p>Monte os campos que o paciente vai preencher antes da consulta. Comece pelo modelo padrão e ajuste como quiser.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="crm-btn-primary" onClick={handleOpenNewField} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Adicionar Campo
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fields.map(field => (
          <div key={field.id} className="crm-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GripVertical size={16} color="var(--crm-text-muted)" />
              <div>
                <strong style={{ color: 'var(--crm-text-main)' }}>{field.label}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', marginTop: '2px' }}>
                  <span>{fieldTypeLabel(field.type)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOpenEditField(field)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--crm-border)', background: 'transparent', color: 'var(--crm-text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Edit size={14} /> Editar
              </button>
              <button
                onClick={() => handleDeleteField(field.id)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #EF4444', background: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && (
          <div className="crm-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
            <FileText size={32} style={{ marginBottom: '12px' }} />
            <p>Nenhum campo cadastrado. Adicione o primeiro campo do formulário de anamnese.</p>
          </div>
        )}
      </div>

      {showFieldModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="crm-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: 'var(--crm-bg)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '700', color: 'var(--crm-text-main)' }}>
              {editingField ? 'Editar Campo' : 'Adicionar Campo'}
            </h2>

            <form onSubmit={handleSaveField} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="crm-label">Nome do Campo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Histórico de Saúde"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  className="crm-input-modern"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="crm-label">Tipo de Resposta</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="crm-input-modern"
                  style={{ width: '100%' }}
                >
                  {FIELD_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {fieldType === 'escolha_unica' && (
                <div>
                  <label className="crm-label">Opções (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: Nunca, Às vezes, Sempre"
                    value={fieldOptionsText}
                    onChange={(e) => setFieldOptionsText(e.target.value)}
                    className="crm-input-modern"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'transparent', color: 'var(--crm-text-main)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancelar
                </button>
                <button type="submit" className="crm-btn-primary" style={{ padding: '10px 20px' }}>
                  Salvar Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
