import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function EstadoVazio({
  icone,
  titulo,
  descricao,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
}) {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];

  return (
    <View style={styles.container}>
      <Ionicons name={icone} size={48} color={cores.tint} />
      <Text style={[styles.titulo, { color: cores.text }]}>{titulo}</Text>
      <Text style={[styles.descricao, { color: cores.icon }]}>{descricao}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 8,
  },
  titulo: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  descricao: { fontSize: 13, textAlign: 'center' },
});
