const mongoose = require('mongoose');

const permissaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    enum: ['visualizar', 'criar', 'alterar', 'excluir']
  },
  recurso: {
    type: String,
    required: true
  },
  descricao: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Permissao', permissaoSchema);