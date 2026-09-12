import { supabase } from '@/src/services/supabase';

async function arquivoParaArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const resposta = await fetch(uri);
  return await resposta.arrayBuffer();
}

export async function enviarMidia(
  usuarioId: string,
  uri: string,
  nomeArquivo: string,
  contentType: string
): Promise<string> {
  const extensao = nomeArquivo.split('.').pop() ?? 'jpg';
  const caminho = `${usuarioId}/${Date.now()}.${extensao}`;
  const bytes = await arquivoParaArrayBuffer(uri);

  const { error } = await supabase.storage.from('midias').upload(caminho, bytes, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('midias').getPublicUrl(caminho);
  return data.publicUrl;
}