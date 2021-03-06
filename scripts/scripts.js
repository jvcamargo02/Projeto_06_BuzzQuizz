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
const SEC = 1000;
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
let quizzUserId = []
let acertos = 0
let respondidas = 0
let teste;

function eraseContent() {
    document.querySelector("main").innerHTML = "";
    window.scrollTo(0, 0)
}

function setFieldMessage() {
    const inputs = document.querySelectorAll("input")
    const inArray = Array.from(inputs)
    inArray.forEach((field) => {
        if (field.type !== "submit") {
            switch (field.type) {
                case "number":
                    if (field.validity.rangeUnderflow)
                        field.setCustomValidity(`Insira um valor igual a ${field.min} ou maior`);
                    break;
                case "text":
                    if (field.validity.tooShort)
                        field.setCustomValidity(`O campo deve possuir pelo menos ${field.minLength} caracteres`);
                    break;
                case "url":
                    if (field.validity.typeMismatch)
                        field.setCustomValidity(`Insira uma URL válida`);
                    break;
                default:
                    break;
            }
        }
    })
}

function loadHeader() {
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

    fillUserQuizz()
    listQuizzes()
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
            case `title0${j + 1}`:
                questions.push({
                    title: pair[1],
                    color: formData.get(`${pair[0]}_color`)
                })
                questions[j].answers = []
                break;
            case `right0${j + 1}`:
                quizzAnswers.push({
                    text: pair[1],
                    image: formData.get(`${pair[0]}_url`),
                    isCorrectAnswer: true
                })
                break;
            case `wrong_0${j + 1}_0${i + 1}`:
                if (isNotEmpty(pair[1])) {
                    quizzAnswers.push({
                        text: pair[1],
                        image: formData.get(`${pair[0]}_url`),
                        isCorrectAnswer: false
                    })
                }
                i++;
                if ((i + 1) === MAX_QUESTIONS) {
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
    if (!editMode) {
        const promise = axios.post(API_URL + "quizzes", quizzForm)
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
        const promise = axios.put(API_URL + `quizzes/${quizzID}`, quizzForm, { headers: { "Secret-Key": toEdit.key } })
        promise.then((response) => {
            const responseString = JSON.stringify(response.data)
            const responseKey = response.data.key.toString();
            localStorage.setItem(responseKey, responseString);
        });
        promise.catch((code) => {
            alert(`Erro ao enviar o quizz.\nCódigo ${code.response.status}.\nMais detalhes: ${code.response}`)
        });
    }
    pageNum = 0;
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

function createScreenOne() {
    const editMode = isNotEmpty(toEdit.questions)
    document.querySelector("main").innerHTML +=
        `
        <h1 class="forms-header">
            Comece pelo começo
        </h1>
        <form class="question-body">
            <div class="quizz-info">
                <input placeholder="Título do seu quizz" type="text" name="quizz" minlength="20" required value="${editMode ? toEdit.title : ""}">
                <input placeholder="URL da imagem do seu quizz" type="url" name="quizz_url" required value="${editMode ? toEdit.image : ""}">
                <input placeholder="Quantidade de perguntas do quizz" type="number" name="questions" min="3" required value="${editMode ? toEdit.questions.length : ""}">
                <input placeholder="Quantidade de níveis do quizz" type="number" name="levels" min="2" required value="${editMode ? toEdit.levels.length : ""}">
            </div>
            <input type="submit" class="next-button" value="Prosseguir para criar perguntas">
        </form>
    `

    setEventListener();
}

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
        if (editMode) {
            editQuantity = toEdit.questions[i].answers.length;
        }
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        formBody.innerHTML +=
            `
        <div class="quizz-info">
            <span onclick="hiddenInput(this)" class="cursor">
                <h2 class="quizz-context levelPage">
                    Pergunta ${i + 1}
                    <ion-icon name="create-outline"></ion-icon>
                </h2>
            </span>
            <input class="hidden" type="text" name="title0${i + 1}" placeholder="Texto da pergunta" required value="${editMode ? toEdit.questions[i].title : ""}">
            <input class="hidden" type="color" name="title0${i + 1}_color" placeholder="Cor de fundo da pergunta" required value="${editMode ? toEdit.questions[i].color : ""}">

            <h2 class="hidden quizz-context">Resposta correta</h2>
            <input class="hidden" type="text" name="right0${i + 1}" placeholder="Resposta correta" required value="${editMode ? toEdit.questions[i].answers[0].text : ""}">
            <input class="hidden" type="url" name="right0${i + 1}_url" placeholder="URL da imagem" required value="${editMode ? toEdit.questions[i].answers[0].image : ""}">

            <h2 class="hidden quizz-context">Respostas incorretas</h2>
            <input class="hidden" type="text" name="wrong_0${i + 1}_01" placeholder="Resposta incorreta 1" required value="${editMode ? toEdit.questions[i].answers[1].text : ""}">
            <input class="hidden" type="url" name="wrong_0${i + 1}_01_url" placeholder="URL da imagem 1" required value="${editMode ? toEdit.questions[i].answers[1].image : ""}">
            <input class="hidden" type="text" name="wrong_0${i + 1}_02" placeholder="Resposta incorreta 2" value="${(editMode && editQuantity >= 3) ? toEdit.questions[i].answers[2].text : ""}">
            <input class="hidden" type="url" name="wrong_0${i + 1}_02_url" placeholder="URL da imagem 2" value="${(editMode && editQuantity >= 3) ? toEdit.questions[i].answers[2].image : ""}">
            <input class="hidden" type="text" name="wrong_0${i + 1}_03" placeholder="Resposta incorreta 3"value="${(editMode && editQuantity >= 4) ? toEdit.questions[i].answers[3].text : ""}">
            <input class="hidden" type="url" name="wrong_0${i + 1}_03_url" placeholder="URL da imagem 3" value="${(editMode && editQuantity >= 4) ? toEdit.questions[i].answers[3].image : ""}">
        </div>            
        `
    }

    formBody.innerHTML +=
        `
        <input type="submit" class="next-button" value="Prosseguir para criar níveis">
    `
    setEventListener();
}

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
                <input class="hidden" type="text" name="title0${i + 1}" placeholder="Título do nível" required value="${editMode ? toEdit.levels[i].title : ""}">
                <input class="hidden"
                    type="number" name="lvl_percent0${i + 1}" placeholder="% de acerto mínima (sem o %)" 
                    min="${levelsArray[i]}" value="${levelsArray[i]}" 
                    value="${editMode ? toEdit.levels[i].minValue : ""}"
                required>
                <input class="hidden" type="url" name="image0${i + 1}" placeholder="URL da imagem do nível" required value="${editMode ? toEdit.levels[i].image : ""}">
                <input class="hidden" type="text" name="text0${i + 1}" placeholder="Descrição do nível" minlength="30" required value="${editMode ? toEdit.levels[i].text : ""}">
            </div>            
        `
    }
    formBody.innerHTML +=
        `
        <input type="submit" class="next-button" value="${editMode ? "Editar quizz" : "Finalizar Quizz"}">
    `
    setEventListener();
}

function clearEditHistory() {
    emptyArray(toEdit.questions);
    emptyArray(toEdit.levels);
    toEdit.title = '';
    toEdit.image = '';
}

function clearFormHistory() {
    emptyArray(quizzForm.questions)
    emptyArray(quizzForm.levels)
    quizzForm.title = '';
    quizzForm.image = '';
}

function createScreenFour() {
    eraseContent();
    const editMode = isNotEmpty(toEdit.questions)
    document.querySelector("main").innerHTML +=
        `
        <div class="successScreen">
            <h1 class="forms-header" >${editMode ? "Seu quizz foi editado!" : "Seu quizz está pronto!"}</h1>
            <div class="successDiv">
                <img class="marginSuccess" src="${quizzForm.image}" alt="Imagem do quizz criado por você">
                <h4 onclick="accessNewQuizz()" class="quizz-title">${quizzForm.title}</h4>
            </div>
            <input class="restartQuizz" onclick="accessNewQuizz()" value="Acessar Quizz">
            <input class="backToHome" onclick="createMenu()" value="Voltar para home">
        </div>
    `
    clearEditHistory();
    clearFormHistory();
    emptyArray(questions);
    emptyArray(levels);
}
// estilizar

function accessNewQuizz() {
    const newQuizzToObject = JSON.parse(localStorage.getItem(localStorage.key(localStorage.length - 1)))
    const quizzId = newQuizzToObject.id;
    searchQuizz(quizzId);
}

function calculateLevels(num) {
    let percentageArray = []
    const step = Math.round(100 / num)
    for (let i = 0; i < num; i++) {
        percentageArray.push(step * i)
    }

    return percentageArray
}

function listQuizzes() {
    const promisse = axios.get(API_URL + "/quizzes")
    promisse.then(printQuizzes)

}

function quizzToObject() {
    userQuizzList.splice(0, userQuizzList.length);
    for (let i = 0; i < localStorage.length; i++) {
        let quizzString = localStorage.getItem(localStorage.key(i))
        userQuizzList.push(JSON.parse(quizzString))
    }
}

function confirmDelete() {
    if (window.confirm("Tem certeza que deseja apagar este quizz?"))
        return true;
    return false;
}

function editQuizz(index) {
    toEdit = Object.assign(toEdit, userQuizzList[index])

    eraseContent();
    createScreenOne();
}

function deleteQuizz(index) {
    const toDelete = userQuizzList[index]
    if (confirmDelete()) {
        const promise = axios.delete(API_URL + `quizzes/${toDelete.id}`, { headers: { "Secret-Key": toDelete.key } })
        loading()
        promise.then(() => {
            alert("O quizz foi deletado com sucesso.");
            localStorage.removeItem(toDelete.key);
            eraseContent();
            backToHome();
        })
        promise.catch((code) => {
            alert("Houve um erro ao deletar o quizz")
            console.log(`Erro ${code.response.status}`)
        })

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
        userQuizzList.forEach((quizz, index) => {
            userQuizzesList.innerHTML +=
                `
                <li class="user-quizz">
                    <div class="side-menu">
                        <ion-icon onclick="editQuizz(${index})"name="create-outline"></ion-icon>
                        <ion-icon onclick="deleteQuizz(${index})" name="trash-outline"></ion-icon>
                    </div>
                    <img class="quizImg" src="${quizz.image}" alt="">
                    <h4 onclick="searchQuizz(${quizz.id})" class="quizz-title">${quizz.title}</h4> 
                </li>
            `
        })
    }
}

function printQuizzes(promisse) {
    const quizzArr = promisse.data
    const listAllQuizzesDOM = document.querySelector(".list")
    receiveQuizzUserId()

    for (let i = 0; i < quizzArr.length; i++) {

        if(!(quizzUserId.includes(quizzArr[i].id))) {
        listAllQuizzesDOM.innerHTML += ` 
        <li onclick="searchQuizz(${quizzArr[i].id})" class="user-quizz">
            <img class="quizImg" src="${quizzArr[i].image}" alt="">
            <h4 class="quizz-title">${quizzArr[i].title}</h4> 
        </li>
        `
    }
    }
}

function searchQuizz(id) {
    quizzId = id

    const promisseQuizz = axios.get(`${API_URL}quizzes/${quizzId}`)
    loading()
    promisseQuizz.then(bannerQuizz)
}

function bannerQuizz(response) {
    data = response.data
    const quizzTop = document.querySelector("header")

    quizzTop.innerHTML += `
        <div class="quizzTop">
            <img class="thumbQuizz" src="${data.image}" alt="">
            <h4 class="quizzTitlePage">${data.title}</h4>
        </div>
        `
    openQuizz()
}

function openQuizz() {
    eraseContent();

    respondidas = 0
    acertos = 0
    const quizzScreen = document.querySelector("main")
    quizzScreen.innerHTML = `
        <div class="questions">
        </div>
        `
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

    for (let ino = 0; ino < alternativas.length; ino++) {
        if (alternativas[ino].isCorrectAnswer === false) {
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

function opacity(element) {
    const question = element.parentNode
    question.removeAttribute("id")
    const questionChild = question.children
    const childrenQuestion = question.children

    for (let i = 1; i < questionChild.length; i++) {


        const questionChoices = question.children[i]
        questionChoices.classList.add("opacity")
    }

    element.classList.remove("opacity")
    element.classList.add("pointerEvents")
    for (let i = 1; i < childrenQuestion.length; i++) {
        const removerClasseChoice = childrenQuestion[i].children
        removerClasseChoice[1].classList.remove("defaultAnswer")
    }
    countHits(element)
}


function countHits(element) {
    const childrenQuestion = element.children[1]

    if (childrenQuestion.classList.value === "correctAnswer") {
        acertos++
        respondidas++
    } else {
        respondidas++
    }
    verifyCounts()
}


function verifyCounts() {
    if (respondidas === data.questions.length) {
        calculateResult()
    } else {
        scrollQuestion()
    }
}

function calculateResult() {
    const result = (acertos / respondidas) * 100

    resultQuizz(result);
    setTimeout(scrollToResult, 2 * SEC);
}

function scrollQuestion() {
    const nextQuestion = document.querySelector("#naoRespondida")

    setTimeout(() => {
        nextQuestion.scrollIntoView({ behavior: "smooth" })
    }, 2 * SEC)
}

function resultQuizz(result) {
    const main = document.querySelector("main")

    main.innerHTML +=
        `
            <div class="quizzResult">
            </div>
            <div class="quizzRestarter">
                <button class="restartQuizz" onclick="restartQuizz()">Reiniciar Quizz</button>
                <button class="backToHome" onclick="backToHome()">Voltar para home</button>
            </div>
            
            `
    renderResult(result);
}

function renderResult(result) {
    const divResult = document.querySelector(".quizzResult")

    for (let i = 0; i < data.levels.length; i++) {
        if (result >= data.levels[i].minValue) {
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
        setTimeout(() => {
            const resultQuizz = document.querySelector(".quizzResult")
            resultQuizz.scrollIntoView({ behavior: "smooth" })
        }, 2 * SEC)
    }
}

function scrollToResult() {
    const result = document.querySelector(".quizzResult")
    result.scrollIntoView({ behavior: "smooth" })
}

function restartQuizz() {
    eraseContent()
    openQuizz()
}

function backToHome() {
    window.scrollTo(0, 0);
    loadHeader()
}

function loading() {
    const main = document.querySelector("main")

    eraseContent()
    main.innerHTML = `
    <div class="cent">
    <div class="loadingio-spinner-eclipse-u1vfdkeea5l"><div class="ldio-ymf273i03w9">
        <div></div>
        </div>
    </div>
    <h1>Carregando...</h1>
    </div>
    `
}

function receiveQuizzUserId () {

    quizzUserId = []

    for(let i = 0; i < localStorage.length; i++){
        const local = localStorage.key(i)
        console.log(local)
        const getlocal = JSON.parse(localStorage.getItem(local)).id
        console.log(getlocal)
        quizzUserId.push(getlocal)

    }
}

function comparador() {
    return Math.random() - 0.5;
}

function hiddenInput(element) {

    const info = element.parentNode
    const level = info.children
    const ionIcon = element.children[0].children[0]
    ionIcon.classList.toggle("hidden")


    for (let i = 1; i < level.length; i++) {

        level[i].classList.toggle("hidden")
    }
}


function oi () {

    const local = localStorage.key(localStorage.length)

}


loadHeader()
