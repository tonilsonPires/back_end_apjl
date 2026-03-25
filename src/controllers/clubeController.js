const mongoose = require('mongoose');
const Clube = require('../models/Clube');
const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');
const Treinador = require('../models/Treinador');
const Atleta = require('../models/Atleta');

// Criar clube
exports.criarClube = async (req, res) => {
  try {
    console.log('Criando clube...');
    console.log('Dados recebidos:', req.body);
    console.log('Arquivo:', req.file);

    const {
      nome,
      municipio,
      endereco,
      dataCriacao,
      responsavel,
      associacaoMunicipal
    } = req.body;

    // Validar campos obrigatórios
    if (!nome || !municipio || !endereco || !dataCriacao || !responsavel || !associacaoMunicipal) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, municipio, endereco, dataCriacao, responsavel, associacaoMunicipal'
      });
    }

    // Verificar se associação municipal existe
    const assocExistente = await AssociacaoMunicipal.findById(associacaoMunicipal);
    if (!assocExistente) {
      return res.status(404).json({ erro: 'Associação municipal não encontrada' });
    }

    // Verificar se já existe um clube com o mesmo nome na mesma associação
    const clubeExistente = await Clube.findOne({ 
      nome, 
      associacaoMunicipal 
    });
    if (clubeExistente) {
      return res.status(400).json({ 
        erro: 'Já existe um clube com este nome nesta associação municipal' 
      });
    }

    // Preparar dados do clube
    const dadosClube = {
      nome,
      municipio,
      endereco,
      dataCriacao: new Date(dataCriacao),
      responsavel,
      associacaoMunicipal,
      ativo: true
    };

    // Adicionar imagem se foi enviada
    if (req.file) {
      dadosClube.imagem = req.file.path;
    }

    const clube = await Clube.create(dadosClube);

    console.log('Clube criado com sucesso:', clube._id);

    // Buscar o clube com os dados populados
    const clubePopulado = await Clube.findById(clube._id)
      .populate('associacaoMunicipal', 'nome municipio')
      .populate('treinadores', 'nomeCompleto')
      .populate('atletas', 'nomeCompleto');

    res.status(201).json({
      mensagem: 'Clube criado com sucesso!',
      clube: clubePopulado
    });
  } catch (error) {
    console.error('Erro ao criar clube:', error);
    res.status(500).json({
      erro: 'Erro ao criar clube.',
      detalhe: error.message
    });
  }
};

// Listar todos clubes
exports.listarClubes = async (req, res) => {
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

    const clubes = await Clube.find(filtros)
      .populate('associacaoMunicipal', 'nome municipio')
      .populate('treinadores', 'nomeCompleto')
      .populate('atletas', 'nomeCompleto')
      .sort('-createdAt');

    res.json(clubes);
  } catch (error) {
    console.error('Erro ao listar clubes:', error);
    res.status(500).json({ erro: 'Erro ao listar clubes.' });
  }
};

// Buscar clube por ID
exports.obterClube = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Buscando clube com ID: ${id}`);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('ID inválido:', id);
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const clube = await Clube.findById(id)
      .populate('associacaoMunicipal', 'nome municipio logo')
      .populate('treinadores', 'nomeCompleto apelido email telefone')
      .populate('atletas', 'nomeCompleto apelido peso graduacao');

    if (!clube) {
      console.log('Clube não encontrado com ID:', id);
      return res.status(404).json({ erro: 'Clube não encontrado.' });
    }

    // Verificar permissão de acesso
    if (req.usuario && req.usuario.acesso_id && req.usuario.acesso_id.nome !== 'administrador') {
      const usuarioAssociacao = req.usuario.associacaoMunicipal || req.usuario.associacaoProvincial;
      const clubeAssociacao = clube.associacaoMunicipal?._id;

      if (usuarioAssociacao && clubeAssociacao && 
          usuarioAssociacao.toString() !== clubeAssociacao.toString()) {
        // Verificar se o usuário pertence à associação provincial que contém esta municipal
        if (req.usuario.associacaoProvincial) {
          const assocMunicipal = await AssociacaoMunicipal.findById(clubeAssociacao);
          if (assocMunicipal && assocMunicipal.associacaoProvincial.toString() !== req.usuario.associacaoProvincial.toString()) {
            return res.status(403).json({
              erro: 'Acesso negado. Você só pode ver clubes da sua associação.'
            });
          }
        } else {
          return res.status(403).json({
            erro: 'Acesso negado. Você só pode ver clubes da sua associação.'
          });
        }
      }
    }

    // Formatar resposta
    const resposta = clube.toObject();
    resposta.totalTreinadores = clube.treinadores?.length || 0;
    resposta.totalAtletas = clube.atletas?.length || 0;
    resposta.idade = new Date().getFullYear() - new Date(clube.dataCriacao).getFullYear();

    console.log(`Clube encontrado: ${resposta.nome}`);

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao obter clube:', error);
    res.status(500).json({
      erro: 'Erro ao obter clube.',
      detalhe: error.message
    });
  }
};

// Atualizar clube
exports.atualizarClube = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log(`Atualizando clube com ID: ${id}`);
    console.log('Dados para atualizar:', updates);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    // Verificar se clube existe
    const clubeExistente = await Clube.findById(id);
    if (!clubeExistente) {
      return res.status(404).json({ erro: 'Clube não encontrado.' });
    }

    // Se estiver alterando associação municipal, verificar se existe
    if (updates.associacaoMunicipal && 
        updates.associacaoMunicipal !== clubeExistente.associacaoMunicipal.toString()) {
      const assocExistente = await AssociacaoMunicipal.findById(updates.associacaoMunicipal);
      if (!assocExistente) {
        return res.status(404).json({ erro: 'Associação municipal não encontrada' });
      }
    }

    // Verificar se nome já existe em outra associação
    if (updates.nome && updates.nome !== clubeExistente.nome) {
      const clubeMesmoNome = await Clube.findOne({
        nome: updates.nome,
        associacaoMunicipal: updates.associacaoMunicipal || clubeExistente.associacaoMunicipal,
        _id: { $ne: id }
      });
      if (clubeMesmoNome) {
        return res.status(400).json({
          erro: 'Já existe um clube com este nome nesta associação'
        });
      }
    }

    // Se tiver imagem nova
    if (req.file) {
      updates.imagem = req.file.path;
    }

    // Converter data se fornecida
    if (updates.dataCriacao) {
      updates.dataCriacao = new Date(updates.dataCriacao);
    }

    // Remover campos que não devem ser atualizados
    delete updates._id;
    delete updates.createdAt;
    delete updates.__v;
    delete updates.treinadores;
    delete updates.atletas;

    const clube = await Clube.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('associacaoMunicipal', 'nome municipio')
      .populate('treinadores', 'nomeCompleto')
      .populate('atletas', 'nomeCompleto');

    console.log(`Clube atualizado: ${clube.nome}`);

    res.json({
      mensagem: 'Clube atualizado com sucesso!',
      clube
    });
  } catch (error) {
    console.error('Erro ao atualizar clube:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar clube.',
      detalhe: error.message
    });
  }
};

// Excluir clube
exports.excluirClube = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Excluindo clube com ID: ${id}`);

    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const clube = await Clube.findById(id);
    if (!clube) {
      return res.status(404).json({ erro: 'Clube não encontrado.' });
    }

    // Verificar se o clube tem atletas ou treinadores
    if (clube.atletas && clube.atletas.length > 0) {
      return res.status(400).json({
        erro: `Não é possível excluir. O clube possui ${clube.atletas.length} atleta(s) vinculado(s).`
      });
    }

    if (clube.treinadores && clube.treinadores.length > 0) {
      return res.status(400).json({
        erro: `Não é possível excluir. O clube possui ${clube.treinadores.length} treinador(es) vinculado(s).`
      });
    }

    // Opção: em vez de excluir, podemos desativar
    // await Clube.findByIdAndUpdate(id, { ativo: false });
    
    await Clube.findByIdAndDelete(id);

    console.log(`Clube excluído: ${clube.nome}`);

    res.json({ mensagem: 'Clube excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir clube:', error);
    res.status(500).json({ erro: 'Erro ao excluir clube.' });
  }
};

// Adicionar treinador ao clube
exports.adicionarTreinador = async (req, res) => {
  try {
    const { id } = req.params;
    const { treinadorId } = req.body;

    console.log(`Adicionando treinador ${treinadorId} ao clube ${id}`);

    if (!treinadorId) {
      return res.status(400).json({ erro: 'ID do treinador é obrigatório' });
    }

    // Verificar se treinador existe
    const treinador = await Treinador.findById(treinadorId);
    if (!treinador) {
      return res.status(404).json({ erro: 'Treinador não encontrado' });
    }

    const clube = await Clube.findByIdAndUpdate(
      id,
      { $addToSet: { treinadores: treinadorId } },
      { new: true }
    ).populate('treinadores', 'nomeCompleto');

    if (!clube) {
      return res.status(404).json({ erro: 'Clube não encontrado' });
    }

    // Adicionar clube ao treinador também
    await Treinador.findByIdAndUpdate(
      treinadorId,
      { $addToSet: { clubes: id } }
    );

    res.json({
      mensagem: 'Treinador adicionado ao clube com sucesso!',
      clube
    });
  } catch (error) {
    console.error('Erro ao adicionar treinador:', error);
    res.status(500).json({ erro: 'Erro ao adicionar treinador ao clube.' });
  }
};

// Remover treinador do clube
exports.removerTreinador = async (req, res) => {
  try {
    const { id, treinadorId } = req.params;

    console.log(`Removendo treinador ${treinadorId} do clube ${id}`);

    const clube = await Clube.findByIdAndUpdate(
      id,
      { $pull: { treinadores: treinadorId } },
      { new: true }
    );

    if (!clube) {
      return res.status(404).json({ erro: 'Clube não encontrado' });
    }

    // Remover clube do treinador também
    await Treinador.findByIdAndUpdate(
      treinadorId,
      { $pull: { clubes: id } }
    );

    res.json({
      mensagem: 'Treinador removido do clube com sucesso!',
      clube
    });
  } catch (error) {
    console.error('Erro ao remover treinador:', error);
    res.status(500).json({ erro: 'Erro ao remover treinador do clube.' });
  }
};

// Adicionar atleta ao clube
exports.adicionarAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const { atletaId } = req.body;

    console.log(`Adicionando atleta ${atletaId} ao clube ${id}`);

    if (!atletaId) {
      return res.status(400).json({ erro: 'ID do atleta é obrigatório' });
    }

    // Verificar se atleta existe
    const atleta = await Atleta.findById(atletaId);
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado' });
    }

    const clube = await Clube.findByIdAndUpdate(
      id,
      { $addToSet: { atletas: atletaId } },
      { new: true }
    ).populate('atletas', 'nomeCompleto');

    if (!clube) {
      return res.status(404).json({ erro: 'Clube não encontrado' });
    }

    // Atualizar o clube do atleta
    await Atleta.findByIdAndUpdate(atletaId, { clube: id });

    res.json({
      mensagem: 'Atleta adicionado ao clube com sucesso!',
      clube
    });
  } catch (error) {
    console.error('Erro ao adicionar atleta:', error);
    res.status(500).json({ erro: 'Erro ao adicionar atleta ao clube.' });
  }
};

// Remover atleta do clube
exports.removerAtleta = async (req, res) => {
  try {
    const { id, atletaId } = req.params;

    console.log(`Removendo atleta ${atletaId} do clube ${id}`);

    const clube = await Clube.findByIdAndUpdate(
      id,
      { $pull: { atletas: atletaId } },
      { new: true }
    );

    if (!clube) {
      return res.status(404).json({ erro: 'Clube não encontrado' });
    }

    // Remover clube do atleta
    await Atleta.findByIdAndUpdate(atletaId, { clube: null });

    res.json({
      mensagem: 'Atleta removido do clube com sucesso!',
      clube
    });
  } catch (error) {
    console.error('Erro ao remover atleta:', error);
    res.status(500).json({ erro: 'Erro ao remover atleta do clube.' });
  }
};