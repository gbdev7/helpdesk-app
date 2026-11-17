import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { Button, ErrorBanner, Field, PressableScale } from '../components/ui';
import { colors, priorityInfo, radius } from '../theme';
import { TicketPriority } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTicket'>;
const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function NewTicketScreen({ navigation }: Props) {
  const { session } = useAuth();
  const isStaff = session?.role === 'ADMIN' || session?.role === 'TECHNICIAN';
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
      // Cliente não escolhe prioridade: a equipe de suporte define depois (padrão: Média)
      const ticket = await api.createTicket(title.trim(), description.trim(), isStaff ? priority : 'MEDIUM');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      navigation.replace('TicketDetail', { ticket });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Como podemos ajudar?</Text>
        <Text style={styles.sub}>Descreva o problema com detalhes para agilizar o atendimento.</Text>

        {error ? <ErrorBanner message={error} /> : null}
        <Field label="Título" icon="ticket" value={title} onChangeText={setTitle} placeholder="Ex.: Computador não liga" maxLength={150} />
        <Field label="Descrição" icon="message" value={description} onChangeText={setDescription} placeholder="O que aconteceu? Quando começou?" multiline />

        {isStaff ? (
          <>
            <Text style={styles.label}>Prioridade</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26 }}>
              {PRIORITIES.map((p) => {
                const info = priorityInfo[p];
                const active = priority === p;
                return (
                  <PressableScale
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[styles.prio, { width: '48%' }, active && { borderColor: info.fg, backgroundColor: info.bg }]}
                  >
                    <View style={[styles.dot, { backgroundColor: info.fg }]} />
                    <View>
                      <Text style={{ fontWeight: '800', color: info.fg }}>{info.label}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 1 }}>{info.sla}</Text>
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.note}>
            <Icon name="info" size={18} color={colors.primaryDark} />
            <Text style={{ flex: 1, color: colors.primaryDark, fontSize: 13, lineHeight: 19 }}>
              A prioridade e o prazo de atendimento serão definidos pela equipe de suporte.
            </Text>
          </View>
        )}
        <Button title="Abrir chamado" onPress={handleCreate} loading={loading} icon="send" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 22, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  prio: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#fff',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  note: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.primarySoft,
    padding: 14, borderRadius: radius.md, marginBottom: 26,
  },
});
