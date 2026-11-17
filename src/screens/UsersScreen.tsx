import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { Text } from '../components/Text';
import { Avatar, Badge, Empty, ErrorBanner, Skeleton } from '../components/ui';
import { colors, radius, roleLabel, shadow } from '../theme';
import { Role, User } from '../types';

const roleColor: Record<Role, { fg: string; bg: string }> = {
  ADMIN: { fg: '#B91C1C', bg: colors.dangerSoft },
  TECHNICIAN: { fg: '#B45309', bg: colors.warningSoft },
  CLIENT: { fg: '#0369A1', bg: colors.infoSoft },
};

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setUsers(await api.listUsers());
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const count = (r: Role) => users.filter((u) => u.role === r).length;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 78, borderRadius: radius.lg, marginBottom: 12 }} />)}
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={users}
      keyExtractor={(u) => String(u.id)}
      contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
      ListHeaderComponent={
        <>
          {error ? <ErrorBanner message={error} onRetry={load} /> : null}
          <View style={styles.stats}>
            {(['ADMIN', 'TECHNICIAN', 'CLIENT'] as Role[]).map((r) => (
              <View key={r} style={[styles.stat, shadow]}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: roleColor[r].fg }}>{count(r)}</Text>
                <Text style={{ fontSize: 11.5, color: colors.muted, marginTop: 2 }}>{roleLabel[r]}{count(r) === 1 ? '' : 's'}</Text>
              </View>
            ))}
          </View>
        </>
      }
      ListEmptyComponent={!error ? <Empty icon="users" text="Nenhum usuário cadastrado." /> : null}
      renderItem={({ item }) => (
        <View style={[styles.card, shadow]}>
          <Avatar name={item.name} size={48} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{item.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 7 }}>{item.email}</Text>
            <Badge label={roleLabel[item.role]} {...roleColor[item.role]} dot />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: 14, alignItems: 'center' },
  card: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.card, padding: 14, borderRadius: radius.lg, marginBottom: 12 },
});
