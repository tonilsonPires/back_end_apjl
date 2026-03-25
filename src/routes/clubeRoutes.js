// const express = require('express');
// const router = express.Router();
// const clubeController = require('../controllers/clubeController');
// const { verificarToken, verificarPermissao, verificarAssociacao } = require('../middleware/authMiddleware');
// const { uploadLogo } = require('../middleware/uploadMiddleware');

// router.post('/',
//   verificarToken,
//   verificarPermissao('clube', 'criar'),
//   uploadLogo,
//   clubeController.criarClube
// );

// router.get('/',
//   verificarToken,
//   clubeController.listarClubes
// );

// router.put('/:id',
//   verificarToken,
//   verificarPermissao('clube', 'alterar'),
//   verificarAssociacao('Clube'),
//   uploadLogo,
//   clubeController.atualizarClube
// );

// router.delete('/:id',
//   verificarToken,
//   verificarPermissao('clube', 'excluir'),
//   clubeController.excluirClube
// );

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const clubeController = require('../controllers/clubeController');
// const { verificarToken, verificarPermissao } = require('../middleware/authMiddleware');
// const { uploadLogo } = require('../middleware/uploadMiddleware');

// // Rotas para clubes
// router.post('/',
//   verificarToken,
//   uploadLogo,
//   clubeController.criarClube
// );

// router.get('/',
//   verificarToken,
//   clubeController.listarClubes
// );

// router.get('/:id',
//   verificarToken,
//   clubeController.obterClube
// );

// router.put('/:id',
//   verificarToken,
//   uploadLogo,
//   clubeController.atualizarClube
// );

// router.delete('/:id',
//   verificarToken,
//   clubeController.excluirClube
// );

// // Rotas para gerenciar treinadores do clube
// router.post('/:id/treinadores',
//   verificarToken,
//   clubeController.adicionarTreinador
// );

// router.delete('/:id/treinadores/:treinadorId',
//   verificarToken,
//   clubeController.removerTreinador
// );

// // Rotas para gerenciar atletas do clube
// router.post('/:id/atletas',
//   verificarToken,
//   clubeController.adicionarAtleta
// );

// router.delete('/:id/atletas/:atletaId',
//   verificarToken,
//   clubeController.removerAtleta
// );

// module.exports = router;


const express = require('express');
const router = express.Router();
const clubeController = require('../controllers/clubeController');
const { verificarToken } = require('../middleware/authMiddleware');
const { uploadImagemClube, handleUploadError } = require('../middleware/uploadMiddleware');

// Rotas para clubes
router.post('/',
  verificarToken,
  (req, res, next) => {
    uploadImagemClube(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  clubeController.criarClube
);

router.get('/',
  verificarToken,
  clubeController.listarClubes
);

router.get('/:id',
  verificarToken,
  clubeController.obterClube
);

router.put('/:id',
  verificarToken,
  (req, res, next) => {
    uploadImagemClube(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  clubeController.atualizarClube
);

router.delete('/:id',
  verificarToken,
  clubeController.excluirClube
);

// Rotas para gerenciar treinadores do clube
router.post('/:id/treinadores',
  verificarToken,
  clubeController.adicionarTreinador
);

router.delete('/:id/treinadores/:treinadorId',
  verificarToken,
  clubeController.removerTreinador
);

// Rotas para gerenciar atletas do clube
router.post('/:id/atletas',
  verificarToken,
  clubeController.adicionarAtleta
);

router.delete('/:id/atletas/:atletaId',
  verificarToken,
  clubeController.removerAtleta
);

module.exports = router;