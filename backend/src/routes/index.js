const express = require('express');
const documentRoutes = require('./documentRoutes');

const router = express.Router();

router.use(documentRoutes);

module.exports = router;
