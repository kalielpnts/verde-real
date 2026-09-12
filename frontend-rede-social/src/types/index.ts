export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: 'cliente' | 'empresa';
  avatarUrl?: string | null;
}

export type Categoria =
  | 'Desmatamento'
  | 'Poluição'
  | 'Queimada'
  | 'Descarte Irregular'
  | 'Água'
  | 'Fauna'
  | 'Outro';

export interface Post {
  id: string;
  conteudo: string;
  categoria: Categoria;
  midiaUrl?: string | null;
  tipoMidia?: 'imagem' | 'video' | null;
  latitude?: number | null;
  longitude?: number | null;
  criadoEm: string;
  autor: Usuario;
  totalCurtidas: number;
  curtidoPorMim: boolean;
}

export interface RankingItem {
  id: string;
  nome: string;
  avatarUrl?: string | null;
  totalDenuncias: number;
}