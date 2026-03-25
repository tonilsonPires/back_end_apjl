const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const treinadorSchema = new mongoose.Schema({
  imagem: {
    type: String,
    default: null
  },
  nomeCompleto: {
    type: String,
    required: [true, 'Nome completo é obrigatório'],
    trim: true
  },
  apelido: {
    type: String,
    trim: true
  },
  dataNascimento: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória']
  },
  graduacao: {
    type: String,
    required: [true, 'Graduação é obrigatória'],
    enum: ['1º Kyu', '2º Kyu', '3º Kyu', '4º Kyu', '5º Kyu', '6º Kyu', '7º Kyu', '8º Kyu', '9º Kyu', '10º Kyu', '1º DAN', '2º DAN', '3º DAN', '4º DAN', '5º DAN', '6º DAN', '7º DAN', '8º DAN', '9º DAN', '10º DAN']
  },
  clubeFormador: {
    type: String,
    trim: true
  },
  morada: {
    type: String,
    trim: true
  },
  profissao: {
    type: String,
    trim: true
  },
  bilheteIdentidade: {
    type: String,
    required: [true, 'BI é obrigatório'],
    unique: true,
    trim: true
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    select: false,
    minlength: 6
  },
  acesso_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Acesso',
    required: [true, 'Nível de acesso é obrigatório']
  },
  clubes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clube'
  }],
  associacaoMunicipal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssociacaoMunicipal',
    required: [true, 'Associação municipal é obrigatória']
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
treinadorSchema.index({ nomeCompleto: 1 });
treinadorSchema.index({ email: 1 });
treinadorSchema.index({ bilheteIdentidade: 1 });
treinadorSchema.index({ associacaoMunicipal: 1 });

// Middleware para hash da senha antes de salvar
treinadorSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  try {
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
treinadorSchema.methods.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Método para retornar dados públicos (sem senha)
treinadorSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

module.exports = mongoose.model('Treinador', treinadorSchema);