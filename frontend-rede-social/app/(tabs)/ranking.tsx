import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoVazio } from '@/components/estado-vazio';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { rotuloConquista } from '@/src/constants/categorias';
import { useAuth } from '@/src/contexts/AuthContext';
import { api } from '@/src/services/api';
import { RankingItem } from '@/src/types';

const MEDALHAS = ['🥇', '🥈', '🥉'];

export default function RankingScreen() {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];
  const { usuario } = useAuth();

  const [lista, setLista] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const dados = await api.ranking();
      setLista(dados);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.background }]} edges={['top']}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: cores.border }]}>
        <Text style={[styles.headerTitulo, { color: cores.tint }]}>Ranking de Guardiões 🏆</Text>
        <Text style={[styles.headerSubtitulo, { color: cores.icon }]}>
          Quem mais denuncia, mais protege o meio ambiente.
        </Text>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color={cores.tint} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, flexGrow: 1 }}
          renderItem={({ item, index }) => {
            const souEu = item.id === usuario?.id;
            return (
              <View
                style={[
                  styles.linha,
                  {
                    backgroundColor: souEu ? cores.tintSoft : cores.card,
                    borderColor: souEu ? cores.tint : cores.border,
                  },
                ]}>
                <Text style={styles.posicao}>{MEDALHAS[index] ?? `${index + 1}º`}</Text>

                <View style={[styles.avatar, { backgroundColor: cores.tintSoft }]}>
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
                  ) : (
                    <Text style={[styles.avatarIniciais, { color: cores.tint }]}>
                      {item.nome.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.nome, { color: cores.text }]} numberOfLines={1}>
                    {item.nome}
                    {souEu ? ' (você)' : ''}
                  </Text>
                  <Text style={[styles.selo, { color: cores.icon }]}>{rotuloConquista(item.totalDenuncias)}</Text>
                </View>

                <Text style={[styles.total, { color: cores.tint }]}>{item.totalDenuncias}</Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <EstadoVazio
              icone="trophy-outline"
              titulo="O ranking ainda está vazio"
              descricao="Publique a primeira denúncia e apareça aqui!"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 18, borderBottomWidth: 1 },
  headerTitulo: { fontSize: 20, fontWeight: '800' },
  headerSubtitulo: { fontSize: 12, marginTop: 4 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  posicao: { fontSize: 16, width: 30, textAlign: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarIniciais: { fontSize: 16, fontWeight: '700' },
  nome: { fontSize: 14, fontWeight: '700' },
  selo: { fontSize: 12, marginTop: 2 },
  total: { fontSize: 18, fontWeight: '800' },
});
