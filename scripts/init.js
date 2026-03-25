const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Acesso = require('../src/models/Acesso');
const Permissao = require('../src/models/Permissao');
const AssociacaoProvincial = require('../src/models/AssociacaoProvincial');
const AssociacaoMunicipal = require('../src/models/AssociacaoMunicipal');
const Membro = require('../src/models/Membro');
require('dotenv').config();

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');
    
    // Limpar dados existentes
    await Permissao.deleteMany({});
    await Acesso.deleteMany({});
    await AssociacaoProvincial.deleteMany({});
    await AssociacaoMunicipal.deleteMany({});
    await Membro.deleteMany({});
    console.log('Dados antigos removidos');
    
    // Criar permissões
    const permissoes = [
      { nome: 'visualizar', recurso: 'associacao', descricao: 'Pode visualizar associações' },
      { nome: 'criar', recurso: 'associacao', descricao: 'Pode criar associações' },
      { nome: 'alterar', recurso: 'associacao', descricao: 'Pode alterar associações' },
      { nome: 'excluir', recurso: 'associacao', descricao: 'Pode excluir associações' },
      { nome: 'visualizar', recurso: 'membro', descricao: 'Pode visualizar membros' },
      { nome: 'criar', recurso: 'membro', descricao: 'Pode criar membros' },
      { nome: 'alterar', recurso: 'membro', descricao: 'Pode alterar membros' },
      { nome: 'excluir', recurso: 'membro', descricao: 'Pode excluir membros' },
      { nome: 'visualizar', recurso: 'clube', descricao: 'Pode visualizar clubes' },
      { nome: 'criar', recurso: 'clube', descricao: 'Pode criar clubes' },
      { nome: 'alterar', recurso: 'clube', descricao: 'Pode alterar clubes' },
      { nome: 'excluir', recurso: 'clube', descricao: 'Pode excluir clubes' },
      { nome: 'visualizar', recurso: 'treinador', descricao: 'Pode visualizar treinadores' },
      { nome: 'criar', recurso: 'treinador', descricao: 'Pode criar treinadores' },
      { nome: 'alterar', recurso: 'treinador', descricao: 'Pode alterar treinadores' },
      { nome: 'excluir', recurso: 'treinador', descricao: 'Pode excluir treinadores' },
      { nome: 'visualizar', recurso: 'atleta', descricao: 'Pode visualizar atletas' },
      { nome: 'criar', recurso: 'atleta', descricao: 'Pode criar atletas' },
      { nome: 'alterar', recurso: 'atleta', descricao: 'Pode alterar atletas' },
      { nome: 'excluir', recurso: 'atleta', descricao: 'Pode excluir atletas' },
      { nome: 'visualizar', recurso: 'cartao', descricao: 'Pode visualizar cartões' },
      { nome: 'criar', recurso: 'cartao', descricao: 'Pode criar cartões' }
    ];
    
    const permissoesCriadas = await Permissao.insertMany(permissoes);
    console.log(`${permissoesCriadas.length} permissões criadas`);
    
    // Criar acessos
    const acessos = [
      { 
        nome: 'administrador', 
        descricao: 'Acesso total ao sistema - pode fazer tudo',
        permissoes: permissoesCriadas.map(p => p._id)
      },
      { 
        nome: 'presidente', 
        descricao: 'Presidente da associação - pode criar, visualizar e alterar, mas não excluir',
        permissoes: permissoesCriadas.filter(p => p.nome !== 'excluir').map(p => p._id)
      },
      { 
        nome: 'membro', 
        descricao: 'Membro da associação - pode criar, visualizar e alterar dados da sua associação',
        permissoes: permissoesCriadas.filter(p => 
          p.nome !== 'excluir' && 
          ['associacao', 'membro', 'clube', 'treinador', 'atleta'].includes(p.recurso)
        ).map(p => p._id)
      },
      { 
        nome: 'treinador', 
        descricao: 'Treinador de judo - pode gerenciar atletas dos seus clubes',
        permissoes: permissoesCriadas.filter(p => 
          p.recurso === 'atleta' && p.nome !== 'excluir'
        ).concat(
          permissoesCriadas.filter(p => 
            p.recurso === 'clube' && p.nome === 'visualizar'
          )
        ).map(p => p._id)
      },
      { 
        nome: 'atleta', 
        descricao: 'Atleta de judo - pode apenas visualizar seus próprios dados',
        permissoes: permissoesCriadas.filter(p => 
          p.recurso === 'atleta' && p.nome === 'visualizar'
        ).map(p => p._id)
      },
      { 
        nome: 'visitante', 
        descricao: 'Visitante do sistema - acesso limitado apenas para visualização pública',
        permissoes: []
      }
    ];
    
    const acessosCriados = await Acesso.insertMany(acessos);
    console.log(`${acessosCriados.length} acessos criados`);
    
    // Criar associação provincial de exemplo
    const associacaoProvincial = await AssociacaoProvincial.create({
      nome: 'Associação Provincial de Luanda de Judo',
      provincia: 'Luanda',
      logo: 'uploads/associacoes/logo-luanda.jpg',
      endereco: 'Rua da Associação, 123, Luanda',
      telefone: '+244 923 456 789',
      email: 'luanda@judo.ao'
    });
    console.log('Associação Provincial criada');
    
    // Criar associação municipal de exemplo
    const associacaoMunicipal = await AssociacaoMunicipal.create({
      nome: 'Associação Municipal de Luanda de Judo',
      municipio: 'Luanda',
      logo: 'uploads/associacoes/logo-luanda-municipal.jpg',
      endereco: 'Avenida 4 de Fevereiro, 456, Luanda',
      telefone: '+244 923 456 790',
      email: 'luanda.municipal@judo.ao',
      associacaoProvincial: associacaoProvincial._id
    });
    console.log('Associação Municipal criada');
    
    // Criar administrador
    const senhaHash = await bcrypt.hash('admin123', 10);
    const acessoAdmin = await Acesso.findOne({ nome: 'administrador' });
    
    const admin = await Membro.create({
      nome: 'Administrador do Sistema',
      dataNascimento: new Date('1980-01-01'),
      cargo: 'presidente',
      profissao: 'Administrador',
      bilheteIdentidade: '001234567LA034',
      telefone: '+244 923 456 788',
      email: 'admin@judo.ao',
      senha: senhaHash,
      acesso_id: acessoAdmin._id,
      ativo: true
    });
    console.log('Administrador criado');
    
    // Criar presidente da associação
    const senhaPresidente = await bcrypt.hash('presidente123', 10);
    const acessoPresidente = await Acesso.findOne({ nome: 'presidente' });
    
    const presidente = await Membro.create({
      nome: 'João Manuel Silva',
      imagem: 'uploads/membros/presidente.jpg',
      dataNascimento: new Date('1975-05-15'),
      cargo: 'presidente',
      profissao: 'Empresário',
      bilheteIdentidade: '002345678LA034',
      telefone: '+244 923 456 777',
      email: 'presidente@judo.ao',
      senha: senhaPresidente,
      acesso_id: acessoPresidente._id,
      associacaoProvincial: associacaoProvincial._id,
      associacaoMunicipal: associacaoMunicipal._id,
      ativo: true
    });
    
    // Atualizar associações com o presidente
    await AssociacaoProvincial.findByIdAndUpdate(associacaoProvincial._id, { presidente: presidente._id });
    await AssociacaoMunicipal.findByIdAndUpdate(associacaoMunicipal._id, { presidente: presidente._id });
    console.log('Presidente criado e associado às associações');
    
    // Criar membro comum
    const senhaMembro = await bcrypt.hash('membro123', 10);
    const acessoMembro = await Acesso.findOne({ nome: 'membro' });
    
    const membro = await Membro.create({
      nome: 'Maria Santos',
      imagem: 'uploads/membros/maria.jpg',
      dataNascimento: new Date('1985-08-20'),
      cargo: 'secretario-geral',
      profissao: 'Advogada',
      bilheteIdentidade: '003456789LA034',
      telefone: '+244 923 456 766',
      email: 'maria.santos@judo.ao',
      senha: senhaMembro,
      acesso_id: acessoMembro._id,
      associacaoProvincial: associacaoProvincial._id,
      associacaoMunicipal: associacaoMunicipal._id,
      ativo: true
    });
    console.log('Membro comum criado');
    
    console.log('\n========================================');
    console.log('INICIALIZAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('========================================');
    console.log('\nCREDENCIAIS DE ACESSO:');
    console.log('----------------------------------------');
    console.log('Administrador:');
    console.log('  Email: admin@judo.ao');
    console.log('  Senha: admin123');
    console.log('----------------------------------------');
    console.log('Presidente:');
    console.log('  Email: presidente@judo.ao');
    console.log('  Senha: presidente123');
    console.log('----------------------------------------');
    console.log('Membro:');
    console.log('  Email: maria.santos@judo.ao');
    console.log('  Senha: membro123');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar:', error);
    process.exit(1);
  }
};

initDatabase();