import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, 
  Plus, Trash2, Edit, Send, Calendar, Users, Award, ArrowUpRight 
} from 'lucide-react';

export default function FinancialCRM({ 
  patients = [], 
  clinicConfig, 
  updateClinicConfig, 
  updatePatient, 
  addNotification 
}) {
  const [activeTab, setActiveTab] = useState('resumo'); // 'resumo' | 'planos' | 'pacientes'
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form states para plano
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDuration, setPlanDuration] = useState('30');
  const [planDescription, setPlanDescription] = useState('');

  // Filtros em pacientes
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'pago' | 'pendente' | 'atrasado'
  const [searchTerm, setSearchTerm] = useState('');

  // Planos padrão se a clínica ainda não tiver cadastrado nenhum
  const defaultPlans = [
    { id: 'plano_avulso', name: 'Consulta Avulsa', price: 250, durationDays: 1, description: 'Consulta única com retorno incluso.' },
    { id: 'plano_mensal', name: 'Plano Mensal (30 dias)', price: 350, durationDays: 30, description: 'Acompanhamento de 1 mês com suporte pelo chat.' },
    { id: 'plano_trimestral', name: 'Plano Trimestral VIP (90 dias)', price: 900, durationDays: 90, description: '3 consultas + WhatsApp proativo e reavaliação contínua.' },
  ];

  const plans = (clinicConfig?.financialPlans && clinicConfig.financialPlans.length > 0) 
    ? clinicConfig.financialPlans 
    : defaultPlans;

  // Cálculo das Métricas Financeiras
  const activePatients = patients.filter(p => p.status === 'ativo' || !p.status);
  
  let totalRevenueExpected = 0;
  let totalRevenueReceived = 0;
  let totalPending = 0;
  let expiringSoonCount = 0;

  const todayStr = new Date().toISOString().split('T')[0];

  activePatients.forEach(p => {
    const plan = plans.find(pl => pl.id === p.financialPlanId) || plans[0];
    const price = Number(plan?.price || 0);
    
    totalRevenueExpected += price;
    
    if (p.financialStatus === 'pago') {
      totalRevenueReceived += price;
    } else {
      totalPending += price;
    }

    // Checar renovação (vencendo em menos de 10 dias)
    if (p.financialDueDate) {
      const due = new Date(p.financialDueDate);
      const now = new Date();
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 10) {
        expiringSoonCount++;
      }
    }
  });

  const averageTicket = activePatients.length > 0 
    ? Math.round(totalRevenueExpected / activePatients.length) 
    : 0;

  // Gerenciamento de Planos
  const handleOpenNewPlan = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanPrice('');
    setPlanDuration('30');
    setPlanDescription('');
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.price);
    setPlanDuration(String(plan.durationDays || 30));
    setPlanDescription(plan.description || '');
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!planName || !planPrice) return;

    const newPlanObj = {
      id: editingPlan ? editingPlan.id : 'plan_' + Date.now(),
      name: planName,
      price: Number(planPrice),
      durationDays: Number(planDuration),
      description: planDescription
    };

    let newPlansArray;
    if (editingPlan) {
      newPlansArray = plans.map(p => p.id === editingPlan.id ? newPlanObj : p);
    } else {
      newPlansArray = [...plans, newPlanObj];
    }

    await updateClinicConfig({ financialPlans: newPlansArray });
    if (addNotification) addNotification(editingPlan ? 'Plano atualizado com sucesso!' : 'Novo plano financeiro cadastrado!');
    setShowPlanModal(false);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Deseja realmente excluir este plano? Pacientes associados retornarão ao plano padrão.')) return;
    const newPlansArray = plans.filter(p => p.id !== id);
    await updateClinicConfig({ financialPlans: newPlansArray });
    if (addNotification) addNotification('Plano removido.');
  };

  // Atualização Rápida em Pacientes
  const handlePatientFinancialChange = async (patientId, field, value) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const updateData = { [field]: value };
    await updatePatient(patientId, updateData);
    if (addNotification) addNotification(`Dados financeiros atualizados para ${patient.name}`);
  };

  // Enviar Lembrete no WhatsApp
  const handleSendWhatsAppReminder = (patient) => {
    const plan = plans.find(pl => pl.id === patient.financialPlanId) || plans[0];
    const phone = patient.phone ? patient.phone.replace(/\D/g, '') : '';
    
    if (!phone) {
      alert('O paciente não possui telefone cadastrado no perfil.');
      return;
    }

    const message = `Olá, ${patient.name}! 🌟 Passando para lembrar sobre a renovação do seu plano de acompanhamento nutricional (${plan.name}) no Nutrivvo. Qualquer dúvida estou à disposição!`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Filtragem
  const filteredPatients = activePatients.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const status = p.financialStatus || 'pendente';
    const matchesStatus = statusFilter === 'todos' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="crm-main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--crm-text)' }}>
            Gestão Financeira & Planos do Consultório
          </h1>
          <p style={{ color: 'var(--crm-text-muted)', margin: '4px 0 0 0' }}>
            Controle honorários, pacotes de acompanhamento e previsibilidade de receita.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="crm-btn-primary" 
            onClick={handleOpenNewPlan}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Cadastrar Novo Plano
          </button>
        </div>
      </div>

      {/* Tabs Internas */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--crm-border)', marginBottom: '24px', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('resumo')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'resumo' ? 'var(--crm-primary)' : 'transparent', 
            color: activeTab === 'resumo' ? '#fff' : 'var(--crm-text)', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <TrendingUp size={16} /> Visão Geral & Previsões
        </button>
        <button 
          onClick={() => setActiveTab('pacientes')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'pacientes' ? 'var(--crm-primary)' : 'transparent', 
            color: activeTab === 'pacientes' ? '#fff' : 'var(--crm-text)', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Users size={16} /> Honorários por Paciente ({activePatients.length})
        </button>
        <button 
          onClick={() => setActiveTab('planos')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'planos' ? 'var(--crm-primary)' : 'transparent', 
            color: activeTab === 'planos' ? '#fff' : 'var(--crm-text)', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Award size={16} /> Catálogo de Planos ({plans.length})
        </button>
      </div>

      {/* CONTEÚDO DA TAB: RESUMO */}
      {activeTab === 'resumo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Grid de Cards de Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="crm-card" style={{ borderLeft: '4px solid var(--crm-primary)', padding: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Faturamento Esperado (Mês)
              </span>
              <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: 'var(--crm-text)' }}>
                R$ {totalRevenueExpected.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <TrendingUp size={14} color="#10B981" /> Previsão de receita dos contratos ativos
              </span>
            </div>

            <div className="crm-card" style={{ borderLeft: '4px solid #10B981', padding: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Recebimentos Confirmados (Pagos)
              </span>
              <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: '#10B981' }}>
                R$ {totalRevenueReceived.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <CheckCircle size={14} color="#10B981" /> {Math.round((totalRevenueReceived / (totalRevenueExpected || 1)) * 100)}% da receita liquidada
              </span>
            </div>

            <div className="crm-card" style={{ borderLeft: '4px solid #F59E0B', padding: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                A Receber / Pendente
              </span>
              <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: '#F59E0B' }}>
                R$ {totalPending.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <Clock size={14} color="#F59E0B" /> Acompanhar datas de vencimento
              </span>
            </div>

            <div className="crm-card" style={{ borderLeft: '4px solid #6366F1', padding: '20px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                Ticket Médio por Paciente
              </span>
              <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: 'var(--crm-text)' }}>
                R$ {averageTicket.toLocaleString('pt-BR')}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--crm-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <Users size={14} color="#6366F1" /> Em {activePatients.length} pacientes ativos
              </span>
            </div>
          </div>

          {/* Destaque de Inteligência: Alertas de Renovação */}
          <div className="crm-card" style={{ border: '1px solid #6366F1', background: 'rgba(99, 102, 241, 0.04)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex' }}>
                <Award size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--crm-text)' }}>
                  Inteligência Preditiva: Oportunidades de Renovação 🌟
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--crm-text-muted)' }}>
                  Cruzando a pontuação de XP dos pacientes com a data de término dos planos para indicar o melhor momento de renovar o contrato.
                </p>
              </div>
            </div>

            {expiringSoonCount === 0 ? (
              <div style={{ padding: '16px', background: 'var(--crm-surface)', borderRadius: '8px', color: 'var(--crm-text-muted)', textAlign: 'center' }}>
                Nenhum plano de paciente vencendo nos próximos 10 dias. Todos os contratos estão em dia! ✅
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePatients
                  .filter(p => {
                    if (!p.financialDueDate) return false;
                    const due = new Date(p.financialDueDate);
                    const now = new Date();
                    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 10;
                  })
                  .map(p => {
                    const plan = plans.find(pl => pl.id === p.financialPlanId) || plans[0];
                    return (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--crm-surface)', borderRadius: '8px', border: '1px solid var(--crm-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--crm-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '1rem', color: 'var(--crm-text)' }}>{p.name}</strong>
                            <div style={{ fontSize: '0.85rem', color: 'var(--crm-text-muted)' }}>
                              Plano Atual: <strong>{plan.name}</strong> (Vence em {p.financialDueDate.split('-').reverse().join('/')})
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontSize: '0.8rem', fontWeight: '700' }}>
                            🔥 Alta Adesão (Apto para Upgrade)
                          </span>
                          <button 
                            className="crm-btn-primary"
                            onClick={() => handleSendWhatsAppReminder(p)}
                            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Send size={14} /> Oferecer Renovação
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO DA TAB: PACIENTES */}
      {activeTab === 'pacientes' && (
        <div className="crm-card" style={{ padding: '24px' }}>
          {/* Filtros */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <input 
              type="text"
              placeholder="Buscar paciente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)', width: '300px' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              {['todos', 'pago', 'pendente', 'atrasado'].map((status) => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    border: '1px solid var(--crm-border)', 
                    background: statusFilter === status ? 'var(--crm-primary)' : 'var(--crm-surface)', 
                    color: statusFilter === status ? '#fff' : 'var(--crm-text)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {status === 'todos' ? 'Todos os Status' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Tabela de Honorários */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--crm-border)', color: 'var(--crm-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Paciente</th>
                  <th style={{ padding: '12px' }}>Plano Contratado</th>
                  <th style={{ padding: '12px' }}>Valor (R$)</th>
                  <th style={{ padding: '12px' }}>Vencimento</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
                      Nenhum paciente encontrado com este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map(p => {
                    const plan = plans.find(pl => pl.id === p.financialPlanId) || plans[0];
                    const status = p.financialStatus || 'pendente';

                    let statusBg = 'rgba(245, 158, 11, 0.1)';
                    let statusColor = '#F59E0B';
                    if (status === 'pago') { statusBg = 'rgba(16, 185, 129, 0.1)'; statusColor = '#10B981'; }
                    if (status === 'atrasado') { statusBg = 'rgba(239, 68, 68, 0.1)'; statusColor = '#EF4444'; }

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--crm-border)' }}>
                        <td style={{ padding: '16px 12px', fontWeight: '600', color: 'var(--crm-text)' }}>
                          {p.name}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <select 
                            value={p.financialPlanId || plan.id}
                            onChange={(e) => handlePatientFinancialChange(p.id, 'financialPlanId', e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)', fontSize: '0.9rem' }}
                          >
                            {plans.map(pl => (
                              <option key={pl.id} value={pl.id}>{pl.name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '16px 12px', fontWeight: '700', color: 'var(--crm-text)' }}>
                          R$ {plan.price?.toLocaleString('pt-BR')}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <input 
                            type="date"
                            value={p.financialDueDate || todayStr}
                            onChange={(e) => handlePatientFinancialChange(p.id, 'financialDueDate', e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)', fontSize: '0.85rem' }}
                          />
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <select 
                            value={status}
                            onChange={(e) => handlePatientFinancialChange(p.id, 'financialStatus', e.target.value)}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              border: 'none', 
                              background: statusBg, 
                              color: statusColor, 
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="pago">🟢 Pago</option>
                            <option value="pendente">🟡 Pendente</option>
                            <option value="atrasado">🔴 Atrasado</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleSendWhatsAppReminder(p)}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '6px', 
                              border: '1px solid #10B981', 
                              background: 'rgba(16, 185, 129, 0.05)', 
                              color: '#10B981', 
                              fontWeight: '600', 
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem'
                            }}
                          >
                            <Send size={14} /> Cobrar no WhatsApp
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA TAB: CATÁLOGO DE PLANOS */}
      {activeTab === 'planos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {plans.map(pl => (
            <div key={pl.id} className="crm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--crm-primary)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--crm-text)' }}>
                    {pl.name}
                  </h3>
                  <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--crm-surface)', color: 'var(--crm-primary)', fontSize: '0.8rem', fontWeight: '700' }}>
                    {pl.durationDays} dias
                  </span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10B981', marginBottom: '12px' }}>
                  R$ {pl.price?.toLocaleString('pt-BR')}
                </div>
                <p style={{ color: 'var(--crm-text-muted)', fontSize: '0.9rem', lineHeight: '1.4', margin: '0 0 20px 0' }}>
                  {pl.description || 'Sem descrição cadastrada para esta modalidade.'}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--crm-border)', paddingTop: '16px' }}>
                <button 
                  onClick={() => handleOpenEditPlan(pl)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--crm-border)', background: 'transparent', color: 'var(--crm-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Edit size={14} /> Editar
                </button>
                <button 
                  onClick={() => handleDeletePlan(pl.id)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #EF4444', background: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO DE PLANO */}
      {showPlanModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="crm-card" style={{ width: '100%', maxWidth: '480px', padding: '28px', background: 'var(--crm-bg)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '700', color: 'var(--crm-text)' }}>
              {editingPlan ? 'Editar Plano Financeiro' : 'Cadastrar Novo Plano'}
            </h2>

            <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--crm-text)' }}>
                  Nome do Plano / Serviço *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Acompanhamento Trimestral VIP"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--crm-text)' }}>
                    Valor (R$) *
                  </label>
                  <input 
                    type="number" 
                    required 
                    placeholder="Ex: 900"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--crm-text)' }}>
                    Duração (Dias) *
                  </label>
                  <input 
                    type="number" 
                    required 
                    placeholder="30"
                    value={planDuration}
                    onChange={(e) => setPlanDuration(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--crm-text)' }}>
                  Descrição e Benefícios do Plano
                </label>
                <textarea 
                  rows={3} 
                  placeholder="Ex: Inclui 3 consultas presenciais, plano alimentar ajustável e suporte via WhatsApp."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'var(--crm-surface)', color: 'var(--crm-text)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPlanModal(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid var(--crm-border)', background: 'transparent', color: 'var(--crm-text)', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="crm-btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
