import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CORES_CATEGORIA } from '@/src/constants/categorias';
import { Categoria } from '@/src/types';

export function CategoriaBadge({ categoria }: { categoria: Categoria }) {
  const cor = CORES_CATEGORIA[categoria] ?? '#2F6B4F';

  return (
    <View style={[styles.badge, { backgroundColor: `${cor}22`, borderColor: cor }]}>
      <Text style={[styles.texto, { color: cor }]} numberOfLines={1}>
        {categoria}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 130,
  },
  texto: { fontSize: 11, fontWeight: '600' },
});
