const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const associacaoRoutes = require('./routes/associacaoRoutes');
const membroRoutes = require('./routes/membroRoutes');
const clubeRoutes = require('./routes/clubeRoutes');
const treinadorRoutes = require('./routes/treinadorRoutes');
const atletaRoutes = require('./routes/atletaRoutes');
const cartaoRoutes = require('./routes/cartaoRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/associacoes', associacaoRoutes);
app.use('/api/membros', membroRoutes);
app.use('/api/clubes', clubeRoutes);
app.use('/api/treinadores', treinadorRoutes);
app.use('/api/atletas', atletaRoutes);
app.use('/api/cartoes', cartaoRoutes);

// Rota inicial
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Sistema de Gestão de Judo de Angola' });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: err.message || 'Erro interno do servidor' });
});

module.exports = app;