const mongoose = require('mongoose');
const Treinador = require('../models/Treinador');
const Acesso = require('../models/Acesso');
const Clube = require('../models/Clube');
const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');
const bcrypt = require('bcryptjs');

// Criar treinador
exports.criarTreinador = async (req, res) => {
  try {
    console.log('Criando treinador...');
    console.log('Dados recebidos:', req.body);
    console.log('Arquivo:', req.file);

    const {
      nomeCompleto,
      apelido,
      dataNascimento,
      graduacao,
      clubeFormador,
      morada,
      profissao,
      bilheteIdentidade,
      telefone,
      email,
      senha,
      clubes,
      associacaoMunicipal
    } = req.body;

    // Validar campos obrigatórios
    if (!nomeCompleto || !dataNascimento || !graduacao || !bilheteIdentidade || 
        !telefone || !email || !senha || !associacaoMunicipal) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nomeCompleto, dataNascimento, graduacao, bilheteIdentidade, telefone, email, senha, associacaoMunicipal'
      });
    }

    // Verificar se associação municipal existe
    const assocExistente = await AssociacaoMunicipal.findById(associacaoMunicipal);
    if (!assocExistente) {
      return res.status(404).json({ erro: 'Associação municipal não encontrada' });
    }

    // Verificar se email já existe
    const emailExiste = await Treinador.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Verificar se BI já existe
    const biExiste = await Treinador.findOne({ bilheteIdentidade });
    if (biExiste) {
      return res.status(400).json({ erro: 'BI já cadastrado' });
    }

    // Buscar nível de acesso (treinador)
    let acesso = await Acesso.findOne({ nome: 'treinador' });
    if (!acesso) {
      acesso = await Acesso.create({
        nome: 'treinador',
        descricao: 'Treinador de judo',
        permissoes: []
      });
    }

    // Preparar dados do treinador
    const dadosTreinador = {
      nomeCompleto,
      apelido: apelido || '',
      dataNascimento: new Date(dataNascimento),
      graduacao,
      clubeFormador: clubeFormador || '',
      morada: morada || '',
      profissao: profissao || '',
      bilheteIdentidade,
      telefone,
      email,
      senha,
      acesso_id: acesso._id,
      associacaoMunicipal,
      ativo: true
    };

    // Adicionar imagem se foi enviada
    if (req.file) {
      dadosTreinador.imagem = req.file.path;
    }

    // Adicionar clubes se fornecidos
    if (clubes) {
      const clubesArray = Array.isArray(clubes) ? clubes : [clubes];
      dadosTreinador.clubes = clubesArray;
    }

    const treinador = await Treinador.create(dadosTreinador);

    console.log('Treinador criado com sucesso:', treinador._id);

    // Atualizar os clubes com o treinador
    if (dadosTreinador.clubes && dadosTreinador.clubes.length > 0) {
      await Clube.updateMany(
        { _id: { $in: dadosTreinador.clubes } },
        { $addToSet: { treinadores: treinador._id } }
      );
    }

    // Buscar o treinador com os dados populados
    const treinadorPopulado = await Treinador.findById(treinador._id)
      .populate('acesso_id', 'nome descricao')
      .populate('clubes', 'nome municipio')
      .populate('associacaoMunicipal', 'nome municipio');

    res.status(201).json({
      mensagem: 'Treinador criado com sucesso!',
      treinador: treinadorPopulado
    });
  } catch (error) {
    console.error('Erro ao criar treinador:', error);
    res.status(500).json({
      erro: 'Erro ao criar treinador.',
      detalhe: error.message
    });
  }
};

// Listar todos treinadores
exports.listarTreinadores = async (req, res) => {
  try {
    const filtros = { ativo: true };

    // Se não for administrador, filtrar por associação
    if (req.usuario && req.usuario.acesso_id && req.usuario.acesso_id.nome !== 'administrador') {
      if (req.usuario.associacaoMunicipal) {
        filtros.associacaoMunicipal = req.usuario.associacaoMunicipal;
      } else if (req.usuario.associacaoProvincial) {
        // Se for usuário de associação provincial, buscar todas as municipais daquela provincial
        const municipais = await AssociacaoMunicipal.find({
          associacaoProvincial: req.usuario.associacaoProvincial
        });
        filtros.associacaoMunicipal = { $in: municipais.map(m => m._id) };
      }
    }

    const treinadores = await Treinador.find(filtros)
      .populate('acesso_id', 'nome descricao')
      .populate('clubes', 'nome municipio')
      .populate('associacaoMunicipal', 'nome municipio')
      .sort('-createdAt');

    // Formatar resposta
    const treinadoresFormatados = treinadores.map(treinador => {
      const obj = treinador.toObject();
      obj.totalClubes = treinador.clubes?.length || 0;
      obj.idade = new Date().getFullYear() - new Date(treinador.dataNascimento).getFullYear();
      return obj;
    });

    res.json(treinadoresFormatados);
  } catch (error) {
    console.error('Erro ao listar treinadores:', error);
    res.status(500).json({ erro: 'Erro ao listar treinadores.' });
  }
};

// Buscar treinador por ID
exports.obterTreinador = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Buscando treinador com ID: ${id}`);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('ID inválido:', id);
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const treinador = await Treinador.findById(id)
      .populate('acesso_id', 'nome descricao')
      .populate('clubes', 'nome municipio endereco')
      .populate('associacaoMunicipal', 'nome municipio');

    if (!treinador) {
      console.log('Treinador não encontrado com ID:', id);
      return res.status(404).json({ erro: 'Treinador não encontrado.' });
    }

    // Verificar permissão de acesso
    if (req.usuario && req.usuario.acesso_id && req.usuario.acesso_id.nome !== 'administrador') {
      const usuarioAssociacao = req.usuario.associacaoMunicipal || req.usuario.associacaoProvincial;
      const treinadorAssociacao = treinador.associacaoMunicipal?._id;

      if (usuarioAssociacao && treinadorAssociacao &&
          usuarioAssociacao.toString() !== treinadorAssociacao.toString()) {
        // Verificar se o usuário pertence à associação provincial que contém esta municipal
        if (req.usuario.associacaoProvincial) {
          const assocMunicipal = await AssociacaoMunicipal.findById(treinadorAssociacao);
          if (assocMunicipal && assocMunicipal.associacaoProvincial.toString() !== req.usuario.associacaoProvincial.toString()) {
            return res.status(403).json({
              erro: 'Acesso negado. Você só pode ver treinadores da sua associação.'
            });
          }
        } else {
          return res.status(403).json({
            erro: 'Acesso negado. Você só pode ver treinadores da sua associação.'
          });
        }
      }
    }

    // Formatar resposta
    const resposta = treinador.toObject();
    resposta.totalClubes = treinador.clubes?.length || 0;
    resposta.idade = new Date().getFullYear() - new Date(treinador.dataNascimento).getFullYear();
    resposta.dataNascimentoFormatada = new Date(treinador.dataNascimento).toLocaleDateString('pt-AO');

    console.log(`Treinador encontrado: ${resposta.nomeCompleto}`);

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao obter treinador:', error);
    res.status(500).json({
      erro: 'Erro ao obter treinador.',
      detalhe: error.message
    });
  }
};

// Atualizar treinador
exports.atualizarTreinador = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`Atualizando treinador com ID: ${id}`);
    console.log('Dados para atualizar:', updates);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    // Verificar se treinador existe
    const treinadorExistente = await Treinador.findById(id);
    if (!treinadorExistente) {
      return res.status(404).json({ erro: 'Treinador não encontrado.' });
    }

    // Se estiver alterando associação municipal, verificar se existe
    if (updates.associacaoMunicipal &&
        updates.associacaoMunicipal !== treinadorExistente.associacaoMunicipal?.toString()) {
      const assocExistente = await AssociacaoMunicipal.findById(updates.associacaoMunicipal);
      if (!assocExistente) {
        return res.status(404).json({ erro: 'Associação municipal não encontrada' });
      }
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (updates.email && updates.email !== treinadorExistente.email) {
      const emailExiste = await Treinador.findOne({ email: updates.email, _id: { $ne: id } });
      if (emailExiste) {
        return res.status(400).json({ erro: 'Email já está em uso por outro treinador.' });
      }
    }

    // Verificar se BI já existe (se estiver sendo alterado)
    if (updates.bilheteIdentidade && updates.bilheteIdentidade !== treinadorExistente.bilheteIdentidade) {
      const biExiste = await Treinador.findOne({ bilheteIdentidade: updates.bilheteIdentidade, _id: { $ne: id } });
      if (biExiste) {
        return res.status(400).json({ erro: 'BI já está em uso por outro treinador.' });
      }
    }

    // Se estiver atualizando senha, fazer hash
    if (updates.senha) {
      updates.senha = await bcrypt.hash(updates.senha, 10);
    }

    // Se tiver imagem nova
    if (req.file) {
      updates.imagem = req.file.path;
    }

    // Converter data se fornecida
    if (updates.dataNascimento) {
      updates.dataNascimento = new Date(updates.dataNascimento);
    }

    // Remover campos que não devem ser atualizados
    delete updates._id;
    delete updates.createdAt;
    delete updates.__v;

    const treinador = await Treinador.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('acesso_id', 'nome descricao')
      .populate('clubes', 'nome municipio')
      .populate('associacaoMunicipal', 'nome municipio');

    console.log(`Treinador atualizado: ${treinador.nomeCompleto}`);

    res.json({
      mensagem: 'Treinador atualizado com sucesso!',
      treinador
    });
  } catch (error) {
    console.error('Erro ao atualizar treinador:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar treinador.',
      detalhe: error.message
    });
  }
};

// Excluir treinador
exports.excluirTreinador = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Excluindo treinador com ID: ${id}`);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const treinador = await Treinador.findById(id);
    if (!treinador) {
      return res.status(404).json({ erro: 'Treinador não encontrado.' });
    }

    // Remover treinador dos clubes
    if (treinador.clubes && treinador.clubes.length > 0) {
      await Clube.updateMany(
        { _id: { $in: treinador.clubes } },
        { $pull: { treinadores: id } }
      );
    }

    await Treinador.findByIdAndDelete(id);

    console.log(`Treinador excluído: ${treinador.nomeCompleto}`);

    res.json({ mensagem: 'Treinador excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir treinador:', error);
    res.status(500).json({ erro: 'Erro ao excluir treinador.' });
  }
};

// Ativar/Desativar treinador
exports.ativarDesativarTreinador = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    console.log(`Alterando status do treinador ${id} para: ${ativo}`);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const treinador = await Treinador.findByIdAndUpdate(
      id,
      { ativo: ativo === true || ativo === 'true' },
      { new: true }
    ).populate('acesso_id', 'nome descricao')
      .populate('clubes', 'nome municipio')
      .populate('associacaoMunicipal', 'nome municipio');

    if (!treinador) {
      return res.status(404).json({ erro: 'Treinador não encontrado.' });
    }

    console.log(`Status do treinador ${treinador.nomeCompleto} alterado para: ${treinador.ativo ? 'Ativo' : 'Inativo'}`);

    res.json({
      mensagem: `Treinador ${treinador.ativo ? 'ativado' : 'desativado'} com sucesso!`,
      treinador
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ erro: 'Erro ao alterar status do treinador.' });
  }
};

// Listar clubes de um treinador
exports.listarClubesDoTreinador = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Listando clubes do treinador: ${id}`);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const treinador = await Treinador.findById(id)
      .populate('clubes', 'nome municipio endereco dataCriacao');

    if (!treinador) {
      return res.status(404).json({ erro: 'Treinador não encontrado.' });
    }

    res.json({
      treinador: {
        id: treinador._id,
        nome: treinador.nomeCompleto
      },
      totalClubes: treinador.clubes?.length || 0,
      clubes: treinador.clubes || []
    });
  } catch (error) {
    console.error('Erro ao listar clubes do treinador:', error);
    res.status(500).json({ erro: 'Erro ao listar clubes do treinador.' });
  }
};