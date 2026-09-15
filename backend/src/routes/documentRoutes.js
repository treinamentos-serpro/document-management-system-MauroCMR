const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const documentController = require('../controllers/documentController');

const router = express.Router();
const storageDir = path.resolve(__dirname, '..', '..', 'storage');
const maxUploadSizeInBytes = Number(process.env.MAX_UPLOAD_SIZE_BYTES || 5 * 1024 * 1024);

fs.mkdirSync(storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, storageDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadSizeInBytes,
    files: 1,
  },
});

function uploadSingleDocument(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'Arquivo excede o tamanho máximo permitido.' });
      return;
    }

    res.status(400).json({ message: 'Falha ao processar upload.' });
  });
}

router.post('/upload', uploadSingleDocument, documentController.uploadDocument);
router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.downloadDocument);

module.exports = router;
