import { supabase } from '@/src/services/supabase';

export async function atualizarAvatar(usuarioId: string, avatarUrl: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', usuarioId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}