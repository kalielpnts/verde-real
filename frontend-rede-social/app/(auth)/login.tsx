import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { useAuth } from '@/src/contexts/AuthContext';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const cores = Colors[scheme];
  const router = useRouter();
  const { entrar, cadastrar } = useAuth();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'cliente' | 'empresa'>('cliente');
  const [carregando, setCarregando] = useState(false);

  async function handleEnviar() {
    if (!email.trim() || !senha.trim() || (modoCadastro && !nome.trim())) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setCarregando(true);
    try {
      if (modoCadastro) {
        const resultado = await cadastrar(nome.trim(), email.trim(), senha, tipo);
        if (resultado.precisaConfirmarEmail) {
          Alert.alert(
            'Quase lá!',
            'Enviamos um link de confirmação para o seu email. Confirme para poder entrar.'
          );
          setModoCadastro(false);
          return;
        }
      } else {
        await entrar(email.trim(), senha);
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Ops', error instanceof Error ? error.message : 'Algo deu errado.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cores.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.marca}>
            <Text style={styles.emoji}>🌿</Text>
            <Text style={[styles.titulo, { color: cores.tint }]}>Verde Real</Text>
            <Text style={[styles.subtitulo, { color: cores.icon }]}>
              Denuncie. Proteja. Transforme.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: cores.card, borderColor: cores.border }]}>
            <Text style={[styles.cardTitulo, { color: cores.text }]}>
              {modoCadastro ? 'Criar minha conta' : 'Entrar na minha conta'}
            </Text>

            {modoCadastro && (
              <TextInput
                style={[styles.input, { backgroundColor: cores.tintSoft, color: cores.text }]}
                placeholder="Nome completo / Razão social"
                placeholderTextColor={cores.icon}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={[styles.input, { backgroundColor: cores.tintSoft, color: cores.text }]}
              placeholder="Seu e-mail"
              placeholderTextColor={cores.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={[styles.input, { backgroundColor: cores.tintSoft, color: cores.text }]}
              placeholder="Sua senha"
              placeholderTextColor={cores.icon}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            {modoCadastro && (
              <View style={styles.tipoGrupo}>
                <TouchableOpacity
                  style={[
                    styles.tipoBotao,
                    { borderColor: cores.border },
                    tipo === 'cliente' && { backgroundColor: cores.tint, borderColor: cores.tint },
                  ]}
                  onPress={() => setTipo('cliente')}>
                  <Text style={[styles.tipoTexto, { color: tipo === 'cliente' ? '#fff' : cores.text }]}>
                    Cliente / Consumidor
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoBotao,
                    { borderColor: cores.border },
                    tipo === 'empresa' && { backgroundColor: cores.tint, borderColor: cores.tint },
                  ]}
                  onPress={() => setTipo('empresa')}>
                  <Text style={[styles.tipoTexto, { color: tipo === 'empresa' ? '#fff' : cores.text }]}>
                    Empresa (interessada no selo)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.botaoPrincipal, { backgroundColor: cores.tint }]}
              onPress={handleEnviar}
              disabled={carregando}>
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botaoTexto}>{modoCadastro ? 'Cadastrar' : 'Entrar'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trocarModo}
              onPress={() => setModoCadastro((v) => !v)}
              disabled={carregando}>
              <Text style={[styles.trocarModoTexto, { color: cores.tint }]}>
                {modoCadastro ? 'Já tenho conta — fazer login' : 'Não tenho conta — cadastrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  marca: { alignItems: 'center', marginBottom: 30 },
  emoji: { fontSize: 48 },
  titulo: { fontSize: 32, fontWeight: '800', marginTop: 4 },
  subtitulo: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 20, borderWidth: 1, padding: 22 },
  cardTitulo: { fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  tipoGrupo: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipoBotao: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  tipoTexto: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  botaoPrincipal: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  trocarModo: { marginTop: 16, alignItems: 'center' },
  trocarModoTexto: { fontSize: 13, fontWeight: '600' },
});