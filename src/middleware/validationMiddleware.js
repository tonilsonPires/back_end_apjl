const { body, validationResult } = require('express-validator');

const validarMembro = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('dataNascimento').isISO8601().withMessage('Data de nascimento inválida'),
  body('cargo').isIn(['presidente', 'vice-presidente', 'secretario-geral', 'tesoureiro', 'diretor-tecnico', 'diretor-arbitragem', 'conselho-fiscal', 'outro']).withMessage('Cargo inválido'),
  body('bilheteIdentidade').notEmpty().withMessage('BI é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validarAtleta = [
  body('nomeCompleto').notEmpty().withMessage('Nome completo é obrigatório'),
  body('dataNascimento').isISO8601().withMessage('Data de nascimento inválida'),
  body('peso').isNumeric().withMessage('Peso deve ser um número'),
  body('bilheteIdentidade').notEmpty().withMessage('BI é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('clube').notEmpty().withMessage('Clube é obrigatório'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validarTreinador = [
  body('nomeCompleto').notEmpty().withMessage('Nome completo é obrigatório'),
  body('dataNascimento').isISO8601().withMessage('Data de nascimento inválida'),
  body('graduacao').notEmpty().withMessage('Graduação é obrigatória'),
  body('bilheteIdentidade').notEmpty().withMessage('BI é obrigatório'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validarClube = [
  body('nome').notEmpty().withMessage('Nome do clube é obrigatório'),
  body('municipio').notEmpty().withMessage('Município é obrigatório'),
  body('dataCriacao').isISO8601().withMessage('Data de criação inválida'),
  body('responsavel').notEmpty().withMessage('Responsável é obrigatório'),
  body('associacaoMunicipal').notEmpty().withMessage('Associação municipal é obrigatória'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validarGraduacao = [
  body('nivel').isIn(['1º Kyu', '2º Kyu', '3º Kyu', '4º Kyu', '5º Kyu', '6º Kyu', '7º Kyu', '8º Kyu', '9º Kyu', '10º Kyu', '1º DAN', '2º DAN', '3º DAN', '4º DAN', '5º DAN', '6º DAN', '7º DAN', '8º DAN', '9º DAN', '10º DAN']).withMessage('Nível de graduação inválido'),
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ erro: 'Certificado é obrigatório' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validarMembro,
  validarAtleta,
  validarTreinador,
  validarClube,
  validarGraduacao
};