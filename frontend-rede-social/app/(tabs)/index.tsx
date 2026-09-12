import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoVazio } from '@/components/estado-vazio';
import { PostCard } from '@/components/post-card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useSocket } from '@/src/contexts/SocketContext';
import { CATEGORIAS } from '@/src/constants/categorias';
import { api } from '@/src/services/api';
import { Post } from '@/src/types';

export default function FeedScreen() {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];
  const { token, usuario } = useAuth();
  const socket = useSocket();

  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null);

  const carregarPosts = useCallback(
    async (mostrarSpinner = true) => {
      if (mostrarSpinner) setCarregando(true);
      try {
        const dados = await api.listarPosts(token, categoriaFiltro ?? undefined);
        setPosts(dados);
      } catch (error) {
        console.error(error);
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [token, categoriaFiltro]
  );

  useEffect(() => {
    carregarPosts();
  }, [carregarPosts]);

  useEffect(() => {
    if (!socket) return;

    function aoReceberPost(novoPost: Post) {
      setPosts((atual) => {
        if (categoriaFiltro && novoPost.categoria !== categoriaFiltro) return atual;
        return [novoPost, ...atual];
      });
    }

    function aoCurtir({ postId, totalCurtidas }: { postId: string; totalCurtidas: number }) {
      setPosts((atual) => atual.map((p) => (p.id === postId ? { ...p, totalCurtidas } : p)));
    }

    socket.on('novo_post', aoReceberPost);
    socket.on('post_curtido', aoCurtir);

    return () => {
      socket.off('novo_post', aoReceberPost);
      socket.off('post_curtido', aoCurtir);
    };
  }, [socket, categoriaFiltro]);

  async function handleCurtir(postId: string) {
    if (!token) return;

    // Atualização otimista: reflete na hora, corrige depois se o backend discordar
    setPosts((atual) =>
      atual.map((p) =>
        p.id === postId
          ? {
              ...p,
              curtidoPorMim: !p.curtidoPorMim,
              totalCurtidas: p.curtidoPorMim ? p.totalCurtidas - 1 : p.totalCurtidas + 1,
            }
          : p
      )
    );

    try {
      await api.curtirPost(token, postId);
    } catch (error) {
      carregarPosts(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.background }]} edges={['top']}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { borderBottomColor: cores.border }]}>
        <Text style={[styles.headerTitulo, { color: cores.tint }]}>Verde Real 🌿</Text>
        {usuario && <Text style={[styles.headerSaudacao, { color: cores.icon }]}>Olá, {usuario.nome.split(' ')[0]}</Text>}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['Todas', ...CATEGORIAS]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtros}
        renderItem={({ item }) => {
          const ativo = item === 'Todas' ? categoriaFiltro === null : categoriaFiltro === item;
          return (
            <TouchableOpacity
              style={[
                styles.chip,
                {
                  backgroundColor: ativo ? cores.tint : cores.tintSoft,
                  borderColor: ativo ? cores.tint : cores.border,
                },
              ]}
              onPress={() => setCategoriaFiltro(item === 'Todas' ? null : item)}>
              <Text style={[styles.chipTexto, { color: ativo ? '#fff' : cores.text }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {carregando ? (
        <ActivityIndicator size="large" color={cores.tint} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} onCurtir={handleCurtir} />}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 20, flexGrow: 1 }}
          refreshing={atualizando}
          onRefresh={() => {
            setAtualizando(true);
            carregarPosts(false);
          }}
          ListEmptyComponent={
            <EstadoVazio
              icone="leaf-outline"
              titulo="Nenhuma denúncia por aqui ainda"
              descricao="Seja o primeiro a proteger o meio ambiente da sua região."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitulo: { fontSize: 20, fontWeight: '800' },
  headerSaudacao: { fontSize: 13 },
  filtros: { paddingHorizontal: 15, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipTexto: { fontSize: 12, fontWeight: '600' },
});
