const mongoose = require('mongoose');
require('dotenv').config();

const cleanIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Lista todas as coleções
        const collections = await mongoose.connection.db.collections();
        
        for (const collection of collections) {
            const indexes = await collection.indexes();
            console.log(`\nÍndices da coleção ${collection.collectionName}:`);
            indexes.forEach(idx => console.log(`  - ${JSON.stringify(idx.key)}`));
            
            // Remove índices duplicados (mantém apenas o primeiro)
            const uniqueIndexes = new Map();
            for (const index of indexes) {
                const keyStr = JSON.stringify(index.key);
                if (uniqueIndexes.has(keyStr) && index.name !== '_id_') {
                    console.log(`Removendo índice duplicado: ${index.name}`);
                    await collection.dropIndex(index.name);
                } else {
                    uniqueIndexes.set(keyStr, index);
                }
            }
        }
        
        console.log('\nLimpeza de índices concluída!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
};

cleanIndexes();