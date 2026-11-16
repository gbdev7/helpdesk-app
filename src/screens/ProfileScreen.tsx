import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { getBaseUrl } from '../api/client';
import { Badge, Button } from '../components/ui';
import { colors, roleLabel } from '../theme';

export default function ProfileScreen() {
  const { session, profile, signOut } = useAuth();
  const name = profile?.name ?? session?.email ?? '';

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{profile?.name ?? 'Usuário'}</Text>
        <Text style={{ color: colors.muted, marginBottom: 10 }}>{session?.email}</Text>
        {session && <Badge label={roleLabel[session.role]} fg={colors.primary} bg={colors.primarySoft} />}
      </View>

      <View style={styles.card2}>
        <Row icon="server-outline" label="Servidor" value={getBaseUrl()} />
        <Row icon="finger-print-outline" label="ID do usuário" value={String(session?.id ?? '-')} />
        <Row icon="information-circle-outline" label="Versão do app" value="1.0.0" />
      </View>

      <Button
        title="Sair da conta"
        variant="danger"
        icon="log-out-outline"
        onPress={() => Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: signOut },
        ])}
      />
    </ScrollView>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
        <Text style={{ fontWeight: '600', color: colors.text }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  card2: { backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 24, gap: 16 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
});
