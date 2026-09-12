const { randomUUID } = require('crypto');
const { supabase, BUCKET_MIDIAS } = require('../config/supabase');

const TIPOS_PERMITIDOS = {
  'image/jpeg': 'imagem',
  'image/png': 'imagem',
  'image/webp': 'imagem',
  'video/mp4': 'video',
  'video/quicktime': 'video',
};

const TAMANHO_MAX_BYTES = 25 * 1024 * 1024; // 25MB

async function uploadMidia(req, res) {
  const arquivo = req.file;

  if (!arquivo) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado (campo "midia")' });
  }

  if (arquivo.size > TAMANHO_MAX_BYTES) {
    return res.status(400).json({ erro: 'Arquivo maior que 25MB' });
  }

  const tipoMidia = TIPOS_PERMITIDOS[arquivo.mimetype];
  if (!tipoMidia) {
    return res.status(400).json({ erro: `Tipo de arquivo não suportado: ${arquivo.mimetype}` });
  }

  const extensao = arquivo.originalname.split('.').pop();
  const caminho = `${req.usuario.id}/${randomUUID()}.${extensao}`;

  try {
    const { error: erroUpload } = await supabase.storage
      .from(BUCKET_MIDIAS)
      .upload(caminho, arquivo.buffer, {
        contentType: arquivo.mimetype,
        upsert: false,
      });

    if (erroUpload) {
      console.error(erroUpload);
      return res.status(500).json({ erro: 'Falha ao enviar arquivo para o Storage' });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET_MIDIAS).getPublicUrl(caminho);

    res.status(201).json({
      midiaUrl: publicUrlData.publicUrl,
      tipoMidia,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro inesperado ao enviar mídia' });
  }
}

module.exports = { uploadMidia };
