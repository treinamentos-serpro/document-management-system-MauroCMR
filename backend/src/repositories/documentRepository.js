const documents = [];

function create(document) {
  documents.push(document);
  return document;
}

function list() {
  return [...documents];
}

function findById(id) {
  return documents.find((document) => document.id === id) || null;
}

module.exports = {
  create,
  list,
  findById,
};
