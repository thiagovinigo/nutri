import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

export default function BiomarkersChart({ patient }) {
  const [selectedMarker, setSelectedMarker] = useState('');

  const chartData = useMemo(() => {
    const dataMap = {}; // { '2023-10-01': { date, peso, [markerName] } }

    if (patient.weights) {
      patient.weights.forEach(w => {
        if (!dataMap[w.date]) dataMap[w.date] = { date: w.date };
        dataMap[w.date].peso = parseFloat(w.value);
      });
    }

    if (patient.exams) {
      patient.exams.forEach(ex => {
        if (!dataMap[ex.date]) dataMap[ex.date] = { date: ex.date };
        if (ex.markers) {
          Object.keys(ex.markers).forEach(k => {
            dataMap[ex.date][k] = parseFloat(ex.markers[k]);
          });
        }
      });
    }

    // Sort by date ascending
    return Object.values(dataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [patient.weights, patient.exams]);

  const availableMarkers = useMemo(() => {
    const markersSet = new Set();
    if (patient.exams) {
      patient.exams.forEach(ex => {
        if (ex.markers) Object.keys(ex.markers).forEach(k => markersSet.add(k));
      });
    }
    const markers = Array.from(markersSet);
    if (markers.length > 0 && !selectedMarker) {
      setSelectedMarker(markers[0]);
    }
    return markers;
  }, [patient.exams, selectedMarker]);

  if (!patient.exams || patient.exams.length === 0 || availableMarkers.length === 0) {
    return (
      <div style={{ padding: '24px', backgroundColor: 'var(--crm-surface)', borderRadius: '12px', border: '1px solid var(--crm-border)', textAlign: 'center' }}>
        <Activity size={32} color="var(--crm-text-muted)" style={{ marginBottom: '12px' }} />
        <p style={{ color: 'var(--crm-text-muted)' }}>Nenhum dado numérico de biomarcador encontrado nos exames para gerar gráfico.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: 'var(--crm-surface)', borderRadius: '12px', border: '1px solid var(--crm-border)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--crm-text-main)' }}>
          <Activity size={18} color="var(--crm-accent)" /> 
          Gráfico Evolutivo Clínico
        </h3>
        <select 
          value={selectedMarker} 
          onChange={(e) => setSelectedMarker(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--crm-border)', backgroundColor: 'var(--crm-bg)', color: 'var(--crm-text-main)' }}
        >
          {availableMarkers.map(m => (
            <option key={m} value={m}>{m.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="var(--crm-text-muted)" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" stroke="#cbd5e1" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" stroke="#a855f7" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--crm-surface)', border: '1px solid var(--crm-border)', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" name="Peso (kg)" dataKey="peso" stroke="#cbd5e1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
            <Line yAxisId="right" type="monotone" name={selectedMarker.replace(/_/g, ' ').toUpperCase()} dataKey={selectedMarker} stroke="#a855f7" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
