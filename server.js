// axios use karenge HTTP call ke liye
const axios = require('axios');

const item = items[0];
const message = item.json.body?.data?.messages?.message;
if (!message) return null;

// Audio/Image/Video check
let mediaDetails = message.audioMessage || message.imageMessage || message.videoMessage || message.documentMessage;
if (!mediaDetails) return null;

// Media info
const mediaUrl = mediaDetails.url;
const mediaType = mediaDetails.mimetype.split('/')[0]; // "audio" / "image" / "video"

// Call external decrypt service
const response = await axios.post(
  'https://wasender-decrypt-2.onrender.com/decrypt',
  { url: mediaUrl, mediaKey: mediaDetails.mediaKey, type: mediaType },
  { responseType: 'arraybuffer' } // important for binary
);

// Prepare binary data for n8n
const mimeType = mediaDetails.mimetype;
const fileName = `file.${mimeType.split('/')[1]}`;

item.binary = {
  data: await this.helpers.prepareBinaryData(response.data, fileName, mimeType)
};

return item;
