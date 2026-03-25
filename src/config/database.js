const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tonilsonrijo:toni1997@cluster0.qocv22p.mongodb.net/WebProMax', {
      
    });
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;



// const mongoose = require('mongoose');
// require('dotenv').config();

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://tonilsonrijo:toni1997@cluster0.qocv22p.mongodb.net/judo-angola', {
//             serverSelectionTimeoutMS: 30000,
//             socketTimeoutMS: 45000,
//             family: 4, // FORÇA IPv4 - ESSENCIAL
//             connectTimeoutMS: 30000,
//             retryWrites: true,
//             retryReads: true,
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
        
//         console.log(`✅ MongoDB Atlas Conectado com sucesso!`);
//         console.log(`📊 Host: ${conn.connection.host}`);
//         console.log(`🗄️  Database: ${conn.connection.name}`);
        
//         return conn;
        
//     } catch (error) {
//         console.error('❌ Erro ao conectar MongoDB:', error.message);
        
//         // Sugestões baseadas no erro
//         if (error.message.includes('Authentication failed')) {
//             console.error('\n🔐 ERRO DE AUTENTICAÇÃO:');
//             console.error('Usuário ou senha incorretos. Verifique no MongoDB Atlas:');
//             console.error('1. Acesse: https://cloud.mongodb.com');
//             console.error('2. Vá em Database Access');
//             console.error('3. Confira se o usuário "tonilsonrijo" existe e tem permissões');
//         } else if (error.message.includes('whitelist')) {
//             console.error('\n🛡️ ERRO DE WHITELIST:');
//             console.error('Seu IP não está liberado. Solução:');
//             console.error('1. Acesse MongoDB Atlas → Network Access');
//             console.error('2. Adicione: 0.0.0.0/0');
//             console.error('3. Aguarde 2 minutos e tente novamente');
//         } else if (error.message.includes('ECONNREFUSED')) {
//             console.error('\n🌐 ERRO DE CONEXÃO:');
//             console.error('Verifique seu firewall/antivírus. Teste com:');
//             console.error('Test-NetConnection cluster0-shard-00-00.qocv22p.mongodb.net -Port 27017');
//         }
        
//         // Em desenvolvimento, não derrube o app
//         if (process.env.NODE_ENV === 'production') {
//             process.exit(1);
//         }
        
//         throw error;
//     }
// };

// module.exports = connectDB;