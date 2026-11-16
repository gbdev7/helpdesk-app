import AsyncStorage from '@react-native-async-storage/async-storage';
import { Page, Role, Ticket, TicketComment, TicketPriority, TicketStatus, User } from '../types';

const URL_KEY = '@helpdesk/baseUrl';
// 10.0.2.2 = "localhost" do computador visto de dentro do emulador Android.
// Em celular físico, troque pelo IP do PC na tela de login (ex.: http://192.168.0.10:8080)
export const DEFAULT_BASE_URL = 'http://10.0.2.2:8080';

let baseUrl = DEFAULT_BASE_URL;
let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export async function loadBaseUrl(): Promise<string> {
  const saved = await AsyncStorage.getItem(URL_KEY);
  if (saved) baseUrl = saved;
  return baseUrl;
}

export async function setBaseUrl(url: string): Promise<void> {
  baseUrl = normalizeUrl(url);
  await AsyncStorage.setItem(URL_KEY, baseUrl);
}

export const getBaseUrl = () => baseUrl;
export const setToken = (t: string | null) => { token = t; };
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

export function normalizeUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  return u;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown, auth = true): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }

    if (!res.ok) {
      if (auth && token && res.status === 403 && onUnauthorized) onUnauthorized();
      throw new ApiError(extractMessage(data, res.status), res.status);
    }
    return data as T;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (e?.name === 'AbortError') {
      throw new ApiError(`Tempo esgotado ao acessar ${baseUrl}. Verifique o endereço do servidor e se o celular está na mesma rede.`, 0);
    }
    throw new ApiError(`Não foi possível conectar em ${baseUrl}. Confira o endereço do servidor e a rede.`, 0);
  } finally {
    clearTimeout(timer);
  }
}

function extractMessage(data: any, status: number): string {
  if (data?.message) return String(data.message);
  if (Array.isArray(data?.errors) && data.errors[0]?.defaultMessage) return String(data.errors[0].defaultMessage);
  if (data?.detail) return String(data.detail);
  if (status === 403) return 'Acesso negado. Faça login novamente.';
  if (status === 400) return 'Dados inválidos.';
  if (status === 404) return 'Recurso não encontrado.';
  return `Erro inesperado (${status}).`;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; type: string }>('POST', '/auth/login', { email, password }, false),

  register: (name: string, email: string, password: string, role: Role) =>
    request<User>('POST', '/users', { name, email, password, role }, false),

  listUsers: () => request<User[]>('GET', '/users'),
  getUser: (id: number) => request<User>('GET', `/users/${id}`),

  listTickets: (opts: { page: number; size?: number; status?: TicketStatus | null; priority?: TicketPriority | null }) => {
    const q = [`page=${opts.page}`, `size=${opts.size ?? 10}`, 'sort=createdAt,desc'];
    if (opts.status) q.push(`status=${opts.status}`);
    if (opts.priority) q.push(`priority=${opts.priority}`);
    return request<Page<Ticket>>('GET', `/tickets?${q.join('&')}`);
  },

  createTicket: (title: string, description: string, priority: TicketPriority) =>
    request<Ticket>('POST', '/tickets', { title, description, priority }),

  updateStatus: (id: number, status: TicketStatus, technicianId?: number | null) =>
    request<Ticket>('PATCH', `/tickets/${id}/status`, { status, technicianId: technicianId ?? null }),

  listComments: (id: number) => request<TicketComment[]>('GET', `/tickets/${id}/comments`),
  addComment: (id: number, content: string) =>
    request<TicketComment>('POST', `/tickets/${id}/comments`, { content }),
};
