const mongoose = require('mongoose'); // <-- ADICIONE ESTA LINHA
const Membro = require('../models/Membro');
const Acesso = require('../models/Acesso');
const AssociacaoProvincial = require('../models/AssociacaoProvincial');
const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');
const bcrypt = require('bcryptjs');

// Criar membro
exports.criarMembro = async (req, res) => {
  try {
    console.log('Criando membro...');
    console.log('Dados recebidos:', req.body);
    console.log('Arquivo:', req.file);
    
    const { 
      nome, 
      dataNascimento, 
      cargo, 
      profissao, 
      bilheteIdentidade, 
      telefone, 
      email, 
      senha,
      associacaoProvincial,
      associacaoMunicipal
    } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !dataNascimento || !cargo || !bilheteIdentidade || !telefone || !email || !senha) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios: nome, dataNascimento, cargo, bilheteIdentidade, telefone, email, senha' 
      });
    }
    
    // Validar associação
    if (!associacaoProvincial && !associacaoMunicipal) {
      return res.status(400).json({ 
        erro: 'É obrigatório informar uma associação (provincial OU municipal)' 
      });
    }
    
    if (associacaoProvincial && associacaoMunicipal) {
      return res.status(400).json({ 
        erro: 'Um membro não pode pertencer a uma associação provincial e municipal simultaneamente' 
      });
    }
    
    // Verificar se a associação existe
    if (associacaoProvincial) {
      const assocExistente = await AssociacaoProvincial.findById(associacaoProvincial);
      if (!assocExistente) {
        return res.status(404).json({ erro: 'Associação provincial não encontrada' });
      }
    }
    
    if (associacaoMunicipal) {
      const assocExistente = await AssociacaoMunicipal.findById(associacaoMunicipal);
      if (!assocExistente) {
        return res.status(404).json({ erro: 'Associação municipal não encontrada' });
      }
    }
    
    // Verificar se email já existe
    const emailExiste = await Membro.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    // Verificar se BI já existe
    const biExiste = await Membro.findOne({ bilheteIdentidade });
    if (biExiste) {
      return res.status(400).json({ erro: 'BI já cadastrado' });
    }
    
    // Buscar nível de acesso (padrão: membro)
    let acesso = await Acesso.findOne({ nome: 'membro' });
    if (!acesso) {
      acesso = await Acesso.create({
        nome: 'membro',
        descricao: 'Membro da associação',
        permissoes: []
      });
    }
    
    // Preparar dados do membro
    const dadosMembro = {
      nome,
      dataNascimento: new Date(dataNascimento),
      cargo,
      profissao: profissao || '',
      bilheteIdentidade,
      telefone,
      email,
      senha,
      acesso_id: acesso._id,
      ativo: true
    };
    
    // Adicionar a associação correta
    if (associacaoProvincial) {
      dadosMembro.associacaoProvincial = associacaoProvincial;
    } else if (associacaoMunicipal) {
      dadosMembro.associacaoMunicipal = associacaoMunicipal;
    }
    
    // Adicionar imagem se foi enviada
    if (req.file) {
      dadosMembro.imagem = req.file.path;
    }
    
    const membro = await Membro.create(dadosMembro);
    
    console.log('Membro criado com sucesso:', membro._id);
    
    // Buscar o membro com os dados populados
    const membroPopulado = await Membro.findById(membro._id)
      .populate('acesso_id', 'nome descricao')
      .populate('associacaoProvincial', 'nome provincia')
      .populate('associacaoMunicipal', 'nome municipio');
    
    res.status(201).json({
      mensagem: 'Membro criado com sucesso!',
      membro: membroPopulado
    });
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    res.status(500).json({ 
      erro: 'Erro ao criar membro.',
      detalhe: error.message 
    });
  }
};

// Listar todos membros
exports.listarMembros = async (req, res) => {
  try {
    const filtros = {};
    
    // Se não for administrador, filtrar por associação
    if (req.usuario && req.usuario.acesso_id && req.usuario.acesso_id.nome !== 'administrador') {
      if (req.usuario.associacaoMunicipal) {
        filtros.associacaoMunicipal = req.usuario.associacaoMunicipal;
      } else if (req.usuario.associacaoProvincial) {
        filtros.associacaoProvincial = req.usuario.associacaoProvincial;
      }
    }
    
    const membros = await Membro.find(filtros)
      .populate('acesso_id', 'nome descricao')
      .populate('associacaoProvincial', 'nome provincia')
      .populate('associacaoMunicipal', 'nome municipio')
      .sort('-createdAt');
    
    // Adicionar campo virtual para saber qual associação o membro pertence
    const membrosFormatados = membros.map(membro => {
      const obj = membro.toObject();
      obj.tipoAssociacao = obj.associacaoProvincial ? 'provincial' : 
                          obj.associacaoMunicipal ? 'municipal' : null;
      obj.nomeAssociacao = obj.associacaoProvincial?.nome || 
                          obj.associacaoMunicipal?.nome || null;
      return obj;
    });
    
    res.json(membrosFormatados);
  } catch (error) {
    console.error('Erro ao listar membros:', error);
    res.status(500).json({ erro: 'Erro ao listar membros.' });
  }
};

// Buscar membro por ID
exports.obterMembro = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Buscando membro com ID: ${id}`);
    
    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('ID inválido:', id);
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const membro = await Membro.findById(id)
      .populate('acesso_id', 'nome descricao')
      .populate('associacaoProvincial', 'nome provincia')
      .populate('associacaoMunicipal', 'nome municipio');
    
    if (!membro) {
      console.log('Membro não encontrado com ID:', id);
      return res.status(404).json({ erro: 'Membro não encontrado.' });
    }
    
    // Verificar permissão de acesso
    if (req.usuario && req.usuario.acesso_id && req.usuario.acesso_id.nome !== 'administrador') {
      const usuarioAssociacao = req.usuario.associacaoMunicipal || req.usuario.associacaoProvincial;
      const membroAssociacao = membro.associacaoMunicipal || membro.associacaoProvincial;
      
      if (usuarioAssociacao && membroAssociacao && 
          usuarioAssociacao.toString() !== membroAssociacao.toString()) {
        return res.status(403).json({ 
          erro: 'Acesso negado. Você só pode ver membros da sua associação.' 
        });
      }
    }
    
    // Formatar resposta
    const resposta = membro.toObject();
    resposta.tipoAssociacao = resposta.associacaoProvincial ? 'provincial' : 
                              resposta.associacaoMunicipal ? 'municipal' : null;
    resposta.nomeAssociacao = resposta.associacaoProvincial?.nome || 
                             resposta.associacaoMunicipal?.nome || null;
    
    console.log(`Membro encontrado: ${resposta.nome}`);
    
    res.json(resposta);
  } catch (error) {
    console.error('Erro ao obter membro:', error);
    res.status(500).json({ 
      erro: 'Erro ao obter membro.',
      detalhe: error.message 
    });
  }
};

// Atualizar membro
exports.atualizarMembro = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`Atualizando membro com ID: ${id}`);
    console.log('Dados para atualizar:', updates);
    
    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    // Verificar se membro existe
    const membroExistente = await Membro.findById(id);
    if (!membroExistente) {
      return res.status(404).json({ erro: 'Membro não encontrado.' });
    }
    
    // Validar associação - não pode ter ambas
    if (updates.associacaoProvincial && updates.associacaoMunicipal) {
      return res.status(400).json({ 
        erro: 'Um membro não pode pertencer a uma associação provincial e municipal simultaneamente' 
      });
    }
    
    // Se estiver trocando de associação, validar se a nova existe
    if (updates.associacaoProvincial && updates.associacaoProvincial !== membroExistente.associacaoProvincial?.toString()) {
      const assocExistente = await AssociacaoProvincial.findById(updates.associacaoProvincial);
      if (!assocExistente) {
        return res.status(404).json({ erro: 'Associação provincial não encontrada' });
      }
      // Remover a outra associação se existir
      updates.associacaoMunicipal = null;
    }
    
    if (updates.associacaoMunicipal && updates.associacaoMunicipal !== membroExistente.associacaoMunicipal?.toString()) {
      const assocExistente = await AssociacaoMunicipal.findById(updates.associacaoMunicipal);
      if (!assocExistente) {
        return res.status(404).json({ erro: 'Associação municipal não encontrada' });
      }
      // Remover a outra associação se existir
      updates.associacaoProvincial = null;
    }
    
    // Verificar se email já existe (se estiver sendo alterado)
    if (updates.email && updates.email !== membroExistente.email) {
      const emailExiste = await Membro.findOne({ email: updates.email, _id: { $ne: id } });
      if (emailExiste) {
        return res.status(400).json({ erro: 'Email já está em uso por outro membro.' });
      }
    }
    
    // Verificar se BI já existe (se estiver sendo alterado)
    if (updates.bilheteIdentidade && updates.bilheteIdentidade !== membroExistente.bilheteIdentidade) {
      const biExiste = await Membro.findOne({ bilheteIdentidade: updates.bilheteIdentidade, _id: { $ne: id } });
      if (biExiste) {
        return res.status(400).json({ erro: 'BI já está em uso por outro membro.' });
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
    
    // Remover campos que não devem ser atualizados diretamente
    delete updates._id;
    delete updates.createdAt;
    delete updates.__v;
    
    const membro = await Membro.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).populate('acesso_id', 'nome descricao')
     .populate('associacaoProvincial', 'nome provincia')
     .populate('associacaoMunicipal', 'nome municipio');
    
    // Formatar resposta
    const resposta = membro.toObject();
    resposta.tipoAssociacao = resposta.associacaoProvincial ? 'provincial' : 
                              resposta.associacaoMunicipal ? 'municipal' : null;
    resposta.nomeAssociacao = resposta.associacaoProvincial?.nome || 
                             resposta.associacaoMunicipal?.nome || null;
    
    console.log(`Membro atualizado: ${resposta.nome}`);
    
    res.json({
      mensagem: 'Membro atualizado com sucesso!',
      membro: resposta
    });
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    res.status(500).json({ 
      erro: 'Erro ao atualizar membro.',
      detalhe: error.message 
    });
  }
};

// Excluir membro
exports.excluirMembro = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Excluindo membro com ID: ${id}`);
    
    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const membro = await Membro.findById(id);
    if (!membro) {
      return res.status(404).json({ erro: 'Membro não encontrado.' });
    }
    
    // Verificar se é o último administrador
    if (membro.acesso_id && membro.acesso_id.nome === 'administrador') {
      const admins = await Membro.find({ 
        acesso_id: membro.acesso_id,
        _id: { $ne: id }
      });
      if (admins.length === 0) {
        return res.status(400).json({ 
          erro: 'Não é possível excluir o último administrador do sistema.' 
        });
      }
    }
    
    await Membro.findByIdAndDelete(id);
    
    console.log(`Membro excluído: ${membro.nome}`);
    
    res.json({ mensagem: 'Membro excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir membro:', error);
    res.status(500).json({ erro: 'Erro ao excluir membro.' });
  }
};

// Ativar/Desativar membro
exports.ativarDesativarMembro = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;
    
    console.log(`Alterando status do membro ${id} para: ${ativo}`);
    
    // Validar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }
    
    const membro = await Membro.findByIdAndUpdate(
      id,
      { ativo: ativo === true || ativo === 'true' },
      { new: true }
    ).populate('acesso_id', 'nome descricao')
     .populate('associacaoProvincial', 'nome provincia')
     .populate('associacaoMunicipal', 'nome municipio');
    
    if (!membro) {
      return res.status(404).json({ erro: 'Membro não encontrado.' });
    }
    
    console.log(`Status do membro ${membro.nome} alterado para: ${membro.ativo ? 'Ativo' : 'Inativo'}`);
    
    res.json({
      mensagem: `Membro ${membro.ativo ? 'ativado' : 'desativado'} com sucesso!`,
      membro
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ erro: 'Erro ao alterar status do membro.' });
  }
};