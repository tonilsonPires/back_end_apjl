// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const atletaSchema = new mongoose.Schema({
//   imagem: String,
//   nomeCompleto: {
//     type: String,
//     required: true
//   },
//   apelido: String,
//   dataNascimento: {
//     type: Date,
//     required: true
//   },
//   peso: {
//     type: Number,
//     required: true
//   },
//   titulos: [String],
//   imagemTitulos: [String],
//   responsavel: String,
//   profissao: String,
//   bilheteIdentidade: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   telefone: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   senha: {
//     type: String,
//     required: true,
//     select: false
//   },
//   acesso_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Acesso',
//     required: true
//   },
//   clube: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Clube',
//     required: true
//   },
//   graduacao: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Graduacao'
//   },
//   ativo: {
//     type: Boolean,
//     default: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// atletaSchema.pre('save', async function(next) {
//   if (!this.isModified('senha')) return next();
//   this.senha = await bcrypt.hash(this.senha, 10);
//   next();
// });

// atletaSchema.methods.compararSenha = async function(senha) {
//   return await bcrypt.compare(senha, this.senha);
// };

// module.exports = mongoose.model('Atleta', atletaSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const atletaSchema = new mongoose.Schema({
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
    trim: true,
    default: ''
  },
  dataNascimento: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória']
  },
  peso: {
    type: Number,
    required: [true, 'Peso é obrigatório'],
    min: 0
  },
  graduacao: {
    type: String,
    enum: [
      '6º Kyu',
      '5º Kyu', 
      '4º Kyu',
      '3º Kyu',
      '2º Kyu',
      '1º Kyu',
      '1º Dan',
      '2º Dan',
      '3º Dan',
      '4º Dan',
      '5º Dan',
      '6º Dan'
    ],
    default: '6º Kyu'
  },
  certificadoGraduacao: {
    type: String,
    default: null
  },
  dataGraduacao: {
    type: Date,
    default: null
  },
  titulos: [{
    nome: String,
    imagem: String,
    data: Date,
    local: String
  }],
  imagemTitulos: [String],
  responsavel: {
    type: String,
    default: ''
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
  clube: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clube',
    required: [true, 'Clube é obrigatório']
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
atletaSchema.index({ nomeCompleto: 1 });
atletaSchema.index({ email: 1 });
atletaSchema.index({ bilheteIdentidade: 1 });
atletaSchema.index({ clube: 1 });
atletaSchema.index({ graduacao: 1 });

// Middleware para hash da senha antes de salvar
atletaSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  try {
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senha
atletaSchema.methods.compararSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Método para retornar dados públicos (sem senha)
atletaSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.senha;
  return obj;
};

// Método para obter cor da graduação
atletaSchema.methods.getGraduacaoCor = function() {
  const cores = {
    '6º Kyu': '#FFFFFF',
    '5º Kyu': '#FFD700',
    '4º Kyu': '#C0C0C0',
    '3º Kyu': '#CD7F32',
    '2º Kyu': '#FFA500',
    '1º Kyu': '#8B4513',
    '1º Dan': '#000000',
    '2º Dan': '#000000',
    '3º Dan': '#000000',
    '4º Dan': '#000000',
    '5º Dan': '#000000',
    '6º Dan': '#000000'
  };
  return cores[this.graduacao] || '#808080';
};

// Método para obter nível da graduação (número)
atletaSchema.methods.getGraduacaoNivel = function() {
  const niveis = {
    '6º Kyu': 6,
    '5º Kyu': 5,
    '4º Kyu': 4,
    '3º Kyu': 3,
    '2º Kyu': 2,
    '1º Kyu': 1,
    '1º Dan': 1,
    '2º Dan': 2,
    '3º Dan': 3,
    '4º Dan': 4,
    '5º Dan': 5,
    '6º Dan': 6
  };
  return niveis[this.graduacao] || 0;
};

// Método para verificar se é Kyu ou Dan
atletaSchema.methods.isKyu = function() {
  return this.graduacao.includes('Kyu');
};

atletaSchema.methods.isDan = function() {
  return this.graduacao.includes('Dan');
};

module.exports = mongoose.model('Atleta', atletaSchema);