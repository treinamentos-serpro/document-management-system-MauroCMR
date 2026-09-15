# Plano de execução do Document Management System

## Contexto

Este plano define a execução do Document Management System (DMS) seguindo a arquitetura simples do projeto e respeitando as restrições do armazenamento local com multer.

## Objetivo

Implementar uma solução funcional para upload, listagem e download de documentos, com armazenamento local no filesystem e metadados em memória, mantendo uma estrutura de Clean Architecture simples.

## Regras gerais

- Backend em Node.js + Express, CommonJS
- Frontend em React + Vite, ESM
- Estrutura do backend em camadas: routes, controllers, services, repositories
- Fluxo de dependência: routes -> controllers -> services -> repositories
- Arquivos salvos em backend/storage usando multer com diskStorage
- Metadados dos documentos mantidos em memória nesta fase
- Sem uso de armazenamento externo ou serviços de terceiros
- Não incluir execução de back-end e front-end no plano, apenas a especificação e organização de implementação

## Escopo funcional

### Requisitos funcionais

- Upload de documentos
- Listagem dos documentos enviados
- Download de um documento por identificador
- Registro de metadados do documento
- Associação do documento a um dono/usuário
- Tratamento de erros básicos de upload, listagem e download

### Requisitos não funcionais

- Uso do filesystem local para persistência dos arquivos
- Metadados em memória somente
- Configuração por variáveis de ambiente
- Código legível e de baixa complexidade
- Organização em camadas e separação de responsabilidades

## Modelo de dados

### Documento

- id: string
- originalName: string
- storedName: string
- size: number
- uploadedAt: string (ISO 8601)
- owner: string
- mimeType: string (opcional)
- storagePath: string

## API esperada

### POST /upload
- Entrada: multipart/form-data com arquivo e owner
- Saída: metadados do documento criado
- Status esperado: 201

### GET /documents
- Saída: lista de documentos com metadados
- Status esperado: 200

### GET /documents/:id/download
- Saída: conteúdo binário do arquivo
- Status esperado: 200

## Arquitetura da implementação

### routes/
- Definir endpoints HTTP
- Delegar para controllers

### controllers/
- Receber requisições e respostas HTTP
- Validar entrada básica
- Chamar services

### services/
- Aplicar regras de negócio
- Orquestrar upload, listagem e download
- Coordinar com repositories e storage

### repositories/
- Gerenciar a coleção de documentos em memória
- Persistir e consultar metadados

## Plano de execução em etapas

### Etapa 1 - Preparação da base
- Revisar o template e o objetivo do projeto
- Confirmar o escopo mínimo do DMS
- Definir a estrutura inicial do backend e do frontend
- Garantir que o armazenamento local e a memória sejam utilizados de acordo com a regra do projeto

### Etapa 2 - Definir domínio e contrato de dados
- Especificar a entidade Documento
- Estabelecer os metadados mínimos obrigatórios
- Definir regras de negócio para o upload, listagem e download
- Formalizar os contratos de resposta da API

### Etapa 3 - Configurar armazenamento local
- Definir a pasta backend/storage
- Configurar multer com diskStorage
- Garantir nome único para arquivos salvos
- Estabelecer a relação entre o ID do documento e o arquivo físico

### Etapa 4 - Implementar camada de repositórios
- Criar estrutura de armazenamento em memória para documentos
- Implementar criação, leitura e busca por ID
- Garantir consistência dos dados e ausência de duplicidade de identificadores

### Etapa 5 - Implementar serviços de negócio
- Upload do documento
- Listagem dos registros
- Download do arquivo pelo identificador
- Tratamento de erros de arquivo inexistente ou falha na leitura

### Etapa 6 - Expor endpoints HTTP
- Implementar as rotas do backend
- Integrar controllers e services
- Validar headers, status codes e respostas JSON
- Garantir que o endpoint de download retorne o arquivo corretamente

### Etapa 7 - Implementar frontend funcional
- Criar tela para upload do documento
- Listar documentos existentes
- Permitir download do arquivo representado na interface
- Consumir os endpoints via fetch com prefixo /api

### Etapa 8 - Validação e refinamento
- Validar upload com arquivo válido
- Testar listagem com registros em memória
- Testar download de arquivo existente
- Verificar erros para id inválido ou arquivo ausente
- Ajustar mensagens e respostas da API

### Etapa 9 - Entrega e documentação
- Revisar a estrutura final do sistema
- Validar que os requisitos do projeto foram atendidos
- Registrar as decisões de arquitetura e armazenamento local
- Preparar a documentação de uso e manutenção

## Critérios de sucesso

- Upload de documentos funciona
- Arquivos são armazenados no filesystem local
- Metadados ficam em memória e são listados corretamente
- Download do documento pelo identificador funciona
- Erros são tratados de forma clara e funcional
- Arquitetura permanece alinhada com a Clean Architecture simples do projeto

## Observações finais

Este plano é uma base de execução para o desenvolvimento do DMS e não inclui a implementação de arquivos de back-end ou front-end em si. Ele serve como referência para a especificação, organização e priorização das tarefas do projeto.
