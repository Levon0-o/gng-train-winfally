import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { AccentTheme } from '../lib/profile';

const accents: Record<AccentTheme, string> = {
  red: '#E34B4B',
  blue: '#4C9AD6',
  green: '#55B88A',
  amber: '#D69A4C',
};
let activeAccent: AccentTheme = 'red';

export function setAccentTheme(theme: AccentTheme) {
  activeAccent = theme;
}

export const C = {
  bg: '#101214', panel: '#191D21', panel2: '#22272C', line: '#343A40',
  get red() { return accents[activeAccent]; },
  text: '#F1F2F3', muted: '#92999F', steel: '#B8C0C7',
  green: '#70B88A',
};

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: C.bg, paddingHorizontal: 20, paddingTop: 58 }}>{children}</View>;
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: C.red, fontSize: 10, fontWeight: '900', letterSpacing: 2 }}>{children}</Text>;
}
export function Heading({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: C.text, fontSize: 29, fontWeight: '900', letterSpacing: -0.8, marginTop: 5 }}>{children}</Text>;
}
export function Panel({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 13, padding: 16 }, style]}>{children}</View>;
}
export function Label({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[{ color: C.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1 }, style]}>{children}</Text>;
}
