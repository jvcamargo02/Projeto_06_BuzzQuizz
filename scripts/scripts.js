const answers = []
const questions = [];
const levels = []
const quizzForm = {
    title: quizzTitle,
    image: quizzImg,
    questions: questions,
    levels: levels
};

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
        <div class="">BuzzQuizz<\div>
    `
    loadQuizz();
}

function loadQuizz() {
    document.querySelector("body").innerHTML +=
    `
        <main>
        <\main>
    `
    createMenu();

}

function createMenu() {
    const hasQuizz = userQuizzes()
    // aqui retorna true ou false. Então, dependendo da resposta, habilita um estilo no menu ou outro. o HTML vai ser o mesmo
    document.querySelector("main").innerHTML +=
    `
    <div class="user-quizz">
        <span class="quizz-button-small">
            Seus Quizzes
            <ion-icon onclick="createQuizz()" name="add-circle"></ion-icon>
        </span>
        <div class="thumb-box">
            <div class="quizz-button-big">
                <span>
                    Você não criou nenhum quizz ainda :(
                </span>
                <span onclick="createQuizz()">
                    Criar Quizz
                </span>
            </div>
        </div>
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

// estilizar
// https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
// tem que adicionar isso aqui no estilo pra não aparecer umas setinhas na lateral
// dos campos em que vão números
function createScreenOne() {
    document.querySelector("main").innerHTML +=
    `
    <div>
        <h2 class="instructions">
            Comece pelo começo
        </h2>
        <form>
            <div class="quizz-info">
                <input placeholder="Título do seu quizz" type="text" name="" id="title" minlength="20" required="required" >
                <input placeholder="URL da imagem do seu quizz" type="url" name="" id="img" required="required">
                <input placeholder="Quantidade de perguntas do quizz" type="number" name="" id="questions" min="3" required="required">
                <input placeholder="Quantidade de níveis do quizz" type="number" name="" id="levels" min="2" required="required">
            </div>
            <input type="submit" onclick="createScreenTwo(form)" class="next-button" value="Prosseguir para criar perguntas">
        </form>
    </div>
    `
    // document.querySelector("input[type='number']") usar isso aqui para selecionar os campos numéricos, talvez?
}
// estilizar

// estilizar
function createScreenTwo(formData) {
    // console.log("hi")
    quizzForm.title = formData.title.value
    quizzForm.image = formData.img.value
    const questionsNum = formData.questions.value;
    eraseContent();
    formData.levels.value
    
    document.querySelector("main").innerHTML +=
    `
        <form>
        
        </form>
    `
    const formBody = document.querySelector("form")
    for(let i = 0; i < questionsNum; i++) {
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        // estudar como implementar um jeito bacana de escolher uma cor.
        formBody.innerHTML +=
        `
        <div class="question-body">
            <h2>Pergunta ${i+1}<ion-icon onclick="show()" name="create-outline"></ion-icon></h2>
            <input type="text" name="" id="title" value="Texto da pergunta" required="required">
            <input type="color" name="" id="title" value="Cor de fundo da pergunta" required="required">

            <h2>Resposta correta</h2>
            <input type="text" name="" id="right01" value="Resposta correta" required="required">
            <input type="url" name="" id="right01" value="URL da imagem" required="required">

            <h2>Respostas incorretas</h2>
            <input type="text" name="" id="wrong01" value="Resposta incorreta 1" required="required">
            <input type="url" name="" id="wrong01" value="URL da imagem 1" required="required">
            <input type="text" name="" id="wrong02" value="Resposta incorreta 2" required="required">
            <input type="url" name="" id="wrong02" value="URL da imagem 2" required="required">
            <input type="text" name="" id="wrong03" value="Resposta incorreta 3">
            <input type="url" name="" id="wrong03" value="URL da imagem 3">
        </div>            
        `
    }

    formBody.innerHTML +=
    `
        <input type="submit" onclick="createScreenThree(form, levels)" class="next-button" value="Prosseguir para criar níveis">
    `
    // vou ter que passar os niveis como parametro pra poder chamar no fim da função e evitar pepinos
    // createQuestionLevels()
    // validar os dados antes de prosseguir, planejar isso depois
    // const questions = []
}
// estilizar

// estilizar
function createScreenThree(questions, levels) {
    fillQuestions(questions);
    const levelsNum = levels;
    const levelsArray = calculateLevels(levelsNum)
    
    quizzForm.questions = algumacoisa;

    document.querySelector("main").innerHTML +=
    `
        <form>
        
        </form>
    `
    const formBody = document.querySelector("form")
    for(let i = 0; i < levelsNum; i++) {
        // esconder o ion-icon por default e só mostrar quando o menu estiver encolhido
        formBody.innerHTML +=
        `
        <div class="question-body">
            <h2>Nível ${i+1}<ion-icon onclick="show()" name="create-outline"></ion-icon></h2>
            <input type="text" name="" id="title" value="Título do nível" required="required">
            <input type="number" name="" id="lvl_percent" value="% de acerto mínima (sem o %)" min="${levelsArray[i]}" required="required">
            <input type="url" name="" id="img_url" value="URL da imagem do nível" required="required">
            <input type="text" name="" id="description" value="Descrição do nível" minlength="30" required="required">
        </div>            
        `
    }
    formBody.innerHTML +=
    `
        <input type="submit" onclick="createScreenThree(form, levels)" class="next-button" value="Prosseguir para criar níveis">
    `
}
// estilizar

function calculateLevels(num) {
    let percentageArray = []
    const step = Math.round(100/num)
    for(let i = 0; i < num; i++) {
        percentageArray.push(step*i)
    }
    console.log(percentageArray)
    return percentageArray
}

function fillQuestions(formQuestions) {
    const title = formQuestions.querySelector("input[id='title']")
    title.forEach((info) => questions.push({ title: info.value.title, color: info.value.color}))
    const answers = formQuestions.querySelector("input[id='right01']")
    answers.forEach((info) => answers.push({ text: info.value.text, image: info.value.image, isCorrectAnswer: true}))
    let i = 1
    let wrongAnswers = formQuestions.querySelector(`input[id='wrong0${i}']`);
    while(wrongAnswers !== null) {
        wrongAnswers.forEach((info) => wrongAnswers.push({ text: info.value.text, image: info.value.image, isCorrectAnswer: false}))
        i++;
        wrongAnswers = formQuestions.querySelector(`input[id='wrong0${i}']`);
    }
}

loadHeader();
