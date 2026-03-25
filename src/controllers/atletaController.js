// const mongoose = require('mongoose');
// const Atleta = require('../models/Atleta');
// const Acesso = require('../models/Acesso');
// const Clube = require('../models/Clube');
// const Graduacao = require('../models/Graduacao');
// const bcrypt = require('bcryptjs');

// // ==================== FUNÇÕES AUXILIARES ====================

// function obterCategoriaPeso(peso) {
//   if (peso <= 55) return 'Ligeiro';
//   if (peso <= 60) return 'Meio Ligeiro';
//   if (peso <= 66) return 'Leve';
//   if (peso <= 73) return 'Meio Médio';
//   if (peso <= 81) return 'Médio';
//   if (peso <= 90) return 'Meio Pesado';
//   if (peso <= 100) return 'Pesado';
//   return 'Super Pesado';
// }

// function processarImagens(req) {
//   const imagens = {
//     imagemPrincipal: null,
//     imagensTitulos: []
//   };

//   // Processar imagem principal do atleta
//   if (req.files && req.files['imagem_atleta_principal']) {
//     imagens.imagemPrincipal = req.files['imagem_atleta_principal'][0].path;
//   }

//   // Processar imagens dos títulos
//   if (req.files && req.files['imagem_titulos']) {
//     imagens.imagensTitulos = req.files['imagem_titulos'].map(file => file.path);
//   }

//   return imagens;
// }

// // ==================== CRUD PRINCIPAL ====================

// // Criar atleta com todas as imagens
// exports.criarAtleta = async (req, res) => {
//   try {
//     console.log('========================================');
//     console.log('CRIANDO ATLETA COM IMAGENS');
//     console.log('========================================');
//     console.log('Body:', req.body);
//     console.log('Files:', req.files);
    
//     // Extrair dados do body
//     const {
//       nomeCompleto,
//       apelido,
//       dataNascimento,
//       peso,
//       titulos,
//       responsavel,
//       profissao,
//       bilheteIdentidade,
//       telefone,
//       email,
//       senha,
//       clube
//     } = req.body;

//     // Validar campos obrigatórios
//     const camposObrigatorios = ['nomeCompleto', 'dataNascimento', 'peso', 'bilheteIdentidade', 'telefone', 'email', 'senha', 'clube'];
//     const camposFaltando = camposObrigatorios.filter(campo => !req.body[campo]);
    
//     if (camposFaltando.length > 0) {
//       return res.status(400).json({
//         erro: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}`
//       });
//     }

//     // Processar imagens
//     const imagens = processarImagens(req);

//     // Verificar se clube existe
//     const clubeExistente = await Clube.findById(clube);
//     if (!clubeExistente) {
//       return res.status(404).json({ erro: 'Clube não encontrado' });
//     }

//     // Verificar se email já existe
//     const emailExiste = await Atleta.findOne({ email });
//     if (emailExiste) {
//       return res.status(400).json({ erro: 'Email já cadastrado' });
//     }

//     // Verificar se BI já existe
//     const biExiste = await Atleta.findOne({ bilheteIdentidade });
//     if (biExiste) {
//       return res.status(400).json({ erro: 'BI já cadastrado' });
//     }

//     // Buscar nível de acesso (atleta)
//     let acesso = await Acesso.findOne({ nome: 'atleta' });
//     if (!acesso) {
//       acesso = await Acesso.create({
//         nome: 'atleta',
//         descricao: 'Atleta de judo',
//         permissoes: []
//       });
//     }

//     // Processar títulos (pode vir como string ou array)
//     let titulosArray = [];
//     if (titulos) {
//       if (Array.isArray(titulos)) {
//         titulosArray = titulos;
//       } else {
//         titulosArray = [titulos];
//       }
//     }

//     // Preparar dados do atleta
//     const dadosAtleta = {
//       nomeCompleto,
//       apelido: apelido || '',
//       dataNascimento: new Date(dataNascimento),
//       peso: Number(peso),
//       titulos: titulosArray,
//       imagemTitulos: imagens.imagensTitulos,
//       responsavel: responsavel || '',
//       profissao: profissao || '',
//       bilheteIdentidade,
//       telefone,
//       email,
//       senha,
//       acesso_id: acesso._id,
//       clube,
//       ativo: true
//     };

//     // Adicionar imagem principal se foi enviada
//     if (imagens.imagemPrincipal) {
//       dadosAtleta.imagem = imagens.imagemPrincipal;
//     }

//     const atleta = await Atleta.create(dadosAtleta);

//     // Adicionar atleta ao clube
//     await Clube.findByIdAndUpdate(clube, {
//       $addToSet: { atletas: atleta._id }
//     });

//     console.log('Atleta criado com sucesso:', atleta._id);

//     // Buscar o atleta com dados populados
//     const atletaPopulado = await Atleta.findById(atleta._id)
//       .populate('acesso_id', 'nome descricao')
//       .populate('clube', 'nome municipio endereco')
//       .populate('graduacao', 'nivel dataConcessao');

//     res.status(201).json({
//       mensagem: 'Atleta criado com sucesso!',
//       atleta: atletaPopulado
//     });
//   } catch (error) {
//     console.error('Erro ao criar atleta:', error);
//     res.status(500).json({
//       erro: 'Erro ao criar atleta.',
//       detalhe: error.message
//     });
//   }
// };

// // Listar todos atletas
// exports.listarAtletas = async (req, res) => {
//   try {
//     const filtros = { ativo: true };

//     // Filtrar por clube se especificado
//     if (req.query.clube) {
//       filtros.clube = req.query.clube;
//     }

//     // Filtrar por graduação se especificado
//     if (req.query.graduacao) {
//       filtros.graduacao = req.query.graduacao;
//     }

//     const atletas = await Atleta.find(filtros)
//       .populate('acesso_id', 'nome descricao')
//       .populate('clube', 'nome municipio')
//       .populate('graduacao', 'nivel dataConcessao')
//       .sort('-createdAt');

//     // Formatar resposta
//     const atletasFormatados = atletas.map(atleta => {
//       const obj = atleta.toObject();
//       obj.idade = new Date().getFullYear() - new Date(atleta.dataNascimento).getFullYear();
//       obj.categoriaPeso = obterCategoriaPeso(atleta.peso);
//       obj.totalTitulos = atleta.titulos?.length || 0;
//       obj.totalImagensTitulos = atleta.imagemTitulos?.length || 0;
//       return obj;
//     });

//     res.json(atletasFormatados);
//   } catch (error) {
//     console.error('Erro ao listar atletas:', error);
//     res.status(500).json({ erro: 'Erro ao listar atletas.' });
//   }
// };

// // Buscar atleta por ID
// exports.obterAtleta = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log(`Buscando atleta com ID: ${id}`);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atleta = await Atleta.findById(id)
//       .populate('acesso_id', 'nome descricao')
//       .populate('clube', 'nome municipio endereco telefone email')
//       .populate('graduacao', 'nivel dataConcessao certificado observacoes');

//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     const resposta = atleta.toObject();
//     resposta.idade = new Date().getFullYear() - new Date(atleta.dataNascimento).getFullYear();
//     resposta.categoriaPeso = obterCategoriaPeso(atleta.peso);
//     resposta.dataNascimentoFormatada = new Date(atleta.dataNascimento).toLocaleDateString('pt-AO');
//     resposta.totalTitulos = atleta.titulos?.length || 0;
//     resposta.totalImagensTitulos = atleta.imagemTitulos?.length || 0;

//     res.json(resposta);
//   } catch (error) {
//     console.error('Erro ao obter atleta:', error);
//     res.status(500).json({
//       erro: 'Erro ao obter atleta.',
//       detalhe: error.message
//     });
//   }
// };

// // Atualizar atleta
// exports.atualizarAtleta = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     console.log(`Atualizando atleta com ID: ${id}`);
//     console.log('Dados para atualizar:', updates);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atletaExistente = await Atleta.findById(id);
//     if (!atletaExistente) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     // Processar novas imagens
//     const imagens = processarImagens(req);
    
//     if (imagens.imagemPrincipal) {
//       updates.imagem = imagens.imagemPrincipal;
//     }
    
//     if (imagens.imagensTitulos.length > 0) {
//       // Adicionar novas imagens de títulos às existentes
//       const imagensExistentes = atletaExistente.imagemTitulos || [];
//       updates.imagemTitulos = [...imagensExistentes, ...imagens.imagensTitulos];
//     }

//     // Verificar se clube existe se estiver sendo alterado
//     if (updates.clube && updates.clube !== atletaExistente.clube.toString()) {
//       const clubeExistente = await Clube.findById(updates.clube);
//       if (!clubeExistente) {
//         return res.status(404).json({ erro: 'Clube não encontrado' });
//       }
      
//       // Remover atleta do clube antigo
//       await Clube.findByIdAndUpdate(atletaExistente.clube, {
//         $pull: { atletas: id }
//       });
      
//       // Adicionar ao novo clube
//       await Clube.findByIdAndUpdate(updates.clube, {
//         $addToSet: { atletas: id }
//       });
//     }

//     // Verificar se email já existe
//     if (updates.email && updates.email !== atletaExistente.email) {
//       const emailExiste = await Atleta.findOne({ email: updates.email, _id: { $ne: id } });
//       if (emailExiste) {
//         return res.status(400).json({ erro: 'Email já está em uso.' });
//       }
//     }

//     // Verificar se BI já existe
//     if (updates.bilheteIdentidade && updates.bilheteIdentidade !== atletaExistente.bilheteIdentidade) {
//       const biExiste = await Atleta.findOne({ bilheteIdentidade: updates.bilheteIdentidade, _id: { $ne: id } });
//       if (biExiste) {
//         return res.status(400).json({ erro: 'BI já está em uso.' });
//       }
//     }

//     // Se estiver atualizando senha
//     if (updates.senha) {
//       updates.senha = await bcrypt.hash(updates.senha, 10);
//     }

//     // Converter peso para número
//     if (updates.peso) {
//       updates.peso = Number(updates.peso);
//     }

//     // Converter data
//     if (updates.dataNascimento) {
//       updates.dataNascimento = new Date(updates.dataNascimento);
//     }

//     // Processar títulos (se vierem como string)
//     if (updates.titulos) {
//       if (typeof updates.titulos === 'string') {
//         updates.titulos = [updates.titulos];
//       }
//     }

//     // Remover campos que não devem ser atualizados
//     delete updates._id;
//     delete updates.createdAt;
//     delete updates.__v;

//     const atleta = await Atleta.findByIdAndUpdate(
//       id,
//       updates,
//       { new: true, runValidators: true }
//     ).populate('acesso_id', 'nome descricao')
//       .populate('clube', 'nome municipio')
//       .populate('graduacao');

//     res.json({
//       mensagem: 'Atleta atualizado com sucesso!',
//       atleta
//     });
//   } catch (error) {
//     console.error('Erro ao atualizar atleta:', error);
//     res.status(500).json({
//       erro: 'Erro ao atualizar atleta.',
//       detalhe: error.message
//     });
//   }
// };

// // Excluir atleta
// exports.excluirAtleta = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atleta = await Atleta.findById(id);
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     // Remover atleta do clube
//     await Clube.findByIdAndUpdate(atleta.clube, {
//       $pull: { atletas: id }
//     });

//     await Atleta.findByIdAndDelete(id);

//     res.json({ mensagem: 'Atleta excluído com sucesso.' });
//   } catch (error) {
//     console.error('Erro ao excluir atleta:', error);
//     res.status(500).json({ erro: 'Erro ao excluir atleta.' });
//   }
// };

// // Ativar/Desativar atleta
// exports.ativarDesativarAtleta = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { ativo } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atleta = await Atleta.findByIdAndUpdate(
//       id,
//       { ativo: ativo === true || ativo === 'true' },
//       { new: true }
//     );

//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     res.json({
//       mensagem: `Atleta ${atleta.ativo ? 'ativado' : 'desativado'} com sucesso!`,
//       atleta
//     });
//   } catch (error) {
//     console.error('Erro ao alterar status:', error);
//     res.status(500).json({ erro: 'Erro ao alterar status do atleta.' });
//   }
// };

// // ==================== GRADUAÇÃO ====================

// // Atribuir graduação
// exports.atribuirGraduacao = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { nivel, observacoes } = req.body;

//     console.log(`Atribuindo graduação ao atleta ${id}`);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atleta = await Atleta.findById(id);
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     const certificado = req.file ? req.file.path : null;

//     const graduacao = await Graduacao.create({
//       atleta: id,
//       nivel,
//       certificado,
//       observacoes
//     });

//     await Atleta.findByIdAndUpdate(id, { graduacao: graduacao._id });

//     res.status(201).json({
//       mensagem: 'Graduação atribuída com sucesso!',
//       graduacao
//     });
//   } catch (error) {
//     console.error('Erro ao atribuir graduação:', error);
//     res.status(500).json({
//       erro: 'Erro ao atribuir graduação.',
//       detalhe: error.message
//     });
//   }
// };

// // Obter graduação do atleta
// exports.obterGraduacao = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const atleta = await Atleta.findById(id).populate('graduacao');
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     res.json({
//       atleta: atleta.nomeCompleto,
//       graduacao: atleta.graduacao || null
//     });
//   } catch (error) {
//     console.error('Erro ao obter graduação:', error);
//     res.status(500).json({ erro: 'Erro ao obter graduação.' });
//   }
// };

// // ==================== TÍTULOS ====================

// // Adicionar título
// exports.adicionarTitulo = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { titulo } = req.body;

//     console.log(`Adicionando título ao atleta ${id}`);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atleta = await Atleta.findById(id);
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     const update = {
//       $addToSet: { titulos: titulo }
//     };

//     // Adicionar imagem do título se foi enviada
//     if (req.files && req.files['imagem_titulos'] && req.files['imagem_titulos'][0]) {
//       update.$addToSet.imagemTitulos = req.files['imagem_titulos'][0].path;
//     }

//     await Atleta.findByIdAndUpdate(id, update);

//     res.json({
//       mensagem: 'Título adicionado com sucesso!'
//     });
//   } catch (error) {
//     console.error('Erro ao adicionar título:', error);
//     res.status(500).json({
//       erro: 'Erro ao adicionar título.',
//       detalhe: error.message
//     });
//   }
// };

// // Listar títulos
// exports.listarTitulos = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const atleta = await Atleta.findById(id).select('nomeCompleto titulos imagemTitulos');
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     const titulosComImagens = atleta.titulos.map((titulo, index) => ({
//       titulo,
//       imagem: atleta.imagemTitulos && atleta.imagemTitulos[index] ? atleta.imagemTitulos[index] : null
//     }));

//     res.json({
//       atletaId: id,
//       atletaNome: atleta.nomeCompleto,
//       totalTitulos: atleta.titulos?.length || 0,
//       titulos: titulosComImagens
//     });
//   } catch (error) {
//     console.error('Erro ao listar títulos:', error);
//     res.status(500).json({ erro: 'Erro ao listar títulos.' });
//   }
// };

// // Remover título
// exports.removerTitulo = async (req, res) => {
//   try {
//     const { id, tituloIndex } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ erro: 'ID inválido' });
//     }

//     const atleta = await Atleta.findById(id);
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }

//     const index = parseInt(tituloIndex);
//     if (index < 0 || index >= atleta.titulos.length) {
//       return res.status(400).json({ erro: 'Índice de título inválido.' });
//     }

//     // Remover título
//     atleta.titulos.splice(index, 1);
    
//     // Remover imagem correspondente se existir
//     if (atleta.imagemTitulos && atleta.imagemTitulos[index]) {
//       atleta.imagemTitulos.splice(index, 1);
//     }

//     await atleta.save();

//     res.json({
//       mensagem: 'Título removido com sucesso!'
//     });
//   } catch (error) {
//     console.error('Erro ao remover título:', error);
//     res.status(500).json({ erro: 'Erro ao remover título.' });
//   }
// };





const mongoose = require('mongoose');
const Atleta = require('../models/Atleta');
const Acesso = require('../models/Acesso');
const Clube = require('../models/Clube');
const bcrypt = require('bcryptjs');

// ==================== CONSTANTES ====================

const GRADUACOES = [
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
];

const CORES_GRADUACAO = {
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

// ==================== FUNÇÕES AUXILIARES ====================

function obterCategoriaPeso(peso) {
  if (peso <= 55) return 'Ligeiro (-55kg)';
  if (peso <= 60) return 'Meio Ligeiro (-60kg)';
  if (peso <= 66) return 'Leve (-66kg)';
  if (peso <= 73) return 'Meio Médio (-73kg)';
  if (peso <= 81) return 'Médio (-81kg)';
  if (peso <= 90) return 'Meio Pesado (-90kg)';
  if (peso <= 100) return 'Pesado (-100kg)';
  return 'Super Pesado (+100kg)';
}

function obterProximaGraduacao(graduacaoAtual) {
  const index = GRADUACOES.indexOf(graduacaoAtual);
  if (index < GRADUACOES.length - 1) {
    return GRADUACOES[index + 1];
  }
  return null;
}

function obterGraduacaoAnterior(graduacaoAtual) {
  const index = GRADUACOES.indexOf(graduacaoAtual);
  if (index > 0) {
    return GRADUACOES[index - 1];
  }
  return null;
}

function processarImagens(req) {
  const imagens = {
    imagemPrincipal: null,
    certificadoGraduacao: null,
    imagensTitulos: []
  };

  if (req.files) {
    if (req.files['imagem_atleta_principal']) {
      imagens.imagemPrincipal = req.files['imagem_atleta_principal'][0].path;
    }
    if (req.files['certificado_graduacao']) {
      imagens.certificadoGraduacao = req.files['certificado_graduacao'][0].path;
    }
    if (req.files['imagem_titulos']) {
      imagens.imagensTitulos = req.files['imagem_titulos'].map(file => file.path);
    }
  }

  return imagens;
}

// ==================== CRUD PRINCIPAL ====================

// Criar atleta
exports.criarAtleta = async (req, res) => {
  try {
    console.log('========================================');
    console.log('CRIANDO ATLETA');
    console.log('========================================');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      nomeCompleto,
      apelido,
      dataNascimento,
      peso,
      graduacao,
      responsavel,
      profissao,
      bilheteIdentidade,
      telefone,
      email,
      senha,
      clube
    } = req.body;

    // Validar campos obrigatórios
    const camposObrigatorios = ['nomeCompleto', 'dataNascimento', 'peso', 'bilheteIdentidade', 'telefone', 'email', 'senha', 'clube'];
    const camposFaltando = camposObrigatorios.filter(campo => !req.body[campo]);
    
    if (camposFaltando.length > 0) {
      return res.status(400).json({
        erro: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}`
      });
    }

    // Validar graduação
    let graduacaoAtual = graduacao || '6º Kyu';
    if (!GRADUACOES.includes(graduacaoAtual)) {
      return res.status(400).json({
        erro: `Graduação inválida. Opções: ${GRADUACOES.join(', ')}`
      });
    }

    // Processar imagens
    const imagens = processarImagens(req);

    // Verificar se clube existe
    const clubeExistente = await Clube.findById(clube);
    if (!clubeExistente) {
      return res.status(404).json({ erro: 'Clube não encontrado' });
    }

    // Verificar se email já existe
    const emailExiste = await Atleta.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Verificar se BI já existe
    const biExiste = await Atleta.findOne({ bilheteIdentidade });
    if (biExiste) {
      return res.status(400).json({ erro: 'BI já cadastrado' });
    }

    // Buscar nível de acesso (atleta)
    let acesso = await Acesso.findOne({ nome: 'atleta' });
    if (!acesso) {
      acesso = await Acesso.create({
        nome: 'atleta',
        descricao: 'Atleta de judo',
        permissoes: []
      });
    }

    // Preparar dados do atleta
    const dadosAtleta = {
      nomeCompleto,
      apelido: apelido || '',
      dataNascimento: new Date(dataNascimento),
      peso: Number(peso),
      graduacao: graduacaoAtual,
      certificadoGraduacao: imagens.certificadoGraduacao,
      dataGraduacao: new Date(),
      responsavel: responsavel || '',
      profissao: profissao || '',
      bilheteIdentidade,
      telefone,
      email,
      senha,
      acesso_id: acesso._id,
      clube,
      ativo: true
    };

    // Adicionar imagem principal se foi enviada
    if (imagens.imagemPrincipal) {
      dadosAtleta.imagem = imagens.imagemPrincipal;
    }

    // Adicionar títulos se houver
    if (req.body.titulos) {
      const titulosArray = Array.isArray(req.body.titulos) ? req.body.titulos : [req.body.titulos];
      dadosAtleta.titulos = titulosArray.map((titulo, index) => ({
        nome: titulo,
        imagem: imagens.imagensTitulos[index] || null,
        data: new Date(),
        local: ''
      }));
    }

    const atleta = await Atleta.create(dadosAtleta);

    // Adicionar atleta ao clube
    await Clube.findByIdAndUpdate(clube, {
      $addToSet: { atletas: atleta._id }
    });

    console.log('Atleta criado com sucesso:', atleta._id);

    // Buscar o atleta com dados populados
    const atletaPopulado = await Atleta.findById(atleta._id)
      .populate('acesso_id', 'nome descricao')
      .populate('clube', 'nome municipio endereco');

    res.status(201).json({
      mensagem: 'Atleta criado com sucesso!',
      atleta: atletaPopulado
    });
  } catch (error) {
    console.error('Erro ao criar atleta:', error);
    res.status(500).json({
      erro: 'Erro ao criar atleta.',
      detalhe: error.message
    });
  }
};

// Listar todos atletas
exports.listarAtletas = async (req, res) => {
  try {
    const filtros = { ativo: true };

    if (req.query.clube) filtros.clube = req.query.clube;
    if (req.query.graduacao) filtros.graduacao = req.query.graduacao;
    if (req.query.categoria) {
      const categorias = {
        'ligeiro': { $lte: 55 },
        'meio-ligeiro': { $gte: 56, $lte: 60 },
        'leve': { $gte: 61, $lte: 66 },
        'meio-medio': { $gte: 67, $lte: 73 },
        'medio': { $gte: 74, $lte: 81 },
        'meio-pesado': { $gte: 82, $lte: 90 },
        'pesado': { $gte: 91, $lte: 100 },
        'super-pesado': { $gte: 101 }
      };
      const range = categorias[req.query.categoria];
      if (range) filtros.peso = range;
    }

    const atletas = await Atleta.find(filtros)
      .populate('acesso_id', 'nome descricao')
      .populate('clube', 'nome municipio')
      .sort('-createdAt');

    const atletasFormatados = atletas.map(atleta => {
      const obj = atleta.toObject();
      obj.idade = new Date().getFullYear() - new Date(atleta.dataNascimento).getFullYear();
      obj.categoriaPeso = obterCategoriaPeso(atleta.peso);
      obj.corGraduacao = CORES_GRADUACAO[atleta.graduacao];
      obj.tipoGraduacao = atleta.graduacao.includes('Kyu') ? 'Kyu' : 'Dan';
      obj.nivelGraduacao = parseInt(atleta.graduacao);
      obj.totalTitulos = atleta.titulos?.length || 0;
      obj.proximaGraduacao = obterProximaGraduacao(atleta.graduacao);
      return obj;
    });

    res.json(atletasFormatados);
  } catch (error) {
    console.error('Erro ao listar atletas:', error);
    res.status(500).json({ erro: 'Erro ao listar atletas.' });
  }
};

// Buscar atleta por ID
exports.obterAtleta = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const atleta = await Atleta.findById(id)
      .populate('acesso_id', 'nome descricao')
      .populate('clube', 'nome municipio endereco telefone email');

    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    const resposta = atleta.toObject();
    resposta.idade = new Date().getFullYear() - new Date(atleta.dataNascimento).getFullYear();
    resposta.categoriaPeso = obterCategoriaPeso(atleta.peso);
    resposta.dataNascimentoFormatada = new Date(atleta.dataNascimento).toLocaleDateString('pt-AO');
    resposta.dataGraduacaoFormatada = atleta.dataGraduacao ? new Date(atleta.dataGraduacao).toLocaleDateString('pt-AO') : null;
    resposta.corGraduacao = CORES_GRADUACAO[atleta.graduacao];
    resposta.tipoGraduacao = atleta.graduacao.includes('Kyu') ? 'Kyu' : 'Dan';
    resposta.nivelGraduacao = parseInt(atleta.graduacao);
    resposta.proximaGraduacao = obterProximaGraduacao(atleta.graduacao);
    resposta.graduacaoAnterior = obterGraduacaoAnterior(atleta.graduacao);
    resposta.totalTitulos = atleta.titulos?.length || 0;

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao obter atleta:', error);
    res.status(500).json({
      erro: 'Erro ao obter atleta.',
      detalhe: error.message
    });
  }
};

// Atualizar atleta
exports.atualizarAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const atletaExistente = await Atleta.findById(id);
    if (!atletaExistente) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    // Processar novas imagens
    const imagens = processarImagens(req);
    
    if (imagens.imagemPrincipal) {
      updates.imagem = imagens.imagemPrincipal;
    }
    
    if (imagens.certificadoGraduacao && updates.graduacao) {
      updates.certificadoGraduacao = imagens.certificadoGraduacao;
      updates.dataGraduacao = new Date();
    }

    // Validar graduação se estiver sendo alterada
    if (updates.graduacao && !GRADUACOES.includes(updates.graduacao)) {
      return res.status(400).json({
        erro: `Graduação inválida. Opções: ${GRADUACOES.join(', ')}`
      });
    }

    // Verificar se clube existe se estiver sendo alterado
    if (updates.clube && updates.clube !== atletaExistente.clube.toString()) {
      const clubeExistente = await Clube.findById(updates.clube);
      if (!clubeExistente) {
        return res.status(404).json({ erro: 'Clube não encontrado' });
      }
      
      await Clube.findByIdAndUpdate(atletaExistente.clube, {
        $pull: { atletas: id }
      });
      
      await Clube.findByIdAndUpdate(updates.clube, {
        $addToSet: { atletas: id }
      });
    }

    // Verificar email único
    if (updates.email && updates.email !== atletaExistente.email) {
      const emailExiste = await Atleta.findOne({ email: updates.email, _id: { $ne: id } });
      if (emailExiste) {
        return res.status(400).json({ erro: 'Email já está em uso.' });
      }
    }

    // Verificar BI único
    if (updates.bilheteIdentidade && updates.bilheteIdentidade !== atletaExistente.bilheteIdentidade) {
      const biExiste = await Atleta.findOne({ bilheteIdentidade: updates.bilheteIdentidade, _id: { $ne: id } });
      if (biExiste) {
        return res.status(400).json({ erro: 'BI já está em uso.' });
      }
    }

    // Hash da senha se for alterada
    if (updates.senha) {
      updates.senha = await bcrypt.hash(updates.senha, 10);
    }

    if (updates.peso) updates.peso = Number(updates.peso);
    if (updates.dataNascimento) updates.dataNascimento = new Date(updates.dataNascimento);

    delete updates._id;
    delete updates.createdAt;
    delete updates.__v;

    const atleta = await Atleta.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('acesso_id', 'nome descricao')
      .populate('clube', 'nome municipio');

    res.json({
      mensagem: 'Atleta atualizado com sucesso!',
      atleta
    });
  } catch (error) {
    console.error('Erro ao atualizar atleta:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar atleta.',
      detalhe: error.message
    });
  }
};

// Excluir atleta
exports.excluirAtleta = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const atleta = await Atleta.findById(id);
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    await Clube.findByIdAndUpdate(atleta.clube, {
      $pull: { atletas: id }
    });

    await Atleta.findByIdAndDelete(id);

    res.json({ mensagem: 'Atleta excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir atleta:', error);
    res.status(500).json({ erro: 'Erro ao excluir atleta.' });
  }
};

// Ativar/Desativar atleta
exports.ativarDesativarAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const atleta = await Atleta.findByIdAndUpdate(
      id,
      { ativo: ativo === true || ativo === 'true' },
      { new: true }
    );

    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    res.json({
      mensagem: `Atleta ${atleta.ativo ? 'ativado' : 'desativado'} com sucesso!`,
      atleta
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ erro: 'Erro ao alterar status do atleta.' });
  }
};

// ==================== GRADUAÇÃO ====================

// Atualizar graduação do atleta
exports.atualizarGraduacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { graduacao, observacoes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    if (!graduacao || !GRADUACOES.includes(graduacao)) {
      return res.status(400).json({
        erro: `Graduação inválida. Opções: ${GRADUACOES.join(', ')}`
      });
    }

    const atleta = await Atleta.findById(id);
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    const graduacaoAnterior = atleta.graduacao;
    const certificado = req.files?.certificado_graduacao?.[0]?.path || null;

    const updateData = {
      graduacao,
      dataGraduacao: new Date()
    };

    if (certificado) {
      updateData.certificadoGraduacao = certificado;
    }

    // Registrar histórico de graduação
    const historicoGraduacao = atleta.historicoGraduacoes || [];
    historicoGraduacao.push({
      graduacao: graduacaoAnterior,
      data: atleta.dataGraduacao,
      certificado: atleta.certificadoGraduacao
    });

    updateData.historicoGraduacoes = historicoGraduacao;

    const atletaAtualizado = await Atleta.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      mensagem: `Graduação atualizada de ${graduacaoAnterior} para ${graduacao}!`,
      atleta: {
        id: atletaAtualizado._id,
        nome: atletaAtualizado.nomeCompleto,
        graduacao: atletaAtualizado.graduacao,
        dataGraduacao: atletaAtualizado.dataGraduacao,
        certificado: atletaAtualizado.certificadoGraduacao
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar graduação:', error);
    res.status(500).json({
      erro: 'Erro ao atualizar graduação.',
      detalhe: error.message
    });
  }
};

// Listar todas as graduações disponíveis
exports.listarGraduacoesDisponiveis = async (req, res) => {
  try {
    const graduacoes = GRADUACOES.map(grad => ({
      nome: grad,
      tipo: grad.includes('Kyu') ? 'Kyu' : 'Dan',
      nivel: parseInt(grad),
      cor: CORES_GRADUACAO[grad],
      descricao: grad.includes('Kyu') ? 'Graduação de aluno' : 'Graduação de mestre'
    }));

    res.json({
      total: graduacoes.length,
      graduacoes
    });
  } catch (error) {
    console.error('Erro ao listar graduações:', error);
    res.status(500).json({ erro: 'Erro ao listar graduações.' });
  }
};

// Buscar histórico de graduações do atleta
exports.buscarHistoricoGraduacoes = async (req, res) => {
  try {
    const { id } = req.params;

    const atleta = await Atleta.findById(id).select('nomeCompleto graduacao dataGraduacao certificadoGraduacao historicoGraduacoes');
    
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    res.json({
      atleta: atleta.nomeCompleto,
      graduacaoAtual: {
        nome: atleta.graduacao,
        data: atleta.dataGraduacao,
        certificado: atleta.certificadoGraduacao
      },
      historico: atleta.historicoGraduacoes || []
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ erro: 'Erro ao buscar histórico de graduações.' });
  }
};

// ==================== TÍTULOS ====================

// Adicionar título
exports.adicionarTitulo = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, data, local } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const atleta = await Atleta.findById(id);
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    const imagem = req.files?.imagem_titulos?.[0]?.path || null;

    const novoTitulo = {
      nome: titulo,
      imagem,
      data: data ? new Date(data) : new Date(),
      local: local || ''
    };

    await Atleta.findByIdAndUpdate(id, {
      $push: { titulos: novoTitulo }
    });

    res.json({
      mensagem: 'Título adicionado com sucesso!',
      titulo: novoTitulo
    });
  } catch (error) {
    console.error('Erro ao adicionar título:', error);
    res.status(500).json({
      erro: 'Erro ao adicionar título.',
      detalhe: error.message
    });
  }
};

// Listar títulos
exports.listarTitulos = async (req, res) => {
  try {
    const { id } = req.params;

    const atleta = await Atleta.findById(id).select('nomeCompleto titulos');
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    res.json({
      atletaId: id,
      atletaNome: atleta.nomeCompleto,
      totalTitulos: atleta.titulos?.length || 0,
      titulos: atleta.titulos || []
    });
  } catch (error) {
    console.error('Erro ao listar títulos:', error);
    res.status(500).json({ erro: 'Erro ao listar títulos.' });
  }
};

// Remover título
exports.removerTitulo = async (req, res) => {
  try {
    const { id, tituloId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const atleta = await Atleta.findById(id);
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }

    const tituloIndex = parseInt(tituloId);
    if (tituloIndex < 0 || tituloIndex >= atleta.titulos.length) {
      return res.status(400).json({ erro: 'Índice de título inválido.' });
    }

    atleta.titulos.splice(tituloIndex, 1);
    await atleta.save();

    res.json({ mensagem: 'Título removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover título:', error);
    res.status(500).json({ erro: 'Erro ao remover título.' });
  }
};

// ==================== ESTATÍSTICAS ====================

// Estatísticas por graduação
exports.estatisticasPorGraduacao = async (req, res) => {
  try {
    const estatisticas = await Atleta.aggregate([
      { $match: { ativo: true } },
      { $group: {
        _id: '$graduacao',
        total: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const resultado = GRADUACOES.map(grad => {
      const encontrado = estatisticas.find(e => e._id === grad);
      return {
        graduacao: grad,
        tipo: grad.includes('Kyu') ? 'Kyu' : 'Dan',
        cor: CORES_GRADUACAO[grad],
        total: encontrado ? encontrado.total : 0
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ erro: 'Erro ao obter estatísticas.' });
  }
};

// Estatísticas por categoria de peso
exports.estatisticasPorCategoria = async (req, res) => {
  try {
    const atletas = await Atleta.find({ ativo: true }).select('peso');
    
    const categorias = {
      'Ligeiro (-55kg)': 0,
      'Meio Ligeiro (-60kg)': 0,
      'Leve (-66kg)': 0,
      'Meio Médio (-73kg)': 0,
      'Médio (-81kg)': 0,
      'Meio Pesado (-90kg)': 0,
      'Pesado (-100kg)': 0,
      'Super Pesado (+100kg)': 0
    };

    atletas.forEach(atleta => {
      const categoria = obterCategoriaPeso(atleta.peso);
      categorias[categoria]++;
    });

    res.json(categorias);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ erro: 'Erro ao obter estatísticas.' });
  }
};