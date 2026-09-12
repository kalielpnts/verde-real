const express = require('express');
const multer = require('multer');
const autenticar = require('../middleware/auth');
const { uploadMidia } = require('../controllers/uploadController');

// Guarda o arquivo em memória (buffer) para repassar direto ao Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/', autenticar, upload.single('midia'), uploadMidia);

module.exports = router;
