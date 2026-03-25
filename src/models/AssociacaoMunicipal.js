const mongoose = require('mongoose');

const associacaoMunicipalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  municipio: {
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
  associacaoProvincial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssociacaoProvincial',
    required: true
  },
  presidente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membro'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AssociacaoMunicipal', associacaoMunicipalSchema);