import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.post("/decrypt-media", async (req, res) => {
  try {
    const { url, mediaKey, fileEncSha256 } = req.body;

    if (!url || !mediaKey || !fileEncSha256) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Step 1 → Convert Base64 mediaKey into buffer
    const mediaKeyBuf = Buffer.from(mediaKey, "base64");

    if (mediaKeyBuf.length !== 32) {
      return res.status(400).json({
        error: "Invalid key length",
        details: `Expected 32 bytes, got ${mediaKeyBuf.length}`
      });
    }

    // Step 2 → Derive AES key + IV using HKDF
    const expandedKey = crypto.hkdfSync(
      "sha256",
      mediaKeyBuf,
      "", 
      "WhatsApp Media Keys",
      112
    );

    const iv = expandedKey.subarray(0, 16);
    const cipherKey = expandedKey.subarray(16, 48);

    // Step 3 → Download encrypted audio
    const encrypted = await axios.get(url, { responseType: "arraybuffer" });
    const encBuffer = Buffer.from(encrypted.data);

    // Step 4 → Remove last 10 bytes (MAC)
    const fileData = encBuffer.subarray(0, encBuffer.length - 10);

    // Step 5 → AES-CBC decrypt
    const decipher = crypto.createDecipheriv("aes-256-cbc", cipherKey, iv);
    let decrypted = Buffer.concat([decipher.update(fileData), decipher.final()]);

    return res.send({
      success: true,
      size: decrypted.length,
      audioBase64: decrypted.toString("base64")
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Decryption failed",
      details: err.message
    });
  }
});

app.get("/", (req, res) => {
  res.send("WhatsApp Media Decryption API Running!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
