import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { Badge, Chip, Empty, ErrorBanner } from '../components/ui';
import { colors, priorityInfo, statusInfo } from '../theme';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import { RootStackParamList } from '../navigation/types';
import { formatDateTime, slaState } from '../utils/date';

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [items, setItems] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<TicketStatus | null>(null);
  const [priority, setPriority] = useState<TicketPriority | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const page = useRef(0);
  const last = useRef(true);
  const reqId = useRef(0);

  const load = useCallback(async (reset: boolean, s: TicketStatus | null, p: TicketPriority | null) => {
    const id = ++reqId.current;
    const nextPage = reset ? 0 : page.current + 1;
    try {
      const res = await api.listTickets({ page: nextPage, status: s, priority: p });
      if (id !== reqId.current) return;
      page.current = res.number;
      last.current = res.last;
      setTotal(res.totalElements);
      setItems((prev) => (reset ? res.content : [...prev, ...res.content]));
      setError('');
    } catch (e: any) {
      if (id === reqId.current) setError(e.message);
    } finally {
      if (id === reqId.current) {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true, status, priority);
    }, [load, status, priority]),
  );

  function changeFilter(s: TicketStatus | null, p: TicketPriority | null) {
    setLoading(true);
    setStatus(s);
    setPriority(p);
  }

  function renderItem({ item }: { item: Ticket }) {
    const st = statusInfo[item.status];
    const pr = priorityInfo[item.priority];
    const sla = slaState(item);
    return (
      <Pressable onPress={() => nav.navigate('TicketDetail', { ticket: item })} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        <View style={styles.cardTop}>
          <Text style={styles.id}>#{item.id}</Text>
          <Badge label={st.label} fg={st.fg} bg={st.bg} />
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.row}>
          <Badge label={pr.label} fg={pr.fg} bg={pr.bg} />
          <View style={styles.sla}>
            <Ionicons name={sla.breached ? 'alarm' : 'time-outline'} size={14} color={sla.breached ? colors.danger : colors.muted} />
            <Text style={{ fontSize: 12, color: sla.breached ? colors.danger : colors.muted, fontWeight: sla.breached ? '700' : '400' }}>{sla.label}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.meta}><Ionicons name="person-outline" size={12} /> {item.customerName ?? '-'}</Text>
          <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <Chip label="Todos" active={!status} onPress={() => changeFilter(null, priority)} />
          {STATUSES.map((s) => (
            <Chip key={s} label={statusInfo[s].label} active={status === s} onPress={() => changeFilter(status === s ? null : s, priority)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Chip label="Qualquer prioridade" active={!priority} onPress={() => changeFilter(status, null)} />
          {PRIORITIES.map((p) => (
            <Chip key={p} label={priorityInfo[p].label} active={priority === p} onPress={() => changeFilter(status, priority === p ? null : p)} />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => String(t.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true, status, priority); }} colors={[colors.primary]} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!last.current && !loadingMore && !loading) {
              setLoadingMore(true);
              load(false, status, priority);
            }
          }}
          ListHeaderComponent={
            <>
              {error ? <ErrorBanner message={error} onRetry={() => load(true, status, priority)} /> : null}
              {!error && <Text style={{ color: colors.muted, marginBottom: 10, fontSize: 13 }}>{total} chamado(s)</Text>}
            </>
          }
          ListEmptyComponent={!error ? <Empty icon="file-tray-outline" text="Nenhum chamado encontrado. Toque em + para abrir o primeiro." /> : null}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
        />
      )}

      <Pressable style={styles.fab} onPress={() => nav.navigate('NewTicket')}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { paddingVertical: 10, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  id: { color: colors.muted, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  desc: { color: colors.muted, marginTop: 4, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sla: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  meta: { fontSize: 12, color: colors.muted },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
});
