function notFound(req, res) {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
}

module.exports = { notFound, errorHandler };
