import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Index() {
  const { usuario, carregando } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.background }}>
        <ActivityIndicator size="large" color={cores.tint} />
      </View>
    );
  }

  return <Redirect href={usuario ? '/(tabs)' : '/(auth)/login'} />;
}
