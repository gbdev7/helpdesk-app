import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../auth/AuthContext';
import { getBaseUrl } from '../api/client';
import { Text } from '../components/Text';
import { Icon, IconName } from '../components/Icon';
import { Avatar, Button } from '../components/ui';
import { colors, gradient, radius, roleLabel, shadow } from '../theme';

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const name = profile?.name ?? session?.email ?? 'Usuário';

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.avatarRing}>
          <Avatar name={name} size={86} />
        </View>
        <Text style={styles.name}>{profile?.name ?? 'Usuário'}</Text>
        <Text style={{ color: '#C7D2FE', marginBottom: 12 }}>{session?.email}</Text>
        {session && (
          <View style={styles.rolePill}>
            <Icon name={session.role === 'ADMIN' ? 'shield' : session.role === 'TECHNICIAN' ? 'wrench' : 'user'} size={14} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{roleLabel[session.role]}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={{ padding: 16 }}>
        <View style={[styles.card, shadow]}>
          <Row icon="server" label="Servidor" value={getBaseUrl()} />
          <View style={styles.divider} />
          <Row icon="fingerprint" label="ID do usuário" value={String(session?.id ?? '-')} />
          <View style={styles.divider} />
          <Row icon="info" label="Versão do app" value="1.0.0" />
        </View>

        <Button
          title="Sair da conta"
          variant="danger"
          icon="logout"
          onPress={() => Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: signOut },
          ])}
        />
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
        <Text style={{ fontWeight: '600', color: colors.text }} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 12, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  avatarRing: { padding: 4, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.35)', marginBottom: 14 },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 2 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: 18, marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
});
