import { Ticket } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  NewTicket: undefined;
  TicketDetail: { ticket: Ticket };
};

export type TabParamList = {
  Tickets: undefined;
  Users: undefined;
  Profile: undefined;
};
