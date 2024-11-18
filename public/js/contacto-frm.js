(() => {

    if (!localStorage.getItem("userInSession")) {
        document.location.href = "login.html";
        return;
    }
    document.querySelector("body").style = "display:block";
    const urlParams = new URLSearchParams(window.location.search);
    const contactoId = urlParams.get('id');

    if (contactoId && !isNaN(contactoId)) {
        document.querySelector("#page-title").innerHTML = "Editar contacto"

        loadContact(contactoId);

    } else {
        document.querySelector("#page-title").innerHTML = "Nuevo contacto"
    }
    document.querySelector("#btn-save").addEventListener('click', saveContact)

    document.querySelector("#imageUploader").addEventListener('change', uploadImage)

    document.querySelector("#add-phone").addEventListener("click", addPhone)

    document.getElementById("add-address").addEventListener("click", () => {
        const addressList = document.getElementById("address-list");
        const inputGroup = document.createElement("div");
        inputGroup.classList.add("input-group", "mb-2");
        inputGroup.innerHTML = `
            <input type="text" class="form-control address" placeholder="Ingrese una dirección">
            <div class="input-group-append">
                <button class="btn btn-danger" onclick="removeAddress(this)">Eliminar</button>
            </div>
        `;
        addressList.appendChild(inputGroup);
    });

})();

function loadContact(contactoId) {
    fetch(`api/contacto/${contactoId}`)
        .then(response => response.json())
        .then(data => {
            console.log("Datos del contacto cargados:", data);

            // Cargar datos básicos
            document.querySelector("#nombreContacto").value = data.nombreContacto;
            document.querySelector("#email").value = data.email;

            // Cargar teléfono principal
            const telefonoInput = document.querySelector("#telefono");
            telefonoInput.value = data.telefonos.length > 0 ? data.telefonos[0].nroTelefono : "";
            telefonoInput.dataset.id = data.telefonos.length > 0 ? data.telefonos[0].telefonoContactoId : 0;

            // Cargar teléfonos adicionales
            const phoneList = document.getElementById("phone-list");
            phoneList.innerHTML = ""; // Limpiar teléfonos previos
            if (data.telefonos.length > 1) {
                data.telefonos.slice(1).forEach((telefono, index) => {
                    phoneList.innerHTML += createPhoneElement(index, telefono.nroTelefono, telefono.telefonoContactoId);
                });
            }

            // Cargar direcciones
            const addressList = document.getElementById("address-list");
            addressList.innerHTML = ""; // Limpiar direcciones previas
            data.direcciones.forEach(direccion => {
                const inputGroup = document.createElement("div");
                inputGroup.classList.add("input-group", "mb-2");
                inputGroup.innerHTML = `
                    <input type="text" class="form-control address" value="${direccion}" placeholder="Ingrese una dirección">
                    <div class="input-group-append">
                        <button class="btn btn-danger" onclick="removeAddress(this)">Eliminar</button>
                    </div>
                `;
                addressList.appendChild(inputGroup);
            });

            // Cargar imagen
            const miniatura = document.getElementById("miniatura");
            const imageIdInput = document.getElementById("imageId");
            if (data.imagenId && data.imagenId > 0) {
                miniatura.src = `api/image/${data.imagenId}`;
                imageIdInput.value = data.imagenId;
            } else {
                miniatura.src = "img/User-icon.png"; // Imagen predeterminada
                imageIdInput.value = 0;
            }
        })
        .catch(error => {
            console.error("Error al cargar el contacto:", error);
            alert("Hubo un problema al cargar los datos del contacto.");
        });
}



function saveContact() {
    const contactoId = parseInt(document.querySelector("#contactoId").value, 10) || 0; // Convertimos a número
    const nombre = document.querySelector("#nombreContacto").value.trim();
    const email = document.querySelector("#email").value.trim();
    const imageId = parseInt(document.querySelector("#imageId").value, 10) || 0;

    const telefonos = Array.from(document.querySelectorAll(".telephone")).map(telefono => ({
        nroTelefono: telefono.value.trim(),
        telefonoContactoId: parseInt(telefono.dataset.id, 10) || 0,
    }));
    const direcciones = Array.from(document.querySelectorAll(".address")).map(direccion => direccion.value.trim());

    const usuario = JSON.parse(localStorage.getItem("userInSession"));
    const contacto = {
        contactoId, // Enviamos correctamente el ID
        usuarioId: usuario.usuarioId,
        nombreContacto: nombre,
        email: email,
        telefonos,
        direcciones,
        imagenId: imageId,
    };

    const method = contactoId === 0 ? "POST" : "PUT"; // POST para crear, PUT para actualizar
    fetch('api/contacto', {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(contacto),
    })
        .then(response => response.json())
        .then(data => {
            if (!data) {
                alert("Error al guardar el contacto.");
                return;
            }
            window.location.href = "index.html";
        })
        .catch(error => {
            console.error("Error al guardar el contacto:", error);
            alert("Hubo un problema al guardar el contacto.");
        });
}






function obtenerDirecciones() {
    return Array.from(document.querySelectorAll('.direccion'))
        .map(input => input.value.trim())
        .filter(value => value !== ""); // Ignorar direcciones vacías
}


function addPhone() {
    let phones = [...document.querySelectorAll(".extra-phone")];
    const phoneNumbers = phones.map(e => e.value);

    const index = phones.length;
    const element = createPhoneElement(index);
    const parent = document.querySelector("#phone-list");
    parent.innerHTML += element;
    phones = document.querySelectorAll(".extra-phone")
    for (var i in phoneNumbers) {
        phones[i].value = phoneNumbers[i];
    }
}

function removePhone(index) {
    let phones = [...document.querySelectorAll(".extra-phone")];
    const phoneNumbers = phones.map(e => { return { "value": e.value, "id": e.dataset.id } });
    phoneNumbers.splice(index, 1);

    let html = "";
    for (var i in phoneNumbers) {
        html += createPhoneElement(i, phoneNumbers[i].value, phoneNumbers[i].id);
    }

    document.querySelector("#phone-list").innerHTML = html;
}

function createPhoneElement(index, value = "", id = 0) {
    return `<div class="mt-3">
                <div class="input-group">
                    <input type="text" class="form-control telephone extra-phone" value="${ value }" data-id="${ id }">
                    <div class="input-group-append">
                        <span class="input-group-text pointer" onclick="removePhone(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </span>
                    </div>
                </div>
                <div class="text-danger validation" style="display: none">
                    El número de teléfono es requerido
                </div>
            </div>`
}

function uploadImage() {
    var input = document.querySelector("#imageUploader");

    var data = new FormData()
    data.append('file', input.files[0])

    fetch('api/image', {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then((imageId) => {
        document.getElementById("imageId").value = imageId;
        document.getElementById("miniatura").src = "api/image/" + imageId;
    });
}

function isEmailValid(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


document.getElementById('agregar-direccion').addEventListener('click', () => {
    const container = document.getElementById('direcciones-container');
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('form-floating', 'mt-2');
    inputGroup.innerHTML = `
        <input type="text" class="form-control direccion" placeholder="Dirección">
        <label>Dirección</label>
    `;
    container.appendChild(inputGroup);
});

// Recopilar direcciones para enviar al backend
function obtenerDirecciones() {
    return Array.from(document.querySelectorAll('.direccion')).map(input => input.value);
}

function removeAddress(button) {
    const inputGroup = button.parentElement.parentElement;
    inputGroup.remove();
}

