const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('GET /health - deve retornar status ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.deepStrictEqual(data, { status: 'ok' });
});

describe('Endpoint POST /api/upload', () => {
  test('deve fazer upload de um documento com sucesso', async () => {
    const fileContent = 'conteudo de upload teste';
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'doc-upload.txt');
    formData.append('owner', 'usuario-upload');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 201);
    const document = await response.json();
    assert.ok(document.id, 'o documento retornado deve conter um id');
    assert.strictEqual(document.originalName, 'doc-upload.txt');
    assert.strictEqual(document.owner, 'usuario-upload');
    assert.strictEqual(document.size, Buffer.byteLength(fileContent));
    assert.strictEqual(document.storagePath, undefined, 'o caminho interno não deve ser exposto');
  });

  test('deve rejeitar upload sem arquivo', async () => {
    const formData = new FormData();
    formData.append('owner', 'usuario-sem-arquivo');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.strictEqual(body.message, 'Arquivo obrigatório.');
  });

  test('deve rejeitar upload sem proprietário', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo sem dono'], { type: 'text/plain' }), 'sem-dono.txt');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 400);
    const body = await response.json();
    assert.strictEqual(body.message, 'Identificação do proprietário é obrigatória.');
  });

  test('deve gerar nome armazenado controlado pelo servidor', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['conteudo'], { type: 'text/plain' }), '../arquivo perigoso.txt');
    formData.append('owner', 'usuario-02');

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 201);
    const document = await response.json();
    assert.match(document.storedName, /^[0-9a-f-]+\.txt$/);
    assert.ok(!document.storedName.includes('/'));
    assert.ok(!document.storedName.includes('..'));
  });
});

describe('Endpoint GET /api/documents', () => {
  test('deve listar os documentos cadastrados sem expor caminhos internos', async () => {
    const formData = new FormData();
    formData.append('file', new Blob(['documento para listagem'], { type: 'text/plain' }), 'para-listar.txt');
    formData.append('owner', 'usuario-listagem');

    const uploadRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploaded = await uploadRes.json();

    const response = await fetch(`${baseUrl}/api/documents`);
    assert.strictEqual(response.status, 200);

    const documents = await response.json();
    assert.ok(Array.isArray(documents), 'a listagem deve retornar um array');
    const found = documents.find((doc) => doc.id === uploaded.id);
    assert.ok(found, 'o documento recém-criado deve estar presente na listagem');
    assert.strictEqual(found.originalName, 'para-listar.txt');
    assert.strictEqual(found.owner, 'usuario-listagem');
    assert.ok(documents.every((doc) => doc.storagePath === undefined), 'a listagem não deve expor caminhos internos');
  });
});

describe('Endpoint GET /api/documents/:id/download', () => {
  test('deve realizar o download de um documento existente', async () => {
    const fileContent = 'conteudo para testar download de arquivo';
    const formData = new FormData();
    formData.append('file', new Blob([fileContent], { type: 'text/plain' }), 'download-teste.txt');
    formData.append('owner', 'usuario-download');

    const uploadRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploaded = await uploadRes.json();

    const response = await fetch(`${baseUrl}/api/documents/${uploaded.id}/download`);
    assert.strictEqual(response.status, 200);
    const downloadedContent = await response.text();
    assert.strictEqual(downloadedContent, fileContent);
  });

  test('deve retornar 404 quando o documento não for encontrado', async () => {
    const response = await fetch(`${baseUrl}/api/documents/id-inexistente/download`);
    assert.strictEqual(response.status, 404);
    const body = await response.json();
    assert.strictEqual(body.message, 'Documento não encontrado.');
  });
});
