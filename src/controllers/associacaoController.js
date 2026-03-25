// const AssociacaoProvincial = require('../models/AssociacaoProvincial');
// const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');
// const Membro = require('../models/Membro');

// exports.criarAssociacaoProvincial = async (req, res) => {
//   try {
//     const { nome, provincia, endereco, telefone, email } = req.body;
//     const logo = req.file ? req.file.path : null;
    
//     if (!logo) {
//       return res.status(400).json({ erro: 'Logo é obrigatório.' });
//     }
    
//     const associacao = await AssociacaoProvincial.create({
//       nome,
//       provincia,
//       logo,
//       endereco,
//       telefone,
//       email
//     });
    
//     res.status(201).json(associacao);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao criar associação provincial.' });
//   }
// };

// exports.listarAssociacoesProvinciais = async (req, res) => {
//   try {
//     const associacoes = await AssociacaoProvincial.find().populate('presidente');
//     res.json(associacoes);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao listar associações provinciais.' });
//   }
// };

// exports.criarAssociacaoMunicipal = async (req, res) => {
//   try {
//     const { nome, municipio, endereco, telefone, email, associacaoProvincial } = req.body;
//     const logo = req.file ? req.file.path : null;
    
//     if (!logo) {
//       return res.status(400).json({ erro: 'Logo é obrigatório.' });
//     }
    
//     const associacao = await AssociacaoMunicipal.create({
//       nome,
//       municipio,
//       logo,
//       endereco,
//       telefone,
//       email,
//       associacaoProvincial
//     });
    
//     res.status(201).json(associacao);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao criar associação municipal.' });
//   }
// };

// exports.listarAssociacoesMunicipais = async (req, res) => {
//   try {
//     const associacoes = await AssociacaoMunicipal.find()
//       .populate('associacaoProvincial')
//       .populate('presidente');
//     res.json(associacoes);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao listar associações municipais.' });
//   }
// };

// exports.atualizarAssociacaoMunicipal = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;
    
//     if (req.file) {
//       updates.logo = req.file.path;
//     }
    
//     const associacao = await AssociacaoMunicipal.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true
//     });
    
//     if (!associacao) {
//       return res.status(404).json({ erro: 'Associação não encontrada.' });
//     }
    
//     res.json(associacao);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao atualizar associação.' });
//   }
// };




const AssociacaoProvincial = require('../models/AssociacaoProvincial');
const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');
const Membro = require('../models/Membro');

exports.criarAssociacaoProvincial = async (req, res) => {
  try {
    console.log('Criando associação provincial...');
    console.log('Dados recebidos:', req.body);
    console.log('Arquivo:', req.file);
    
    const { nome, provincia, endereco, telefone, email } = req.body;
    
    // Verificar se o logo foi enviado
    if (!req.file) {
      return res.status(400).json({ erro: 'Logo é obrigatório.' });
    }
    
    // Verificar se já existe associação com este nome
    const existe = await AssociacaoProvincial.findOne({ nome });
    if (existe) {
      return res.status(400).json({ erro: 'Já existe uma associação com este nome.' });
    }
    
    const associacao = await AssociacaoProvincial.create({
      nome,
      provincia,
      logo: req.file.path,
      endereco,
      telefone,
      email
    });
    
    console.log('Associação criada:', associacao);
    
    res.status(201).json({
      mensagem: 'Associação provincial criada com sucesso!',
      associacao
    });
  } catch (error) {
    console.error('Erro ao criar associação provincial:', error);
    res.status(500).json({ 
      erro: 'Erro ao criar associação provincial.',
      detalhe: error.message 
    });
  }
};

exports.listarAssociacoesProvinciais = async (req, res) => {
  try {
    const associacoes = await AssociacaoProvincial.find().populate('presidente');
    res.json(associacoes);
  } catch (error) {
    console.error('Erro ao listar associações:', error);
    res.status(500).json({ erro: 'Erro ao listar associações provinciais.' });
  }
};

exports.obterAssociacaoProvincial = async (req, res) => {
  try {
    const { id } = req.params;
    const associacao = await AssociacaoProvincial.findById(id).populate('presidente');
    
    if (!associacao) {
      return res.status(404).json({ erro: 'Associação não encontrada.' });
    }
    
    res.json(associacao);
  } catch (error) {
    console.error('Erro ao obter associação:', error);
    res.status(500).json({ erro: 'Erro ao obter associação provincial.' });
  }
};

exports.atualizarAssociacaoProvincial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (req.file) {
      updates.logo = req.file.path;
    }
    
    const associacao = await AssociacaoProvincial.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    
    if (!associacao) {
      return res.status(404).json({ erro: 'Associação não encontrada.' });
    }
    
    res.json({
      mensagem: 'Associação atualizada com sucesso!',
      associacao
    });
  } catch (error) {
    console.error('Erro ao atualizar associação:', error);
    res.status(500).json({ erro: 'Erro ao atualizar associação.' });
  }
};

exports.excluirAssociacaoProvincial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se existem associações municipais vinculadas
    const municipais = await AssociacaoMunicipal.find({ associacaoProvincial: id });
    if (municipais.length > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir. Existem associações municipais vinculadas a esta provincial.' 
      });
    }
    
    const associacao = await AssociacaoProvincial.findByIdAndDelete(id);
    
    if (!associacao) {
      return res.status(404).json({ erro: 'Associação não encontrada.' });
    }
    
    res.json({ mensagem: 'Associação provincial excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir associação:', error);
    res.status(500).json({ erro: 'Erro ao excluir associação.' });
  }
};

exports.criarAssociacaoMunicipal = async (req, res) => {
  try {
    const { nome, municipio, endereco, telefone, email, associacaoProvincial } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ erro: 'Logo é obrigatório.' });
    }
    
    // Verificar se a associação provincial existe
    const provincial = await AssociacaoProvincial.findById(associacaoProvincial);
    if (!provincial) {
      return res.status(404).json({ erro: 'Associação provincial não encontrada.' });
    }
    
    const associacao = await AssociacaoMunicipal.create({
      nome,
      municipio,
      logo: req.file.path,
      endereco,
      telefone,
      email,
      associacaoProvincial
    });
    
    res.status(201).json({
      mensagem: 'Associação municipal criada com sucesso!',
      associacao
    });
  } catch (error) {
    console.error('Erro ao criar associação municipal:', error);
    res.status(500).json({ erro: 'Erro ao criar associação municipal.' });
  }
};

exports.listarAssociacoesMunicipais = async (req, res) => {
  try {
    const associacoes = await AssociacaoMunicipal.find()
      .populate('associacaoProvincial')
      .populate('presidente');
    res.json(associacoes);
  } catch (error) {
    console.error('Erro ao listar associações municipais:', error);
    res.status(500).json({ erro: 'Erro ao listar associações municipais.' });
  }
};

exports.obterAssociacaoMunicipal = async (req, res) => {
  try {
    const { id } = req.params;
    const associacao = await AssociacaoMunicipal.findById(id)
      .populate('associacaoProvincial')
      .populate('presidente');
    
    if (!associacao) {
      return res.status(404).json({ erro: 'Associação não encontrada.' });
    }
    
    res.json(associacao);
  } catch (error) {
    console.error('Erro ao obter associação:', error);
    res.status(500).json({ erro: 'Erro ao obter associação municipal.' });
  }
};

exports.atualizarAssociacaoMunicipal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (req.file) {
      updates.logo = req.file.path;
    }
    
    const associacao = await AssociacaoMunicipal.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });
    
    if (!associacao) {
      return res.status(404).json({ erro: 'Associação não encontrada.' });
    }
    
    res.json({
      mensagem: 'Associação atualizada com sucesso!',
      associacao
    });
  } catch (error) {
    console.error('Erro ao atualizar associação:', error);
    res.status(500).json({ erro: 'Erro ao atualizar associação.' });
  }
};

exports.excluirAssociacaoMunicipal = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se existem clubes vinculados
    const Clube = require('../models/Clube');
    const clubes = await Clube.find({ associacaoMunicipal: id });
    if (clubes.length > 0) {
      return res.status(400).json({ 
        erro: 'Não é possível excluir. Existem clubes vinculados a esta associação.' 
      });
    }
    
    const associacao = await AssociacaoMunicipal.findByIdAndDelete(id);
    
    if (!associacao) {
      return res.status(404).json({ erro: 'Associação não encontrada.' });
    }
    
    res.json({ mensagem: 'Associação municipal excluída com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir associação:', error);
    res.status(500).json({ erro: 'Erro ao excluir associação.' });
  }
};