import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Icon, IconName } from './Icon';
import { colors, fonts, gradient, radius, shadow } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children, style, onPress, disabled, haptic = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      onPress={() => {
        if (haptic) Haptics.selectionAsync().catch(() => undefined);
        onPress?.();
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function Button({
  title, onPress, loading, disabled, variant = 'primary', icon, style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'soft';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : variant === 'soft' ? colors.primaryDark : colors.primary;
  const content = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon && <Icon name={icon} size={19} color={fg} />}
      <Text style={{ fontSize: 15.5, fontWeight: '700', color: fg }}>{title}</Text>
    </View>
  );
  const base: ViewStyle = { minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
  const off = disabled || loading ? { opacity: 0.5 } : null;

  if (variant === 'primary') {
    return (
      <PressableScale onPress={onPress} disabled={disabled || loading} style={[base, shadow, { shadowColor: colors.primary, shadowOpacity: 0.3 }, off, style]}>
        <LinearGradient colors={gradient.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        {content}
      </PressableScale>
    );
  }
  const variantStyle: ViewStyle =
    variant === 'danger' ? { backgroundColor: colors.danger }
    : variant === 'soft' ? { backgroundColor: colors.primarySoft }
    : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
  return (
    <PressableScale onPress={onPress} disabled={disabled || loading} style={[base, variantStyle, off, style]}>
      {content}
    </PressableScale>
  );
}

export function Field({
  label, error, icon, secureTextEntry, ...props
}: TextInputProps & { label: string; error?: string; icon?: IconName }) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const multiline = props.multiline;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: colors.primary, backgroundColor: '#fff' },
          error ? { borderColor: colors.danger } : null,
          multiline && { alignItems: 'flex-start' },
        ]}
      >
        {icon && (
          <View style={multiline ? { marginTop: 14 } : undefined}>
            <Icon name={icon} size={18} color={focused ? colors.primary : colors.subtle} />
          </View>
        )}
        <TextInput
          placeholderTextColor={colors.subtle}
          {...props}
          secureTextEntry={secureTextEntry && hidden}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={[styles.input, multiline && { minHeight: 110, textAlignVertical: 'top' }]}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10}>
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={18} color={colors.subtle} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Badge({ label, fg, bg, dot }: { label: string; fg: string; bg: string; dot?: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: fg }} />}
      <Text style={{ fontSize: 12, fontWeight: '700', color: fg }}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : colors.muted }}>{label}</Text>
    </PressableScale>
  );
}

const AVATAR_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9', '#EF4444', '#14B8A6'];

export function Avatar({ name, size = 40 }: { name?: string | null; size?: number }) {
  const n = (name ?? '?').trim() || '?';
  let hash = 0;
  for (let i = 0; i < n.length; i++) hash = (hash * 31 + n.charCodeAt(i)) % 997;
  const bg = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.42 }}>{n.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.banner}>
      <Icon name="alert" size={20} color={colors.danger} />
      <Text style={{ flex: 1, color: '#B91C1C', fontSize: 13 }}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={{ color: '#B91C1C', fontWeight: '700' }}>Tentar de novo</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Empty({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={{ alignItems: 'center', padding: 40, gap: 14 }}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={34} color={colors.primary} />
      </View>
      <Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 21 }}>{text}</Text>
    </View>
  );
}

export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[{ backgroundColor: '#E2E8F0', borderRadius: 8, opacity }, style]} />;
}

export function TicketSkeleton() {
  return (
    <View style={[styles.skelCard, shadow]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton style={{ width: 40, height: 14 }} />
        <Skeleton style={{ width: 90, height: 22, borderRadius: 11 }} />
      </View>
      <Skeleton style={{ width: '70%', height: 18, marginTop: 14 }} />
      <Skeleton style={{ width: '95%', height: 12, marginTop: 10 }} />
      <Skeleton style={{ width: '60%', height: 12, marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text, marginBottom: 7 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8F9FC',
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 15.5, color: colors.text, fontFamily: fonts.regular },
  error: { color: colors.danger, fontSize: 12, marginTop: 4, fontFamily: fonts.regular },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' },
  chip: {
    paddingHorizontal: 15, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.border, marginRight: 8,
  },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.dangerSoft, padding: 13, borderRadius: radius.md, marginBottom: 14 },
  emptyIcon: { width: 78, height: 78, borderRadius: 39, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  skelCard: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 16, marginBottom: 14 },
});
