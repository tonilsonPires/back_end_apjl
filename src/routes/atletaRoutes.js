// const express = require('express');
// const router = express.Router();
// const atletaController = require('../controllers/atletaController');
// const { verificarToken } = require('../middleware/authMiddleware');
// const { uploadAtletaCompleto, uploadAtletaUpdate, uploadCertificado } = require('../middleware/uploadMiddleware');

// // ==================== ROTAS PRINCIPAIS ====================

// // Criar atleta com todas as imagens (imagem principal + imagens de títulos)
// router.post('/',
//   verificarToken,
//   uploadAtletaCompleto,
//   atletaController.criarAtleta
// );

// // Listar todos atletas
// router.get('/',
//   verificarToken,
//   atletaController.listarAtletas
// );

// // Buscar atleta por ID
// router.get('/:id',
//   verificarToken,
//   atletaController.obterAtleta
// );

// // Atualizar atleta com todas as imagens
// router.put('/:id',
//   verificarToken,
//   uploadAtletaUpdate,
//   atletaController.atualizarAtleta
// );

// // Excluir atleta
// router.delete('/:id',
//   verificarToken,
//   atletaController.excluirAtleta
// );

// // Ativar/Desativar atleta
// router.patch('/:id/status',
//   verificarToken,
//   atletaController.ativarDesativarAtleta
// );

// // ==================== ROTAS DE GRADUAÇÃO ====================

// // Atribuir graduação com certificado
// router.post('/:id/graduacao',
//   verificarToken,
//   uploadCertificado,
//   atletaController.atribuirGraduacao
// );

// // Buscar graduação do atleta
// router.get('/:id/graduacao',
//   verificarToken,
//   atletaController.obterGraduacao
// );

// // ==================== ROTAS DE TÍTULOS ====================

// // Adicionar título com imagem
// router.post('/:id/titulos',
//   verificarToken,
//   uploadAtletaUpdate,
//   atletaController.adicionarTitulo
// );

// // Listar títulos do atleta
// router.get('/:id/titulos',
//   verificarToken,
//   atletaController.listarTitulos
// );

// // Remover título
// router.delete('/:id/titulos/:tituloIndex',
//   verificarToken,
//   atletaController.removerTitulo
// );

// module.exports = router;


const express = require('express');
const router = express.Router();
const atletaController = require('../controllers/atletaController');
const { verificarToken } = require('../middleware/authMiddleware');
const { 
  uploadAtletaCompleto, 
  uploadAtletaUpdate, 
  uploadAtletaGraduacao 
} = require('../middleware/uploadMiddleware');

// ==================== ROTAS PRINCIPAIS ====================

// Criar atleta com todas as imagens
router.post('/',
  verificarToken,
  uploadAtletaCompleto,
  atletaController.criarAtleta
);

// Listar todos atletas
router.get('/',
  verificarToken,
  atletaController.listarAtletas
);

// Buscar atleta por ID
router.get('/:id',
  verificarToken,
  atletaController.obterAtleta
);

// Atualizar atleta
router.put('/:id',
  verificarToken,
  uploadAtletaUpdate,
  atletaController.atualizarAtleta
);

// Excluir atleta
router.delete('/:id',
  verificarToken,
  atletaController.excluirAtleta
);

// Ativar/Desativar atleta
router.patch('/:id/status',
  verificarToken,
  atletaController.ativarDesativarAtleta
);

// ==================== ROTAS DE GRADUAÇÃO ====================

// Atualizar graduação do atleta
router.patch('/:id/graduacao',
  verificarToken,
  uploadAtletaGraduacao,
  atletaController.atualizarGraduacao
);

// Listar todas as graduações disponíveis
router.get('/graduacoes/disponiveis',
  verificarToken,
  atletaController.listarGraduacoesDisponiveis
);

// Buscar histórico de graduações do atleta
router.get('/:id/historico-graduacoes',
  verificarToken,
  atletaController.buscarHistoricoGraduacoes
);

// ==================== ROTAS DE TÍTULOS ====================

// Adicionar título
router.post('/:id/titulos',
  verificarToken,
  uploadAtletaUpdate,
  atletaController.adicionarTitulo
);

// Listar títulos do atleta
router.get('/:id/titulos',
  verificarToken,
  atletaController.listarTitulos
);

// Remover título
router.delete('/:id/titulos/:tituloId',
  verificarToken,
  atletaController.removerTitulo
);

// ==================== ROTAS DE ESTATÍSTICAS ====================

// Estatísticas por graduação
router.get('/estatisticas/graduacoes',
  verificarToken,
  atletaController.estatisticasPorGraduacao
);

// Estatísticas por categoria de peso
router.get('/estatisticas/categorias',
  verificarToken,
  atletaController.estatisticasPorCategoria
);

module.exports = router;