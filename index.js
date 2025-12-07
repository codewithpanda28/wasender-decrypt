const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/decrypt', (req, res) => {
  try {
    const { fileBinary, mediaKey } = req.body;
    const encryptedBuffer = Buffer.from(fileBinary, 'base64');
    const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');

    const expandedKey = crypto.createHmac('sha256', mediaKeyBuffer)
                              .update('WhatsApp Audio Keys')
                              .digest();
    const iv = expandedKey.slice(0, 16);
    const cipherKey = expandedKey.slice(16, 48);

    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    let decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    decrypted = decrypted.slice(0, decrypted.length - 10);

    res.json({ fileBinary: decrypted.toString('base64') });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Decrypt service running on port 3000'));
