import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { getBaseUrl, setBaseUrl } from '../api/client';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { Button, ErrorBanner, Field } from '../components/ui';
import { colors, gradient, radius } from '../theme';
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
    <LinearGradient colors={gradient.login} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={[styles.blob, { width: 280, height: 280, top: -90, right: -90 }]} />
      <View style={[styles.blob, { width: 200, height: 200, bottom: -60, left: -70 }]} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.logoWrap}>
            <View style={styles.logo}>
              <Icon name="headset" size={38} color={colors.primaryDark} strokeWidth={2.2} />
            </View>
            <Text style={styles.title}>HelpDesk</Text>
            <Text style={styles.subtitle}>Central de chamados de suporte</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcome}>Bem-vindo de volta</Text>
            <Text style={styles.welcomeSub}>Entre para acompanhar seus chamados</Text>

            {error ? <ErrorBanner message={error} /> : null}
            <Field label="E-mail" icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="voce@email.com" />
            <Field label="Senha" icon="lock" value={password} onChangeText={setPassword} secureTextEntry placeholder="Sua senha" />

            <Pressable onPress={() => setShowServer((v) => !v)} style={styles.serverToggle} hitSlop={8}>
              <Icon name="server" size={15} color={colors.muted} />
              <Text style={{ color: colors.muted, fontSize: 12.5, flex: 1 }} numberOfLines={1}>Servidor: {server}</Text>
              <Icon name={showServer ? 'up' : 'down'} size={16} color={colors.muted} />
            </Pressable>
            {showServer && (
              <Field
                label="Endereço da API"
                icon="phone"
                value={server}
                onChangeText={setServer}
                onEndEditing={saveServer}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="http://192.168.0.10:8080"
              />
            )}

            <Button title="Entrar" onPress={handleLogin} loading={loading} icon="login" />
            <Pressable onPress={goToRegister} style={{ marginTop: 18, alignItems: 'center' }} hitSlop={8}>
              <Text style={{ color: colors.muted }}>
                Não tem conta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Cadastre-se</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.07)' },
  logoWrap: { alignItems: 'center', marginBottom: 26 },
  logo: {
    width: 78, height: 78, borderRadius: 26, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { color: '#C7D2FE', marginTop: 4, fontSize: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: radius.xl, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 10,
  },
  welcome: { fontSize: 21, fontWeight: '800', color: colors.text },
  welcomeSub: { color: colors.muted, marginTop: 2, marginBottom: 20, fontSize: 13.5 },
  serverToggle: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 16 },
});
