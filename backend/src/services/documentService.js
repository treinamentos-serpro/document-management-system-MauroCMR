const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

const storageDir = path.resolve(__dirname, '..', '..', 'storage');
const DEFAULT_MIME_TYPE = 'application/octet-stream';

const documentErrorCodes = {
  validation: 'DOCUMENT_VALIDATION_ERROR',
  fileNotFound: 'DOCUMENT_FILE_NOT_FOUND',
  unsafeStoragePath: 'DOCUMENT_UNSAFE_STORAGE_PATH',
};

function createDocumentError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function validateUploadInput({ file, owner }) {
  if (!file) {
    throw createDocumentError('Arquivo obrigatório.', documentErrorCodes.validation);
  }

  if (!owner || !owner.trim()) {
    throw createDocumentError('Identificação do proprietário é obrigatória.', documentErrorCodes.validation);
  }
}

function createDocumentMetadata({ file, owner }) {
  return {
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner.trim(),
    mimeType: file.mimetype || DEFAULT_MIME_TYPE,
    storagePath: file.path,
  };
}

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    storedName: document.storedName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
    mimeType: document.mimeType,
  };
}

function isPathInsideStorage(filePath) {
  const resolvedPath = path.resolve(filePath);
  return resolvedPath === storageDir || resolvedPath.startsWith(`${storageDir}${path.sep}`);
}

function ensureDocumentCanBeDownloaded(document) {
  if (!isPathInsideStorage(document.storagePath)) {
    throw createDocumentError('Caminho do arquivo inválido.', documentErrorCodes.unsafeStoragePath);
  }

  if (!fs.existsSync(document.storagePath)) {
    throw createDocumentError('Arquivo não encontrado no armazenamento local.', documentErrorCodes.fileNotFound);
  }
}

function uploadDocument({ file, owner }) {
  validateUploadInput({ file, owner });

  const document = createDocumentMetadata({ file, owner });
  return toPublicDocument(documentRepository.create(document));
}

function listDocuments() {
  return documentRepository.list().map(toPublicDocument);
}

function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);

  if (!document) {
    return null;
  }

  ensureDocumentCanBeDownloaded(document);

  return document;
}

module.exports = {
  documentErrorCodes,
  uploadDocument,
  listDocuments,
  getDocumentForDownload,
};
