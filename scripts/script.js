let nameUser;
let mensagens = [];
let contatoSelecionado;
let visibilidadeSelecionada;
let idManterConexao;
let idBuscarMensagens;
let idBuscarParticipantes;
let arrayParticipantes = [];
const elementoInputMensagem = document.querySelector("input");
const telaDeEntrada = document.querySelector(".tela-de-entrada");
const inputEntrada = document.querySelector(".tela-de-entrada > input");
const buttonEntrada = document.querySelector(".tela-de-entrada > button"); 
const imgEntrada = document.querySelector(".img-carregando");
const textEntrada = document.querySelector(".tela-de-entrada > p");

function entrarNaSala() {
    
    const name = {
        name: nameUser
    }

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", name);
    promise.then(tratarSucessoEnviarNome);
    promise.catch(tratarErroEnviarNome);
}

function tratarSucessoEnviarNome (response) {
    
    if (response.status === 200) {
        telaDeEntrada.classList.add("ocultar");        
        inputEntrada.classList.remove("ocultar");
        buttonEntrada.classList.remove("ocultar");
        imgEntrada.classList.add("ocultar");
        textEntrada.classList.add("ocultar");

        idManterConexao = setInterval(manterConexao, 4000);
        idBuscarMensagens = setInterval(buscarMensagens, 3000);
        idBuscarParticipantes = setInterval(buscarParticipantes, 10000);
        alterarDestinatarioEVisibilidade();
        buscarMensagens();
        buscarParticipantes();
    }
}

function tratarErroEnviarNome(error) {
    
    if(error.response.status === 400) {
        alert(`Já existe um(a) usuário(a) online com o nome ${nameUser}! Digite outro nome.`);
        imgEntrada.classList.add("ocultar");
        textEntrada.classList.add("ocultar");
        inputEntrada.classList.remove("ocultar");
        buttonEntrada.classList.remove("ocultar");
    }
}

function manterConexao() {
    
    const name = {
        name: nameUser
    }

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", name);
    promise.catch(erroManterConexao);
}

function erroManterConexao() {
    alert("Sua conexão caiu e você não está mais online! Se quiser continuar no chat, entre novamente.");
    telaDeEntrada.classList.remove("ocultar");
    clearInterval(idManterConexao);
    clearInterval(idBuscarMensagens);
    clearInterval(idBuscarParticipantes);
}

function buscarMensagens() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(armazenarMensagens);
}

function armazenarMensagens(response) {
    mensagens = response.data;
    renderizarMensagens(mensagens);
}

function renderizarMensagens(arrayMensagens) {
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

function buscarParticipantes() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(sucessoBuscarPartcipantes);
}

function sucessoBuscarPartcipantes(response) {

    if(response.status === 200) {
        arrayParticipantes = response.data;
        renderizarParticipantes(arrayParticipantes);
    }
}

function renderizarParticipantes(participantes) {
    const elemento = document.querySelector(".contatos-dinamico");
    elemento.innerHTML = "";

    for(let j = 0; j < participantes.length; j++) {
        const nomeUsuarioDiferente = participantes[j].name !== nameUser;
        const contatoDiferenteDoSelecionado = participantes[j].name !== contatoSelecionado;

        if(nomeUsuarioDiferente && contatoDiferenteDoSelecionado) {
            elemento.innerHTML += `
            <div class="contato" onclick="selecionarContato(this)">
                <ion-icon name="person-circle-sharp" class="ion-icon-usuario"></ion-icon>
                <p class="texto-menu-lateral">${participantes[j].name}</p>
                <img src="./images/check.svg" alt="Selecionado"/>
            </div>
            `;
        } else if(nomeUsuarioDiferente && !contatoDiferenteDoSelecionado) {
            elemento.innerHTML += `
            <div class="contato selecionar" onclick="selecionarContato(this)">
                <ion-icon name="person-circle-sharp" class="ion-icon-usuario"></ion-icon>
                <p class="texto-menu-lateral">${participantes[j].name}</p>
                <img src="./images/check.svg" alt="Selecionado"/>
            </div>
            `;
        }
    }
    alterarDestinatarioEVisibilidade();
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

    if((objetoMensagem.to === nameUser) || (objetoMensagem.to === "Todos") || (objetoMensagem.from === nameUser)) {
        const elemento = document.querySelector(".content");
        const templateParticular = `
            <div class="box reserved-message">
                <p class="text-message"><span class="color-gray">(${objetoMensagem.time})</span> <span>${objetoMensagem.from}</span> reservadamente para <span>${objetoMensagem.to}</span>: ${objetoMensagem.text}</p>
            </div>
        `; 
    
        elemento.innerHTML += templateParticular;
    }
}

function rolarProFinal() {
    const elemento = document.querySelector(".box:last-child");
    elemento.scrollIntoView();
}

function enviarMensagem() {
    const mensagemNaoVazia = elementoInputMensagem.value !== "";
    let tipoMensagem;

    if(visibilidadeSelecionada === "público") {
        tipoMensagem = "message";
    } else {
        tipoMensagem = "private_message";
    }
    
    if(mensagemNaoVazia) {

        const mensagem = {
            from: nameUser,
            to: contatoSelecionado, 
            text: elementoInputMensagem.value,
            type: tipoMensagem 
        } 
    
        const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagem);
        promise.then(sucessoEnviarMensagem);
        promise.catch(erroEnviarMensagem);
    }
}

function sucessoEnviarMensagem() {
    elementoInputMensagem.value = "";
    buscarMensagens();
}

function erroEnviarMensagem() {
    alert("Você não está mais na sala, portanto, a página será recarregada!");
    elementoInputMensagem.value = "";
    window.location.reload();
} 

elementoInputMensagem.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if(keyName === "Enter") {
        enviarMensagem();
    }
});

function abrirMenuLateral() {
    const elemento = document.querySelector(".opcoes");
    elemento.classList.remove("ocultar");
}

function fecharMenuLateral() {
    const elemento = document.querySelector(".opcoes");
    elemento.classList.add("ocultar");
}

function selecionarContato(el) {
    const contatos = document.querySelector(".contatos");
    const selecionado = contatos.querySelector(".selecionar");
    
    if(selecionado) {
        selecionado.classList.remove("selecionar");
    }

    el.classList.add("selecionar");    
    alterarDestinatarioEVisibilidade();
}

function selecionarVisibilidade(el) {
    const visibilidades = document.querySelector(".visibilidades");
    const selecionado = visibilidades.querySelector(".selecionar");

    if(selecionado) {
        selecionado.classList.remove("selecionar");
    }

    el.classList.add("selecionar");
    alterarDestinatarioEVisibilidade();
}

function alterarDestinatarioEVisibilidade() {
    const destinatarioInput = document.querySelector(".bottom h6");
    const contatos = document.querySelector(".contatos");
    const contato = contatos.querySelector(".selecionar");

    if(contato !== null) {
        contatoSelecionado = contato.querySelector("p").innerHTML;    
    } else {
        contatoSelecionado = "Todos";
        document.querySelector(".ion-icon-todos").parentNode.classList.add("selecionar");
    }

    const visibilidades = document.querySelector(".visibilidades");
    const visibilidade = visibilidades.querySelector(".selecionar");
    visibilidadeSelecionada = visibilidade.querySelector("p").innerHTML;
    visibilidadeSelecionada = visibilidadeSelecionada.toLowerCase();

    destinatarioInput.innerHTML = `Enviando para ${contatoSelecionado} (${visibilidadeSelecionada})`;
}

function carregarEntradaNaSala() {

    nameUser = inputEntrada.value;

    if(nameUser === "") {
        alert("Entrada inválida! Digite um nome.");
    } else {
        inputEntrada.classList.add("ocultar");
        buttonEntrada.classList.add("ocultar");
        imgEntrada.classList.remove("ocultar");
        textEntrada.classList.remove("ocultar");
        inputEntrada.value = "";
        entrarNaSala();
    }
}

inputEntrada.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if(keyName === "Enter") {
        carregarEntradaNaSala();
    }
});