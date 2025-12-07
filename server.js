const express = require("express");
const { downloadAndDecrypt } = require("./waDownload");
const app = express();

app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("WA Decrypt API Running");
});

// Main decrypt API
app.post("/decrypt", async (req, res) => {
    try {
        const { url, mediaKey, type } = req.body;

        if (!url || !mediaKey || !type) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        const file = await downloadAndDecrypt(url, mediaKey, type);

        res.json({ success: true, file: file.toString("base64") });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Decryption failed", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on PORT " + PORT));
