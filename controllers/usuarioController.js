const usuarioRepository = require('../repositories/usuarioRepository');
const imagenRepository = require('../repositories/imagenRepository');

exports.register = async (req, res) => {
    const { fullName, username, password } = req.body;
    const file = req.file;

    try {
        // Subir la imagen si existe
        const imageId = file ? await imagenRepository.createImagen({ fileName: file.filename, path: file.path }) : null;

        // Crear el usuario
        await usuarioRepository.createUsuario({ fullName, username, password, imagenId: imageId });

        res.status(201).send('Usuario registrado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar el usuario');
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await getConnection();
        const [rows] = await connection.query(
            'SELECT usuarioId, fullName, imagenId FROM usuario WHERE userName = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).send('Usuario o contraseña incorrectos');
        }

        const user = rows[0];
        res.json(user); // Incluye imagenId en la respuesta
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).send('Error en el servidor');
    }
};


