// const express = require('express');
// const router = express.Router();
// const cartaoController = require('../controllers/cartaoController');
// const { verificarToken } = require('../middleware/authMiddleware');

// router.post('/atleta/:id', verificarToken, cartaoController.gerarCartaoAtleta);
// router.post('/treinador/:id', verificarToken, cartaoController.gerarCartaoTreinador);
// router.get('/:id', cartaoController.visualizarCartao);

// module.exports = router;


const express = require('express');
const router = express.Router();
const cartaoController = require('../controllers/cartaoController');
const { verificarToken } = require('../middleware/authMiddleware');

router.post('/atleta/:id', verificarToken, cartaoController.gerarCartaoAtleta);
router.post('/treinador/:id', verificarToken, cartaoController.gerarCartaoTreinador);
router.get('/:id', cartaoController.visualizarCartao);

module.exports = router;