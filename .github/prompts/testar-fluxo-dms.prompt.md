---
description: Executa um teste funcional do fluxo principal do DMS.
name: testar-fluxo-dms
argument-hint: caminho do arquivo de teste ou escopo (ex. backend/test/app.test.js)
agent: agent
---

# Testar fluxo principal do DMS

Valide o fluxo `${input:escopo:caminho do arquivo de teste ou escopo}` do Document Management System.

Verifique os comportamentos principais:

- Upload de documento com arquivo e proprietário válidos.
- Rejeição de upload sem arquivo ou sem proprietário.
- Listagem dos documentos cadastrados.
- Download de documento existente.
- Resposta adequada para documento inexistente.

Requisitos:

- Use os testes existentes quando cobrirem o escopo solicitado.
- Para backend, prefira `node:test` e `node:assert`.
- Não use serviços externos; o armazenamento deve permanecer no filesystem local.
- Informe quais comandos foram executados e quais cenários ficaram cobertos.