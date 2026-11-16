import { TicketPriority, TicketStatus, Role } from './types';

export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  bg: '#F3F4F8',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  info: '#0284C7',
  infoSoft: '#E0F2FE',
};

export const statusInfo: Record<TicketStatus, { label: string; fg: string; bg: string }> = {
  OPEN: { label: 'Aberto', fg: colors.info, bg: colors.infoSoft },
  IN_PROGRESS: { label: 'Em andamento', fg: colors.warning, bg: colors.warningSoft },
  RESOLVED: { label: 'Resolvido', fg: colors.success, bg: colors.successSoft },
  CLOSED: { label: 'Fechado', fg: colors.muted, bg: '#E5E7EB' },
};

export const priorityInfo: Record<TicketPriority, { label: string; fg: string; bg: string; sla: string }> = {
  LOW: { label: 'Baixa', fg: colors.success, bg: colors.successSoft, sla: 'SLA 48h' },
  MEDIUM: { label: 'Média', fg: colors.info, bg: colors.infoSoft, sla: 'SLA 24h' },
  HIGH: { label: 'Alta', fg: colors.warning, bg: colors.warningSoft, sla: 'SLA 8h' },
  CRITICAL: { label: 'Crítica', fg: colors.danger, bg: colors.dangerSoft, sla: 'SLA 2h' },
};

export const roleLabel: Record<Role, string> = {
  ADMIN: 'Administrador',
  TECHNICIAN: 'Técnico',
  CLIENT: 'Cliente',
};
