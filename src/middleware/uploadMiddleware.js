// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Garantir que as pastas existem
// const ensureDir = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// // Criar pastas necessárias
// ensureDir('uploads');
// ensureDir('uploads/associacoes');
// ensureDir('uploads/membros');
// ensureDir('uploads/treinadores');
// ensureDir('uploads/atletas');
// ensureDir('uploads/certificados');
// ensureDir('uploads/titulos');
// ensureDir('uploads/clubes');
// ensureDir('uploads/cartoes');
// ensureDir('uploads/qrcodes');

// // Configurar armazenamento
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let folder = 'uploads/';
    
//     const fieldMap = {
//       'logo': 'associacoes/',
//       'imagem_membro': 'membros/',
//       'imagem': 'membros/',
//       'imagem_treinador': 'treinadores/',
//       'imagem_atleta': 'atletas/',
//       'imagem_atleta_principal': 'atletas/',
//       'certificado_graduacao': 'certificados/',
//       'certificado': 'certificados/',
//       'imagem_titulo': 'titulos/',
//       'imagem_titulos': 'titulos/',
//       'imagem_clube': 'clubes/'
//     };
    
//     const subfolder = fieldMap[file.fieldname] || 'outros/';
//     folder += subfolder;
    
//     ensureDir(folder);
//     cb(null, folder);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const ext = path.extname(file.originalname);
//     const filename = file.fieldname + '-' + uniqueSuffix + ext;
//     cb(null, filename);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif|webp/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
//   }
// };

// // Configuração do multer
// const upload = multer({
//   storage: storage,
//   limits: { 
//     fileSize: 5 * 1024 * 1024, // 5MB
//     files: 20 // máximo de 20 arquivos por requisição
//   },
//   fileFilter: fileFilter
// });

// // Middlewares específicos
// const uploadLogo = upload.single('logo');
// const uploadImagemMembro = upload.single('imagem');
// const uploadImagemTreinador = upload.single('imagem');
// const uploadImagemAtleta = upload.single('imagem_atleta_principal');
// const uploadCertificado = upload.single('certificado');
// const uploadImagensTitulos = upload.array('imagem_titulos', 20);
// const uploadImagemClube = upload.single('imagem');

// // Middleware para upload completo de atleta (imagem principal + imagens de títulos)
// const uploadAtletaCompleto = (req, res, next) => {
//   // Usar fields para múltiplos campos de arquivo
//   upload.fields([
//     { name: 'imagem_atleta_principal', maxCount: 1 },
//     { name: 'imagem_titulos', maxCount: 20 }
//   ])(req, res, (err) => {
//     if (err) {
//       return handleUploadError(err, req, res, next);
//     }
//     next();
//   });
// };

// // Middleware para atualização de atleta
// const uploadAtletaUpdate = (req, res, next) => {
//   upload.fields([
//     { name: 'imagem_atleta_principal', maxCount: 1 },
//     { name: 'imagem_titulos', maxCount: 20 }
//   ])(req, res, (err) => {
//     if (err) {
//       return handleUploadError(err, req, res, next);
//     }
//     next();
//   });
// };

// // Middleware para lidar com erros de upload
// const handleUploadError = (err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);
//   }
  
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ erro: 'Arquivo muito grande. Máximo 5MB.' });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({ erro: `Campo inesperado: ${err.field}. Verifique o nome do campo.` });
//     }
//     if (err.code === 'LIMIT_FILE_COUNT') {
//       return res.status(400).json({ erro: 'Muitos arquivos enviados. Máximo 20.' });
//     }
//     return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
//   }
  
//   if (err) {
//     return res.status(400).json({ erro: err.message });
//   }
  
//   next();
// };

// // Middleware wrapper para capturar erros
// const wrapUpload = (uploadMiddleware) => {
//   return (req, res, next) => {
//     uploadMiddleware(req, res, (err) => {
//       if (err) {
//         return handleUploadError(err, req, res, next);
//       }
//       next();
//     });
//   };
// };

// module.exports = {
//   upload,
//   uploadLogo: wrapUpload(uploadLogo),
//   uploadImagemMembro: wrapUpload(uploadImagemMembro),
//   uploadImagemTreinador: wrapUpload(uploadImagemTreinador),
//   uploadImagemAtleta: wrapUpload(uploadImagemAtleta),
//   uploadCertificado: wrapUpload(uploadCertificado),
//   uploadImagensTitulos,
//   uploadImagemClube: wrapUpload(uploadImagemClube),
//   uploadAtletaCompleto,
//   uploadAtletaUpdate,
//   handleUploadError
// };



const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que as pastas existem
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Criar pastas necessárias
ensureDir('uploads');
ensureDir('uploads/associacoes');
ensureDir('uploads/membros');
ensureDir('uploads/treinadores');
ensureDir('uploads/atletas');
ensureDir('uploads/certificados');
ensureDir('uploads/titulos');
ensureDir('uploads/clubes');
ensureDir('uploads/cartoes');
ensureDir('uploads/qrcodes');

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    const fieldMap = {
      'logo': 'associacoes/',
      'imagem_membro': 'membros/',
      'imagem': 'membros/',
      'imagem_treinador': 'treinadores/',
      'imagem_atleta': 'atletas/',
      'imagem_atleta_principal': 'atletas/',
      'certificado_graduacao': 'certificados/',
      'certificado': 'certificados/',
      'imagem_titulo': 'titulos/',
      'imagem_titulos': 'titulos/',
      'imagem_clube': 'clubes/'
    };
    
    const subfolder = fieldMap[file.fieldname] || 'outros/';
    folder += subfolder;
    
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens e PDFs são permitidos (jpeg, jpg, png, gif, webp, pdf)'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB para certificados
    files: 20
  },
  fileFilter: fileFilter
});

// Middlewares específicos
const uploadLogo = upload.single('logo');
const uploadImagemMembro = upload.single('imagem');
const uploadImagemTreinador = upload.single('imagem');
const uploadImagemAtleta = upload.single('imagem_atleta_principal');
const uploadCertificado = upload.single('certificado_graduacao');
const uploadImagensTitulos = upload.array('imagem_titulos', 20);
const uploadImagemClube = upload.single('imagem');

// Middleware para upload completo de atleta
const uploadAtletaCompleto = (req, res, next) => {
  upload.fields([
    { name: 'imagem_atleta_principal', maxCount: 1 },
    { name: 'certificado_graduacao', maxCount: 1 },
    { name: 'imagem_titulos', maxCount: 20 }
  ])(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

// Middleware para atualização de atleta
const uploadAtletaUpdate = (req, res, next) => {
  upload.fields([
    { name: 'imagem_atleta_principal', maxCount: 1 },
    { name: 'certificado_graduacao', maxCount: 1 },
    { name: 'imagem_titulos', maxCount: 20 }
  ])(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

// Middleware para atualizar apenas graduação
const uploadAtletaGraduacao = (req, res, next) => {
  upload.fields([
    { name: 'certificado_graduacao', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

// Middleware para lidar com erros de upload
const handleUploadError = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ erro: 'Arquivo muito grande. Máximo 10MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ erro: `Campo inesperado: ${err.field}. Verifique o nome do campo.` });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ erro: 'Muitos arquivos enviados. Máximo 20.' });
    }
    return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
  }
  
  if (err) {
    return res.status(400).json({ erro: err.message });
  }
  
  next();
};

// Middleware wrapper para capturar erros
const wrapUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  };
};

module.exports = {
  upload,
  uploadLogo: wrapUpload(uploadLogo),
  uploadImagemMembro: wrapUpload(uploadImagemMembro),
  uploadImagemTreinador: wrapUpload(uploadImagemTreinador),
  uploadImagemAtleta: wrapUpload(uploadImagemAtleta),
  uploadCertificado: wrapUpload(uploadCertificado),
  uploadImagensTitulos,
  uploadImagemClube: wrapUpload(uploadImagemClube),
  uploadAtletaCompleto,
  uploadAtletaUpdate,
  uploadAtletaGraduacao,
  handleUploadError
};