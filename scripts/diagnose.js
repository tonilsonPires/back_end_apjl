const mongoose = require('mongoose');
const { exec } = require('child_process');
require('dotenv').config();

const diagnoseConnection = async () => {
    console.log('🔍 DIAGNÓSTICO DE CONEXÃO MONGODB\n');
    
    // 1. Verificar URI
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI não definida no arquivo .env');
        return;
    }
    
    // Mostrar URI sem senha
    const cleanUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@');
    console.log('📌 URI configurada:', cleanUri);
    
    // 2. Verificar se é Atlas
    const isAtlas = uri.includes('mongodb+srv');
    console.log('📌 Tipo de conexão:', isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB Local');
    
    if (isAtlas) {
        console.log('\n🔧 Para conexão com Atlas:');
        console.log('1. Acesse: https://cloud.mongodb.com');
        console.log('2. Vá em Network Access');
        console.log('3. Adicione seu IP atual ou 0.0.0.0/0');
        
        // Tentar pegar IP atual
        exec('curl -s ifconfig.me', (error, stdout) => {
            if (!error && stdout) {
                const ip = stdout.trim();
                console.log(`\n🌐 Seu IP atual parece ser: ${ip}`);
                console.log(`Adicione este IP na whitelist do Atlas`);
            }
        });
    }
    
    // 3. Tentar conexão
    console.log('\n📡 Tentando conectar...');
    
    try {
        // Timeout reduzido para teste rápido
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        
        console.log('✅ CONEXÃO BEM SUCEDIDA!');
        
        // Listar databases
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('\n📚 Databases disponíveis:');
        dbs.databases.forEach(db => {
            console.log(`   - ${db.name} (${db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) + 'MB' : '0MB'})`);
        });
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('\n❌ ERRO DE CONEXÃO:', error.message);
        
        if (error.message.includes('whitelist')) {
            console.log('\n🔴 SOLUÇÃO ESPECÍFICA:');
            console.log('1. Abra: https://cloud.mongodb.com');
            console.log('2. Selecione seu projeto');
            console.log('3. Clique em "Network Access"');
            console.log('4. Clique em "Add IP Address"');
            console.log('5. Digite: 0.0.0.0/0');
            console.log('6. Clique em "Confirm"');
            console.log('7. Aguarde 1-2 minutos e tente novamente');
        }
        
        console.log('\n💡 ALTERNATIVA:');
        console.log('Use MongoDB local instalando:');
        console.log('https://www.mongodb.com/try/download/community');
        console.log('\nDepois mude no .env para:');
        console.log('MONGODB_URI=mongodb://localhost:27017/apjl-software');
    }
};

diagnoseConnection();