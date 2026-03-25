const mongoose = require('mongoose');

const graduacaoSchema = new mongoose.Schema({
  atleta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Atleta',
    required: true
  },
  nivel: {
    type: String,
    required: true,
    enum: ['1º Kyu', '2º Kyu', '3º Kyu', '4º Kyu', '5º Kyu', '6º Kyu', '7º Kyu', '8º Kyu', '9º Kyu', '10º Kyu', '1º DAN', '2º DAN', '3º DAN', '4º DAN', '5º DAN', '6º DAN', '7º DAN', '8º DAN', '9º DAN', '10º DAN']
  },
  certificado: {
    type: String,
    required: true
  },
  dataConcessao: {
    type: Date,
    default: Date.now
  },
  observacoes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Graduacao', graduacaoSchema);