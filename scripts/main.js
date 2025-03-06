document.addEventListener('DOMContentLoaded', fetchQuizCategories);

let correctAnswersCount = 0;
let totalQuestionsCount = 0;
let currentQuestions = [];
let currentCategory = '';


async function fetchQuizCategories() {
    console.info('fetchQuizCategories() called from main.js');
    try {
        console.info('Sæki tiltæk próf...');
        const response = await fetch('/DATA/index.json');

        if (!response.ok) {
            throw new Error(`Mistókst að hlaða index.json. Staða: ${response.status}`);
        }

        const quizList = await response.json();
        console.info('Tiltæk próf:', quizList);

        renderNavigation(quizList);
    } catch (error) {
        console.error('Villa við að hlaða index.json:', error);
    }
}

function renderNavigation(quizList) {
    const quizNav = document.getElementById('quiz-nav');
    quizNav.innerHTML = '';

    quizList.forEach(({ title, file }) => {
        const button = document.createElement('button');
        button.textContent = title;
        button.addEventListener('click', () => fetchQuizData(file, title));
        quizNav.appendChild(button);
    });
}

async function fetchQuizData(filename, category) {
    try {
        console.info(`Sæki próf: ${filename}...`);
        const response = await fetch(`/DATA/${filename}`);

        if (!response.ok) {
            throw new Error(`Mistókst að hlaða ${filename}. Staða: ${response.status}`);
        }

        const quizData = await response.json();
        console.info(`Prófgögn hlaðin fyrir ${category}:`, quizData);

        correctAnswersCount = 0;
        currentCategory = category;
        
        const savedQuestions = JSON.parse(localStorage.getItem(`customQuestions_${currentCategory}`)) || [];
        let allQuestions = [...quizData.questions, ...savedQuestions];

        if (allQuestions.length === 0) {
            throw new Error(`⚠️ Engar spurningar fundust fyrir ${category}!`);
        }

        currentQuestions = shuffleArray(allQuestions);
        totalQuestionsCount = currentQuestions.length;

        console.info(`Hleð ${totalQuestionsCount} spurningar fyrir ${category}`);
        renderQuiz(currentQuestions);
    } catch (error) {
        console.error(`Villa við að hlaða ${filename}:`, error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderQuiz(questions) {
    if (!questions || questions.length === 0) {
        console.error("Engar spurningar til að sýna!");
        document.getElementById('quiz-container').innerHTML = "<p>⚠️ Engar spurningar fundust.</p>";
        return;
    }

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    let questionIndex = 0;
    renderQuestion(quizContainer, questions, questionIndex);
}

function renderQuestion(quizContainer, questions, index) {
    if (index >= questions.length) {
        displayResults(quizContainer);
        return;
    }

    const questionData = questions[index];

    if (!questionData || !questionData.question || !Array.isArray(questionData.answers)) {
        console.error(`⚠️ Skipping invalid question at index ${index}`, questionData);
        renderQuestion(quizContainer, questions, index + 1);
        return;
    }

    quizContainer.innerHTML = '';

    const questionHeader = document.createElement('h2');
    questionHeader.textContent = 'Spurningar';
    quizContainer.appendChild(questionHeader);

    const questionElement = document.createElement('h2');
    questionElement.textContent = questionData.question;
    quizContainer.appendChild(questionElement);

    const answerHeader = document.createElement('h3');
    answerHeader.textContent = 'Svör';
    answerHeader.id = 'answers-label';
    quizContainer.appendChild(answerHeader);

    const formElement = document.createElement('form');
    formElement.classList.add('question__form');

    const shuffledAnswers = shuffleArray([...questionData.answers]);

    shuffledAnswers.forEach((answer) => {
        if (!answer || !answer.answer) return;

        const answerLabel = document.createElement('label');
        answerLabel.classList.add('answer-label');

        const answerInput = document.createElement('input');
        answerInput.type = 'radio';
        answerInput.name = `question-${index}`;
        answerInput.value = answer.answer;

        if (answer.correct) {
            answerInput.dataset.correct = 'true';
        }

        answerInput.addEventListener('change', (e) => {
            const allInputs = formElement.querySelectorAll('input');
            allInputs.forEach(input => input.disabled = true);

            if (e.target.dataset.correct) {
                e.target.parentElement.classList.add('answer--correct');
                correctAnswersCount++;
            } else {
                e.target.parentElement.classList.add('answer--incorrect');
            }

            console.info(`Spurning ${index + 1} af ${questions.length} svarað.`);
            setTimeout(() => renderQuestion(quizContainer, questions, index + 1), 1000);
        });

        answerLabel.appendChild(answerInput);
        answerLabel.appendChild(document.createTextNode(answer.answer));
        formElement.appendChild(answerLabel);
    });

    quizContainer.appendChild(formElement);
}

function displayResults(quizContainer) {
    quizContainer.innerHTML = `<h2>Þú hefur lokið prófinu! 🎉</h2>
        <p>Þú svaraðir <strong>${correctAnswersCount} / ${totalQuestionsCount}</strong> rétt.</p>`;

    renderAddQuestionForm(quizContainer);
}

function renderAddQuestionForm(quizContainer) {
    const addQuestionContainer = document.createElement('div');
    addQuestionContainer.innerHTML = `
        <h3>Bættu við nýrri spurningu í flokkinn: ${currentCategory}</h3>
        <form id="add-question-form">
            <input type="text" id="new-question" placeholder="Skrifaðu spurningu hér" required>
            <input type="text" id="new-answer-1" placeholder="Rétt svar" required>
            <input type="text" id="new-answer-2" placeholder="Rangt svar" required>
            <input type="text" id="new-answer-3" placeholder="Rangt svar" required>
            <button type="submit">Bæta við</button>
        </form>
        <p id="confirmation-message" style="display: none; color: green; font-weight: bold; margin-top: 10px;"></p>
    `;

    quizContainer.appendChild(addQuestionContainer);
    document.getElementById('add-question-form').addEventListener('submit', function (e) {
        e.preventDefault();
        addNewQuestion();
    });

    const resetButton = document.createElement('button');
resetButton.textContent = 'Eyða viðbættum spurningum';
resetButton.classList.add('delete-button');
resetButton.addEventListener('click', () => {
    localStorage.removeItem(`customQuestions_${currentCategory}`);
    alert('Allar viðbættar spurningar hafa verið fjarlægðar.');
    fetchQuizData(`/DATA/${currentCategory.toLowerCase()}.json`, currentCategory);
});

addQuestionContainer.appendChild(resetButton);

}

function addNewQuestion() {
    const questionInput = document.getElementById('new-question');
    const answer1Input = document.getElementById('new-answer-1');
    const answer2Input = document.getElementById('new-answer-2');
    const answer3Input = document.getElementById('new-answer-3');
    const confirmationMessage = document.getElementById('confirmation-message');

    if (!questionInput.value.trim() || !answer1Input.value.trim() || !answer2Input.value.trim() || !answer3Input.value.trim()) {
        confirmationMessage.innerHTML = `⚠️ Vinsamlegast fylltu út alla reiti.`;
        confirmationMessage.style.color = "red";
        confirmationMessage.style.display = 'block';
        return;
    }

    const newQuestion = {
        question: questionInput.value.trim(),
        answers: shuffleArray([
            { answer: answer1Input.value.trim(), correct: true },
            { answer: answer2Input.value.trim(), correct: false },
            { answer: answer3Input.value.trim(), correct: false }
        ])
    };

    let savedQuestions = JSON.parse(localStorage.getItem(`customQuestions_${currentCategory}`)) || [];

    savedQuestions.push(newQuestion);

    localStorage.setItem(`customQuestions_${currentCategory}`, JSON.stringify(savedQuestions));

    confirmationMessage.innerHTML = `✅ Ný spurning bætt við!`;
    confirmationMessage.style.color = "green";
    confirmationMessage.style.display = 'block';

    questionInput.value = "";
    answer1Input.value = "";
    answer2Input.value = "";
    answer3Input.value = "";

}