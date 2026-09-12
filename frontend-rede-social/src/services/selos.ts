import { supabase } from '@/src/services/supabase';

export interface Selo {
  id: string;
  nivel: 'bronze' | 'prata' | 'ouro';
  status: 'pendente' | 'ativo' | 'expirado' | 'revogado';
  validade: string | null;
  criadoEm: string;
}

export async function buscarSelosDaEmpresa(empresaId: string): Promise<Selo[]> {
  const { data, error } = await supabase
    .from('selos')
    .select('id, nivel, status, validade, criado_em')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((linha: any) => ({
    id: linha.id,
    nivel: linha.nivel,
    status: linha.status,
    validade: linha.validade,
    criadoEm: linha.criado_em,
  }));
}