import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Badge, Button, Chip, ErrorBanner } from '../components/ui';
import { colors, priorityInfo, statusInfo } from '../theme';
import { Ticket, TicketComment, TicketStatus, User } from '../types';
import { RootStackParamList } from '../navigation/types';
import { formatDateTime, slaState } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;
const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function TicketDetailScreen({ route }: Props) {
  const { session } = useAuth();
  const [ticket, setTicket] = useState<Ticket>(route.params.ticket);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>(ticket.status);
  const [techId, setTechId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canManage = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';

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

  async function saveStatus(status: TicketStatus, technicianId: number | null) {
    setSaving(true);
    try {
      const updated = await api.updateStatus(ticket.id, status, technicianId);
      setTicket(updated);
      setNewStatus(updated.status);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaving(false);
    }
  }

  const st = statusInfo[ticket.status];
  const pr = priorityInfo[ticket.priority];
  const sla = slaState(ticket);
  const changed = newStatus !== ticket.status || (techId !== null && technicians.find((t) => t.id === techId)?.name !== ticket.technicianName);

  const header = (
    <View>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: colors.muted, fontWeight: '700' }}>Chamado #{ticket.id}</Text>
          <Badge label={st.label} fg={st.fg} bg={st.bg} />
        </View>
        <Text style={styles.title}>{ticket.title}</Text>
        <Text style={styles.desc}>{ticket.description}</Text>

        <View style={styles.infoGrid}>
          <Info icon="flag-outline" label="Prioridade" value={pr.label} color={pr.fg} />
          <Info icon={sla.breached ? 'alarm' : 'time-outline'} label="SLA" value={sla.label} color={sla.breached ? colors.danger : colors.text} />
          <Info icon="person-outline" label="Solicitante" value={ticket.customerName ?? '-'} />
          <Info icon="construct-outline" label="Técnico" value={ticket.technicianName ?? 'Não atribuído'} />
          <Info icon="calendar-outline" label="Aberto em" value={formatDateTime(ticket.createdAt)} />
          <Info icon="hourglass-outline" label="Prazo SLA" value={formatDateTime(ticket.slaDueDate)} />
        </View>
      </View>

      {canManage && (
        <View style={styles.card}>
          <Text style={styles.section}>Gerenciar chamado</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
            {STATUSES.map((s) => (
              <Chip key={s} label={statusInfo[s].label} active={newStatus === s} onPress={() => setNewStatus(s)} />
            ))}
          </View>

          {technicians.length > 0 && (
            <>
              <Text style={[styles.section, { marginTop: 14 }]}>Técnico responsável</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
                {technicians.map((t) => (
                  <Chip key={t.id} label={t.name} active={techId === t.id} onPress={() => setTechId(t.id)} />
                ))}
              </View>
            </>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            {session?.role === 'TECHNICIAN' && ticket.status === 'OPEN' && (
              <Button
                title="Assumir"
                variant="outline"
                icon="hand-right-outline"
                style={{ flex: 1 }}
                loading={saving}
                onPress={() => saveStatus('IN_PROGRESS', session.id)}
              />
            )}
            <Button title="Salvar alterações" icon="save-outline" style={{ flex: 1 }} loading={saving} disabled={!changed} onPress={() => saveStatus(newStatus, techId)} />
          </View>
        </View>
      )}

      <Text style={[styles.section, { marginHorizontal: 16, marginTop: 6 }]}>Comentários ({comments.length})</Text>
      {error ? <View style={{ marginHorizontal: 16 }}><ErrorBanner message={error} onRetry={loadComments} /></View> : null}
      {loading && <ActivityIndicator style={{ margin: 20 }} color={colors.primary} />}
      {!loading && comments.length === 0 && !error && (
        <Text style={{ color: colors.muted, marginHorizontal: 16, marginBottom: 12 }}>Ainda não há comentários.</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={comments}
        keyExtractor={(c) => String(c.id)}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <View style={styles.avatar}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>{item.userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{item.userName}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }}>{formatDateTime(item.createdAt)}</Text>
              </View>
              <Text style={{ marginTop: 2, color: colors.text }}>{item.content}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          value={text}
          onChangeText={setText}
          placeholder="Escreva um comentário..."
          placeholderTextColor="#9CA3AF"
          multiline
        />
        <Pressable onPress={sendComment} disabled={sending || !text.trim()} style={[styles.send, (!text.trim() || sending) && { opacity: 0.5 }]}>
          {sending ? <ActivityIndicator color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Info({ icon, label, value, color }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; color?: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icon} size={16} color={colors.muted} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: color ?? colors.text }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, margin: 16, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  desc: { marginTop: 8, color: colors.text, lineHeight: 21 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, rowGap: 14 },
  info: { width: '50%', flexDirection: 'row', gap: 8, paddingRight: 8 },
  section: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 8 },
  comment: { flexDirection: 'row', gap: 10, backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 14 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  composerInput: { flex: 1, maxHeight: 110, backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
