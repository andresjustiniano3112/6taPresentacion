const contactoRepository = require('../repositories/contactoRepository');

exports.getUserContacts = async (req, res) => {
    const userId = req.params.usuarioId;

    try {
        const contacts = await contactoRepository.getContactsByUserId(userId);
        res.json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los contactos');
    }
};

exports.getContactById = async (req, res) => {
    const contactId = req.params.contactoId;

    try {
        const contact = await contactoRepository.getContactById(contactId);
        console.log("Datos del contacto enviados:", contact); // Depuración
        res.json(contact);
    } catch (error) {
        console.error("Error al obtener el contacto:", error);
        res.status(500).send('Error al obtener el contacto');
    }
};


exports.createContact = async (req, res) => {
    const contacto = req.body;

    try {
        const contact = await contactoRepository.createContact(contacto);
        res.json(contact);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear el contacto');
    }
};

exports.deleteContact = async (req, res) => {
    const contactId = req.params.contactoId;

    try {
        await contactoRepository.deleteContact(contactId);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el contacto');
    }
};

exports.updateContact = async (req, res) => {
    const contacto = req.body;

    try {
        if (!contacto.contactoId || contacto.contactoId === 0) {
            console.error("El ID del contacto no es válido:", contacto.contactoId); // Log para depuración
            return res.status(400).send('El ID del contacto es requerido para actualizar');
        }

        const updatedContact = await contactoRepository.updateContact(contacto);
        res.json(updatedContact);
    } catch (error) {
        console.error("Error al actualizar el contacto:", error);
        res.status(500).send('Error al actualizar el contacto');
    }
};




