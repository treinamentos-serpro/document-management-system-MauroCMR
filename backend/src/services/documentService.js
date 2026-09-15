const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

function uploadDocument({ file, owner }) {
  if (!file) {
    throw new Error('Arquivo obrigatório.');
  }

  if (!owner) {
    throw new Error('Identificação do proprietário é obrigatória.');
  }

  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype || 'application/octet-stream',
    storagePath: file.path,
  };

  documentRepository.create(document);

  return document;
}

function listDocuments() {
  return documentRepository.list();
}

function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);

  if (!document) {
    return null;
  }

  if (!fs.existsSync(document.storagePath)) {
    throw new Error('Arquivo não encontrado no armazenamento local.');
  }

  return document;
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentForDownload,
};
