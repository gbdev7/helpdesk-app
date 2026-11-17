import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Text } from '../components/Text';
import { Icon, IconName } from '../components/Icon';
import { Avatar, Badge, Button, Chip, ErrorBanner, PressableScale } from '../components/ui';
import { colors, fonts, gradient, priorityInfo, radius, shadow, statusInfo } from '../theme';
import { Ticket, TicketComment, TicketPriority, TicketStatus, User } from '../types';
import { RootStackParamList } from '../navigation/types';
import { formatDateTime, slaState } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;
const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketDetailScreen({ route }: Props) {
  const { session, profile } = useAuth();
  const [ticket, setTicket] = useState<Ticket>(route.params.ticket);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status);
  const [newPriority, setNewPriority] = useState<TicketPriority>(ticket.priority);
  const [techId, setTechId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canManage = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
  const polling = useRef(false);
  const ticketRef = useRef(ticket);
  const newStatusRef = useRef(newStatus);
  const newPriorityRef = useRef(newPriority);
  ticketRef.current = ticket;
  newStatusRef.current = newStatus;
  newPriorityRef.current = newPriority;

  // Atualização automática (a API não tem WebSocket): consulta a cada 4s enquanto a tela está aberta.
  const refresh = useCallback(async () => {
    if (polling.current) return;
    polling.current = true;
    try {
      const fresh = await api.listComments(ticket.id);
      setComments((prev) => (prev.length === fresh.length && prev[prev.length - 1]?.id === fresh[fresh.length - 1]?.id ? prev : fresh));

      // Não existe GET /tickets/{id}: procura o chamado nas primeiras páginas da listagem.
      for (let page = 0; page < 5; page++) {
        const res = await api.listTickets({ page, size: 50 });
        const found = res.content.find((t) => t.id === ticket.id);
        if (found) {
          const old = ticketRef.current;
          if (found.status !== old.status || found.technicianName !== old.technicianName || found.priority !== old.priority) {
            // só sobrescreve a seleção se o usuário não estiver editando
            if (newStatusRef.current === old.status) setNewStatus(found.status);
            if (newPriorityRef.current === old.priority) setNewPriority(found.priority);
            setTicket(found);
          }
          break;
        }
        if (res.last) break;
      }
    } catch {
      /* falhas de rede no polling são silenciosas */
    } finally {
      polling.current = false;
    }
  }, [ticket.id]);

  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(refresh, 4000);
      return () => clearInterval(timer);
    }, [refresh]),
  );

  const loadComments = useCallback(async () => {
    try {
      setComments(await api.listComments(ticket.id));
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticket.id]);

  useEffect(() => {
    loadComments();
    if (canManage) {
      api.listUsers()
        .then((users) => {
          const techs = users.filter((u) => u.role === 'TECHNICIAN');
          setTechnicians(techs);
          const current = techs.find((u) => u.name === ticket.technicianName);
          if (current) setTechId(current.id);
        })
        .catch(() => undefined);
    }
  }, [loadComments, canManage, ticket.technicianName]);

  async function sendComment() {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const c = await api.addComment(ticket.id, content);
      setComments((prev) => [...prev, c]);
      setText('');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSending(false);
    }
  }

  async function saveStatus(status: TicketStatus, technicianId: number | null, priority: TicketPriority) {
    setSaving(true);
    try {
      const updated = await api.updateStatus(ticket.id, status, technicianId, priority);
      setTicket(updated);
      setNewStatus(updated.status);
      setNewPriority(updated.priority);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaving(false);
    }
  }

  const st = statusInfo[ticket.status];
  const pr = priorityInfo[ticket.priority];
  const sla = slaState(ticket);
  const changed =
    newStatus !== ticket.status ||
    newPriority !== ticket.priority ||
    (techId !== null && technicians.find((t) => t.id === techId)?.name !== ticket.technicianName);

  const header = (
    <View>
      <View style={[styles.card, shadow]}>
        <View style={styles.cardTop}>
          <Text style={{ color: colors.subtle, fontWeight: '700' }}>Chamado #{ticket.id}</Text>
          <Badge label={st.label} fg={st.fg} bg={st.bg} dot />
        </View>
        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.desc}>{ticket.description}</Text>

        <View style={styles.infoGrid}>
          {canManage && <Info icon="flag" label="Prioridade" value={pr.label} color={pr.fg} />}
          {canManage && <Info icon={sla.breached ? 'alarm' : 'clock'} label="SLA" value={sla.label} color={sla.breached ? colors.danger : colors.text} />}
          <Info icon="user" label="Solicitante" value={ticket.customerName ?? '-'} />
          <Info icon="wrench" label="Técnico" value={ticket.technicianName ?? 'Não atribuído'} />
          <Info icon="calendar" label="Aberto em" value={formatDateTime(ticket.createdAt)} />
          {canManage && <Info icon="hourglass" label="Prazo SLA" value={formatDateTime(ticket.slaDueDate)} />}
        </View>
      </View>

      {canManage && (
        <View style={[styles.card, shadow]}>
          <Text style={styles.section}>Gerenciar chamado</Text>

          <Text style={styles.label}>Status</Text>
          <View style={styles.wrap}>
            {STATUSES.map((s) => (
              <Chip key={s} label={statusInfo[s].label} active={newStatus === s} onPress={() => setNewStatus(s)} />
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Prioridade</Text>
          <View style={styles.wrap}>
            {PRIORITIES.map((p) => (
              <Chip key={p} label={`${priorityInfo[p].label} · ${priorityInfo[p].sla}`} active={newPriority === p} onPress={() => setNewPriority(p)} />
            ))}
          </View>

          {technicians.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 14 }]}>Técnico responsável</Text>
              <View style={styles.wrap}>
                {technicians.map((t) => (
                  <Chip key={t.id} label={t.name} active={techId === t.id} onPress={() => setTechId(t.id)} />
                ))}
              </View>
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            {session?.role === 'TECHNICIAN' && ticket.status === 'OPEN' && (
              <Button
                title="Assumir"
                variant="soft"
                icon="hand"
                style={{ flex: 1 }}
                loading={saving}
                onPress={() => saveStatus('IN_PROGRESS', session.id, newPriority)}
              />
            )}
            <Button title="Salvar" icon="save" style={{ flex: 1 }} loading={saving} disabled={!changed} onPress={() => saveStatus(newStatus, techId, newPriority)} />
          </View>
        </View>
      )}

      <View style={styles.commentsHeader}>
        <Icon name="message" size={18} color={colors.text} />
        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Comentários</Text>
        <View style={styles.countPill}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primaryDark }}>{comments.length}</Text>
        </View>
      </View>
      {error ? <View style={{ marginHorizontal: 16 }}><ErrorBanner message={error} onRetry={loadComments} /></View> : null}
      {loading && <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />}
      {!loading && comments.length === 0 && !error && (
        <Text style={{ color: colors.muted, marginHorizontal: 20, marginBottom: 12 }}>Ainda não há comentários. Seja o primeiro a responder.</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={comments}
        keyExtractor={(c) => String(c.id)}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const mine = !!profile && profile.name === item.userName;
          return (
            <View style={[styles.msgRow, mine && { flexDirection: 'row-reverse' }]}>
              <Avatar name={item.userName} size={34} />
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: mine ? '#fff' : colors.text }}>{mine ? 'Você' : item.userName}</Text>
                  <Text style={{ fontSize: 11, color: mine ? '#C7D2FE' : colors.subtle }}>{formatDateTime(item.createdAt)}</Text>
                </View>
                <Text style={{ marginTop: 4, lineHeight: 20, color: mine ? '#fff' : colors.text }}>{item.content}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          value={text}
          onChangeText={setText}
          placeholder="Escreva um comentário..."
          placeholderTextColor={colors.subtle}
          multiline
        />
        <PressableScale onPress={sendComment} disabled={sending || !text.trim()} style={[styles.send, (!text.trim() || sending) && { opacity: 0.45 }]}>
          <LinearGradient colors={gradient.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          {sending ? <ActivityIndicator color="#fff" /> : <Icon name="send" size={19} color="#fff" />}
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

function Info({ icon, label, value, color }: { icon: IconName; label: string; value: string; color?: string }) {
  return (
    <View style={styles.infoWrap}>
      <View style={styles.info}>
        <View style={styles.infoIcon}>
          <Icon name={icon} size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: color ?? colors.text }} numberOfLines={2}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 20, marginHorizontal: 16, marginTop: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 21, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  desc: { marginTop: 8, color: colors.muted, lineHeight: 22, fontSize: 14.5 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, rowGap: 12 },
  infoWrap: { width: '50%', paddingRight: 8 },
  info: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#F8F9FC', padding: 10, borderRadius: radius.md },
  infoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 14 },
  label: { fontSize: 12.5, fontWeight: '600', color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  commentsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  countPill: { backgroundColor: colors.primarySoft, paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999 },
  msgRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12, alignItems: 'flex-end' },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4, ...shadow, shadowOpacity: 0.05 },
  composer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border,
  },
  composerInput: {
    flex: 1, maxHeight: 110, backgroundColor: colors.bg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11,
    fontSize: 15, color: colors.text, fontFamily: fonts.regular,
  },
  send: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
