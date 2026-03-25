// const mongoose = require('mongoose');

// const clubeSchema = new mongoose.Schema({
//   nome: {
//     type: String,
//     required: true
//   },
//   imagem: String,
//   municipio: {
//     type: String,
//     required: true
//   },
//   endereco: String,
//   dataCriacao: {
//     type: Date,
//     required: true
//   },
//   responsavel: {
//     type: String,
//     required: true
//   },
//   associacaoMunicipal: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'AssociacaoMunicipal',
//     required: true
//   },
//   treinadores: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Treinador'
//   }],
//   atletas: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Atleta'
//   }],
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Clube', clubeSchema);


const mongoose = require('mongoose');

const clubeSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do clube é obrigatório'],
    trim: true
  },
  imagem: {
    type: String,
    default: null
  },
  municipio: {
    type: String,
    required: [true, 'Município é obrigatório'],
    trim: true
  },
  endereco: {
    type: String,
    required: [true, 'Endereço é obrigatório'],
    trim: true
  },
  dataCriacao: {
    type: Date,
    required: [true, 'Data de criação é obrigatória']
  },
  responsavel: {
    type: String,
    required: [true, 'Responsável é obrigatório'],
    trim: true
  },
  associacaoMunicipal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssociacaoMunicipal',
    required: [true, 'Associação municipal é obrigatória']
  },
  treinadores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Treinador'
  }],
  atletas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Atleta'
  }],
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
clubeSchema.index({ nome: 1 });
clubeSchema.index({ associacaoMunicipal: 1 });
clubeSchema.index({ municipio: 1 });

module.exports = mongoose.model('Clube', clubeSchema);