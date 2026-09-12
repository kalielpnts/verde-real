const prisma = require('../config/prisma');

async function ranking(req, res) {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        avatarUrl: true,
        _count: { select: { posts: true } },
      },
    });

    const lista = usuarios
      .map((u) => ({
        id: u.id,
        nome: u.nome,
        avatarUrl: u.avatarUrl,
        totalDenuncias: u._count.posts,
      }))
      .filter((u) => u.totalDenuncias > 0)
      .sort((a, b) => b.totalDenuncias - a.totalDenuncias);

    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao montar o ranking' });
  }
}

module.exports = { ranking };
