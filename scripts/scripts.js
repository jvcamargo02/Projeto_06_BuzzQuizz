const API_URL = "https://mock-api.driven.com.br/api/v6/buzzquizz/"
// criei uma função para zerar a tela, pra reaproveitar código e ficar mais bonito
// também isso nos tira o trabalho de ter que ficar mudando z-index e outros indicadores de profundidade do css

function eraseContent() {
    document.querySelector("main").innerHTML = "";
}

function loadHeader() {
    // injetar a classe css junto, quando hovuer
    document.querySelector("body").innerHTML =
        `
        <header>
            BuzzQuizz
        </header>
    `
    loadQuizz();
}

function loadQuizz() {
    document.querySelector("body").innerHTML +=
        `
        <main>
        </main>
    `
    createMenu();

}

function createMenu() {
    const hasQuizz = userQuizzes()
    // aqui retorna true ou false. Então, dependendo da resposta, habilita um estilo no menu ou outro. o HTML vai ser o mesmo
    document.querySelector("main").innerHTML +=
        `
    <div class="user-quizzes">
        
    </div>
    <div class="list-quizzes">
    Liste todos os Quizzes
        <ul class="list">
        </ul>
     </div>

    `
    // quizz-button-big e quizz-button-small são os estilos a serem selecionados, 
    // ou então só escreve um deles e não o outro
    // como ficar melhor, qualquer coisa é só trocar a lógica um pouco :p

    // chama uma função aqui pra carregar todos os quizzes do usuário na thumb-box
    // thumb-box de thumbnail + vou deixar a função comentada pra depois

    fillUserQuizz()
    listQuizzes()
}

function userQuizzes() {

}

function createQuizz() {
    eraseContent();
    createScreenOne();
}


// https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
// tem que adicionar isso aqui no estilo pra não aparecer umas setinhas na lateral
// dos campos em que vão números
function createScreenOne() {
    document.querySelector("main").innerHTML +=
        `
    <div class="createQuizzPage">
        <h2 class="instructions">
            Comece pelo começo
        </h2>
        <form>
            <div class="quizz-info">
                <input placeholder="Título do seu quizz" type="text" name="" id="" required="required" >
                <input placeholder="URL da imagem do seu quizz" type="url" name="" id="" required="required">
                <input placeholder="Quantidade de perguntas do quizz" type="number" name="" id="" min="3" required="required">
                <input placeholder="Quantidade de níveis do quizz" type="number" name="" id="" min="2" required="required">
            </div>
            <input type="submit" onclick="createScreenTwo(form)" class="next-button" value="Prosseguir para criar perguntas">
        </form>
    </div>
    `
    // document.querySelector("input[type='number']") usar isso aqui para selecionar os campos numéricos, talvez?
}

function createScreenTwo(formData) {
    console.log("hi")
    const quizzTitle = formData.querySelector("input[type='text']").value
    const quizzImg = formData.querySelector("input[type='url']").value
    // validar os dados antes de prosseguir, planejar isso depois
    const questions = []
    const quizzForm = {
        title: quizzTitle,
        image: quizzImg,
        questions: questions
    };

    eraseContent();


}

function listQuizzes (){
    const promisse = axios.get(API_URL + "/quizzes")
    promisse.then(printQuizzes)

}

function fillUserQuizz(){
    const userQuizzes = document.querySelector(".user-quizzes")


        if(localStorage.length === 0 ){

            userQuizzes.innerHTML = `
            <div class="thumb-box">
                <div class="quizz-button-big">
                    <span>
                        Você não criou nenhum quizz ainda :(
                    </span>
                    <button onclick="createQuizz()">
                        Criar Quizz
                    </button>
                </div>
            </div>
            `
        } else {
            userQuizzes.innerHTML += `
        <span class="quizz-button-small">
            Seus Quizzes
            <ion-icon onclick="createQuizz()" name="add-circle" alt="Criar Quizz"></ion-icon>
        </span>
            <ul class="userQuizzesList">
                <li class="user-quizz">
                    <img class="quizImg" src="../images/Rectangle\ 35.png" alt="">
                    <h4 class="quizz-title">Titulo Teste</h4> 
                </li>
            </ul>`
        }      
}

function printQuizzes (promisse) {
    
    const quizzArr = promisse.data
    const listAllQuizzesDOM = document.querySelector(".list")
    console.log(quizzArr)
    
    for(let i = 0; i < quizzArr.length; i++){
        listAllQuizzesDOM.innerHTML += ` 
        
        <li class="user-quizz">
            <img class="quizImg" src="${quizzArr[i].image}" alt="">
            <h4 class="quizz-title">${quizzArr[i].title}</h4> 
        </li>`
    }
    
}

loadHeader();
