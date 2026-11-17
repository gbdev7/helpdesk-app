import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { Avatar, Badge, Chip, Empty, ErrorBanner, PressableScale, TicketSkeleton } from '../components/ui';
import { colors, gradient, priorityInfo, radius, roleLabel, shadow, statusInfo } from '../theme';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import { RootStackParamList } from '../navigation/types';
import { formatDateTime, slaState } from '../utils/date';

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, profile } = useAuth();
  const isStaff = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
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

  // Atualização automática da primeira página a cada 5s (só se o usuário não rolou para páginas seguintes)
  useFocusEffect(
    useCallback(() => {
      const timer = setInterval(() => {
        if (page.current === 0) load(true, status, priority);
      }, 5000);
      return () => clearInterval(timer);
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
    const accent = isStaff ? pr.fg : st.fg;
    return (
      <PressableScale onPress={() => nav.navigate('TicketDetail', { ticket: item })} style={[styles.card, shadow]}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={{ flex: 1, padding: 16, paddingLeft: 14 }}>
          <View style={styles.cardTop}>
            <Text style={styles.id}>#{item.id}</Text>
            <Badge label={st.label} fg={st.fg} bg={st.bg} dot />
          </View>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

          {isStaff && (
            <View style={styles.row}>
              <Badge label={pr.label} fg={pr.fg} bg={pr.bg} />
              <View style={styles.sla}>
                <Icon name={sla.breached ? 'alarm' : 'clock'} size={14} color={sla.breached ? colors.danger : colors.muted} />
                <Text style={{ fontSize: 12, color: sla.breached ? colors.danger : colors.muted, fontWeight: sla.breached ? '700' : '500' }}>{sla.label}</Text>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <Avatar name={item.customerName} size={24} />
            <Text style={styles.meta} numberOfLines={1}>{item.customerName ?? '-'}</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
          </View>
        </View>
      </PressableScale>
    );
  }

  const firstName = (profile?.name ?? session?.email ?? '').split(' ')[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroHi}>Olá, {firstName || 'bem-vindo'}</Text>
          <Text style={styles.heroSub}>
            {loading ? 'Carregando chamados...' : `${total} chamado${total === 1 ? '' : 's'} ${status || priority ? 'no filtro' : 'no total'}`}
          </Text>
        </View>
        {session && (
          <View style={styles.rolePill}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{roleLabel[session.role]}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <Chip label="Todos" active={!status} onPress={() => changeFilter(null, priority)} />
          {STATUSES.map((s) => (
            <Chip key={s} label={statusInfo[s].label} active={status === s} onPress={() => changeFilter(status === s ? null : s, priority)} />
          ))}
        </ScrollView>
        {isStaff && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 8 }}>
            <Chip label="Qualquer prioridade" active={!priority} onPress={() => changeFilter(status, null)} />
            {PRIORITIES.map((p) => (
              <Chip key={p} label={priorityInfo[p].label} active={priority === p} onPress={() => changeFilter(status, priority === p ? null : p)} />
            ))}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View style={{ padding: 16 }}>
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(t) => String(t.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 170 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true, status, priority); }} colors={[colors.primary]} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!last.current && !loadingMore && !loading) {
              setLoadingMore(true);
              load(false, status, priority);
            }
          }}
          ListHeaderComponent={error ? <ErrorBanner message={error} onRetry={() => load(true, status, priority)} /> : null}
          ListEmptyComponent={!error ? <Empty icon="inbox" text={"Nenhum chamado por aqui.\nToque no + para abrir o primeiro."} /> : null}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
        />
      )}

      <PressableScale onPress={() => nav.navigate('NewTicket')} style={styles.fab}>
        <LinearGradient colors={gradient.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <Icon name="plus" size={28} color="#fff" strokeWidth={2.5} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 26,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  heroHi: { color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: -0.3 },
  heroSub: { color: '#C7D2FE', marginTop: 3, fontSize: 13.5 },
  rolePill: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  filters: { paddingVertical: 14 },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, marginBottom: 14, overflow: 'hidden' },
  accent: { width: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id: { color: colors.subtle, fontWeight: '700', fontSize: 13 },
  title: { fontSize: 16.5, fontWeight: '700', color: colors.text, letterSpacing: -0.2 },
  desc: { color: colors.muted, marginTop: 5, marginBottom: 12, lineHeight: 20, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  sla: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  meta: { fontSize: 12, color: colors.muted },
  fab: {
    position: 'absolute', right: 20, bottom: 100, width: 60, height: 60, borderRadius: 22, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', elevation: 10,
    shadowColor: colors.primary, shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 8 },
  },
});
