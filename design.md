# Vytal Design System & Theming

Este documento serve como referência de **Design Tokens** para garantir que a Vytal funcione perfeitamente tanto no Modo Claro quanto no Modo Escuro (Dark Mode Premium).

## Regra de Ouro
NUNCA utilize cores hexadecimais (como `#FFFFFF` ou `#F8FAFC`) diretamente nas propriedades `style={{}}` ou no CSS dos componentes. **Sempre** utilize as variáveis CSS mapeadas aqui.

## 1. Variáveis do Paciente (Patient App)
Usadas no aplicativo mobile (PWA) gamificado.

| Token | Modo Claro | Modo Escuro | Uso Principal |
|-------|------------|-------------|---------------|
| `--patient-bg` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | Fundo global do app |
| `--patient-surface` | `#FFFFFF` (White) | `#1E293B` (Slate 800) | Fundo de Cards principais |
| `--patient-surface-2`| `#F1F5F9` (Slate 100)| `#334155` (Slate 700) | Fundos secundários, inputs |
| `--patient-text` | `#0F172A` (Slate 900)| `#F8FAFC` (Slate 50) | Texto primário, títulos |
| `--patient-text-muted`|`#64748B` (Slate 500)| `#94A3B8` (Slate 400) | Texto secundário, labels |
| `--glass-bg` | `rgba(255,255,255,0.7)` | `rgba(30,41,59,0.7)` | Efeito de glassmorphism |
| `--glass-border` | `rgba(15,23,42,0.08)` | `rgba(255,255,255,0.1)` | Bordas translúcidas |

## 2. Variáveis do Nutricionista (CRM Desktop)
Usadas no dashboard de gestão clínica.

| Token | Modo Claro | Modo Escuro | Uso Principal |
|-------|------------|-------------|---------------|
| `--crm-bg` | `#F8FAFC` (Slate 50) | `#0F172A` (Slate 900) | Fundo global do CRM |
| `--crm-surface` | `#FFFFFF` (White) | `#1E293B` (Slate 800) | Fundo de Cards e Tabelas |
| `--crm-border` | `#E2E8F0` (Slate 200)| `#334155` (Slate 700) | Bordas e divisores |
| `--crm-text-main` | `#0F172A` (Slate 900)| `#F8FAFC` (Slate 50) | Texto principal de leitura |
| `--crm-text-muted` | `#64748B` (Slate 500)| `#94A3B8` (Slate 400) | Subtítulos e placeholders |
| `--crm-primary` | `#10B981` (Emerald 500)| `#10B981` (Emerald 500)| Calls to Action primários |
| `--crm-accent` | `#047857` (Emerald 700)| `#34D399` (Emerald 400) | Destaques textuais, ícones |
| `--crm-accent-soft` | `#D1FAE5` (Emerald 100)| `#064E3B` (Emerald 900)| Fundos de alerta positivo |
| `--crm-danger` | `#EF4444` (Red 500) | `#EF4444` (Red 500) | Ações destrutivas |
| `--crm-danger-soft` | `#FEE2E2` (Red 100) | `#7F1D1D` (Red 900) | Fundo de erros e alertas |
| `--crm-warn` | `#F59E0B` (Amber 500) | `#F59E0B` (Amber 500) | Status em risco |
| `--crm-warn-soft` | `#FEF3C7` (Amber 100) | `#78350F` (Amber 900) | Avisos moderados |
