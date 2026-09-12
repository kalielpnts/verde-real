import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/src/components/ui/Botao';
import { Cartao } from '@/src/components/ui/Cartao';
import { Emblema } from '@/src/components/ui/Emblema';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { rotuloConquista } from '@/src/constants/categorias';
import { useAuth } from '@/src/contexts/AuthContext';
import { atualizarAvatar } from '@/src/services/profile';
import { buscarRanking } from '@/src/services/ranking';
import { enviarMidia } from '@/src/services/upload';
import { RankingItem } from '@/src/types';

export default function PerfilScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const cores = Colors[scheme];
  const router = useRouter();
  const { usuario, sair, atualizarUsuario } = useAuth();

  const [minhasStats, setMinhasStats] = useState<RankingItem | null>(null);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);

  const carregarStats = useCallback(async () => {
    try {
      const lista: RankingItem[] = await buscarRanking();
      setMinhasStats(lista.find((item) => item.id === usuario?.id) ?? null);
    } catch (error) {
      console.error(error);
    }
  }, [usuario?.id]);

  useEffect(() => {
    carregarStats();
  }, [carregarStats]);

  async function handleTrocarAvatar() {
    if (!usuario) return;

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
      const nomeArquivo = imagem.fileName ?? `avatar.${imagem.uri.split('.').pop()}`;
      const contentType = imagem.mimeType ?? 'image/jpeg';
      const url = await enviarMidia(usuario.id, imagem.uri, nomeArquivo, contentType);
      await atualizarAvatar(usuario.id, url);
      atualizarUsuario({ avatarUrl: url });
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
          style={[styles.avatar, { backgroundColor: cores.tintSoft, borderColor: cores.border }]}
          onPress={handleTrocarAvatar}
          disabled={enviandoAvatar}>
          {enviandoAvatar ? (
            <ActivityIndicator color={cores.tint} />
          ) : usuario.avatarUrl ? (
            <Image source={{ uri: usuario.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarIniciais, { color: cores.tint, fontFamily: Fonts.bold }]}>
              {usuario.nome.charAt(0).toUpperCase()}
            </Text>
          )}
          <View style={[styles.editarIcone, { backgroundColor: cores.tint }]}>
            <Ionicons name="camera" size={13} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.nome, { color: cores.text, fontFamily: Fonts.bold }]}>{usuario.nome}</Text>
        <Text style={[styles.email, { color: cores.icon, fontFamily: Fonts.regular }]}>{usuario.email}</Text>

        <View style={{ marginTop: 12 }}>
          <Emblema
            texto={usuario.tipo === 'empresa' ? 'Conta empresa' : rotuloConquista(minhasStats?.totalDenuncias ?? 0)}
            icone={usuario.tipo === 'empresa' ? 'business-outline' : 'ribbon-outline'}
            variante="destaque"
          />
        </View>
      </View>

      <Cartao>
        <View style={styles.statsLinha}>
          <Ionicons name="megaphone-outline" size={22} color={cores.tint} />
          <View>
            <Text style={[styles.statsNumero, { color: cores.text, fontFamily: Fonts.bold }]}>
              {minhasStats?.totalDenuncias ?? 0}
            </Text>
            <Text style={[styles.statsLabel, { color: cores.icon, fontFamily: Fonts.mono }]}>
              DENÚNCIAS PUBLICADAS
            </Text>
          </View>
        </View>
      </Cartao>

      <Botao
        titulo="Sair da conta"
        onPress={handleSair}
        variante="perigo"
        style={{ marginTop: 24 }}
      />
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarIniciais: { fontSize: 34 },
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
  nome: { fontSize: 20, marginTop: 14 },
  email: { fontSize: 13, marginTop: 2 },
  statsLinha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statsNumero: { fontSize: 22 },
  statsLabel: { fontSize: 10, letterSpacing: 0.5 },
});