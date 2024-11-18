const dbConnection = require('../dbConnection/mysqlConnection');

let connection = null;

const getConnection = async () => {
    if (connection === null) {
        connection = await dbConnection();
    }

    return connection;
}

exports.getUsuarioByUsername = async (username) => {
    const connection = await getConnection();
    
    const [rows] = await connection.query(`
        SELECT u.*, i.path AS imagenPath
        FROM usuario u
        LEFT JOIN imagen i ON u.imagenId = i.imagenId
        WHERE u.username = ?`, [username]);

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};


exports.createUsuario = async ({ fullName, username, password, imagenId }) => {
    const connection = await getConnection();

    const data = [fullName, username, password, imagenId];
    const sql = 'INSERT INTO usuario (fullName, username, password, imagenId) VALUES (?, ?, ?, ?)';

    await connection.query(sql, data);
};

