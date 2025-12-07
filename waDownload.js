const axios = require("axios");
const crypto = require("crypto");

async function downloadAndDecrypt(url, mediaKey, type) {
    const response = await axios.get(url, {
        responseType: "arraybuffer"
    });

    const fileData = Buffer.from(response.data);

    const mediaKeyBuffer = Buffer.from(mediaKey, "base64");

    const iv = mediaKeyBuffer.slice(0, 16);
    const cipherKey = mediaKeyBuffer.slice(16, 48);

    const decipher = crypto.createDecipheriv("aes-256-cbc", cipherKey, iv);
    let decrypted = Buffer.concat([decipher.update(fileData), decipher.final()]);

    return decrypted;
}

module.exports = { downloadAndDecrypt };
