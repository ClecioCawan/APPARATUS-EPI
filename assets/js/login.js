const email = document.getElementById("email");
const password = document.getElementById("password");
const form = document.getElementById("form");

function verificarInputs() {
  if (email.value != "" && password.value !== "") {
    window.location.href = "index.html";
  } else {
    alert("Preencha ambos os campos corretamente");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  verificarInputs();
});
