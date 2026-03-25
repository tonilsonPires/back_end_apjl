// const QRCode = require('qrcode');
// const { createCanvas, loadImage, registerFont } = require('canvas');
// const path = require('path');
// const fs = require('fs-extra');

// class GeradorCartao {
//   constructor() {
//     this.width = 600;
//     this.height = 400;
    
//     // Registrar fontes se disponíveis
//     try {
//       registerFont(path.join(__dirname, '../fonts/arial.ttf'), { family: 'Arial' });
//     } catch (err) {
//       console.log('Fonte Arial não encontrada, usando padrão');
//     }
//   }

//   async gerarCartao(usuario, tipo, associacao) {
//     try {
//       const canvas = createCanvas(this.width, this.height);
//       const ctx = canvas.getContext('2d');
      
//       // Fundo branco com gradiente suave
//       const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
//       gradient.addColorStop(0, '#FFFFFF');
//       gradient.addColorStop(1, '#F5F5F5');
//       ctx.fillStyle = gradient;
//       ctx.fillRect(0, 0, this.width, this.height);
      
//       // Borda dourada
//       ctx.strokeStyle = '#FFD700';
//       ctx.lineWidth = 5;
//       ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
      
//       // Borda interna
//       ctx.strokeStyle = '#C0C0C0';
//       ctx.lineWidth = 1;
//       ctx.strokeRect(15, 15, this.width - 30, this.height - 30);
      
//       // Título principal
//       ctx.fillStyle = '#000000';
//       ctx.font = 'bold 22px "Arial"';
//       ctx.textAlign = 'center';
//       ctx.fillText('Federação Angolana de Judo', this.width / 2, 40);
      
//       // Subtítulo
//       ctx.font = '14px "Arial"';
//       ctx.fillStyle = '#666666';
//       ctx.fillText('CARTÃO DE IDENTIFICAÇÃO OFICIAL', this.width / 2, 70);
      
//       // Tipo de usuário com fundo colorido
//       const tipoColors = {
//         'atleta': '#4CAF50',
//         'treinador': '#2196F3',
//         'membro': '#FF9800',
//         'presidente': '#9C27B0'
//       };
      
//       const bgColor = tipoColors[tipo] || '#9E9E9E';
//       ctx.fillStyle = bgColor;
//       ctx.fillRect(this.width / 2 - 80, 78, 160, 28);
      
//       ctx.fillStyle = '#FFFFFF';
//       ctx.font = 'bold 16px "Arial"';
//       ctx.fillText(tipo.toUpperCase(), this.width / 2, 100);
      
//       // Foto (se houver)
//       if (usuario.imagem && fs.existsSync(usuario.imagem)) {
//         try {
//           const imagem = await loadImage(usuario.imagem);
//           ctx.save();
//           ctx.beginPath();
//           ctx.arc(80, 180, 55, 0, Math.PI * 2);
//           ctx.closePath();
//           ctx.clip();
//           ctx.drawImage(imagem, 25, 125, 110, 110);
//           ctx.restore();
          
//           // Borda da foto
//           ctx.beginPath();
//           ctx.arc(80, 180, 55, 0, Math.PI * 2);
//           ctx.strokeStyle = '#FFD700';
//           ctx.lineWidth = 3;
//           ctx.stroke();
//         } catch (err) {
//           console.error('Erro ao carregar imagem:', err);
//           this.desenharPlaceholder(ctx, 25, 125, 110, 110);
//         }
//       } else {
//         this.desenharPlaceholder(ctx, 25, 125, 110, 110);
//       }
      
//       // Dados do usuário
//       ctx.fillStyle = '#000000';
//       ctx.font = '14px "Arial"';
//       ctx.textAlign = 'left';
      
//       const startX = 160;
//       let startY = 130;
//       const lineHeight = 25;
      
//       ctx.font = 'bold 14px "Arial"';
//       ctx.fillText('Nome:', startX, startY);
//       ctx.font = '14px "Arial"';
//       ctx.fillText(usuario.nomeCompleto || usuario.nome || 'Não informado', startX + 60, startY);
      
//       startY += lineHeight;
//       ctx.font = 'bold 14px "Arial"';
//       ctx.fillText('BI:', startX, startY);
//       ctx.font = '14px "Arial"';
//       ctx.fillText(usuario.bilheteIdentidade || 'Não informado', startX + 60, startY);
      
//       startY += lineHeight;
//       ctx.font = 'bold 14px "Arial"';
//       ctx.fillText('Data Nasc.:', startX, startY);
//       ctx.font = '14px "Arial"';
//       const dataNasc = usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString('pt-AO') : 'Não informado';
//       ctx.fillText(dataNasc, startX + 90, startY);
      
//       if (tipo === 'atleta') {
//         startY += lineHeight;
//         ctx.font = 'bold 14px "Arial"';
//         ctx.fillText('Peso:', startX, startY);
//         ctx.font = '14px "Arial"';
//         ctx.fillText(`${usuario.peso || 0} kg`, startX + 60, startY);
        
//         if (usuario.graduacao) {
//           startY += lineHeight;
//           ctx.font = 'bold 14px "Arial"';
//           ctx.fillText('Graduação:', startX, startY);
//           ctx.font = '14px "Arial"';
//           ctx.fillText(usuario.graduacao.nivel || usuario.graduacao, startX + 90, startY);
//         }
//       }
      
//       if (tipo === 'treinador' && usuario.graduacao) {
//         startY += lineHeight;
//         ctx.font = 'bold 14px "Arial"';
//         ctx.fillText('Graduação:', startX, startY);
//         ctx.font = '14px "Arial"';
//         ctx.fillText(usuario.graduacao, startX + 90, startY);
//       }
      
//       // Associação
//       if (associacao) {
//         startY += lineHeight;
//         ctx.font = 'bold 14px "Arial"';
//         ctx.fillText('Associação:', startX, startY);
//         ctx.font = '12px "Arial"';
//         ctx.fillStyle = '#666666';
//         ctx.fillText(associacao.nome, startX + 90, startY);
        
//         // Logo da associação
//         if (associacao.logo && fs.existsSync(associacao.logo)) {
//           try {
//             const logo = await loadImage(associacao.logo);
//             ctx.drawImage(logo, this.width - 100, this.height - 100, 80, 80);
//           } catch (err) {
//             console.error('Erro ao carregar logo:', err);
//           }
//         }
//       }
      
//       // ID do cartão
//       const cartaoId = `${tipo.substring(0, 3).toUpperCase()}-${usuario._id.toString().substring(0, 8)}`;
//       ctx.font = '10px "Arial"';
//       ctx.fillStyle = '#999999';
//       ctx.textAlign = 'left';
//       ctx.fillText(`ID: ${cartaoId}`, 25, this.height - 25);
      
//       // Data de emissão
//       const dataEmissao = new Date().toLocaleDateString('pt-AO');
//       ctx.fillText(`Emissão: ${dataEmissao}`, 25, this.height - 10);
      
//       // QR Code com dados completos
//       const qrData = JSON.stringify({
//         id: usuario._id.toString(),
//         tipo: tipo,
//         nome: usuario.nomeCompleto || usuario.nome,
//         bi: usuario.bilheteIdentidade,
//         associacao: associacao ? associacao.nome : null,
//         dataEmissao: new Date().toISOString()
//       });
      
//       const qrCodeDataURL = await QRCode.toDataURL(qrData, {
//         width: 80,
//         margin: 1,
//         color: {
//           dark: '#000000',
//           light: '#FFFFFF'
//         }
//       });
      
//       const qrImage = await loadImage(qrCodeDataURL);
//       ctx.drawImage(qrImage, this.width - 100, 30, 70, 70);
      
//       // Validade do cartão
//       const validade = new Date();
//       validade.setFullYear(validade.getFullYear() + 1);
//       ctx.font = '8px "Arial"';
//       ctx.fillStyle = '#999999';
//       ctx.textAlign = 'right';
//       ctx.fillText(`Válido até: ${validade.toLocaleDateString('pt-AO')}`, this.width - 25, this.height - 10);
      
//       // Salvar imagem
//       const cartaoDir = path.join(__dirname, '../../uploads/cartoes');
//       await fs.ensureDir(cartaoDir);
//       const cartaoPath = path.join(cartaoDir, `${cartaoId}.png`);
//       const buffer = canvas.toBuffer('image/png');
//       await fs.writeFile(cartaoPath, buffer);
      
//       return {
//         path: cartaoPath,
//         id: cartaoId,
//         url: `/uploads/cartoes/${cartaoId}.png`,
//         dataEmissao: new Date(),
//         validade: validade
//       };
//     } catch (error) {
//       console.error('Erro ao gerar cartão:', error);
//       throw error;
//     }
//   }
  
//   desenharPlaceholder(ctx, x, y, width, height) {
//     ctx.fillStyle = '#E0E0E0';
//     ctx.fillRect(x, y, width, height);
//     ctx.fillStyle = '#999999';
//     ctx.font = '12px "Arial"';
//     ctx.textAlign = 'center';
//     ctx.fillText('Sem Foto', x + width / 2, y + height / 2);
//   }
  
//   async gerarCartaoEmLote(usuarios) {
//     const cartoes = [];
//     for (const usuario of usuarios) {
//       try {
//         const cartao = await this.gerarCartao(usuario, usuario.tipo, usuario.associacao);
//         cartoes.push(cartao);
//       } catch (error) {
//         console.error(`Erro ao gerar cartão para ${usuario.nome}:`, error);
//       }
//     }
//     return cartoes;
//   }
// }

// module.exports = new GeradorCartao();



const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');

class GeradorCartao {
  async gerarCartao(usuario, tipo, associacao) {
    try {
      // Gerar ID do cartão
      const cartaoId = `${tipo.substring(0, 3).toUpperCase()}-${usuario._id.toString().substring(0, 8)}`;
      
      // Dados para o QR Code
      const qrData = {
        id: usuario._id.toString(),
        tipo: tipo,
        nome: usuario.nomeCompleto || usuario.nome,
        bi: usuario.bilheteIdentidade,
        associacao: associacao ? associacao.nome : null,
        cartaoId: cartaoId,
        dataEmissao: new Date().toISOString()
      };
      
      // Gerar QR Code como imagem
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
      
      // Criar dados do cartão em JSON
      const cartaoData = {
        id: cartaoId,
        tipo: tipo,
        usuario: {
          id: usuario._id,
          nome: usuario.nomeCompleto || usuario.nome,
          bi: usuario.bilheteIdentidade,
          dataNascimento: usuario.dataNascimento,
          email: usuario.email,
          telefone: usuario.telefone
        },
        associacao: associacao ? {
          nome: associacao.nome,
          municipio: associacao.municipio,
          logo: associacao.logo
        } : null,
        qrCode: `/uploads/qrcodes/${cartaoId}.png`,
        dataEmissao: new Date(),
        validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
      };
      
      // Salvar dados do cartão
      const cartaoDir = path.join(__dirname, '../../uploads/cartoes');
      await fs.ensureDir(cartaoDir);
      const cartaoPath = path.join(cartaoDir, `${cartaoId}.json`);
      await fs.writeJson(cartaoPath, cartaoData, { spaces: 2 });
      
      // Para atletas e treinadores, também salvar uma versão HTML para impressão
      if (tipo === 'atleta' || tipo === 'treinador') {
        const htmlPath = path.join(cartaoDir, `${cartaoId}.html`);
        const html = this.gerarHTMLCartao(cartaoData, tipo, usuario, associacao);
        await fs.writeFile(htmlPath, html);
      }
      
      return {
        id: cartaoId,
        qrCode: `/uploads/qrcodes/${cartaoId}.png`,
        url: `/uploads/cartoes/${cartaoId}.json`,
        htmlUrl: tipo === 'atleta' || tipo === 'treinador' ? `/uploads/cartoes/${cartaoId}.html` : null,
        dataEmissao: cartaoData.dataEmissao,
        validade: cartaoData.validade
      };
    } catch (error) {
      console.error('Erro ao gerar cartão:', error);
      throw error;
    }
  }
  
  gerarHTMLCartao(cartaoData, tipo, usuario, associacao) {
    const nome = usuario.nomeCompleto || usuario.nome;
    const dataNasc = new Date(usuario.dataNascimento).toLocaleDateString('pt-AO');
    const emissao = new Date(cartaoData.dataEmissao).toLocaleDateString('pt-AO');
    const validade = new Date(cartaoData.validade).toLocaleDateString('pt-AO');
    
    return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cartão de Identificação - ${nome}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
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
            transition: transform 0.3s;
        }
        .cartao:hover {
            transform: translateY(-5px);
        }
        .cabecalho {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            padding: 20px;
            text-align: center;
            color: #2c3e50;
        }
        .cabecalho h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        .cabecalho p {
            font-size: 14px;
            opacity: 0.9;
        }
        .tipo {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 10px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        .conteudo {
            padding: 30px;
            display: flex;
            gap: 30px;
        }
        .foto-area {
            flex: 0 0 150px;
            text-align: center;
        }
        .foto-placeholder {
            width: 150px;
            height: 150px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 15px;
            border: 3px solid #FFD700;
        }
        .dados {
            flex: 1;
        }
        .campo {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        .campo-label {
            font-size: 12px;
            color: #7f8c8d;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .campo-valor {
            font-size: 16px;
            color: #2c3e50;
            font-weight: 500;
        }
        .qr-code {
            flex: 0 0 120px;
            text-align: center;
            border-left: 2px dashed #e0e0e0;
            padding-left: 20px;
        }
        .qr-code img {
            width: 120px;
            height: 120px;
            margin-bottom: 10px;
        }
        .qr-code p {
            font-size: 10px;
            color: #7f8c8d;
        }
        .rodape {
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #e0e0e0;
        }
        .logo-associacao {
            margin-top: 10px;
            max-width: 100px;
            max-height: 50px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .cartao {
                box-shadow: none;
                page-break-after: avoid;
            }
            .cartao:hover {
                transform: none;
            }
        }
    </style>
</head>
<body>
    <div class="cartao">
        <div class="cabecalho">
            <h1>Federação Angolana de Judo</h1>
            <p>CARTÃO DE IDENTIFICAÇÃO OFICIAL</p>
        </div>
        <div class="tipo">
            ${tipo.toUpperCase()}
        </div>
        <div class="conteudo">
            <div class="foto-area">
                <div class="foto-placeholder">
                    ${nome.charAt(0).toUpperCase()}
                </div>
                <div style="font-size: 12px; color: #7f8c8d;">ID: ${cartaoData.id}</div>
            </div>
            <div class="dados">
                <div class="campo">
                    <div class="campo-label">Nome Completo</div>
                    <div class="campo-valor">${nome}</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Bilhete de Identidade</div>
                    <div class="campo-valor">${usuario.bilheteIdentidade}</div>
                </div>
                <div class="campo">
                    <div class="campo-label">Data de Nascimento</div>
                    <div class="campo-valor">${dataNasc}</div>
                </div>
                ${tipo === 'atleta' ? `
                <div class="campo">
                    <div class="campo-label">Peso</div>
                    <div class="campo-valor">${usuario.peso || 'N/A'} kg</div>
                </div>
                ` : ''}
                ${tipo === 'treinador' ? `
                <div class="campo">
                    <div class="campo-label">Graduação</div>
                    <div class="campo-valor">${usuario.graduacao || 'N/A'}</div>
                </div>
                ` : ''}
                <div class="campo">
                    <div class="campo-label">Associação</div>
                    <div class="campo-valor">${associacao ? associacao.nome : 'N/A'}</div>
                </div>
            </div>
            <div class="qr-code">
                <img src="/uploads/qrcodes/${cartaoData.id}.png" alt="QR Code">
                <p>Escaneie para verificar autenticidade</p>
            </div>
        </div>
        <div class="rodape">
            <div>Emissão: ${emissao} | Validade: ${validade}</div>
            <div>Este documento é válido em todo território nacional</div>
            ${associacao && associacao.logo ? `<img src="${associacao.logo}" class="logo-associacao" alt="Logo">` : ''}
        </div>
    </div>
</body>
</html>
    `;
  }
  
  async gerarCartaoEmLote(usuarios) {
    const cartoes = [];
    for (const usuario of usuarios) {
      try {
        const cartao = await this.gerarCartao(usuario, usuario.tipo, usuario.associacao);
        cartoes.push(cartao);
      } catch (error) {
        console.error(`Erro ao gerar cartão para ${usuario.nome}:`, error);
      }
    }
    return cartoes;
  }
}

module.exports = new GeradorCartao();