export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (erroRede) {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e o endereço da API.');
  }

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Ocorreu um erro ao falar com o servidor.');
  }

  return dados;
}

export const api = {
  // Login e cadastro agora são feitos direto pelo AuthContext via Supabase.

  atualizarPerfil: (token: string, avatarUrl: string) =>
    request('/auth/perfil', { method: 'PATCH', body: JSON.stringify({ avatarUrl }) }, token),

  listarPosts: (token: string | null, categoria?: string) =>
    request(`/posts${categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''}`, {}, token),

  criarPost: (
    token: string,
    payload: {
      conteudo: string;
      categoria: string;
      midiaUrl?: string | null;
      tipoMidia?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    }
  ) => request('/posts', { method: 'POST', body: JSON.stringify(payload) }, token),

  curtirPost: (token: string, postId: string) =>
    request(`/posts/${postId}/curtir`, { method: 'POST' }, token),

  uploadMidia: (token: string, form: FormData) =>
    request('/upload', { method: 'POST', body: form }, token),

  ranking: () => request('/usuarios/ranking'),
};