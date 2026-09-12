import { supabase } from '@/src/services/supabase';

export interface Comentario {
  id: string;
  conteudo: string;
  criadoEm: string;
  autor: { id: string; nome: string; avatarUrl?: string | null };
}

export async function buscarComentarios(postId: string): Promise<Comentario[]> {
  const { data, error } = await supabase
    .from('comentarios')
    .select('*, autor:profiles!comentarios_autor_id_fkey(*)')
    .eq('post_id', postId)
    .order('criado_em', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((linha: any) => ({
    id: linha.id,
    conteudo: linha.conteudo,
    criadoEm: linha.criado_em,
    autor: { id: linha.autor.id, nome: linha.autor.nome, avatarUrl: linha.autor.avatar_url },
  }));
}

export async function criarComentario(postId: string, autorId: string, conteudo: string) {
  const { error } = await supabase.from('comentarios').insert({ post_id: postId, autor_id: autorId, conteudo });
  if (error) throw new Error(error.message);
}