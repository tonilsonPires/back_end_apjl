const mongoose = require('mongoose');

const acessoShema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true,
    enum: ['administrador', 'membro', 'treinador', 'atleta', 'visitante', 'presidente']
  },
  descricao: String,
  permissoes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permissao'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Acesso', acessoShema);