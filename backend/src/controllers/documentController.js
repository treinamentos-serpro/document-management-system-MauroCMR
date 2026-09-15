const documentService = require('../services/documentService');

function uploadDocument(req, res) {
  try {
    const document = documentService.uploadDocument({
      file: req.file,
      owner: req.body.owner,
    });

    return res.status(201).json(document);
  } catch (error) {
    const statusCode = error.message === 'Arquivo obrigatório.' || error.message === 'Identificação do proprietário é obrigatória.' ? 400 : 500;
    return res.status(statusCode).json({ message: error.message });
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
    if (error.message === 'Arquivo não encontrado no armazenamento local.') {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  uploadDocument,
  listDocuments,
  downloadDocument,
};
