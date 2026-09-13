import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/src/services/supabase';
import { Notificacao } from '@/src/types';

function mapearNotificacao(linha: any): Notificacao {
  return {
    id: linha.id,
    tipo: linha.tipo,
    mensagem: linha.mensagem,
    lida: linha.lida,
    postId: linha.post_id,
    empresaId: linha.empresa_id,
    criadoEm: linha.criado_em,
  };
}

export async function buscarNotificacoes(usuarioId: string): Promise<Notificacao[]> {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('destinatario_id', usuarioId)
    .order('criado_em', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapearNotificacao);
}

export async function contarNaoLidas(usuarioId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notificacoes')
    .select('*', { count: 'exact', head: true })
    .eq('destinatario_id', usuarioId)
    .eq('lida', false);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function marcarComoLida(notificacaoId: string) {
  const { error } = await supabase.from('notificacoes').update({ lida: true }).eq('id', notificacaoId);
  if (error) throw new Error(error.message);
}

export async function marcarTodasComoLidas(usuarioId: string) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('destinatario_id', usuarioId)
    .eq('lida', false);

  if (error) throw new Error(error.message);
}

export function ouvirNovasNotificacoes(usuarioId: string, aoReceber: (n: Notificacao) => void) {
  // Nome de canal único por instância para evitar choque de listeners concorrentes
  const channelName = `notificacoes:${usuarioId}:${Date.now()}`;
  
  const canal = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `destinatario_id=eq.${usuarioId}`,
      },
      (payload) => aoReceber(mapearNotificacao(payload.new))
    );

  canal.subscribe();

  return () => {
    supabase.removeChannel(canal);
  };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registrarPushToken(usuarioId: string) {
  if (!Device.isDevice) return;

  const permissaoAtual = await Notifications.getPermissionsAsync();
  let status = permissaoAtual.status;

  if (status !== 'granted') {
    const pedido = await Notifications.requestPermissionsAsync();
    status = pedido.status;
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      console.warn('EAS projectId não configurado no app.json. Ignorando push token.');
      return;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = tokenResponse.data;

    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        { usuario_id: usuarioId, expo_push_token: expoPushToken, atualizado_em: new Date().toISOString() },
        { onConflict: 'expo_push_token' }
      );

    if (error) {
      console.error('Erro ao salvar push token:', error.message);
    }
  } catch (error) {
    console.warn('Não foi possível obter o Expo push token:', error);
  }
}