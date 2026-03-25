// const QRCode = require('qrcode');
// const { createCanvas, loadImage } = require('canvas');
// const path = require('path');
// const fs = require('fs-extra');
// const Atleta = require('../models/Atleta');
// const Treinador = require('../models/Treinador');
// const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');

// const gerarCartao = async (usuario, tipo, associacao) => {
//   try {
//     const canvas = createCanvas(600, 400);
//     const ctx = canvas.getContext('2d');
    
//     // Fundo branco
//     ctx.fillStyle = '#FFFFFF';
//     ctx.fillRect(0, 0, 600, 400);
    
//     // Borda
//     ctx.strokeStyle = '#FFD700';
//     ctx.lineWidth = 5;
//     ctx.strokeRect(10, 10, 580, 380);
    
//     // Título
//     ctx.fillStyle = '#000000';
//     ctx.font = 'bold 20px Arial';
//     ctx.fillText('Federação Angolana de Judo', 150, 40);
    
//     ctx.font = '16px Arial';
//     ctx.fillText('CARTÃO DE IDENTIFICAÇÃO', 210, 70);
    
//     // Tipo
//     ctx.font = 'bold 14px Arial';
//     ctx.fillStyle = '#FFD700';
//     ctx.fillText(tipo.toUpperCase(), 250, 100);
    
//     // Foto (se houver)
//     if (usuario.imagem) {
//       try {
//         const imagem = await loadImage(usuario.imagem);
//         ctx.drawImage(imagem, 30, 120, 120, 150);
//       } catch (err) {
//         console.error('Erro ao carregar imagem:', err);
//       }
//     }
    
//     // Dados do usuário
//     ctx.fillStyle = '#000000';
//     ctx.font = '14px Arial';
//     ctx.fillText(`Nome: ${usuario.nomeCompleto || usuario.nome}`, 180, 140);
//     ctx.fillText(`BI: ${usuario.bilheteIdentidade}`, 180, 170);
//     ctx.fillText(`Data Nasc.: ${new Date(usuario.dataNascimento).toLocaleDateString()}`, 180, 200);
    
//     if (tipo === 'atleta') {
//       ctx.fillText(`Peso: ${usuario.peso} kg`, 180, 230);
//       if (usuario.graduacao) {
//         ctx.fillText(`Graduação: ${usuario.graduacao.nivel}`, 180, 260);
//       }
//     }
    
//     if (tipo === 'treinador') {
//       ctx.fillText(`Graduação: ${usuario.graduacao}`, 180, 230);
//     }
    
//     // Associação
//     if (associacao) {
//       ctx.fillText(`Associação: ${associacao.nome}`, 180, tipo === 'atleta' ? 290 : 260);
      
//       // Logo da associação
//       if (associacao.logo) {
//         try {
//           const logo = await loadImage(associacao.logo);
//           ctx.drawImage(logo, 480, 300, 80, 80);
//         } catch (err) {
//           console.error('Erro ao carregar logo:', err);
//         }
//       }
//     }
    
//     // ID do cartão
//     const cartaoId = `${tipo.substring(0, 3).toUpperCase()}-${usuario._id.toString().substring(0, 8)}`;
//     ctx.font = '12px Arial';
//     ctx.fillStyle = '#666666';
//     ctx.fillText(`ID: ${cartaoId}`, 30, 370);
    
//     // QR Code
//     const qrData = JSON.stringify({
//       id: usuario._id,
//       tipo: tipo,
//       nome: usuario.nomeCompleto || usuario.nome,
//       bi: usuario.bilheteIdentidade,
//       associacao: associacao ? associacao.nome : null
//     });
    
//     const qrCodeDataURL = await QRCode.toDataURL(qrData);
//     const qrImage = await loadImage(qrCodeDataURL);
//     ctx.drawImage(qrImage, 500, 20, 70, 70);
    
//     // Salvar imagem
//     const cartaoDir = path.join(__dirname, '../../uploads/cartoes');
//     fs.ensureDirSync(cartaoDir);
//     const cartaoPath = path.join(cartaoDir, `${cartaoId}.png`);
//     const buffer = canvas.toBuffer('image/png');
//     fs.writeFileSync(cartaoPath, buffer);
    
//     return {
//       path: cartaoPath,
//       id: cartaoId,
//       url: `/uploads/cartoes/${cartaoId}.png`
//     };
//   } catch (error) {
//     console.error('Erro ao gerar cartão:', error);
//     throw error;
//   }
// };

// exports.gerarCartaoAtleta = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const atleta = await Atleta.findById(id)
//       .populate('graduacao')
//       .populate({
//         path: 'clube',
//         populate: {
//           path: 'associacaoMunicipal'
//         }
//       });
    
//     if (!atleta) {
//       return res.status(404).json({ erro: 'Atleta não encontrado.' });
//     }
    
//     const associacao = atleta.clube.associacaoMunicipal;
//     const cartao = await gerarCartao(atleta, 'atleta', associacao);
    
//     res.json(cartao);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao gerar cartão do atleta.' });
//   }
// };

// exports.gerarCartaoTreinador = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const treinador = await Treinador.findById(id)
//       .populate('associacaoMunicipal');
    
//     if (!treinador) {
//       return res.status(404).json({ erro: 'Treinador não encontrado.' });
//     }
    
//     const cartao = await gerarCartao(treinador, 'treinador', treinador.associacaoMunicipal);
    
//     res.json(cartao);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao gerar cartão do treinador.' });
//   }
// };

// exports.visualizarCartao = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cartaoPath = path.join(__dirname, '../../uploads/cartoes', `${id}.png`);
    
//     if (!fs.existsSync(cartaoPath)) {
//       return res.status(404).json({ erro: 'Cartão não encontrado.' });
//     }
    
//     res.sendFile(cartaoPath);
//   } catch (error) {
//     res.status(500).json({ erro: 'Erro ao visualizar cartão.' });
//   }
// };










const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');
const Atleta = require('../models/Atleta');
const Treinador = require('../models/Treinador');
const AssociacaoMunicipal = require('../models/AssociacaoMunicipal');

// Versão simplificada sem canvas - gera apenas QR Code e dados JSON
exports.gerarCartaoAtleta = async (req, res) => {
  try {
    const { id } = req.params;
    
    const atleta = await Atleta.findById(id)
      .populate('graduacao')
      .populate({
        path: 'clube',
        populate: {
          path: 'associacaoMunicipal'
        }
      });
    
    if (!atleta) {
      return res.status(404).json({ erro: 'Atleta não encontrado.' });
    }
    
    const associacao = atleta.clube.associacaoMunicipal;
    const cartaoId = `ATL-${atleta._id.toString().substring(0, 8)}`;
    
    // Dados para o QR Code
    const qrData = {
      id: atleta._id.toString(),
      tipo: 'atleta',
      nome: atleta.nomeCompleto,
      bi: atleta.bilheteIdentidade,
      associacao: associacao ? associacao.nome : null,
      cartaoId: cartaoId,
      dataEmissao: new Date().toISOString()
    };
    
    // Gerar QR Code
    const qrDir = path.join(__dirname, '../../uploads/qrcodes');
    await fs.ensureDir(qrDir);
    const qrPath = path.join(qrDir, `${cartaoId}.png`);
    
    await QRCode.toFile(qrPath, JSON.stringify(qrData), {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Criar dados do cartão
    const cartaoData = {
      id: cartaoId,
      tipo: 'atleta',
      qrCode: `/uploads/qrcodes/${cartaoId}.png`,
      dados: {
        nome: atleta.nomeCompleto,
        apelido: atleta.apelido,
        dataNascimento: atleta.dataNascimento,
        peso: atleta.peso,
        bilheteIdentidade: atleta.bilheteIdentidade,
        telefone: atleta.telefone,
        email: atleta.email,
        graduacao: atleta.graduacao ? atleta.graduacao.nivel : null,
        clube: atleta.clube.nome,
        associacao: associacao ? associacao.nome : null
      },
      dataEmissao: new Date(),
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
    
    // Salvar dados do cartão
    const cartaoDir = path.join(__dirname, '../../uploads/cartoes');
    await fs.ensureDir(cartaoDir);
    const cartaoPath = path.join(cartaoDir, `${cartaoId}.json`);
    await fs.writeJson(cartaoPath, cartaoData, { spaces: 2 });
    
    // Gerar HTML para impressão
    const htmlPath = path.join(cartaoDir, `${cartaoId}.html`);
    const html = gerarHTMLCartao(cartaoData, atleta, associacao);
    await fs.writeFile(htmlPath, html);
    
    res.json({
      mensagem: 'Cartão gerado com sucesso',
      cartao: {
        id: cartaoId,
        qrCode: `/uploads/qrcodes/${cartaoId}.png`,
        dados: `/uploads/cartoes/${cartaoId}.json`,
        impressao: `/uploads/cartoes/${cartaoId}.html`
      }
    });
  } catch (error) {
    console.error('Erro ao gerar cartão:', error);
    res.status(500).json({ erro: 'Erro ao gerar cartão do atleta.' });
  }
};

exports.gerarCartaoTreinador = async (req, res) => {
  try {
    const { id } = req.params;
    
    const treinador = await Treinador.findById(id)
      .populate('associacaoMunicipal');
    
    if (!treinador) {
      return res.status(404).json({ erro: 'Treinador não encontrado.' });
    }
    
    const cartaoId = `TRE-${treinador._id.toString().substring(0, 8)}`;
    
    // Dados para o QR Code
    const qrData = {
      id: treinador._id.toString(),
      tipo: 'treinador',
      nome: treinador.nomeCompleto,
      bi: treinador.bilheteIdentidade,
      associacao: treinador.associacaoMunicipal ? treinador.associacaoMunicipal.nome : null,
      cartaoId: cartaoId,
      dataEmissao: new Date().toISOString()
    };
    
    // Gerar QR Code
    const qrDir = path.join(__dirname, '../../uploads/qrcodes');
    await fs.ensureDir(qrDir);
    const qrPath = path.join(qrDir, `${cartaoId}.png`);
    
    await QRCode.toFile(qrPath, JSON.stringify(qrData), {
      width: 200,
      margin: 2
    });
    
    const cartaoData = {
      id: cartaoId,
      tipo: 'treinador',
      qrCode: `/uploads/qrcodes/${cartaoId}.png`,
      dados: {
        nome: treinador.nomeCompleto,
        apelido: treinador.apelido,
        dataNascimento: treinador.dataNascimento,
        graduacao: treinador.graduacao,
        bilheteIdentidade: treinador.bilheteIdentidade,
        telefone: treinador.telefone,
        email: treinador.email,
        associacao: treinador.associacaoMunicipal ? treinador.associacaoMunicipal.nome : null
      },
      dataEmissao: new Date(),
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
    
    const cartaoDir = path.join(__dirname, '../../uploads/cartoes');
    await fs.ensureDir(cartaoDir);
    const cartaoPath = path.join(cartaoDir, `${cartaoId}.json`);
    await fs.writeJson(cartaoPath, cartaoData, { spaces: 2 });
    
    res.json({
      mensagem: 'Cartão gerado com sucesso',
      cartao: {
        id: cartaoId,
        qrCode: `/uploads/qrcodes/${cartaoId}.png`,
        dados: `/uploads/cartoes/${cartaoId}.json`
      }
    });
  } catch (error) {
    console.error('Erro ao gerar cartão:', error);
    res.status(500).json({ erro: 'Erro ao gerar cartão do treinador.' });
  }
};

exports.visualizarCartao = async (req, res) => {
  try {
    const { id } = req.params;
    const cartaoPath = path.join(__dirname, '../../uploads/cartoes', `${id}.json`);
    
    if (!fs.existsSync(cartaoPath)) {
      return res.status(404).json({ erro: 'Cartão não encontrado.' });
    }
    
    const cartao = await fs.readJson(cartaoPath);
    res.json(cartao);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao visualizar cartão.' });
  }
};

// Função auxiliar para gerar HTML
function gerarHTMLCartao(cartaoData, atleta, associacao) {
  const dataNasc = new Date(atleta.dataNascimento).toLocaleDateString('pt-AO');
  const emissao = new Date(cartaoData.dataEmissao).toLocaleDateString('pt-AO');
  const validade = new Date(cartaoData.validade).toLocaleDateString('pt-AO');
  
  return `<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cartão de Atleta - ${atleta.nomeCompleto}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .cartao {
            width: 800px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .cabecalho {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            padding: 20px;
            text-align: center;
            color: #2c3e50;
        }
        .cabecalho h1 { font-size: 24px; margin-bottom: 5px; }
        .tipo {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 10px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .conteudo { padding: 30px; display: flex; gap: 30px; }
        .dados { flex: 1; }
        .campo {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .campo-label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .campo-valor { font-size: 16px; color: #2c3e50; font-weight: 500; }
        .qr-code {
            flex: 0 0 150px;
            text-align: center;
            border-left: 2px dashed #e0e0e0;
            padding-left: 20px;
        }
        .qr-code img { width: 150px; height: 150px; margin-bottom: 10px; }
        .rodape {
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
        @media print {
            body { background: white; padding: 0; }
            .cartao { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="cartao">
        <div class="cabecalho">
            <h1>Federação Angolana de Judo</h1>
            <p>CARTÃO DE IDENTIFICAÇÃO OFICIAL</p>
        </div>
        <div class="tipo">ATLETA</div>
        <div class="conteudo">
            <div class="dados">
                <div class="campo">
                    <div class="campo-label">Nome Completo</div>
                    <div class="campo-valor">${atleta.nomeCompleto}</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Bilhete de Identidade</div>
                    <div class="campo-valor">${atleta.bilheteIdentidade}</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Data de Nascimento</div>
                    <div class="campo-valor">${dataNasc}</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Peso</div>
                    <div class="campo-valor">${atleta.peso} kg</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Clube</div>
                    <div class="campo-valor">${atleta.clube.nome}</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Associação</div>
                    <div class="campo-valor">${associacao ? associacao.nome : 'N/A'}</div>
                </div>
            </div>
            <div class="qr-code">
                <img src="/uploads/qrcodes/${cartaoData.id}.png" alt="QR Code">
                <p>ID: ${cartaoData.id}</p>
                <p>Escaneie para verificar</p>
            </div>
        </div>
        <div class="rodape">
            <div>Emissão: ${emissao} | Validade: ${validade}</div>
            <div>Este documento é válido em todo território nacional</div>
        </div>
    </div>
</body>
</html>`;
}