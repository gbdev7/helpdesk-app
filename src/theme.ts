import { TicketPriority, TicketStatus, Role } from './types';

export const colors = {
  primary: '#6366F1',
  primaryDark: '#4338CA',
  violet: '#7C3AED',
  primarySoft: '#EEF0FF',
  bg: '#F5F6FA',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  subtle: '#94A3B8',
  border: '#E8EAF0',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  info: '#0EA5E9',
  infoSoft: '#E0F2FE',
};

export const gradient = {
  brand: ['#4338CA', '#6D28D9'] as const,
  button: ['#6366F1', '#7C3AED'] as const,
  login: ['#312E81', '#5B21B6', '#7C3AED'] as const,
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

export const shadow = {
  shadowColor: '#1E1B4B',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

export const statusInfo: Record<TicketStatus, { label: string; fg: string; bg: string }> = {
  OPEN: { label: 'Aberto', fg: '#0369A1', bg: colors.infoSoft },
  IN_PROGRESS: { label: 'Em andamento', fg: '#B45309', bg: colors.warningSoft },
  RESOLVED: { label: 'Resolvido', fg: '#047857', bg: colors.successSoft },
  CLOSED: { label: 'Fechado', fg: '#475569', bg: '#E2E8F0' },
};

export const priorityInfo: Record<TicketPriority, { label: string; fg: string; bg: string; sla: string }> = {
  LOW: { label: 'Baixa', fg: '#047857', bg: colors.successSoft, sla: 'SLA 48h' },
  MEDIUM: { label: 'Média', fg: '#0369A1', bg: colors.infoSoft, sla: 'SLA 24h' },
  HIGH: { label: 'Alta', fg: '#B45309', bg: colors.warningSoft, sla: 'SLA 8h' },
  CRITICAL: { label: 'Crítica', fg: '#B91C1C', bg: colors.dangerSoft, sla: 'SLA 2h' },
};

export const roleLabel: Record<Role, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  CLIENT: 'Cliente',
};
