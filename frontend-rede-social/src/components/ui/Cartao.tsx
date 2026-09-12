import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { Colors, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CartaoProps extends ViewProps {
  comSombra?: boolean;
}

export function Cartao({ style, comSombra = true, children, ...rest }: CartaoProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const cores = Colors[scheme];

  return (
    <View style={styles.wrapper}>
      {comSombra && <View style={[styles.sombra, { backgroundColor: cores.tint }]} />}
      <View
        style={[styles.cartao, { backgroundColor: cores.card, borderColor: cores.border }, style]}
        {...rest}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  sombra: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: Radius,
    opacity: 0.15,
  },
  cartao: {
    borderWidth: 1,
    borderRadius: Radius,
    padding: 16,
  },
});