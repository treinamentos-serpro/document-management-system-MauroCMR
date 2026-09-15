const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const documentController = require('../controllers/documentController');

const router = express.Router();
const storageDir = path.join(__dirname, '..', '..', 'storage');

fs.mkdirSync(storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, storageDir);
  },
  filename: (_req, file, callback) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, '_');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);

    callback(null, `${timestamp}-${baseName}${extension}`);
  },
});

const upload = multer({
  storage,
});

router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;
