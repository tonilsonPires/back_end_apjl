// const express = require('express');
// const router = express.Router();
// const membroController = require('../controllers/membroController');
// const { verificarToken, verificarPermissao, verificarAssociacao } = require('../middleware/authMiddleware');
// const { uploadImagemMembro } = require('../middleware/uploadMiddleware');

// router.post('/',
//   verificarToken,
//   verificarPermissao('membro', 'criar'),
//   uploadImagemMembro,
//   membroController.criarMembro
// );

// router.get('/',
//   verificarToken,
//   membroController.listarMembros
// );

// router.put('/:id',
//   verificarToken,
//   verificarPermissao('membro', 'alterar'),
//   verificarAssociacao('Membro'),
//   uploadImagemMembro,
//   membroController.atualizarMembro
// );

// router.delete('/:id',
//   verificarToken,
//   verificarPermissao('membro', 'excluir'),
//   membroController.excluirMembro
// );

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const membroController = require('../controllers/membroController');
// const { verificarToken } = require('../middleware/authMiddleware');
// const { uploadImagemMembro } = require('../middleware/uploadMiddleware');

// // IMPORTANTE: A ordem das rotas é importante!
// // Rotas específicas devem vir antes de rotas com parâmetros

// // Criar membro
// router.post('/', 
//   verificarToken, 
//   uploadImagemMembro, 
//   membroController.criarMembro
// );

// // Listar todos membros
// router.get('/', 
//   verificarToken, 
//   membroController.listarMembros
// );

// // Buscar membro por ID - Esta rota deve estar ANTES de qualquer rota com /:id
// router.get('/:id', 
//   verificarToken, 
//   membroController.obterMembro
// );

// // Atualizar membro
// router.put('/:id', 
//   verificarToken, 
//   uploadImagemMembro, 
//   membroController.atualizarMembro
// );

// // Desativar/Ativar membro
// router.patch('/:id/status', 
//   verificarToken, 
//   membroController.ativarDesativarMembro
// );

// // Excluir membro
// router.delete('/:id', 
//   verificarToken, 
//   membroController.excluirMembro
// );

// module.exports = router;







const express = require('express');
const router = express.Router();
const membroController = require('../controllers/membroController');
const { verificarToken } = require('../middleware/authMiddleware');
const { uploadImagemMembro, handleUploadError } = require('../middleware/uploadMiddleware');

// Criar membro
router.post('/', 
  verificarToken,
  (req, res, next) => {
    uploadImagemMembro(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  membroController.criarMembro
);

// Listar todos membros
router.get('/', 
  verificarToken, 
  membroController.listarMembros
);

// Buscar membro por ID
router.get('/:id', 
  verificarToken, 
  membroController.obterMembro
);

// Atualizar membro
router.put('/:id', 
  verificarToken,
  (req, res, next) => {
    uploadImagemMembro(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  membroController.atualizarMembro
);

// Ativar/Desativar membro
router.patch('/:id/status',
  verificarToken,
  membroController.ativarDesativarMembro
);

// Excluir membro
router.delete('/:id',
  verificarToken,
  membroController.excluirMembro
);

module.exports = router;