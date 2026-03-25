const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const membroSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  imagem: {
    type: String,
    default: null
  },
  dataNascimento: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória']
  },
  cargo: {
    type: String,
    required: [true, 'Cargo é obrigatório'],
    enum: ['presidente', 'vice-presidente', 'secretario-geral', 'tesoureiro', 'diretor-tecnico', 'diretor-arbitragem', 'conselho-fiscal', 'outro']
  },
  profissao: {
    type: String,
    default: ''
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
  // Campos de associação - apenas UM deve ser preenchido
  associacaoProvincial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssociacaoProvincial',
    validate: {
      validator: function(v) {
        // Se associacaoProvincial está preenchido, associacaoMunicipal deve estar vazio
        return !v || !this.associacaoMunicipal;
      },
      message: 'Um membro não pode pertencer a uma associação provincial e municipal simultaneamente'
    }
  },
  associacaoMunicipal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssociacaoMunicipal',
    validate: {
      validator: function(v) {
        // Se associacaoMunicipal está preenchido, associacaoProvincial deve estar vazio
        return !v || !this.associacaoProvincial;
      },
      message: 'Um membro não pode pertencer a uma associação provincial e municipal simultaneamente'
    }
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validação customizada para garantir que apenas uma associação é selecionada
membroSchema.pre('validate', function(next) {
  if (this.associacaoProvincial && this.associacaoMunicipal) {
    next(new Error('Um membro deve pertencer apenas a uma associação (provincial OU municipal), não a ambas.'));
  }
  
  if (!this.associacaoProvincial && !this.associacaoMunicipal) {
    next(new Error('Um membro deve pertencer a pelo menos uma associação (provincial ou municipal).'));
  }
  
  next();
});

// Middleware para hash da senha antes de salvar
membroSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  try {
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
membroSchema.methods.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Método para retornar dados públicos (sem senha)
membroSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

module.exports = mongoose.model('Membro', membroSchema);