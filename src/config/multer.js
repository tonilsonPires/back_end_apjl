const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'logo') {
      folder += 'associacoes/';
    } else if (file.fieldname === 'imagem_membro') {
      folder += 'membros/';
    } else if (file.fieldname === 'imagem_treinador') {
      folder += 'treinadores/';
    } else if (file.fieldname === 'imagem_atleta') {
      folder += 'atletas/';
    } else if (file.fieldname === 'certificado_graduacao') {
      folder += 'certificados/';
    } else if (file.fieldname === 'imagem_titulo') {
      folder += 'titulos/';
    }
    
    fs.ensureDirSync(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;