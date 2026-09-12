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

import { Emblema } from '@/src/components/ui/Emblema';
import { Botao } from '@/src/components/ui/Botao';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/contexts/AuthContext';

type Aba = 'entrar' | 'cadastro' | 'recuperar';

export default function LoginScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const cores = Colors[scheme];
  const router = useRouter();
  const { entrar, cadastrar, recuperarSenha } = useAuth();

  const [aba, setAba] = useState<Aba>('entrar');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'cliente' | 'empresa'>('cliente');
  const [carregando, setCarregando] = useState(false);

  async function handleEnviar() {
    if (aba === 'recuperar') {
      if (!email.trim()) {
        Alert.alert('Atenção', 'Informe seu e-mail.');
        return;
      }
      setCarregando(true);
      try {
        await recuperarSenha(email.trim());
        Alert.alert(
          'Verifique seu email',
          'Se este email estiver cadastrado, você vai receber um link para redefinir sua senha.'
        );
        setAba('entrar');
      } catch (error) {
        Alert.alert('Ops', error instanceof Error ? error.message : 'Algo deu errado.');
      } finally {
        setCarregando(false);
      }
      return;
    }

    if (!email.trim() || !senha.trim() || (aba === 'cadastro' && !nome.trim())) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setCarregando(true);
    try {
      if (aba === 'cadastro') {
        const resultado = await cadastrar(nome.trim(), email.trim(), senha, tipo);
        if (resultado.precisaConfirmarEmail) {
          Alert.alert(
            'Quase lá!',
            'Enviamos um link de confirmação para o seu email. Confirme para poder entrar.'
          );
          setAba('entrar');
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
    <SafeAreaView style={[styles.container, { backgroundColor: cores.tint === cores.tint ? cores.background : cores.background }]}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Painel escuro de marca, igual ao lado esquerdo do site */}
          <View style={[styles.hero, { backgroundColor: cores.secondary }]}>
            <Text style={styles.heroEmoji}>🌱</Text>
            <Text style={[styles.heroTitulo, { fontFamily: Fonts.bold }]}>Verde Real</Text>
            <Text style={[styles.heroTag, { fontFamily: Fonts.mono, color: cores.tintSoft }]}>
              TRANSPARÊNCIA AMBIENTAL
            </Text>
            <Text style={[styles.heroFrase, { fontFamily: Fonts.regular }]}>
              "O futuro é verde,{'\n'}mas só se for verdadeiro."
            </Text>
          </View>

          {/* Painel claro do formulário */}
          <View style={[styles.formPainel, { backgroundColor: cores.card }]}>
            <Text style={[styles.formTitulo, { color: cores.text, fontFamily: Fonts.bold }]}>
              Acessar plataforma
            </Text>

            <View style={[styles.abas, { borderColor: cores.border }]}>
              {(['entrar', 'cadastro', 'recuperar'] as Aba[]).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.abaBotao}
                  onPress={() => setAba(item)}>
                  <Text
                    style={[
                      styles.abaTexto,
                      { fontFamily: Fonts.semibold, color: aba === item ? cores.tint : cores.icon },
                    ]}>
                    {item === 'entrar' ? 'ENTRAR' : item === 'cadastro' ? 'CRIAR CONTA' : 'RECUPERAR'}
                  </Text>
                  {aba === item && <View style={[styles.abaLinha, { backgroundColor: cores.tint }]} />}
                </TouchableOpacity>
              ))}
            </View>

            {aba === 'cadastro' && (
              <>
                <Text style={[styles.rotulo, { color: cores.icon, fontFamily: Fonts.mono }]}>NOME / RAZÃO SOCIAL</Text>
                <TextInput
                  style={[styles.input, { borderColor: cores.border, color: cores.text, fontFamily: Fonts.regular }]}
                  placeholder="Seu nome completo"
                  placeholderTextColor={cores.icon}
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={[styles.rotulo, { color: cores.icon, fontFamily: Fonts.mono }]}>E-MAIL</Text>
            <TextInput
              style={[styles.input, { borderColor: cores.border, color: cores.text, fontFamily: Fonts.regular }]}
              placeholder="seu@email.com"
              placeholderTextColor={cores.icon}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {aba !== 'recuperar' && (
              <>
                <Text style={[styles.rotulo, { color: cores.icon, fontFamily: Fonts.mono }]}>SENHA</Text>
                <TextInput
                  style={[styles.input, { borderColor: cores.border, color: cores.text, fontFamily: Fonts.regular }]}
                  placeholder="••••••••"
                  placeholderTextColor={cores.icon}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />
              </>
            )}

            {aba === 'cadastro' && (
              <>
                <Text style={[styles.rotulo, { color: cores.icon, fontFamily: Fonts.mono }]}>TIPO DE CONTA</Text>
                <View style={styles.tipoGrupo}>
                  <TouchableOpacity
                    style={[
                      styles.tipoBotao,
                      { borderColor: cores.border },
                      tipo === 'cliente' && { backgroundColor: cores.tint, borderColor: cores.tint },
                    ]}
                    onPress={() => setTipo('cliente')}>
                    <Text
                      style={[
                        styles.tipoTexto,
                        { fontFamily: Fonts.semibold, color: tipo === 'cliente' ? cores.card : cores.text },
                      ]}>
                      Cliente
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tipoBotao,
                      { borderColor: cores.border },
                      tipo === 'empresa' && { backgroundColor: cores.tint, borderColor: cores.tint },
                    ]}
                    onPress={() => setTipo('empresa')}>
                    <Text
                      style={[
                        styles.tipoTexto,
                        { fontFamily: Fonts.semibold, color: tipo === 'empresa' ? cores.card : cores.text },
                      ]}>
                      Empresa
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Botao
              titulo={aba === 'entrar' ? 'Entrar' : aba === 'cadastro' ? 'Cadastrar' : 'Enviar link'}
              onPress={handleEnviar}
              carregando={carregando}
              style={{ marginTop: 20 }}
            />

            <View style={{ marginTop: 16, alignItems: 'center' }}>
              <Emblema texto="🌱 Rede social de transparência ambiental" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 28,
    alignItems: 'flex-start',
  },
  heroEmoji: { fontSize: 32, marginBottom: 8 },
  heroTitulo: { fontSize: 30, color: '#faf4eb' },
  heroTag: { fontSize: 11, letterSpacing: 2, marginTop: 6, marginBottom: 20 },
  heroFrase: { fontSize: 16, color: '#faf4eb', lineHeight: 24 },
  formPainel: {
    flex: 1,
    borderRadius: Radius,
    padding: 24,
    marginTop: -16,
  },
  formTitulo: { fontSize: 20, marginBottom: 18 },
  abas: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 20 },
  abaBotao: { marginRight: 24, paddingBottom: 10 },
  abaTexto: { fontSize: 12, letterSpacing: 1 },
  abaLinha: { height: 2, marginTop: 8 },
  rotulo: { fontSize: 11, letterSpacing: 1, marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: Radius,
    padding: 13,
    fontSize: 15,
    marginBottom: 10,
  },
  tipoGrupo: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  tipoBotao: { flex: 1, borderWidth: 1, borderRadius: Radius, padding: 11, alignItems: 'center' },
  tipoTexto: { fontSize: 13 },
});