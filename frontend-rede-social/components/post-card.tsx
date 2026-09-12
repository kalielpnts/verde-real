import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CategoriaBadge } from '@/components/categoria-badge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Post } from '@/src/types';

function formatarData(iso: string) {
  const data = new Date(iso);
  return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function PostCard({ post, onCurtir }: { post: Post; onCurtir: (id: string) => void }) {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];

  return (
    <View style={[styles.card, { backgroundColor: cores.card, borderColor: cores.border }]}>
      <View style={styles.cabecalho}>
        <View style={[styles.avatar, { backgroundColor: cores.tintSoft }]}>
          {post.autor.avatarUrl ? (
            <Image source={{ uri: post.autor.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarIniciais, { color: cores.tint }]}>
              {post.autor.nome.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.autor, { color: cores.text }]} numberOfLines={1}>
            {post.autor.nome}
          </Text>
          <Text style={[styles.data, { color: cores.icon }]}>{formatarData(post.criadoEm)}</Text>
        </View>

        <CategoriaBadge categoria={post.categoria} />
      </View>

      <Text style={[styles.conteudo, { color: cores.text }]}>{post.conteudo}</Text>

      {post.midiaUrl && post.tipoMidia === 'imagem' && (
        <Image source={{ uri: post.midiaUrl }} style={styles.midia} contentFit="cover" />
      )}

      {post.midiaUrl && post.tipoMidia === 'video' && (
        <View style={[styles.midia, styles.videoPlaceholder]}>
          <Ionicons name="play-circle" size={40} color="#fff" />
          <Text style={styles.videoTexto}>Vídeo anexado</Text>
        </View>
      )}

      {post.latitude != null && post.longitude != null && (
        <View style={styles.localizacao}>
          <Ionicons name="location-outline" size={14} color={cores.icon} />
          <Text style={[styles.localizacaoTexto, { color: cores.icon }]}>
            {post.latitude.toFixed(4)}, {post.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.curtirBotao}
        onPress={() => onCurtir(post.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons
          name={post.curtidoPorMim ? 'heart' : 'heart-outline'}
          size={20}
          color={post.curtidoPorMim ? cores.danger : cores.icon}
        />
        <Text style={[styles.curtirTexto, { color: cores.icon }]}>
          {post.totalCurtidas} {post.totalCurtidas === 1 ? 'apoio' : 'apoios'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 15,
    marginBottom: 12,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarIniciais: { fontSize: 16, fontWeight: '700' },
  autor: { fontSize: 15, fontWeight: '700' },
  data: { fontSize: 11 },
  conteudo: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
  midia: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  videoPlaceholder: {
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  videoTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  localizacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  localizacaoTexto: { fontSize: 12 },
  curtirBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  curtirTexto: { fontSize: 13, fontWeight: '600' },
});
