import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CATEGORIAS } from '@/src/constants/categorias';
import { useAuth } from '@/src/contexts/AuthContext';
import { api } from '@/src/services/api';
import { Categoria } from '@/src/types';

export default function NovaDenunciaScreen() {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];
  const router = useRouter();
  const { token } = useAuth();

  const [conteudo, setConteudo] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('Outro');
  const [midia, setMidia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [incluirLocalizacao, setIncluirLocalizacao] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function escolherMidia() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Preciso de acesso às suas fotos/vídeos para anexar uma prova.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.7,
      videoMaxDuration: 30,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      setMidia(resultado.assets[0]);
    }
  }

  async function obterLocalizacao(): Promise<{ latitude: number; longitude: number } | null> {
    const permissao = await Location.requestForegroundPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Preciso de acesso à localização para anexar o local da denúncia.');
      return null;
    }

    const posicao = await Location.getCurrentPositionAsync({});
    return { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude };
  }

  async function handlePublicar() {
    if (!token) return;
    if (!conteudo.trim()) {
      Alert.alert('Atenção', 'Descreva a denúncia antes de publicar.');
      return;
    }

    setEnviando(true);
    try {
      let midiaUrl: string | undefined;
      let tipoMidia: string | undefined;

      if (midia) {
        const form = new FormData();
        const nomeArquivo = midia.fileName ?? `midia.${midia.uri.split('.').pop()}`;
        // @ts-expect-error React Native aceita esse formato de arquivo no FormData
        form.append('midia', {
          uri: midia.uri,
          name: nomeArquivo,
          type: midia.mimeType ?? (midia.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        });

        const respostaUpload = await api.uploadMidia(token, form);
        midiaUrl = respostaUpload.midiaUrl;
        tipoMidia = respostaUpload.tipoMidia;
      }

      let localizacao: { latitude: number; longitude: number } | null = null;
      if (incluirLocalizacao) {
        localizacao = await obterLocalizacao();
      }

      await api.criarPost(token, {
        conteudo: conteudo.trim(),
        categoria,
        midiaUrl,
        tipoMidia,
        latitude: localizacao?.latitude ?? null,
        longitude: localizacao?.longitude ?? null,
      });

      setConteudo('');
      setMidia(null);
      setCategoria('Outro');
      setIncluirLocalizacao(false);
      Alert.alert('Denúncia publicada! 🌿', 'Obrigado por proteger o meio ambiente.');
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Ops', error instanceof Error ? error.message : 'Não foi possível publicar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.background }]} edges={['top']}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.titulo, { color: cores.text }]}>Nova denúncia</Text>
        <Text style={[styles.subtitulo, { color: cores.icon }]}>
          Descreva o que você presenciou. Fotos e localização ajudam a fiscalização a agir mais rápido.
        </Text>

        <TextInput
          style={[styles.textarea, { backgroundColor: cores.card, borderColor: cores.border, color: cores.text }]}
          placeholder="O que está acontecendo e onde?"
          placeholderTextColor={cores.icon}
          value={conteudo}
          onChangeText={setConteudo}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.rotulo, { color: cores.text }]}>Categoria</Text>
        <View style={styles.chips}>
          {CATEGORIAS.map((c) => {
            const ativo = categoria === c;
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  { backgroundColor: ativo ? cores.tint : cores.tintSoft, borderColor: ativo ? cores.tint : cores.border },
                ]}
                onPress={() => setCategoria(c)}>
                <Text style={[styles.chipTexto, { color: ativo ? '#fff' : cores.text }]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.rotulo, { color: cores.text }]}>Prova (opcional)</Text>
        {midia ? (
          <View style={styles.previewContainer}>
            {midia.type === 'video' ? (
              <View style={[styles.preview, styles.videoPreview]}>
                <Ionicons name="videocam" size={32} color="#fff" />
              </View>
            ) : (
              <Image source={{ uri: midia.uri }} style={styles.preview} />
            )}
            <TouchableOpacity style={styles.removerMidia} onPress={() => setMidia(null)}>
              <Ionicons name="close-circle" size={26} color={cores.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.anexarBotao, { borderColor: cores.border, backgroundColor: cores.card }]}
            onPress={escolherMidia}>
            <Ionicons name="camera-outline" size={22} color={cores.tint} />
            <Text style={[styles.anexarTexto, { color: cores.tint }]}>Adicionar foto ou vídeo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.localizacaoToggle, { borderColor: cores.border, backgroundColor: cores.card }]}
          onPress={() => setIncluirLocalizacao((v) => !v)}>
          <Ionicons
            name={incluirLocalizacao ? 'checkbox' : 'square-outline'}
            size={20}
            color={cores.tint}
          />
          <Text style={[styles.localizacaoTexto, { color: cores.text }]}>
            Anexar minha localização atual
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.publicarBotao, { backgroundColor: cores.tint }]}
          onPress={handlePublicar}
          disabled={enviando}>
          {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.publicarTexto}>Publicar denúncia</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitulo: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  textarea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    marginBottom: 18,
  },
  rotulo: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  chipTexto: { fontSize: 12, fontWeight: '600' },
  anexarBotao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 18,
  },
  anexarTexto: { fontSize: 14, fontWeight: '600' },
  previewContainer: { marginBottom: 18 },
  preview: { width: '100%', height: 180, borderRadius: 14 },
  videoPreview: { backgroundColor: '#1c1c1e', alignItems: 'center', justifyContent: 'center' },
  removerMidia: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 13 },
  localizacaoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  localizacaoTexto: { fontSize: 14, fontWeight: '600' },
  publicarBotao: { borderRadius: 14, padding: 16, alignItems: 'center' },
  publicarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
