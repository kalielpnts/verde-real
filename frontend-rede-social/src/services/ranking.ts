import { supabase } from '@/src/services/supabase';
import { RankingItem } from '@/src/types';

export async function buscarRanking(): Promise<RankingItem[]> {
  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? []).map((linha) => ({
    id: linha.id,
    nome: linha.nome,
    avatarUrl: linha.avatar_url,
    totalDenuncias: linha.total_denuncias,
  }));
}