const mongoose = require('mongoose');

const associacaoProvincialSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  provincia: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  endereco: String,
  telefone: String,
  email: String,
  presidente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membro'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AssociacaoProvincial', associacaoProvincialSchema);