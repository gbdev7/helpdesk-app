import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { getBaseUrl, setBaseUrl } from '../api/client';
import { Button, ErrorBanner, Field } from '../components/ui';
import { colors } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState(getBaseUrl());
  const [showServer, setShowServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function saveServer() {
    setBaseUrl(server).catch(() => undefined);
  }

  async function goToRegister() {
    await setBaseUrl(server);
    navigation.navigate('Register');
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await setBaseUrl(server);
      await signIn(email, password);
    } catch (e: any) {
      setError(e.message || 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.primary }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Ionicons name="headset" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>HelpDesk</Text>
          <Text style={styles.subtitle}>Central de chamados de suporte</Text>
        </View>

        <View style={styles.card}>
          {error ? <ErrorBanner message={error} /> : null}
          <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@email.com" />
          <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          <Pressable onPress={() => setShowServer((v) => !v)} style={styles.serverToggle}>
            <Ionicons name="server-outline" size={16} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 13 }}>Servidor: {server}</Text>
            <Ionicons name={showServer ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
          </Pressable>
          {showServer && (
            <Field
              label="Endereço da API"
              value={server}
              onChangeText={setServer}
              onEndEditing={saveServer}
              autoCapitalize="none"
              keyboardType="url"
              placeholder="http://192.168.0.10:8080"
            />
          )}

          <Button title="Entrar" onPress={handleLogin} loading={loading} icon="log-in-outline" />
          <Pressable onPress={goToRegister} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Não tem conta? Cadastre-se</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff' },
  subtitle: { color: '#C7D2FE', marginTop: 4 },
  card: { backgroundColor: colors.bg, borderRadius: 20, padding: 20 },
  serverToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
});
