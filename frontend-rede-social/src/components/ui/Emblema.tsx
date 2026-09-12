import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmblemaProps {
  texto: string;
  variante?: 'padrao' | 'destaque';
}

export function Emblema({ texto, variante = 'padrao' }: EmblemaProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const cores = Colors[scheme];

  const corBorda = variante === 'destaque' ? cores.accent : cores.border;
  const corTexto = variante === 'destaque' ? cores.accent : cores.secondary;

  return (
    <View style={[styles.emblema, { borderColor: corBorda }]}>
      <Text style={[styles.texto, { color: corTexto, fontFamily: Fonts.mono }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emblema: {
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