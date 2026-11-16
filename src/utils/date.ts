import { Ticket } from '../types';

/** O Spring devolve LocalDateTime sem fuso (ex.: 2026-11-13T10:02:11.123456). */
export function parseDate(value: string | null | undefined): Date {
  if (!value) return new Date(NaN);
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return new Date(value);
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0);
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatDateTime(value: string): string {
  const d = parseDate(value);
  if (isNaN(d.getTime())) return '-';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface SlaState {
  label: string;
  breached: boolean;
  done: boolean;
}

export function slaState(ticket: Ticket): SlaState {
  if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    return { label: 'Atendido', breached: false, done: true };
  }
  const diffMs = parseDate(ticket.slaDueDate).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const h = Math.floor(abs / 3600000);
  const min = Math.floor((abs % 3600000) / 60000);
  const text = h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h > 0 ? `${h}h ${min}min` : `${min}min`;
  return diffMs < 0
    ? { label: `SLA estourado há ${text}`, breached: true, done: false }
    : { label: `Vence em ${text}`, breached: false, done: false };
}
