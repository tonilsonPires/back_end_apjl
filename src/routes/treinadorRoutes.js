// const express = require('express');
// const router = express.Router();
// const treinadorController = require('../controllers/treinadorController');
// const { verificarToken, verificarPermissao } = require('../middleware/authMiddleware');
// const { uploadImagemTreinador } = require('../middleware/uploadMiddleware');

// // Rotas para treinadores
// router.post('/',
//   verificarToken,
//   uploadImagemTreinador,
//   treinadorController.criarTreinador
// );

// router.get('/',
//   verificarToken,
//   treinadorController.listarTreinadores
// );

// router.get('/:id',
//   verificarToken,
//   treinadorController.obterTreinador
// );

// router.put('/:id',
//   verificarToken,
//   uploadImagemTreinador,
//   treinadorController.atualizarTreinador
// );

// router.delete('/:id',
//   verificarToken,
//   treinadorController.excluirTreinador
// );

// router.patch('/:id/status',
//   verificarToken,
//   treinadorController.ativarDesativarTreinador
// );

// router.get('/:id/clubes',
//   verificarToken,
//   treinadorController.listarClubesDoTreinador
// );

// module.exports = router;



















const express = require('express');
const router = express.Router();
const treinadorController = require('../controllers/treinadorController');
const { verificarToken } = require('../middleware/authMiddleware');
const { uploadImagemTreinador, handleUploadError } = require('../middleware/uploadMiddleware');

// Rotas para treinadores
router.post('/',
  verificarToken,
  (req, res, next) => {
    uploadImagemTreinador(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  treinadorController.criarTreinador
);

router.get('/',
  verificarToken,
  treinadorController.listarTreinadores
);

router.get('/:id',
  verificarToken,
  treinadorController.obterTreinador
);

router.put('/:id',
  verificarToken,
  (req, res, next) => {
    uploadImagemTreinador(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  treinadorController.atualizarTreinador
);

router.delete('/:id',
  verificarToken,
  treinadorController.excluirTreinador
);

router.patch('/:id/status',
  verificarToken,
  treinadorController.ativarDesativarTreinador
);

router.get('/:id/clubes',
  verificarToken,
  treinadorController.listarClubesDoTreinador
);

module.exports = router;