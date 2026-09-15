import { useState } from 'react';

export default function UploadComponent({ onUpload, isUploading }) {
  const [owner, setOwner] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!owner.trim()) {
      setError('Informe o proprietário do documento.');
      return;
    }

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setError('');
    await onUpload({ file, owner: owner.trim() });
    setOwner('');
    setFile(null);
    event.currentTarget.reset();
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="owner">Proprietário</label>
        <input
          id="owner"
          name="owner"
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Nome do usuário"
          disabled={isUploading}
        />
      </div>

      <div className="form-field">
        <label htmlFor="file">Documento</label>
        <input
          id="file"
          name="file"
          type="file"
          onChange={(event) => setFile(event.target.files[0] || null)}
          disabled={isUploading}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}