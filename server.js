import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
app.use(express.json());

async function downloadFile(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

function decryptMedia(encBuf, mediaKeyBase64) {
  const mediaKey = Buffer.from(mediaKeyBase64, "base64");

  const expanded = crypto.createHmac("sha256", Buffer.from("WhatsApp Audio Keys")).update(mediaKey).digest();

  const iv = expanded.subarray(0, 16);
  const cipherKey = expanded.subarray(16, 48);

  const decipher = crypto.createDecipheriv("aes-256-cbc", cipherKey, iv);
  
  let decrypted = Buffer.concat([decipher.update(encBuf), decipher.final()]);
  return decrypted;
}

app.post("/decrypt-media", async (req, res) => {
  try {
    const { url, mediaKey } = req.body;

    if (!url || !mediaKey) return res.status(400).json({ error: "Missing url/mediaKey" });

    const encFile = await downloadFile(url);
    const decrypted = decryptMedia(encFile, mediaKey);

    return res.send(decrypted.toString("base64")); // return base64 media
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Running!"));
