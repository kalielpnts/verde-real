const prisma = require('../config/prisma');

const CATEGORIAS_VALIDAS = [
  'Desmatamento',
  'Poluição',
  'Queimada',
  'Descarte Irregular',
  'Água',
  'Fauna',
  'Outro',
];

function serializarPost(post, usuarioId) {
  return {
    id: post.id,
    conteudo: post.conteudo,
    categoria: post.categoria,
    midiaUrl: post.midiaUrl,
    tipoMidia: post.tipoMidia,
    latitude: post.latitude,
    longitude: post.longitude,
    criadoEm: post.criadoEm,
    autor: post.autor,
    totalCurtidas: post.curtidas.length,
    curtidoPorMim: usuarioId ? post.curtidas.some((c) => c.userId === usuarioId) : false,
  };
}

async function listarPosts(req, res) {
  try {
    const { categoria } = req.query;

    const posts = await prisma.post.findMany({
      where: categoria ? { categoria: String(categoria) } : undefined,
      orderBy: { criadoEm: 'desc' },
      include: {
        autor: { select: { id: true, nome: true, email: true, avatarUrl: true } },
        curtidas: { select: { userId: true } },
      },
    });

    res.json(posts.map((p) => serializarPost(p, req.usuario?.id)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar postagens' });
  }
}

async function criarPost(req, res, io) {
  const { conteudo, categoria, midiaUrl, tipoMidia, latitude, longitude } = req.body;
  const autorId = req.usuario.id; // vem do token, nunca do body

  if (!conteudo || !conteudo.trim()) {
    return res.status(400).json({ erro: 'O conteúdo da denúncia é obrigatório' });
  }

  const categoriaFinal = CATEGORIAS_VALIDAS.includes(categoria) ? categoria : 'Outro';

  try {
    const novoPost = await prisma.post.create({
      data: {
        conteudo,
        categoria: categoriaFinal,
        autorId,
        midiaUrl,
        tipoMidia,
        latitude: typeof latitude === 'number' ? latitude : null,
        longitude: typeof longitude === 'number' ? longitude : null,
      },
      include: {
        autor: { select: { id: true, nome: true, email: true, avatarUrl: true } },
        curtidas: { select: { userId: true } },
      },
    });

    const postSerializado = serializarPost(novoPost, autorId);

    // Notifica todos os dispositivos conectados em tempo real
    io.emit('novo_post', postSerializado);

    res.status(201).json(postSerializado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar postagem' });
  }
}

async function curtirPost(req, res, io) {
  const { id: postId } = req.params;
  const userId = req.usuario.id;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ erro: 'Postagem não encontrada' });
    }

    const curtidaExistente = await prisma.curtida.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (curtidaExistente) {
      await prisma.curtida.delete({ where: { id: curtidaExistente.id } });
    } else {
      await prisma.curtida.create({ data: { userId, postId } });
    }

    const totalCurtidas = await prisma.curtida.count({ where: { postId } });
    const curtidoPorMim = !curtidaExistente;

    io.emit('post_curtido', { postId, totalCurtidas });

    res.json({ postId, totalCurtidas, curtidoPorMim });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao curtir postagem' });
  }
}

module.exports = { listarPosts, criarPost, curtirPost, CATEGORIAS_VALIDAS };
