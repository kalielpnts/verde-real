import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { rotuloConquista } from '@/src/constants/categorias';
import { useAuth } from '@/src/contexts/AuthContext';
import { api } from '@/src/services/api';
import { RankingItem } from '@/src/types';

export default function PerfilScreen() {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];
  const router = useRouter();
  const { usuario, token, sair, atualizarUsuario } = useAuth();

  const [minhasStats, setMinhasStats] = useState<RankingItem | null>(null);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);

  const carregarStats = useCallback(async () => {
    try {
      const lista: RankingItem[] = await api.ranking();
      setMinhasStats(lista.find((item) => item.id === usuario?.id) ?? null);
    } catch (error) {
      console.error(error);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  async function handleTrocarAvatar() {
    if (!token) return;

    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Preciso de acesso às suas fotos para trocar o avatar.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (resultado.canceled || resultado.assets.length === 0) return;

    const imagem = resultado.assets[0];
    setEnviandoAvatar(true);
    try {
      const form = new FormData();
      const nomeArquivo = imagem.fileName ?? `avatar.${imagem.uri.split('.').pop()}`;
      // @ts-expect-error React Native aceita esse formato de arquivo no FormData
      form.append('midia', {
        uri: imagem.uri,
        name: nomeArquivo,
        type: imagem.mimeType ?? 'image/jpeg',
      });

      const respostaUpload = await api.uploadMidia(token, form);
      const perfilAtualizado = await api.atualizarPerfil(token, respostaUpload.midiaUrl);
      atualizarUsuario({ avatarUrl: perfilAtualizado.avatarUrl });
    } catch (error) {
      Alert.alert('Ops', error instanceof Error ? error.message : 'Não foi possível trocar o avatar.');
    } finally {
      setEnviandoAvatar(false);
    }
  }

  function handleSair() {
    Alert.alert('Sair da conta', 'Tem certeza que quer sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await sair();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  if (!usuario) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.background }]} edges={['top']}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.topo}>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: cores.tintSoft }]}
          onPress={handleTrocarAvatar}
          disabled={enviandoAvatar}>
          {enviandoAvatar ? (
            <ActivityIndicator color={cores.tint} />
          ) : usuario.avatarUrl ? (
            <Image source={{ uri: usuario.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarIniciais, { color: cores.tint }]}>
              {usuario.nome.charAt(0).toUpperCase()}
            </Text>
          )}
          <View style={[styles.editarIcone, { backgroundColor: cores.tint }]}>
            <Ionicons name="camera" size={13} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.nome, { color: cores.text }]}>{usuario.nome}</Text>
        <Text style={[styles.email, { color: cores.icon }]}>{usuario.email}</Text>

        {minhasStats && (
          <View style={[styles.seloContainer, { backgroundColor: cores.tintSoft }]}>
            <Text style={[styles.seloTexto, { color: cores.tint }]}>
              {rotuloConquista(minhasStats.totalDenuncias)}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.cardStats, { backgroundColor: cores.card, borderColor: cores.border }]}>
        <Ionicons name="megaphone-outline" size={22} color={cores.tint} />
        <View>
          <Text style={[styles.statsNumero, { color: cores.text }]}>{minhasStats?.totalDenuncias ?? 0}</Text>
          <Text style={[styles.statsLabel, { color: cores.icon }]}>denúncias publicadas</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.sairBotao, { borderColor: cores.danger }]} onPress={handleSair}>
        <Ionicons name="log-out-outline" size={18} color={cores.danger} />
        <Text style={[styles.sairTexto, { color: cores.danger }]}>Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topo: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarIniciais: { fontSize: 34, fontWeight: '800' },
  editarIcone: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nome: { fontSize: 20, fontWeight: '800', marginTop: 14 },
  email: { fontSize: 13, marginTop: 2 },
  seloContainer: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  seloTexto: { fontSize: 13, fontWeight: '700' },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 30,
  },
  statsNumero: { fontSize: 22, fontWeight: '800' },
  statsLabel: { fontSize: 12 },
  sairBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  sairTexto: { fontSize: 15, fontWeight: '700' },
});
