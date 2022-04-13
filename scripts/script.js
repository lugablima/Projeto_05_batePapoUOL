let nameUser;
let mensagens = [];
let idManterConexao;
let idBuscarMensagens;
entrarNaSala();

function entrarNaSala() {
    nameUser = prompt("Qual é o seu nome?");

    const name = {
        name: nameUser
    }

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", name);
    console.log("mandei");
    promise.then(tratarSucessoEnviarNome);
    promise.catch(tratarErroEnviarNome);
}

function tratarSucessoEnviarNome (response) {
    if (response.status === 200) {
        console.log("entrei em tratar sucesso!");
        idManterConexao = setInterval(manterConexao, 4000);
        idBuscarMensagens = setInterval(buscarMensagens, 3000);
    }
}

function tratarErroEnviarNome(error) {
    console.log(error);
    if(error.response.status === 400) {
        alert(`O(a) ${nameUser} já está online! Digite outro nome.`);
        window.location.reload();
    }
}

function manterConexao() {
    const name = {
        name: nameUser
    }

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", name);
    console.log("consegui mandar o post de manter conexão!");
    promise.catch(function () {
        alert("Você não está mais online! Se quiser continuar no chat, entre novamente.");
        // clearInterval(idManterConexao);
        // clearInterval(idBuscarMensagens);
        window.location.reload();
    })
}

function buscarMensagens() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    console.log("consegui requisitar pra pegar as mensagens!");
    promise.then(armazenarMensagens);
}

function armazenarMensagens(response) {
    console.log("entrei em armazenarMensagens!");
    //console.log(response);
    mensagens = response.data;
    renderizarMensagens(mensagens);
}

function renderizarMensagens(arrayMensagens) {
    console.log("entrei em renderizarMensagens");
    const elemento = document.querySelector(".content");
    elemento.innerHTML = "";

    for(let i = 0; i < arrayMensagens.length; i++) {
        if(arrayMensagens[i].type === "status") {
            mensagemStatus(arrayMensagens[i]);
        } else if(arrayMensagens[i].type === "message") {
            mensagemPublica(arrayMensagens[i]);
        } else if(arrayMensagens[i].type === "private_message") {
            mensagemParticular(arrayMensagens[i]);
        }
    }
    rolarProFinal();
}

function mensagemStatus(objetoMensagem) {
    const elemento = document.querySelector(".content");
    const templateStatus = `
        <div class="box status">
            <p class="text-message"><span class="color-gray">(${objetoMensagem.time})</span> <span>${objetoMensagem.from}</span> ${objetoMensagem.text}</p>
        </div>
    `; 

    elemento.innerHTML += templateStatus;
}

function mensagemPublica(objetoMensagem) {
    const elemento = document.querySelector(".content");
    const templatePublica = `
        <div class="box normal-message">
            <p class="text-message"><span class="color-gray">(${objetoMensagem.time})</span> <span>${objetoMensagem.from}</span> para <span>${objetoMensagem.to}</span>: ${objetoMensagem.text}</p>
        </div>
    `; 

    elemento.innerHTML += templatePublica;
}

function mensagemParticular(objetoMensagem) {
    const elemento = document.querySelector(".content");
    const templateParticular = `
        <div class="box reserved-message">
            <p class="text-message"><span class="color-gray">(${objetoMensagem.time})</span> <span>${objetoMensagem.from}</span> reservadamente para <span>${objetoMensagem.to}</span>: ${objetoMensagem.text}</p>
        </div>
    `; 

    elemento.innerHTML += templateParticular;
}

function rolarProFinal() {
    const elemento = document.querySelector(".box:last-child");
    elemento.scrollIntoView();
}

function enviarMensagem() {
    const elemento = document.querySelector("input");

    const mensagem = {
        from: nameUser,
        to: "Todos", //lembrar de alterar depois
        text: elemento.value,
        type: "message" //"private_message" para o bônus
    } 

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagem)
    promise.then(function () {
        elemento.value = "";
        buscarMensagens
    });
    promise.catch(function () {
        alert("Você não está mais na sala, portanto, a página será recarregada!");
        window.location.reload();
    })
}

