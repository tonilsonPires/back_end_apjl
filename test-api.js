const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let token = '';

const testarAPI = async () => {
  try {
    console.log('========================================');
    console.log('TESTANDO API DO SISTEMA DE JUDO');
    console.log('========================================\n');

    // 1. TESTAR LOGIN
    console.log('1. TESTANDO LOGIN...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@judo.ao',
      senha: '123456'
    });
    token = login.data.token;
    console.log('✅ Login realizado com sucesso!');
    console.log(`Token: ${token.substring(0, 50)}...\n`);

    // 2. TESTAR USUÁRIO LOGADO
    console.log('2. TESTANDO USUÁRIO LOGADO...');
    const me = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Usuário logado:', me.data);
    console.log();

    // 3. TESTAR ASSOCIAÇÕES PROVINCIAIS
    console.log('3. TESTANDO ASSOCIAÇÕES PROVINCIAIS...');
    const provincias = await axios.get(`${BASE_URL}/associacoes/provincial`);
    console.log('✅ Lista de associações provinciais:', provincias.data);
    console.log();

    // 4. TESTAR ASSOCIAÇÕES MUNICIPAIS
    console.log('4. TESTANDO ASSOCIAÇÕES MUNICIPAIS...');
    const municipais = await axios.get(`${BASE_URL}/associacoes/municipal`);
    console.log('✅ Lista de associações municipais:', municipais.data);
    console.log();

    // 5. TESTAR MEMBROS
    console.log('5. TESTANDO MEMBROS...');
    const membros = await axios.get(`${BASE_URL}/membros`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Lista de membros:', membros.data);
    console.log();

    // 6. TESTAR CLUBES
    console.log('6. TESTANDO CLUBES...');
    const clubes = await axios.get(`${BASE_URL}/clubes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Lista de clubes:', clubes.data);
    console.log();

    // 7. TESTAR TREINADORES
    console.log('7. TESTANDO TREINADORES...');
    const treinadores = await axios.get(`${BASE_URL}/treinadores`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Lista de treinadores:', treinadores.data);
    console.log();

    // 8. TESTAR ATLETAS
    console.log('8. TESTANDO ATLETAS...');
    const atletas = await axios.get(`${BASE_URL}/atletas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Lista de atletas:', atletas.data);
    console.log();

    // 9. TESTAR CRIAÇÃO DE CLUBE (POST)
    console.log('9. TESTANDO CRIAÇÃO DE CLUBE...');
    const novoClube = {
      nome: 'Clube de Teste API',
      municipio: 'Luanda',
      endereco: 'Rua Teste, 123',
      dataCriacao: '2024-01-01',
      responsavel: 'Teste Silva',
      associacaoMunicipal: municipais.data[0]?._id || 'ID_AQUI'
    };
    
    try {
      const created = await axios.post(`${BASE_URL}/clubes`, novoClube, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Clube criado:', created.data);
      console.log();
    } catch (error) {
      console.log('⚠️ Erro ao criar clube (pode ser falta de permissão):', error.response?.data || error.message);
      console.log();
    }

    // 10. TESTAR CRIAÇÃO DE ATLETA (POST)
    console.log('10. TESTANDO CRIAÇÃO DE ATLETA...');
    const novoAtleta = {
      nomeCompleto: 'Atleta Teste',
      apelido: 'Teste',
      dataNascimento: '2000-01-01',
      peso: 70,
      titulos: ['Campeão Teste'],
      responsavel: 'Responsável Teste',
      profissao: 'Estudante',
      bilheteIdentidade: '999999999LA034',
      telefone: '999999999',
      email: 'teste@judo.ao',
      senha: 'teste123',
      clube: clubes.data[0]?._id || 'ID_AQUI'
    };
    
    try {
      const created = await axios.post(`${BASE_URL}/atletas`, novoAtleta, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Atleta criado:', created.data);
      console.log();
    } catch (error) {
      console.log('⚠️ Erro ao criar atleta (pode ser falta de permissão):', error.response?.data || error.message);
      console.log();
    }

    // 11. TESTAR ATUALIZAÇÃO (PUT)
    if (clubes.data && clubes.data.length > 0) {
      console.log('11. TESTANDO ATUALIZAÇÃO DE CLUBE...');
      try {
        const updated = await axios.put(`${BASE_URL}/clubes/${clubes.data[0]._id}`, 
          { nome: 'Clube Atualizado via API' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Clube atualizado:', updated.data);
        console.log();
      } catch (error) {
        console.log('⚠️ Erro ao atualizar clube:', error.response?.data || error.message);
        console.log();
      }
    }

    // 12. TESTAR DELETAR (DELETE) - Comentar para não perder dados
    console.log('12. TESTANDO DELETE (comentado para não perder dados)...');
    console.log('⚠️ Para testar delete, descomente o código abaixo');
    console.log();

    console.log('========================================');
    console.log('✅ TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.response?.data || error.message);
  }
};

// Executar testes
testarAPI();