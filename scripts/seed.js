const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Acesso = require('../src/models/Acesso');
const AssociacaoProvincial = require('../src/models/AssociacaoProvincial');
const AssociacaoMunicipal = require('../src/models/AssociacaoMunicipal');
const Clube = require('../src/models/Clube');
const Treinador = require('../src/models/Treinador');
const Atleta = require('../src/models/Atleta');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');
    
    // Buscar associações existentes
    const associacaoProvincial = await AssociacaoProvincial.findOne();
    const associacaoMunicipal = await AssociacaoMunicipal.findOne();
    
    if (!associacaoProvincial || !associacaoMunicipal) {
      console.log('Execute npm run init primeiro para criar as associações base');
      process.exit(1);
    }
    
    // Criar clubes de exemplo
    const clubes = [
      {
        nome: 'Clube de Judo Kimonos',
        imagem: 'uploads/clubes/kimonos.jpg',
        municipio: 'Luanda',
        endereco: 'Rua do Kimono, 100',
        dataCriacao: new Date('2010-05-20'),
        responsavel: 'José Antonio',
        associacaoMunicipal: associacaoMunicipal._id
      },
      {
        nome: 'Academia de Judo Kodokan',
        imagem: 'uploads/clubes/kodokan.jpg',
        municipio: 'Luanda',
        endereco: 'Avenida do Kodokan, 200',
        dataCriacao: new Date('2015-03-15'),
        responsavel: 'Maria Fernandes',
        associacaoMunicipal: associacaoMunicipal._id
      }
    ];
    
    const clubesCriados = await Clube.insertMany(clubes);
    console.log(`${clubesCriados.length} clubes criados`);
    
    // Criar treinadores
    const acessoTreinador = await Acesso.findOne({ nome: 'treinador' });
    const senhaTreinador = await bcrypt.hash('treinador123', 10);
    
    const treinadores = [
      {
        imagem: 'uploads/treinadores/treinador1.jpg',
        nomeCompleto: 'Carlos Alberto Silva',
        apelido: 'Mestre Carlos',
        dataNascimento: new Date('1980-02-10'),
        graduacao: '5º DAN',
        clubeFormador: 'Clube Kimonos',
        morada: 'Rua 1, Luanda',
        profissao: 'Professor de Judo',
        bilheteIdentidade: '004567890LA034',
        telefone: '+244 923 456 755',
        email: 'carlos.silva@judo.ao',
        senha: senhaTreinador,
        acesso_id: acessoTreinador._id,
        clubes: [clubesCriados[0]._id],
        associacaoMunicipal: associacaoMunicipal._id
      },
      {
        imagem: 'uploads/treinadores/treinador2.jpg',
        nomeCompleto: 'Ana Paula Santos',
        apelido: 'Sensei Ana',
        dataNascimento: new Date('1985-07-25'),
        graduacao: '3º DAN',
        clubeFormador: 'Academia Kodokan',
        morada: 'Rua 2, Luanda',
        profissao: 'Treinadora',
        bilheteIdentidade: '005678901LA034',
        telefone: '+244 923 456 744',
        email: 'ana.santos@judo.ao',
        senha: senhaTreinador,
        acesso_id: acessoTreinador._id,
        clubes: [clubesCriados[1]._id],
        associacaoMunicipal: associacaoMunicipal._id
      }
    ];
    
    const treinadoresCriados = await Treinador.insertMany(treinadores);
    console.log(`${treinadoresCriados.length} treinadores criados`);
    
    // Atualizar clubes com treinadores
    await Clube.findByIdAndUpdate(clubesCriados[0]._id, { 
      treinadores: [treinadoresCriados[0]._id] 
    });
    await Clube.findByIdAndUpdate(clubesCriados[1]._id, { 
      treinadores: [treinadoresCriados[1]._id] 
    });
    
    // Criar atletas
    const acessoAtleta = await Acesso.findOne({ nome: 'atleta' });
    const senhaAtleta = await bcrypt.hash('atleta123', 10);
    
    const atletas = [
      {
        imagem: 'uploads/atletas/atleta1.jpg',
        nomeCompleto: 'João Pedro Mendes',
        apelido: 'J.P.',
        dataNascimento: new Date('2000-03-15'),
        peso: 73,
        titulos: ['Campeão Nacional 2023', 'Medalha de Prata Africano 2024'],
        imagemTitulos: ['uploads/titulos/titulo1.jpg', 'uploads/titulos/titulo2.jpg'],
        responsavel: 'José Mendes',
        profissao: 'Estudante',
        bilheteIdentidade: '006789012LA034',
        telefone: '+244 923 456 733',
        email: 'joao.mendes@judo.ao',
        senha: senhaAtleta,
        acesso_id: acessoAtleta._id,
        clube: clubesCriados[0]._id
      },
      {
        imagem: 'uploads/atletas/atleta2.jpg',
        nomeCompleto: 'Maria Clara Fernandes',
        apelido: 'M.C.',
        dataNascimento: new Date('2002-07-20'),
        peso: 57,
        titulos: ['Campeã Regional 2024'],
        imagemTitulos: ['uploads/titulos/titulo3.jpg'],
        responsavel: 'Antonio Fernandes',
        profissao: 'Estudante',
        bilheteIdentidade: '007890123LA034',
        telefone: '+244 923 456 722',
        email: 'maria.fernandes@judo.ao',
        senha: senhaAtleta,
        acesso_id: acessoAtleta._id,
        clube: clubesCriados[0]._id
      },
      {
        imagem: 'uploads/atletas/atleta3.jpg',
        nomeCompleto: 'Lucas Andrade',
        apelido: 'Lukinha',
        dataNascimento: new Date('2001-11-10'),
        peso: 81,
        titulos: ['Campeão Juvenil 2023'],
        imagemTitulos: ['uploads/titulos/titulo4.jpg'],
        responsavel: 'Paulo Andrade',
        profissao: 'Estudante',
        bilheteIdentidade: '008901234LA034',
        telefone: '+244 923 456 711',
        email: 'lucas.andrade@judo.ao',
        senha: senhaAtleta,
        acesso_id: acessoAtleta._id,
        clube: clubesCriados[1]._id
      }
    ];
    
    const atletasCriados = await Atleta.insertMany(atletas);
    console.log(`${atletasCriados.length} atletas criados`);
    
    // Atualizar clubes com atletas
    await Clube.findByIdAndUpdate(clubesCriados[0]._id, { 
      atletas: [atletasCriados[0]._id, atletasCriados[1]._id] 
    });
    await Clube.findByIdAndUpdate(clubesCriados[1]._id, { 
      atletas: [atletasCriados[2]._id] 
    });
    
    console.log('\n========================================');
    console.log('DADOS DE TESTE CRIADOS COM SUCESSO!');
    console.log('========================================');
    console.log('\nCREDENCIAIS DE ACESSO:');
    console.log('----------------------------------------');
    console.log('Treinadores:');
    console.log('  Email: carlos.silva@judo.ao | Senha: treinador123');
    console.log('  Email: ana.santos@judo.ao | Senha: treinador123');
    console.log('----------------------------------------');
    console.log('Atletas:');
    console.log('  Email: joao.mendes@judo.ao | Senha: atleta123');
    console.log('  Email: maria.fernandes@judo.ao | Senha: atleta123');
    console.log('  Email: lucas.andrade@judo.ao | Senha: atleta123');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
    process.exit(1);
  }
};

seedDatabase();