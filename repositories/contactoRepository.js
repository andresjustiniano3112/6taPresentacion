const dbConnection = require('../dbConnection/mysqlConnection');

let connection = null;
const getConnection = async () => {
    connection = connection || await dbConnection();
    return connection;
};

const getPhonesByContactId = async (contactId) => {
    const connection = await getConnection();

    const [rows] = await connection.query(
        'SELECT telefonoContactoId, nroTelefono FROM telefonoContacto WHERE contactoId = ? ORDER BY telefonoContactoId',
        [contactId]
    );

    return rows; // Aseguramos que devuelve el ID y número del teléfono
};


const getAddressesByContactId = async (contactId) => {
    const connection = await getConnection();
    const [rows] = await connection.query(
        'SELECT direccion FROM direcciones WHERE contactoId = ? ORDER BY direccionId',
        [contactId]
    );
    return rows.map(row => row.direccion); // Mapeo para retornar solo las direcciones
};




const getContactsByUserId = async (userId) => {
    const connection = await getConnection();

    const [rows] = await connection.query('SELECT * FROM contacto WHERE usuarioId = ?', [userId]);

    for (let contact of rows) {
        contact.telefonos = await getPhonesByContactId(contact.contactoId);
        contact.direcciones = await getAddressesByContactId(contact.contactoId);
        contact.telefono = contact.telefonos.length > 0 ? contact.telefonos[0].nroTelefono : "";
    }

    return rows;
};

const getContactById = async (id) => {
    const connection = await getConnection();

    const [rows] = await connection.query('SELECT * FROM contacto WHERE contactoId = ?', [id]);

    if (rows.length === 0) {
        return null;
    }

    const contacto = rows[0];

    // Obtener teléfonos y direcciones asociados
    contacto.telefonos = await getPhonesByContactId(id);
    contacto.direcciones = await getAddressesByContactId(id);

    // Asignar teléfono principal
    contacto.telefono = contacto.telefonos.length > 0 ? contacto.telefonos[0].nroTelefono : "";

    return contacto;
};




const createContact = async (contacto) => {
    const { nombreContacto, email, usuarioId, imagenId, telefonos, direcciones } = contacto;

    const connection = await getConnection();

    // Crear el contacto
    const data = [nombreContacto, email, usuarioId, imagenId || null];
    const sql = 'INSERT INTO contacto (nombreContacto, email, usuarioId, imagenId) VALUES (?, ?, ?, ?)';

    const [result] = await connection.query(sql, data);
    const contactoId = result.insertId;

    // Guardar teléfonos asociados
    for (let telefono of telefonos) {
        const phoneData = [telefono.nroTelefono, contactoId];
        await connection.query('INSERT INTO telefonoContacto (nroTelefono, contactoId) VALUES (?, ?)', phoneData);
    }

    // Guardar direcciones asociadas
    for (let direccion of direcciones) {
        const addressData = [contactoId, direccion];
        await connection.query('INSERT INTO direcciones (contactoId, direccion) VALUES (?, ?)', addressData);
    }

    return await getContactById(contactoId); // Retorna el contacto creado
};



const deleteContact = async (id) => {
    const connection = await getConnection();
    const oldContactVersion = await getContactById(id);

    if (oldContactVersion.imagenId && oldContactVersion.imagenId > 0) {
        await connection.query('UPDATE imagen SET temporal = 1 WHERE imagenId = ?', [oldContactVersion.imagenId]);
    }

    const [rows] = await connection.query('DELETE FROM contacto WHERE contactoId = ?', [id]);
    return rows.affectedRows;
};

const updateContact = async (contacto) => {
    const { contactoId, nombreContacto, email, imagenId, telefonos, direcciones } = contacto;
    const connection = await getConnection();

    console.log("Actualizando contacto con ID:", contactoId); // Depuración

    // Actualizar el contacto principal
    const data = [nombreContacto, email, imagenId || null, contactoId];
    await connection.query(
        'UPDATE contacto SET nombreContacto = ?, email = ?, imagenId = ? WHERE contactoId = ?',
        data
    );

    // Actualizar teléfonos
    await connection.query('DELETE FROM telefonoContacto WHERE contactoId = ?', [contactoId]);
    for (let telefono of telefonos) {
        const phoneData = [telefono.nroTelefono, contactoId];
        await connection.query('INSERT INTO telefonoContacto (nroTelefono, contactoId) VALUES (?, ?)', phoneData);
    }

    // Actualizar direcciones
    await connection.query('DELETE FROM direcciones WHERE contactoId = ?', [contactoId]);
    for (let direccion of direcciones) {
        const addressData = [contactoId, direccion];
        await connection.query('INSERT INTO direcciones (contactoId, direccion) VALUES (?, ?)', addressData);
    }

    return await getContactById(contactoId); // Retorna el contacto actualizado
};






module.exports = {
    getContactsByUserId,
    createContact,
    getContactById,
    deleteContact,
    updateContact,
};
