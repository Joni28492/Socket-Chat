const url = window.location.hostname.includes("localhost")
  ? "http://localhost:8080/api/auth/"
  : "https://restserver-curso-node-joni.herokuapp.com/api/auth/";

let usuario = null;
let socket = null;

//Referencias HTML
const txtUid = document.querySelector("#txtUid");
const txtMensaje = document.querySelector("#txtMensaje");
const ulUsuarios = document.querySelector("#ulUsuarios");
const ulMensajes = document.querySelector("#ulMensajes");
const btnSalir = document.querySelector("#btnSalir");

//validar el token del local storage
const validarJWT = async () => {
  const token = localStorage.getItem("token") || "";
  if (token <= 10) {
    window.location = "index.html";
    throw new Error("No hay token en la peticion");
  }

  const resp = await fetch(url, {
    headers: { "x-token": token },
  });

  const { usuario: userDB, token: tokenDB } = await resp.json();
  console.log(userDB, tokenDB);
  localStorage.setItem("token", tokenDB);
  usuario = userDB;
  document.title = usuario.nombre;

  await conectarSocket();
};

const conectarSocket = async () => {
  //reutilizamos la global
  socket = io({
    extraHeaders: {
      "x-token": localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("Sockets Online");
  });
  socket.on("disconnect", () => {
    console.log("Sockets Offline");
  });

  socket.on("recibir-mensajes", dibujarMensajes);
  socket.on("usuarios-activos", dibujarUsuarios);

  socket.on("mensaje-privado", (payload) => {
    console.log("Privado: ", payload);
  });
};

const dibujarUsuarios = (usuarios = []) => {
  let usersHtml = "";
  usuarios.forEach(({ nombre, uid }) => {
    usersHtml += `
      <li>
        <p>
          <h5 class="text-success">${nombre}</h5>
          <span class="fs-6 text-muted">${uid}</span>
        </p>
      </li>
    `;
  });

  ulUsuarios.innerHTML = usersHtml;
};

const dibujarMensajes = (mensajes = []) => {
  let mensajesHtml = "";
  mensajes.forEach(({ nombre, mensaje }) => {
    mensajesHtml += `
      <li>
        <p>
          <span class="text-primary">${nombre}: </span>
          <span>${mensaje}</span>
        </p>
      </li>
    `;
  });

  ulMensajes.innerHTML = mensajesHtml;
};

txtMensaje.addEventListener("keyup", ({ keyCode }) => {
  const mensaje = txtMensaje.value.trim();
  const uid = txtUid.value.trim();

  if (keyCode !== 13) {
    return;
  }
  if (mensaje.length === 0) {
    return;
  }

  socket.emit("enviar-mensaje", { mensaje, uid });

  txtMensaje.value = "";
});

const main = async () => {
  await validarJWT();
};

main();

//const socket = io();
