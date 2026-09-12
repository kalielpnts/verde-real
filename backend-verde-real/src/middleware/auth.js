const { supabase } = require('../config/supabase');

/**
 * Protege rotas: exige "Authorization: Bearer <token>" com um
 * access_token válido do Supabase Auth — o mesmo emitido para o
 * app e para o site, então login feito em qualquer um dos dois
 * já autoriza chamadas aqui.
 */
async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('id, nome, tipo, email, avatar_url')
      .eq('id', data.user.id)
      .single();

    if (perfilError || !perfil) {
      return res.status(401).json({ erro: 'Perfil não encontrado para este usuário' });
    }

    req.usuario = perfil;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

async function autenticarOpcional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        const { data: perfil } = await supabase
          .from('profiles')
          .select('id, nome, tipo, email, avatar_url')
          .eq('id', data.user.id)
          .single();
        if (perfil) req.usuario = perfil;
      }
    } catch (error) {
      // token inválido/expirado: segue como anônimo, sem erro
    }
  }

  next();
}

module.exports = autenticar;
module.exports.autenticarOpcional = autenticarOpcional;