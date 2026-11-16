export type Role = 'ADMIN' | 'CLIENT' | 'TECHNICIAN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  slaDueDate: string;
  customerName: string | null;
  technicianName: string | null;
}

export interface TicketComment {
  id: number;
  content: string;
  userName: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  number: number;
  last: boolean;
  totalElements: number;
}

export interface Session {
  token: string;
  id: number;
  email: string;
  role: Role;
}
