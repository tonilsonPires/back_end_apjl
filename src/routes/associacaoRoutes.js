// const express = require('express');
// const router = express.Router();
// const associacaoController = require('../controllers/associacaoController');
// const { verificarToken, verificarPermissao } = require('../middleware/authMiddleware');
// const { uploadLogo } = require('../middleware/uploadMiddleware');

// // Rotas para associações provinciais
// router.post('/provincial', 
//   verificarToken, 
//   verificarPermissao('associacao', 'criar'),
//   uploadLogo,
//   associacaoController.criarAssociacaoProvincial
// );
// router.get('/provincial', associacaoController.listarAssociacoesProvinciais);

// // Rotas para associações municipais
// router.post('/municipal',
//   verificarToken,
//   verificarPermissao('associacao', 'criar'),
//   uploadLogo,
//   associacaoController.criarAssociacaoMunicipal
// );
// router.get('/municipal', associacaoController.listarAssociacoesMunicipais);
// router.put('/municipal/:id',
//   verificarToken,
//   verificarPermissao('associacao', 'alterar'),
//   uploadLogo,
//   associacaoController.atualizarAssociacaoMunicipal
// );

// module.exports = router;



// const express = require('express');
// const router = express.Router();
// const associacaoController = require('../controllers/associacaoController');
// const { verificarToken, verificarPermissao } = require('../middleware/authMiddleware');
// const { uploadLogo } = require('../middleware/uploadMiddleware');

// // Rotas para associações provinciais
// router.post('/provincial', 
//   verificarToken,
//   uploadLogo,
//   associacaoController.criarAssociacaoProvincial
// );

// router.get('/provincial', associacaoController.listarAssociacoesProvinciais);
// router.get('/provincial/:id', associacaoController.obterAssociacaoProvincial);

// router.put('/provincial/:id',
//   verificarToken,
//   uploadLogo,
//   associacaoController.atualizarAssociacaoProvincial
// );

// router.delete('/provincial/:id',
//   verificarToken,
//   associacaoController.excluirAssociacaoProvincial
// );

// // Rotas para associações municipais
// router.post('/municipal',
//   verificarToken,
//   uploadLogo,
//   associacaoController.criarAssociacaoMunicipal
// );

// router.get('/municipal', associacaoController.listarAssociacoesMunicipais);
// router.get('/municipal/:id', associacaoController.obterAssociacaoMunicipal);

// router.put('/municipal/:id',
//   verificarToken,
//   uploadLogo,
//   associacaoController.atualizarAssociacaoMunicipal
// );

// router.delete('/municipal/:id',
//   verificarToken,
//   associacaoController.excluirAssociacaoMunicipal
// );

// module.exports = router;



const express = require('express');
const router = express.Router();
const associacaoController = require('../controllers/associacaoController');
const { verificarToken } = require('../middleware/authMiddleware');
const { uploadLogo, handleUploadError } = require('../middleware/uploadMiddleware');

// Rotas para associações provinciais
router.post('/provincial', 
  verificarToken,
  (req, res, next) => {
    uploadLogo(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  associacaoController.criarAssociacaoProvincial
);

router.get('/provincial', associacaoController.listarAssociacoesProvinciais);
router.get('/provincial/:id', associacaoController.obterAssociacaoProvincial);

router.put('/provincial/:id',
  verificarToken,
  (req, res, next) => {
    uploadLogo(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  associacaoController.atualizarAssociacaoProvincial
);

router.delete('/provincial/:id',
  verificarToken,
  associacaoController.excluirAssociacaoProvincial
);

// Rotas para associações municipais
router.post('/municipal',
  verificarToken,
  (req, res, next) => {
    uploadLogo(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  associacaoController.criarAssociacaoMunicipal
);

router.get('/municipal', associacaoController.listarAssociacoesMunicipais);
router.get('/municipal/:id', associacaoController.obterAssociacaoMunicipal);

router.put('/municipal/:id',
  verificarToken,
  (req, res, next) => {
    uploadLogo(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  associacaoController.atualizarAssociacaoMunicipal
);

router.delete('/municipal/:id',
  verificarToken,
  associacaoController.excluirAssociacaoMunicipal
);

module.exports = router;