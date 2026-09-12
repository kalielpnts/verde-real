import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmblemaProps {
  texto: string;
  variante?: 'padrao' | 'destaque';
  icone?: keyof typeof Ionicons.glyphMap;
  corFixa?: { borda: string; texto: string };
}

export function Emblema({ texto, variante = 'padrao', icone, corFixa }: EmblemaProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const cores = Colors[scheme];

  const corBorda = corFixa?.borda ?? (variante === 'destaque' ? cores.accent : cores.border);
  const corTexto = corFixa?.texto ?? (variante === 'destaque' ? cores.accent : cores.secondary);

  return (
    <View style={[styles.emblema, { borderColor: corBorda }]}>
      {icone && <Ionicons name={icone} size={12} color={corTexto} style={{ marginRight: 5 }} />}
      <Text style={[styles.texto, { color: corTexto, fontFamily: Fonts.mono }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emblema: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  texto: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});