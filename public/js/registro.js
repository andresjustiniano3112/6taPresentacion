document.getElementById("btn-register").addEventListener("click", async () => {
    const fullName = document.getElementById("inputFullName").value.trim();
    const username = document.getElementById("inputUsername").value.trim();
    const password = document.getElementById("inputPassword").value.trim();
    const fileInput = document.getElementById("imageUploader");

    const msgError = document.getElementById("msg-error");
    msgError.style.display = "none";

    // Validaciones básicas
    if (!fullName || !username || !password) {
        msgError.textContent = "Todos los campos son obligatorios";
        msgError.style.display = "block";
        return;
    }

    // Preparar datos para enviar
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("password", password);
    if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
    }

    try {
        // Enviar datos al backend
        const response = await fetch("api/usuario/register", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Error en el registro");
        }

        alert("Usuario registrado exitosamente");
        window.location.href = "login.html";
    } catch (error) {
        msgError.textContent = "Error al registrar el usuario";
        msgError.style.display = "block";
    }
});
