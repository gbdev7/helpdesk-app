import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { fonts } from '../theme';

/** Text que escolhe a família Inter conforme o fontWeight do estilo. */
export function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style) || {};
  const w = String(flat.fontWeight ?? '400');
  const family =
    flat.fontFamily ??
    (w === '800' || w === '900' ? fonts.extrabold
      : w === '700' || w === 'bold' ? fonts.bold
      : w === '600' ? fonts.semibold
      : w === '500' ? fonts.medium
      : fonts.regular);
  return <RNText {...props} style={[style, { fontFamily: family, fontWeight: 'normal' }]} />;
}
