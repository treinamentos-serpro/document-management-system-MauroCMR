const documentService = require('../services/documentService');
const fs = require('node:fs');

function removeUploadedFile(file) {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

function getErrorStatusCode(error) {
  if (error.code === documentService.documentErrorCodes.validation) {
    return 400;
  }

  if (
    error.code === documentService.documentErrorCodes.fileNotFound
    || error.code === documentService.documentErrorCodes.unsafeStoragePath
  ) {
    return 404;
  }

  return 500;
}

function uploadDocument(req, res) {
  try {
    const document = documentService.uploadDocument({
      file: req.file,
      owner: req.body.owner,
    });

    return res.status(201).json(document);
  } catch (error) {
    removeUploadedFile(req.file);
    return res.status(getErrorStatusCode(error)).json({ message: error.message });
  }
}

function listDocuments(req, res) {
  try {
    const documents = documentService.listDocuments();
    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

function downloadDocument(req, res) {
  try {
    const document = documentService.getDocumentForDownload(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    return res.download(document.storagePath, document.originalName);
  } catch (error) {
    return res.status(getErrorStatusCode(error)).json({ message: error.message });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
