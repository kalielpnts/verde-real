require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./src/routes/authRoutes');
const postRoutesFactory = require('./src/routes/postRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Rota de saúde — útil pra testar se o backend está no ar
app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'Verde Real API' });
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutesFactory(io));
app.use('/upload', uploadRoutes);
app.use('/usuarios', userRoutes);

app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log(`🟢 Cliente conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Verde Real rodando na porta ${PORT}`);
});
