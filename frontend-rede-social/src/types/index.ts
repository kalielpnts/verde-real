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

export type StatusDenuncia = 'recebida' | 'em_analise' | 'resolvida' | 'rejeitada';

export interface Post {
  id: string;
  conteudo: string;
  categoria: Categoria;
  status: StatusDenuncia;
  midiaUrl?: string | null;
  tipoMidia?: 'imagem' | 'video' | null;
  latitude?: number | null;
  longitude?: number | null;
  criadoEm: string;
  autor: Usuario;
  empresa?: Usuario | null;
  totalCurtidas: number;
  curtidoPorMim: boolean;
}

export interface RankingItem {
  id: string;
  nome: string;
  avatarUrl?: string | null;
  totalDenuncias: number;
}

export type TipoNotificacao = 'curtida' | 'comentario' | 'status_denuncia' | 'selo_empresa';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  mensagem: string;
  lida: boolean;
  postId?: string | null;
  empresaId?: string | null;
  criadoEm: string;
}