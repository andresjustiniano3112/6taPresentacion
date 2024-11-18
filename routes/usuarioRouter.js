const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const usuarioController = require('../controllers/usuarioController');

// Configuración de multer para manejar la subida de imágenes
const uploadDirectory = process.env.UPLOADS_PATH || 'uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Ruta para registrar un usuario
router.post('/register', upload.single('file'), usuarioController.register);

// Ruta para login de usuario
router.post('/login', usuarioController.login);

module.exports = router;
