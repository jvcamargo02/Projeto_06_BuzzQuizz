const API_URL = "https://mock-api.driven.com.br/api/v6/buzzquizz/"
const quizzAnswers = [];
const questions = [];
const levels = [];
const LAST_PAGE_INDEX = 2;
const MAX_QUESTIONS = 4;
const quizzForm = {
    title: '',
    image: '',
    questions: [],
    levels: []
};
const userQuizzList = [];
let toEdit = {
    title: '',
    image: '',
    questions: [],
    levels: []
};
let pageNum = 0;
let questionsNum;
let levelsNum;
let data;
let quizzId;
let acertos = 0
let respondidas = 0
let teste;


// criei uma função para zerar a tela, pra reaproveitar código e ficar mais bonito
// também isso nos tira o trabalho de ter que ficar mudando z-index e outros indicadores de profundidade do css

function eraseContent() {
    document.querySelector("main").innerHTML = "";
    window.scrollTo(0,0)
}

function loadHeader() {
    // injetar a classe css junto, quando hovuer
    document.querySelector("body").innerHTML =
    `
        <header>
            <div class="top">
                <h1 onclick="loadHeader()">BuzzQuizz</h1>
            </div>
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
    document.querySelector("main").innerHTML =
    `
    <div class="user-quizzes">
        
    </div>
    <div class="list-quizzes">
    Lista de todos os Quizzes
        <ul class="list">
        </ul>
    </div>

    `
    // quizz-button-big e quizz-button-small são os estilos a serem selecionados, 
    // ou então só escreve um deles e não o outro
    // como ficar melhor, qualquer coisa é só trocar a lógica um pouco :p

    // chama uma função aqui pra carregar todos os quizzes do usuário na thumb-box
    // thumb-box de thumbnail + vou deixar a função comentada pra depois

    fillUserQuizz();
    listQuizzes();
}

function userQuizzes() {

}

function createQuizz() {
    eraseContent();
    createScreenOne();
}

function isNotEmpty(array) {
    if (array.length === 0)
        return false;
    return true;
}

function emptyArray(array) {
    array.splice(0, array.length);
}

function parseData(formData) {
    if (formData.get("quizz") !== null) {
        quizzForm.title = formData.get("quizz")
        quizzForm.image = formData.get("quizz_url")
        formData.delete("quizz")
        formData.delete("quizz_url")
    }
    let i = 0;
    let j = 0;
    for (let pair of formData.entries()) {
        switch (pair[0]) {
            case `title0${j+1}`:
                questions.push({
                    title: pair[1],
                    color: formData.get(`${pair[0]}_color`)
                })
                questions[j].answers = []
                break;
            case `right0${j+1}`:
                quizzAnswers.push({
                    text: pair[1],
                    image: formData.get(`${pair[0]}_url`),
                    isCorrectAnswer: true
                })
                break;
            case `wrong_0${j+1}_0${i+1}`:
                if (isNotEmpty(pair[1])) {
                    quizzAnswers.push({
                        text: pair[1],
                        image: formData.get(`${pair[0]}_url`),
                        isCorrectAnswer: false
                    })
                }
                i++;
                if ((i+1) === MAX_QUESTIONS) {
                    Object.assign(questions[j].answers, quizzAnswers)
                    emptyArray(quizzAnswers)
                    j++;
                    i = 0;
                }
                break;
            case "questions":
                questionsNum = Number(pair[1])
                break;
            case "levels":
                levelsNum = Number(pair[1])
                break;
        }
    }
    if (pageNum === 0) {
        pageNum++;
        createScreenTwo(questionsNum);
    } else {
        pageNum++;
        createScreenThree(levelsNum)
    }
}

function postQuizz() {
    const editMode = isNotEmpty(toEdit.questions)
    Object.assign(quizzForm.questions, questions);
    Object.assign(quizzForm.levels, levels);
    if(!editMode) {
        const promise = axios.post(API_URL+"quizzes", quizzForm)
        promise.then((response) => {
            const responseString = JSON.stringify(response.data)
            const responseKey = response.data.key.toString();
            localStorage.setItem(responseKey, responseString);
        });
        promise.catch((code) => {
            alert(`Erro ao enviar o quizz.\nCódigo ${code.response.status}.\nMais detalhes: ${code.response}`)
        });    
    } else {
        const quizzID = toEdit.id.toString()
        console.log(quizzForm, toEdit.key, quizzID)
        const promise = axios.put(API_URL+`quizzes/${quizzID}`, quizzForm, { headers: { "Secret-Key": toEdit.key } })
        promise.then((response) => {
            const responseString = JSON.stringify(response.data)
            const responseKey = response.data.key.toString();
            localStorage.setItem(responseKey, responseString);
        });
        promise.catch((code) => {
            alert(`Erro ao enviar o quizz.\nCódigo ${code.response.status}.\nMais detalhes: ${code.response}`)
        });
    }
    createScreenFour();
}

function parseLevels(formData) {
    let i = 0;
    do {
        levels.push({
            title: formData.get(`title0${i + 1}`),
            image: formData.get(`image0${i + 1}`),
            text: formData.get(`text0${i + 1}`),
            minValue: Number(formData.get(`lvl_percent0${i + 1}`))
        });
        i++;
    } while (i < levelsNum)
    postQuizz();
}

function handleData(submitEvent) {
    submitEvent.preventDefault();
    const data = new FormData(document.querySelector("form"))
    if (pageNum === LAST_PAGE_INDEX) {
        parseLevels(data);
        return;
    }
    parseData(data)
}

function setEventListener() {
    const pageForm = document.querySelector("form")
    pageForm.addEventListener("submit", handleData)
}

// estilizar
// https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
// tem que adicionar isso aqui no estilo pra não aparecer umas setinhas na lateral
// dos campos em que vão números
function createScreenOne() {
    // <div class="createQuizzPage">
    // </div>
    const editMode = isNotEmpty(toEdit.questions)
    document.querySelector("main").innerHTML +=
    `
        <h1 class="forms-header">
            Comece pelo começo
        </h1>
        <form class="question-body">
        <div class="quizz-info">
        <input placeholder="Título do seu quizz" type="text" name="quizz" minlength="20" required="required" value="${editMode ? toEdit.title : ""}">
                <input placeholder="URL da imagem do seu quizz" type="url" name="quizz_url" required="required" value="${editMode ? toEdit.image : ""}">
                <input placeholder="Quantidade de perguntas do quizz" type="number" name="questions" min="3" required="required" value="${editMode ? toEdit.questions.length : ""}">
                <input placeholder="Quantidade de níveis do quizz" type="number" name="levels" min="2" required="required" value="${editMode ? toEdit.levels.length : ""}">
            </div>
            <input type="submit" class="next-button" value="Prosseguir para criar perguntas">
        </form>
    `

    setEventListener();
    // document.querySelector("input[type='number']") usar isso aqui para selecionar os campos numéricos, talvez?
}
// estilizar

// estilizar
function createScreenTwo(questionsNum) {
    eraseContent();
    const editMode = isNotEmpty(toEdit.questions)
    document.querySelector("main").innerHTML +=
    `
        <h1 class="forms-header">
            Crie suas perguntas
        </h1>
        <form class="question-body">
        
        </form>
    `;
    let editQuantity = 0;
    const formBody = document.querySelector("form");
    for (let i = 0; i < questionsNum; i++) {
        if(editMode) {
            editQuantity = toEdit.questions[i].answers.length;
        }
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        // estudar como implementar um jeito bacana de escolher uma cor.
        formBody.innerHTML +=
        `
        <div>
            <span>
                <h2 class="quizz-context">
                    Pergunta ${i + 1}
                    <ion-icon onclick="show()" name="create-outline"></ion-icon>
                </h2>
            </span>
            <input type="text" name="title0${i + 1}" placeholder="Texto da pergunta" required="required" value="${editMode ? toEdit.questions[i].title : ""}">
            <input type="color" name="title0${i + 1}_color" placeholder="Cor de fundo da pergunta" required="required" value="${editMode ? toEdit.questions[i].color : ""}">

            <h2 class="quizz-context">Resposta correta</h2>
            <input type="text" name="right0${i + 1}" placeholder="Resposta correta" required="required" value="${editMode ? toEdit.questions[i].answers[0].text : ""}">
            <input type="url" name="right0${i + 1}_url" placeholder="URL da imagem" required="required" value="${editMode ? toEdit.questions[i].answers[0].image : ""}">

            <h2 class="quizz-context">Respostas incorretas</h2>
            <input type="text" name="wrong_0${i + 1}_01" placeholder="Resposta incorreta 1" required="required" value="${editMode ? toEdit.questions[i].answers[1].text : ""}">
            <input type="url" name="wrong_0${i + 1}_01_url" placeholder="URL da imagem 1" required="required" value="${editMode ? toEdit.questions[i].answers[1].image : ""}">
            <input type="text" name="wrong_0${i + 1}_02" placeholder="Resposta incorreta 2" value="${(editMode && editQuantity >= 3) ? toEdit.questions[i].answers[2].text : ""}">
            <input type="url" name="wrong_0${i + 1}_02_url" placeholder="URL da imagem 2" value="${(editMode && editQuantity >= 3) ? toEdit.questions[i].answers[2].image : ""}">
            <input type="text" name="wrong_0${i + 1}_03" placeholder="Resposta incorreta 3"value="${(editMode && editQuantity >= 4) ? toEdit.questions[i].answers[3].text : ""}">
            <input type="url" name="wrong_0${i + 1}_03_url" placeholder="URL da imagem 3" value="${(editMode && editQuantity >= 4) ? toEdit.questions[i].answers[3].image : ""}">
        </div>            
        `
    }

    formBody.innerHTML +=
    `
        <input type="submit" class="next-button" value="Prosseguir para criar níveis">
    `
    setEventListener();
    // vou ter que passar os niveis como parametro pra poder chamar no fim da função e evitar pepinos
    // createQuestionLevels()
    // validar os dados antes de prosseguir, planejar isso depois
    // const questions = []
}
// estilizar

// estilizar
function createScreenThree(levels) {
    const levelsNum = levels;
    const levelsArray = calculateLevels(levelsNum)
    eraseContent();
    document.querySelector("main").innerHTML +=
    `
        <h1 class="forms-header">
            Agora, decida os níveis
        </h1>
        <form class="question-body">
        
        </form>
    `;

    const formBody = document.querySelector("form");
    const editMode = isNotEmpty(toEdit.questions)
    for (let i = 0; i < levelsNum; i++) {
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        
        formBody.innerHTML +=
        `
            <div  class="quizz-info">
                <span onclick="hiddenInput(this)" class="cursor">
                    <h2 class="quizz-context levelPage">
                        Nível ${i + 1}
                        <ion-icon name="create-outline"></ion-icon>
                    </h2>
                </span>
                <input class="hidden" type="text" name="title0${i + 1}" placeholder="Título do nível" required="required" value="${editMode ? toEdit.levels[i].title : ""}">
                <input class="hidden"
                    type="number" name="lvl_percent0${i + 1}" placeholder="% de acerto mínima (sem o %)" 
                    min="${levelsArray[i]}" value="${levelsArray[i]}" 
                    value="${editMode ? toEdit.levels[i].minValue : ""}"
                required="required">
                <input class="hidden" type="url" name="image0${i + 1}" placeholder="URL da imagem do nível" required="required" value="${editMode ? toEdit.levels[i].image : ""}">
                <input class="hidden" type="text" name="text0${i + 1}" placeholder="Descrição do nível" minlength="30" required="required" value="${editMode ? toEdit.levels[i].text : ""}">
            </div>            
        `
    }
    formBody.innerHTML +=
    `
        <input type="submit" class="next-button" value="${editMode ? "Editar quizz" : "Finalizar Quizz"}">
    `
    setEventListener();
}
// estilizar

// estilizar
function createScreenFour() {
    eraseContent();
    const editMode = isNotEmpty(toEdit.questions)
    document.querySelector("main").innerHTML +=
    `
        <div class="successScreen">
            <h1 class="forms-header" >${editMode ? "Seu quizz foi editado!" : "Seu quizz está pronto!"}</h1>
            <div class="successDiv">
                <img class="marginSuccess" src="${quizzForm.image}" alt="Imagem do quizz criado por você">
                <h4 class="quizz-title">${quizzForm.title}</h4>
            </div>
            <input class="restartQuizz" onclick="accessNewQuizz()" value="Acessar Quizz">
            <input class="backToHome" onclick="createMenu()" value="Voltar para home">
        </div>
    `
    emptyArray(questions);
    emptyArray(levels);
}
// estilizar

function accessNewQuizz() {
    const newQuizzToObject = JSON.parse(localStorage.getItem(localStorage.key(localStorage.length-1)))
    const quizzId = newQuizzToObject.id;
    searchQuizz(quizzId);
}

function calculateLevels(num) {
    let percentageArray = []
    const step = Math.round(100 / num)
    for (let i = 0; i < num; i++) {
        percentageArray.push(step * i)
    }
    console.log(percentageArray)
    return percentageArray
}

function listQuizzes() {
    const promisse = axios.get(API_URL + "/quizzes")
    promisse.then(printQuizzes)

}

function quizzToObject() {
    for(let i = 0; i < localStorage.length; i++) {
        let quizzString = localStorage.getItem(localStorage.key(i))
        userQuizzList.push(JSON.parse(quizzString))
    }
}

function confirmDelete() {
    let userResponse = prompt("Tem certeza que deseja apagar este quizz?\nEscreva 'sim' para confirmar");
    userResponse = userResponse.toLowerCase();
    if(userResponse === "sim")
        return true
    return false;
}

function editQuizz(index) {
    toEdit = Object.assign(toEdit, userQuizzList[index])
    console.log(toEdit)
    eraseContent();
    createScreenOne();
}

function deleteQuizz(index) {
    const toDelete = userQuizzList[index]
    if (confirmDelete()) {
        console.log(toDelete.id)
        const promise = axios.delete(API_URL+`quizzes/${toDelete.id}`, { headers: { "Secret-Key": toDelete.key } })
        promise.then(() => {
            alert("O quizz foi deletado com sucesso.");
            localStorage.removeItem(toDelete.key);
        })
        promise.catch((code) => {
            alert("Houve um erro ao deletar o quizz")
            console.log(`Erro ${code.response.status}`)
        })
        eraseContent();
        fillUserQuizz();
    }
}

function fillUserQuizz() {
    const userQuizzes = document.querySelector(".user-quizzes")
    quizzToObject();


    if (localStorage.length === 0) {

        userQuizzes.innerHTML = 
        `
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
        userQuizzes.innerHTML = `
        <span class="quizz-button-small">
            Seus Quizzes
            <ion-icon onclick="createQuizz()" name="add-circle" alt="Criar Quizz"></ion-icon>
         </span> 
        <ul class="userQuizzesList">
        </ul>
       
        `
        
    const userQuizzesList = document.querySelector(".userQuizzesList")
      userQuizzesList.innerHTML = ""

        userQuizzList.forEach((quizz, index) => {
      console.log(userQuizzesList.innerHTML)

            userQuizzesList.innerHTML =
        `
                <li class="user-quizz" onclick="searchQuizz(${quizz.id})">
                    <div class="side-menu">
                        <ion-icon onclick="editQuizz(${index})"name="create-outline"></ion-icon>
                        <ion-icon onclick="deleteQuizz(${index})" name="trash-outline"></ion-icon>
                    </div>
                    <img class="quizImg" src="${quizz.image}" alt="">
                    <h4 class="quizz-title">${quizz.title}</h4> 
                </li>
        `
        })

    }
}

function printQuizzes(promisse) {

    const quizzArr = promisse.data
    const listAllQuizzesDOM = document.querySelector(".list")

    for (let i = 0; i < quizzArr.length; i++) {
        listAllQuizzesDOM.innerHTML += ` 
        
        <li onclick="searchQuizz(${quizzArr[i].id})" class="user-quizz">
            <img class="quizImg" src="${quizzArr[i].image}" alt="">
            <h4 class="quizz-title">${quizzArr[i].title}</h4> 
        </li>`
    }

}

function searchQuizz(id) {

    quizzId = id

    const promisseQuizz = axios.get(`${API_URL}quizzes/${quizzId}`)
    promisseQuizz.then(bannerQuizz)
}

function bannerQuizz (response) {  
    
    data = response.data
    const quizzTop = document.querySelector("header")   
    
    quizzTop.innerHTML += `
        <div class="quizzTop">

            <img class="thumbQuizz" src="${data.image}" alt="">
            <h4 class="quizzTitlePage">${data.title}</h4>

        </div> `

        openQuizz()
}

function openQuizz() {

    eraseContent()
    respondidas = 0
    acertos = 0

    const quizzScreen = document.querySelector("main")



    quizzScreen.innerHTML =
        `<div class="questions">
        
        </div>`

    printQuestions(data)
}

function printQuestions(data) {



    const quizzScreen = document.querySelector(".questions")



    for (let i = 0; i < data.questions.length; i++) {

        quizzScreen.innerHTML += `
        
        <div id="naoRespondida" class="question">
            <div style="background-color: ${data.questions[i].color}" class="questionTitle">
                <h4>${data.questions[i].title}</h4>
            </div>  `
        const question = document.querySelector(`.question:nth-child(${1 + i})`)
        printChoices(data, i, question)
    }



}

function printChoices(data, i, question) {

    let alternativas = []

    for (let index = 0; index < data.questions[i].answers.length; index++) {
        alternativas.push(data.questions[i].answers[index])
        alternativas.sort(comparador)
       
    }

    for (let ino = 0; ino < alternativas.length; ino++){

        if(alternativas[ino].isCorrectAnswer === false){ 

                question.innerHTML += `
                    <div onclick="opacity(this)" class="choice">
                            <img src="${alternativas[ino].image}" alt="Imagem da alternativa">
                            <h6 class="wrongAnswer defaultAnswer">${alternativas[ino].text}</h6>
                    </div>

                    `
    
        } else if (alternativas[ino].isCorrectAnswer === true) {
                    
                question.innerHTML += `
                        <div onclick="opacity(this)" class="choice">
                            <img src="${alternativas[ino].image}" alt="Imagem da alternativa">
                            <h6 class="correctAnswer defaultAnswer">${alternativas[ino].text}</h6>
                        </div>
                        ` 
        }    
    } 

}


function opacity (element) {


    const question = element.parentNode
    question.removeAttribute("id")
    const questionChild = question.children
    const childrenQuestion = question.children


    for(let i = 1; i < questionChild.length; i++) {


        const questionChoices = question.children[i]
        questionChoices.classList.add("opacity")
    }

    element.classList.remove("opacity")
    element.classList.add("pointerEvents")

    
    for (let i = 1; i < childrenQuestion.length; i++){

        const removerClasseChoice = childrenQuestion[i].children
        removerClasseChoice[1].classList.remove("defaultAnswer")


    }
   

    countHits(element)


}


function countHits (element) {


    const childrenQuestion = element.children[1]


    if(childrenQuestion.classList.value === "correctAnswer"){

        acertos++
        respondidas++
    } else {
        respondidas++
    }

   verifyCounts()
    
}


function verifyCounts () {



    if (respondidas === data.questions.length ){
        calculateResult()
    } else {
        scrollQuestion()
    }

    
}

function calculateResult (){

    const result = (acertos/respondidas)*100
    resultQuizz(result)
    setTimeout(scrollToResult,2000)
}

function scrollQuestion(){
    
    const nextQuestion = document.querySelector("#naoRespondida")
    nextQuestion.scrollIntoView()
    
}

function resultQuizz (result) {

    const main = document.querySelector("main")
    console.log(result)

    main.innerHTML += `
    
            <div class="quizzResult">
            </div>
            <div class="quizzRestarter">
                <button class="restartQuizz" onclick="restartQuizz()">Reiniciar Quizz</button>
                <button class="backToHome" onclick="backToHome()">Voltar para home</button>
            </div>
            
            `

            renderResult(result)

}

function renderResult (result) {

    const divResult = document.querySelector(".quizzResult")

    for(let i = 0; i < data.levels.length;i++){
        console.log(i)

        if(result  >= data.levels[i].minValue){

            divResult.innerHTML = `
                <div class="resultTitle">
                    <h6>${result.toFixed()}% de acerto: ${data.levels[i].title}
                </div>
                <div class="resultBox">
                <img src="${data.levels[i].image}" alt="Imagem do nivel de acertos">
                <p>${data.levels[i].text}</p>
                </div>
            
            `

        

        }
        const resultQuizz = document.querySelector(".quizzResult")
            resultQuizz.scrollIntoView()
    }        
}

function scrollToResult () {
    const result = document.querySelector(".quizzResult")
    result.scrollIntoView()
}

function restartQuizz () {
    
    eraseContent()
    openQuizz()
    
}

function backToHome () {

    window.scrollTo(0,0)
    loadHeader()
}




function comparador() { 
	return Math.random() - 0.5; 
}

function hiddenInput (element) {

    const info = element.parentNode
    const level = info.children
    const ionIcon = element.children[0].children[0]
    ionIcon.classList.toggle("hidden")

    
    for(let i=1; i < level.length; i++) {

        level[i].classList.toggle("hidden")
    }



}



/* função restart quizz com problema, lembrar de rever */

loadHeader();
