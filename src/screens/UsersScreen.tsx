import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { Badge, Empty, ErrorBanner } from '../components/ui';
import { colors, roleLabel } from '../theme';
import { Role, User } from '../types';

const roleColor: Record<Role, { fg: string; bg: string }> = {
  ADMIN: { fg: colors.danger, bg: colors.dangerSoft },
  TECHNICIAN: { fg: colors.warning, bg: colors.warningSoft },
  CLIENT: { fg: colors.info, bg: colors.infoSoft },
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

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />;

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      data={users}
      keyExtractor={(u) => String(u.id)}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[colors.primary]} />}
      ListHeaderComponent={error ? <ErrorBanner message={error} onRetry={load} /> : null}
      ListEmptyComponent={!error ? <Empty icon="people-outline" text="Nenhum usuário cadastrado." /> : null}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{item.name}</Text>
            <Text style={{ color: colors.muted, marginBottom: 6 }}>{item.email}</Text>
            <Badge label={roleLabel[item.role]} {...roleColor[item.role]} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, padding: 14, borderRadius: 16, marginBottom: 10 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
