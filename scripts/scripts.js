const API_URL = "https://mock-api.driven.com.br/api/v6/buzzquizz/"
const quizzAnswers = [];
const questions = [];
const levels = [];
const LAST_PAGE_INDEX = 2;
const MAX_QUESTIONS = 4;
// const quizzHeader = {
//     title: '',
//     image: ''
// };
const quizzForm = {
    title: '',
    image: '',
    questions: [],
    levels: []
};
let pageNum = 0;
let questionsNum;
let levelsNum;
let data;
let teste;
let teste2 = []


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
            <div class="top">
                <h1  onclick="loadHeader()">BuzzQuizz</h1>
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
        // quizzHeader.push({ title: formData.get("quizz"), image: formData.get("quizz_url") })
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
                console.log("switch de", pair[0], pair[1])
                if (isNotEmpty(pair[1])) {
                    quizzAnswers.push({
                        text: pair[1],
                        image: formData.get(`${pair[0]}_url`),
                        isCorrectAnswer: false
                    })
                }
                i++;
                if ((i+1) === MAX_QUESTIONS) {
                    // questions[j].answers = []
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
    console.log("sai do for")
    if (pageNum === 0) {
        console.log("entrei no if === 0")
        pageNum++;
        createScreenTwo(questionsNum);
    } else {
        pageNum++;
        createScreenThree(levelsNum)
    }
}

function postQuizz() {
    // Object.assign(quizzForm.title, quizzHeader.title);
    // Object.assign(quizzForm.image, quizzHeader.image);
    Object.assign(quizzForm.questions, questions);
    Object.assign(quizzForm.levels, levels);
    const promise = axios.post(API_URL+"quizzes", quizzForm)
    promise.then((data) => {
        const quizzString = JSON.stringify(quizzForm);
        localStorage.setItem(data.key, quizzString);
    })
    promise.catch((code) => {
        alert(`Erro ao enviar o quizz.\nCódigo ${code.response.status}.\nMais detalhes: ${code.response}`)
    })
    // emptyArray(quizzHeader)
    emptyArray(questions)
    emptyArray(levels)
}

function parseLevels(formData) {
    let i = 0;
    // const formObj = {
    //     title: '',
    //     text: '',
    //     image: '',
    //     minValue: undefined
    // }
    do {
        // formObj.title = formData.get(`title0${i + 1}`);
        // formObj.text = formData.get(`text0${i + 1}`);
        // formObj.image = formData.get(`image0${i + 1}`);
        // formObj.minValue = formData.get(`lvl_percent0${i + 1}`)
        // levels.push(formObj);
        levels.push({
            title: formData.get(`title0${i + 1}`),
            image: formData.get(`image0${i + 1}`),
            text: formData.get(`text0${i + 1}`),
            minValue: Number(formData.get(`lvl_percent0${i + 1}`))
        });
        i++;
    } while (i < levelsNum)
    console.log(questions, "\n", quizzAnswers, "\n", levels, "\n")
    console.log("chegasse no fim camarada")
    console.log("\n")
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
    document.querySelector("main").innerHTML +=
    `
    <div class="createQuizzPage">
        <h2 class="instructions">
            Comece pelo começo
        </h2>
        <form>
            <div class="quizz-info">
                <input placeholder="Título do seu quizz" type="text" name="quizz" minlength="20" required="required" >
                <input placeholder="URL da imagem do seu quizz" type="url" name="quizz_url" required="required">
                <input placeholder="Quantidade de perguntas do quizz" type="number" name="questions" min="3" required="required">
                <input placeholder="Quantidade de níveis do quizz" type="number" name="levels" min="2" required="required">
            </div>
            <input type="submit" class="next-button" value="Prosseguir para criar perguntas">
        </form>
    </div>
    `

    setEventListener();
    // document.querySelector("input[type='number']") usar isso aqui para selecionar os campos numéricos, talvez?
}
// estilizar

// estilizar
function createScreenTwo(questionsNum) {
    // console.log(formData)
    // const questionsNum = formData.questions.value;
    // formData.levels.value
    eraseContent();

    document.querySelector("main").innerHTML +=
    `
        <form>
        
        </form>
    `;

    const formBody = document.querySelector("form");
    for (let i = 0; i < questionsNum; i++) {
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        // estudar como implementar um jeito bacana de escolher uma cor.
        formBody.innerHTML +=
        `
        <div class="question-body">
            <h2>Pergunta ${i + 1}<ion-icon onclick="show()" name="create-outline"></ion-icon></h2>
            <input type="text" name="title0${i + 1}" placeholder="Texto da pergunta" required="required">
            <input type="color" name="title0${i + 1}_color" placeholder="Cor de fundo da pergunta" required="required">

            <h2>Resposta correta</h2>
            <input type="text" name="right0${i + 1}" placeholder="Resposta correta" required="required">
            <input type="url" name="right0${i + 1}_url" placeholder="URL da imagem" required="required">

            <h2>Respostas incorretas</h2>
            <input type="text" name="wrong_0${i + 1}_01" placeholder="Resposta incorreta 1" required="required">
            <input type="url" name="wrong_0${i + 1}_01_url" placeholder="URL da imagem 1" required="required">
            <input type="text" name="wrong_0${i + 1}_02" placeholder="Resposta incorreta 2">
            <input type="url" name="wrong_0${i + 1}_02_url" placeholder="URL da imagem 2">
            <input type="text" name="wrong_0${i + 1}_03" placeholder="Resposta incorreta 3">
            <input type="url" name="wrong_0${i + 1}_03_url" placeholder="URL da imagem 3">
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
        <form>
        
        </form>
    `;

    const formBody = document.querySelector("form");
    for (let i = 0; i < levelsNum; i++) {
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        formBody.innerHTML +=
        `
            <div class="question-body">
                <h2>Nível ${i + 1}<ion-icon onclick="show()" name="create-outline"></ion-icon></h2>
                <input type="text" name="title0${i + 1}" placeholder="Título do nível" required="required">
                <input type="number" name="lvl_percent0${i + 1}" placeholder="% de acerto mínima (sem o %)" min="${levelsArray[i]}" value="${levelsArray[i]}" required="required">
                <input type="url" name="image0${i + 1}" placeholder="URL da imagem do nível" required="required">
                <input type="text" name="text0${i + 1}" placeholder="Descrição do nível" minlength="30" required="required">
            </div>            
        `
    }
    formBody.innerHTML +=
    `
        <input type="submit" class="next-button" value="Finalizar Quizz">
    `
    setEventListener();
}
// estilizar

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

function fillUserQuizz() {
    const userQuizzes = document.querySelector(".user-quizzes")

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

function searchQuizz(quizzId) {

    const promisseQuizz = axios.get(`https://mock-api.driven.com.br/api/v6/buzzquizz/quizzes/${quizzId}`)
    promisseQuizz.then(openQuizz)
}

function openQuizz(response) {

    eraseContent()
    data = response.data
    const quizzTop = document.querySelector("header")
    const quizzScreen = document.querySelector("main")

    quizzTop.innerHTML += `
        <div class="quizzTop">

            <img class="thumbQuizz" src="${data.image}" alt="">
            <h4 class="quizzTitlePage">${data.title}</h4>

        </div> `

    quizzScreen.innerHTML =
        `<div class="questions">
        
        </div>`

    printQuestions(data)
}

function printQuestions(data) {



    const quizzScreen = document.querySelector(".questions")



    for (let i = 0; i < data.questions.length; i++) {

        quizzScreen.innerHTML += `
        <div class="question">
            <div style="background-color: ${data.questions[i].color}" class="questionTitle">
                <h4>${data.questions[i].title}</h4>
            </div>`
        const question = document.querySelector(`.question:nth-child(${1 + i})`)
        printChoices(data, i, question)
    }



}

function printChoices(data, i, question) {

    console.log(data.questions[i].answers)
    teste = []

    for (let index = 0; index < data.questions[i].answers.length; index++) {
        console.log(data.questions[i].answers[index])
        teste.push(data.questions[i].answers[index])
        teste.sort(comparador)

        for (let ino = 0; ino < teste.length; ino++){

            console.log('passei aqui')

             if(teste[ino].isCorrectAnswer === false){
                question.innerHTML += `
                <div class="choice">
                        <img src="${teste[ino].image}" alt="Imagem da alternativa">
                        <h6 class="wrongAnswer">${teste[ino].text}</h6>
                    </div>
                `
            } else if (teste[ino].isCorrectAnswer === true) {
                console.log("adicionei 1")
                question.innerHTML += `
                    <div class="choice">
                        <img src="${teste[ino].image}" alt="Imagem da alternativa">
                        <h6 class="correctAnswer">${teste[ino].text}</h6>
                    </div>
                    ` 
                    console.log("erminei de adicionar 1")
            }

        }

       
    }

}

function comparador() { 
	return Math.random() - 0.5; 
}

loadHeader();

/*  */