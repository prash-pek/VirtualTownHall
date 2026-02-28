const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';

const StorageService = {
  save(candidateId, fileBuffer, filename) {
    const dir = path.join(UPLOADS_DIR, candidateId);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, fileBuffer);
    return filePath;
  },

  get(candidateId, filename) {
    return path.join(UPLOADS_DIR, candidateId, filename);
  },

  delete(candidateId, filename) {
    const filePath = path.join(UPLOADS_DIR, candidateId, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

module.exports = StorageService;
