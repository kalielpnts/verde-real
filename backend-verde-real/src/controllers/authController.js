const { supabase } = require('../config/supabase');

async function atualizarPerfil(req, res) {
  const { avatarUrl, bio, telefone } = req.body;
  const userId = req.usuario.id;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
        ...(bio !== undefined && { bio }),
        ...(telefone !== undefined && { telefone }),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      nome: data.nome,
      email: data.email,
      tipo: data.tipo,
      avatarUrl: data.avatar_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
}

module.exports = { atualizarPerfil };