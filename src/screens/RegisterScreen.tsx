import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { Button, Chip, ErrorBanner, Field } from '../components/ui';
import { colors, roleLabel } from '../theme';
import { Role } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
const ROLES: Role[] = ['CLIENT', 'TECHNICIAN', 'ADMIN'];

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
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {error ? <ErrorBanner message={error} /> : null}
        <Field label="Nome completo" value={name} onChangeText={setName} placeholder="Maria Silva" />
        <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="maria@email.com" />
        <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholder="mínimo 6 caracteres" />
        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Perfil</Text>
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          {ROLES.map((r) => (
            <Chip key={r} label={roleLabel[r]} active={role === r} onPress={() => setRole(r)} />
          ))}
        </View>
        <Button title="Criar conta" onPress={handleRegister} loading={loading} icon="person-add-outline" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
