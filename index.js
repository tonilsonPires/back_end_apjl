const dotenv = require('dotenv');
const connectDB = require('./src/config/database');

dotenv.config();

const app = require('./src/app');

// conecta ao banco
connectDB();

// exporta o app (ESSENCIAL)
module.exports = app;