// const jwt = require('jsonwebtoken');
// const Membro = require('../models/Membro');
// const Treinador = require('../models/Treinador');
// const Atleta = require('../models/Atleta');

// const verificarToken = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     let usuario = await Membro.findById(decoded.id).populate('acesso_id');
//     if (!usuario) {
//       usuario = await Treinador.findById(decoded.id).populate('acesso_id');
//     }
//     if (!usuario) {
//       usuario = await Atleta.findById(decoded.id).populate('acesso_id');
//     }
    
//     if (!usuario) {
//       return res.status(401).json({ erro: 'Usuário não encontrado.' });
//     }

//     req.usuario = usuario;
//     req.tipoUsuario = decoded.tipo;
//     next();
//   } catch (error) {
//     res.status(401).json({ erro: 'Token inválido.' });
//   }
// };

// const verificarPermissao = (recurso, acao) => {
//   return async (req, res, next) => {
//     try {
//       const usuario = req.usuario;
//       const acesso = usuario.acesso_id;
      
//       const temPermissao = acesso.permissoes.some(permissao => 
//         permissao.recurso === recurso && permissao.nome === acao
//       );
      
//       if (!temPermissao) {
//         return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
//       }
      
//       next();
//     } catch (error) {
//       res.status(500).json({ erro: 'Erro ao verificar permissões.' });
//     }
//   };
// };

// const verificarAssociacao = (model) => {
//   return async (req, res, next) => {
//     try {
//       const usuario = req.usuario;
//       const itemId = req.params.id;
      
//       if (usuario.acesso_id.nome === 'administrador') {
//         return next();
//       }
      
//       let item;
//       if (model === 'Membro') {
//         item = await Membro.findById(itemId);
//       } else if (model === 'Clube') {
//         item = await Clube.findById(itemId).populate('associacaoMunicipal');
//       } else if (model === 'Treinador') {
//         item = await Treinador.findById(itemId);
//       } else if (model === 'Atleta') {
//         item = await Atleta.findById(itemId).populate('clube');
//       }
      
//       if (!item) {
//         return res.status(404).json({ erro: 'Item não encontrado.' });
//       }
      
//       const associacaoUsuario = usuario.associacaoMunicipal || usuario.associacaoProvincial;
//       const associacaoItem = item.associacaoMunicipal || item.associacaoProvincial || 
//                             (item.clube && item.clube.associacaoMunicipal);
      
//       if (associacaoUsuario && associacaoItem && 
//           associacaoUsuario.toString() === associacaoItem.toString()) {
//         return next();
//       }
      
//       res.status(403).json({ erro: 'Acesso negado. Você só pode acessar dados da sua associação.' });
//     } catch (error) {
//       res.status(500).json({ erro: 'Erro ao verificar associação.' });
//     }
//   };
// };

// module.exports = { verificarToken, verificarPermissao, verificarAssociacao };


const jwt = require('jsonwebtoken');
const Membro = require('../models/Membro');
const Treinador = require('../models/Treinador');
const Atleta = require('../models/Atleta');

const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário em todas as coleções
    let usuario = await Membro.findById(decoded.id).populate('acesso_id');
    let tipo = 'membro';
    
    if (!usuario) {
      usuario = await Treinador.findById(decoded.id).populate('acesso_id');
      tipo = 'treinador';
    }
    
    if (!usuario) {
      usuario = await Atleta.findById(decoded.id).populate('acesso_id');
      tipo = 'atleta';
    }
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário não encontrado.' });
    }
    
    req.usuario = usuario;
    req.tipoUsuario = tipo;
    next();
  } catch (error) {
    console.error('Erro no verificarToken:', error);
    res.status(401).json({ erro: 'Token inválido.' });
  }
};

const verificarPermissao = (recurso, acao) => {
  return async (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      // Se for administrador, permite tudo
      if (usuario.acesso_id && usuario.acesso_id.nome === 'administrador') {
        return next();
      }
      
      // Se não tiver permissões definidas
      if (!usuario.acesso_id || !usuario.acesso_id.permissoes) {
        return res.status(403).json({ erro: 'Você não tem permissão para realizar esta ação.' });
      }
      
      // Verificar permissão específica
      const temPermissao = usuario.acesso_id.permissoes.some(permissao => 
        permissao.recurso === recurso && permissao.nome === acao
      );
      
      if (!temPermissao) {
        return res.status(403).json({ erro: `Você não tem permissão para ${acao} ${recurso}.` });
      }
      
      next();
    } catch (error) {
      console.error('Erro no verificarPermissao:', error);
      res.status(500).json({ erro: 'Erro ao verificar permissões.' });
    }
  };
};

const verificarAssociacao = (model) => {
  return async (req, res, next) => {
    try {
      const usuario = req.usuario;
      
      // Administrador pode acessar tudo
      if (usuario.acesso_id && usuario.acesso_id.nome === 'administrador') {
        return next();
      }
      
      // Para outros usuários, implementar lógica de associação
      // Por enquanto, permitir acesso para teste
      next();
    } catch (error) {
      console.error('Erro no verificarAssociacao:', error);
      res.status(500).json({ erro: 'Erro ao verificar associação.' });
    }
  };
};

module.exports = { verificarToken, verificarPermissao, verificarAssociacao };