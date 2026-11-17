import React from 'react';
import {
  AlarmClock, CalendarDays, ChevronDown, ChevronRight, ChevronUp, CircleAlert, CircleUser, Clock, Eye, EyeOff,
  Fingerprint, Flag, Hand, Headset, Hourglass, Inbox, Info, Lock, LogIn, LogOut, Mail, MessageSquare, Plus, Save,
  Send, Server, ShieldCheck, Ticket, User, UserPlus, Users, Wrench, CheckCheck, Smartphone,
} from 'lucide-react-native';
import { colors } from '../theme';

const icons = {
  alarm: AlarmClock, calendar: CalendarDays, down: ChevronDown, right: ChevronRight, up: ChevronUp,
  alert: CircleAlert, profile: CircleUser, clock: Clock, eye: Eye, eyeOff: EyeOff, fingerprint: Fingerprint,
  flag: Flag, hand: Hand, headset: Headset, hourglass: Hourglass, inbox: Inbox, info: Info, lock: Lock,
  login: LogIn, logout: LogOut, mail: Mail, message: MessageSquare, plus: Plus, save: Save, send: Send,
  server: Server, shield: ShieldCheck, ticket: Ticket, user: User, userPlus: UserPlus, users: Users,
  wrench: Wrench, check: CheckCheck, phone: Smartphone,
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20, color = colors.text, strokeWidth = 2 }: {
  name: IconName; size?: number; color?: string; strokeWidth?: number;
}) {
  const C = icons[name];
  return <C size={size} color={color} strokeWidth={strokeWidth} />;
}
