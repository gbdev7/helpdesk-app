import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { Text } from '../components/Text';
import { Icon, IconName } from '../components/Icon';
import { Button, ErrorBanner, Field, PressableScale } from '../components/ui';
import { colors, radius, roleLabel } from '../theme';
import { Role } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const ROLES: { role: Role; icon: IconName; desc: string }[] = [
  { role: 'CLIENT', icon: 'user', desc: 'Abre e acompanha chamados' },
  { role: 'TECHNICIAN', icon: 'wrench', desc: 'Atende e resolve chamados' },
  { role: 'ADMIN', icon: 'shield', desc: 'Gerencia tudo' },
];

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CLIENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Preencha nome, e-mail e uma senha de pelo menos 6 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.register(name.trim(), email.trim(), password, role);
      Alert.alert('Conta criada', 'Agora é só entrar com seu e-mail e senha.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Crie sua conta</Text>
        <Text style={styles.sub}>Preencha os dados abaixo para começar a usar o HelpDesk.</Text>

        {error ? <ErrorBanner message={error} /> : null}
        <Field label="Nome completo" icon="user" value={name} onChangeText={setName} placeholder="Maria Silva" />
        <Field label="E-mail" icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="maria@email.com" />
        <Field label="Senha" icon="lock" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 6 caracteres" />

        <Text style={styles.label}>Perfil de acesso</Text>
        <View style={{ gap: 10, marginBottom: 26 }}>
          {ROLES.map((r) => {
            const active = role === r.role;
            return (
              <PressableScale key={r.role} onPress={() => setRole(r.role)} style={[styles.roleCard, active && styles.roleActive]}>
                <View style={[styles.roleIcon, active && { backgroundColor: colors.primary }]}>
                  <Icon name={r.icon} size={20} color={active ? '#fff' : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{roleLabel[r.role]}</Text>
                  <Text style={{ fontSize: 12.5, color: colors.muted }}>{r.desc}</Text>
                </View>
                <View style={[styles.radio, active && { borderColor: colors.primary }]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </PressableScale>
            );
          })}
        </View>
        <Button title="Criar conta" onPress={handleRegister} loading={loading} icon="userPlus" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 22, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 14,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
  },
  roleActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  roleIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
});
