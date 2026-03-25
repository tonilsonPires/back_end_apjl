const mongoose = require('mongoose');
require('dotenv').config();

const testOnlineConnection = async () => {
    console.log('🔗 TESTANDO CONEXÃO MONGODB ATLAS\n');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI não definida no .env');
        process.exit(1);
    }
    
    // Mostrar URI sem senha
    const cleanUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@');
    console.log('📌 URI:', cleanUri);
    
    const options = {
        serverSelectionTimeoutMS: 15000,
        family: 4,
        connectTimeoutMS: 15000,
    };
    
    try {
        console.log('\n📡 Conectando...');
        await mongoose.connect(uri, options);
        
        console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!\n');
        
        // Informações da conexão
        console.log('📊 Informações:');
        console.log(`   • Host: ${mongoose.connection.host}`);
        console.log(`   • Database: ${mongoose.connection.name}`);
        console.log(`   • Porta: ${mongoose.connection.port || 'padrão'}`);
        
        // Listar coleções
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📚 Coleções encontradas: ${collections.length}`);
        collections.forEach(col => console.log(`   • ${col.name}`));
        
        console.log('\n✨ TUDO FUNCIONANDO PERFEITAMENTE! ✨');
        console.log('\nAgora você pode iniciar o servidor:');
        console.log('   npm run dev');
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('\n❌ FALHA NA CONEXÃO:', error.message);
        
        console.log('\n🔧 SOLUÇÕES:');
        
        if (error.message.includes('Authentication failed')) {
            console.log('\n1️⃣ ERRO DE AUTENTICAÇÃO:');
            console.log('   • Verifique usuário: tonilsonrijo');
            console.log('   • Verifique senha no MongoDB Atlas');
            console.log('   • Acesse: https://cloud.mongodb.com → Database Access');
        }
        else if (error.message.includes('whitelist')) {
            console.log('\n2️⃣ ERRO DE WHITELIST:');
            console.log('   • Acesse: https://cloud.mongodb.com');
            console.log('   • Network Access → Add IP Address');
            console.log('   • Adicione: 0.0.0.0/0');
            console.log('   • Aguarde 2 minutos');
        }
        else if (error.message.includes('ECONNREFUSED')) {
            console.log('\n3️⃣ ERRO DE CONEXÃO (ECONNREFUSED):');
            console.log('   • Desative firewall/antivírus temporariamente');
            console.log('   • Execute: netsh winsock reset');
            console.log('   • Reinicie o computador');
        }
        else if (error.message.includes('querySrv')) {
            console.log('\n4️⃣ ERRO DE DNS:');
            console.log('   • Use a string MANUAL no .env (sem mongodb+srv)');
            console.log('   • Execute: ipconfig /flushdns');
        }
        
        console.log('\n💡 Se o problema persistir, use MongoDB Local:');
        console.log('   MONGODB_URI=mongodb://localhost:27017/judo-angola');
        
        process.exit(1);
    }
};

testOnlineConnection();