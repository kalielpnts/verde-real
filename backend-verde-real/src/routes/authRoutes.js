const express = require('express');
const autenticar = require('../middleware/auth');
const { atualizarPerfil } = require('../controllers/authController');

const router = express.Router();

// Login e cadastro agora são feitos direto contra o Supabase Auth
// pelo app e pelo site (Etapa 2) — o backend só cuida do que
// precisa de privilégio de servidor.
router.patch('/perfil', autenticar, atualizarPerfil);

module.exports = router;