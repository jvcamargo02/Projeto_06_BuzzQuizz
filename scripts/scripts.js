const answers = [];
const questions = [];
const levels = [];
const quizzHeader = [];
const quizzForm = {};
const LAST_PAGE_INDEX = 2;
let pageNum = 0;
let questionsNum;
let levelsNum;


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
        <span class="quizz-button-small">
            Seus Quizzes
            <ion-icon onclick="createQuizz()" name="add-circle"></ion-icon>
        </span>
        <div class="thumb-box">
        <!--  <div class="quizz-button-big">
                <span>
                    Você não criou nenhum quizz ainda :(
                </span>
                <button onclick="createQuizz()">
                    Criar Quizz
                </button>
            </div>--> 
            <div class="user-quizz">
                O quão Potterhead é você?
            </div>
            <div class="user-quizz">
                É ex-BBB ou ex-De férias com o Ex?
            </div>
        </div>
    </div>
    <div class="list-quizzes">
        <ul>Liste todos os Quizzes

            <li class="user-quizz">
                É ex-BBB ou ex-De férias com o Ex?

            </li>

        </ul>


     </div>

    `
    // quizz-button-big e quizz-button-small são os estilos a serem selecionados, 
    // ou então só escreve um deles e não o outro
    // como ficar melhor, qualquer coisa é só trocar a lógica um pouco :p

    // chama uma função aqui pra carregar todos os quizzes do usuário na thumb-box
    // thumb-box de thumbnail + vou deixar a função comentada pra depois
    // fillUserQuizz()
}

function userQuizzes() {

}

function createQuizz() {
    eraseContent();
    createScreenOne();
}


//reformular esse monstrinho
function parseData(formData) {
    if (formData.get("quizz") !== null) {
        quizzHeader.push({ title: formData.get("quizz"), image: formData.get("quizz_url") })
        formData.delete("quizz")
        formData.delete("quizz_url")
    }
    let i = 0;
    for (let pair of formData.entries()) {
        // console.log(pair[0], pair[1])
        console.log("switch de ", pair[0])
        switch (pair[0]) {
            case "title":
                questions.push({
                    text: pair[1],
                    color: formData.get(`${pair[0]}_color`)
                })
                break;
            // case "text":
            //         questions.push({
            //             text: pair[1],
            //             color: formData.get(`${pair[0]}_url`)
            //         })
            //         break;
            case "right":
                answers.push({
                    text: pair[1],
                    image: formData.get(`${pair[0]}_url`),
                    isCorrectAnswer: true
                })
                break;
            case `wrong0${i}`:
                answers.push({
                    text: pair[1],
                    image: formData.get(`wrong0${i}_url`),
                    isCorrectAnswer: false
                })
                i++;
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
        // break;
    } else {
        pageNum++;
        createScreenThree(levelsNum)    
    }
}

function parseLevels(formData) {
    let i = 0;
    do {
        levels.push({
            title: formData.get(`title0${i + 1}`),
            text: formData.get(`text0${i + 1}`),
            image: formData.get(`image0${i + 1}`),
            minValue: formData.get(`lvl_percent0${i + 1}`)
        });
        i++;
    } while (i < levelsNum)
    console.log(questions,"\n",answers,"\n",levels,"\n")
    console.log("chegasse no fim camarada")
    console.log("\n")
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
            <input type="text" name="title" placeholder="Texto da pergunta" required="required">
            <input type="color" name="title_color" placeholder="Cor de fundo da pergunta" required="required">

            <h2>Resposta correta</h2>
            <input type="text" name="right" placeholder="Resposta correta" required="required">
            <input type="url" name="right_url" placeholder="URL da imagem" required="required">

            <h2>Respostas incorretas</h2>
            <input type="text" name="wrong01" placeholder="Resposta incorreta 1" required="required">
            <input type="url" name="wrong01_url" placeholder="URL da imagem 1" required="required">
            <input type="text" name="wrong02" placeholder="Resposta incorreta 2">
            <input type="url" name="wrong02_url" placeholder="URL da imagem 2">
            <input type="text" name="wrong03" placeholder="Resposta incorreta 3">
            <input type="url" name="wrong03_url" placeholder="URL da imagem 3">
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

loadHeader();
