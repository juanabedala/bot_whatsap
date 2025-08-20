const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { getContextFromVectorDB } = require('./vector');
const { askGemini } = require('./gemini');

const app = express();
let qrCodeImage = null;

// Cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
});

client.on('qr', async (qr) => {
  console.log('QR generado');
  qrCodeImage = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
  console.log('✅ Bot de WhatsApp conectado');
});

client.on('message', async (msg) => {
  console.log(`📩 Mensaje de ${msg.from}: ${msg.body}`);

  try {
    // 1. Buscar contexto en ChromaDB
    const context = await getContextFromVectorDB(msg.body);

    // 2. Preguntar a Gemini
    const response = await askGemini(msg.body, context);

    // 3. Responder en WhatsApp
    await msg.reply(response);
  } catch (err) {
    console.error("Error:", err);
    await msg.reply("⚠️ Ocurrió un error al procesar tu mensaje.");
  }
});

// Endpoint para mostrar el QR en Railway
app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.send(`<h2>Escanea este QR en WhatsApp Business:</h2><img src="${qrCodeImage}" />`);
  } else {
    res.send("QR aún no generado o el bot ya está conectado ✅");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`🌐 Servidor Express en puerto ${process.env.PORT || 3000}`);
});

client.initialize();
