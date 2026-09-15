import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments, uploadDocument } from './services/documentApi';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [listError, setListError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  async function loadDocuments() {
    setIsLoading(true);
    setListError('');

    try {
      const loadedDocuments = await listDocuments();
      setDocuments(loadedDocuments);
    } catch (error) {
      setListError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(documentData) {
    setIsUploading(true);
    setUploadMessage('');

    try {
      await uploadDocument(documentData);
      setUploadMessage('Documento enviado com sucesso.');
      await loadDocuments();
    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div>
          <p className="eyebrow">Gestão de documentos</p>
          <h1>Document Management System</h1>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <h2>Enviar documento</h2>
          <UploadComponent onUpload={handleUpload} isUploading={isUploading} />
          {uploadMessage && <p className="status-message">{uploadMessage}</p>}
        </div>

        <div className="panel panel-wide">
          <div className="panel-header">
            <h2>Documentos</h2>
            <button type="button" onClick={loadDocuments} disabled={isLoading}>
              Atualizar
            </button>
          </div>
          <DocumentList documents={documents} isLoading={isLoading} error={listError} onRetry={loadDocuments} />
        </div>
      </section>
    </main>
  );
}
