const express = require('express');
const autenticar = require('../middleware/auth');
const { autenticarOpcional } = require('../middleware/auth');
const { listarPosts, criarPost, curtirPost } = require('../controllers/postController');

// Recebe a instância do socket.io criada em server.js
module.exports = function postRoutes(io) {
  const router = express.Router();

  router.get('/', autenticarOpcional, listarPosts);
  router.post('/', autenticar, (req, res) => criarPost(req, res, io));
  router.post('/:id/curtir', autenticar, (req, res) => curtirPost(req, res, io));

  return router;
};
