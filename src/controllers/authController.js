const jwt = require('jsonwebtoken');
const Membro = require('../models/Membro');
const Treinador = require('../models/Treinador');
const Atleta = require('../models/Atleta');

const gerarToken = (id, tipo) => {
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    let usuario = await Membro.findOne({ email }).select('+senha').populate('acesso_id');
    let tipo = 'membro';
    
    if (!usuario) {
      usuario = await Treinador.findOne({ email }).select('+senha').populate('acesso_id');
      tipo = 'treinador';
    }
    
    if (!usuario) {
      usuario = await Atleta.findOne({ email }).select('+senha').populate('acesso_id');
      tipo = 'atleta';
    }
    
    if (!usuario || !(await usuario.compararSenha(senha))) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }
    
    const token = gerarToken(usuario._id, tipo);
    
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome || usuario.nomeCompleto,
        email: usuario.email,
        tipo: tipo,
        acesso: usuario.acesso_id.nome
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
};

exports.me = async (req, res) => {
  try {
    res.json({
      id: req.usuario._id,
      nome: req.usuario.nome || req.usuario.nomeCompleto,
      email: req.usuario.email,
      tipo: req.tipoUsuario,
      acesso: req.usuario.acesso_id.nome
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao obter dados do usuário.' });
  }
};