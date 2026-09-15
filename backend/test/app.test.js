const { test, before, after } = require('node:test');
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

test('deve fazer upload, listar e baixar um documento', async () => {
  const formData = new FormData();
  formData.append('file', new Blob(['conteudo de teste do arquivo'], { type: 'text/plain' }), 'arquivo.txt');
  formData.append('owner', 'usuario-01');

  const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201, 'o upload deve criar o documento');

  const uploadedDocument = await uploadResponse.json();
  assert.ok(uploadedDocument.id, 'o documento deve ter id');
  assert.strictEqual(uploadedDocument.originalName, 'arquivo.txt');
  assert.strictEqual(uploadedDocument.owner, 'usuario-01');
  assert.strictEqual(uploadedDocument.storagePath, undefined, 'o caminho interno não deve ser exposto');

  const listResponse = await fetch(`${baseUrl}/api/documents`);
  assert.strictEqual(listResponse.status, 200, 'a listagem deve retornar sucesso');
  const documents = await listResponse.json();
  assert.ok(Array.isArray(documents), 'a listagem deve retornar uma lista');
  assert.ok(documents.some((document) => document.id === uploadedDocument.id), 'o documento enviado deve aparecer na listagem');
  assert.ok(documents.every((document) => document.storagePath === undefined), 'a listagem não deve expor caminhos internos');

  const downloadResponse = await fetch(`${baseUrl}/api/documents/${uploadedDocument.id}/download`);
  assert.strictEqual(downloadResponse.status, 200, 'o download deve retornar sucesso');
  const fileContent = await downloadResponse.text();
  assert.strictEqual(fileContent, 'conteudo de teste do arquivo');
});

test('deve rejeitar upload sem arquivo', async () => {
  const formData = new FormData();
  formData.append('owner', 'usuario-01');

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(await response.json(), { message: 'Arquivo obrigatório.' });
});

test('deve rejeitar upload sem proprietário', async () => {
  const formData = new FormData();
  formData.append('file', new Blob(['conteudo'], { type: 'text/plain' }), 'arquivo-sem-dono.txt');

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(await response.json(), { message: 'Identificação do proprietário é obrigatória.' });
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

test('deve retornar 404 para download inexistente', async () => {
  const response = await fetch(`${baseUrl}/api/documents/documento-inexistente/download`);

  assert.strictEqual(response.status, 404);
  assert.deepStrictEqual(await response.json(), { message: 'Documento não encontrado.' });
});
