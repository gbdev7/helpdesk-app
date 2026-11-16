import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { Button, ErrorBanner, Field } from '../components/ui';
import { colors, priorityInfo } from '../theme';
import { TicketPriority } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTicket'>;
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function NewTicketScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!title.trim() || !description.trim()) {
      setError('Título e descrição são obrigatórios.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const ticket = await api.createTicket(title.trim(), description.trim(), priority);
      navigation.replace('TicketDetail', { ticket });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {error ? <ErrorBanner message={error} /> : null}
        <Field label="Título" value={title} onChangeText={setTitle} placeholder="Ex.: Computador não liga" maxLength={150} />
        <Field label="Descrição" value={description} onChangeText={setDescription} placeholder="Descreva o problema com o máximo de detalhes" multiline />

        <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 8 }}>Prioridade</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {PRIORITIES.map((p) => {
            const info = priorityInfo[p];
            const active = priority === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPriority(p)}
                style={{
                  width: '47.5%', padding: 12, borderRadius: 12, borderWidth: 2,
                  borderColor: active ? info.fg : colors.border, backgroundColor: active ? info.bg : '#fff',
                }}
              >
                <Text style={{ fontWeight: '800', color: info.fg }}>{info.label}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{info.sla}</Text>
              </Pressable>
            );
          })}
        </View>
        <Button title="Abrir chamado" onPress={handleCreate} loading={loading} icon="paper-plane-outline" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
