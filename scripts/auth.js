document.addEventListener('DOMContentLoaded', () => {
    console.info('auth.js loaded and event listeners initialized');

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const quizWrapper = document.getElementById('quiz-wrapper');
    const toggleRegister = document.getElementById('toggle-register');
    const toggleLogin = document.getElementById('toggle-login');
    const logoutButton = document.getElementById('logout-button');

    function getStoredUsers() {
        return JSON.parse(localStorage.getItem('users')) || {};
    }

    function showRegisterForm() {
        console.info('Switching to registration form');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    }

    function showLoginForm() {
        console.info('Switching to login form');
        if (registerForm) registerForm.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
    }

    function checkLoginStatus() {
        const storedUser = localStorage.getItem('loggedInUser');

        if (storedUser) {
            console.info('User already logged in:', storedUser);
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'none';
            if (quizWrapper) quizWrapper.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'block';

            // Load the quiz if function exists
            if (typeof fetchQuizCategories === 'function') {
                console.info('Calling fetchQuizCategories()');
                fetchQuizCategories();
            }
        } else {
            console.info('No user logged in');
            if (quizWrapper) quizWrapper.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    }

    function handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const loginMessage = document.getElementById('login-message');

        if (!username || !password) {
            console.error('Missing username or password');
            if (loginMessage) {
                loginMessage.textContent = 'Vinsamlegast fylltu út bæði svæði.';
                loginMessage.style.color = 'red';
            }
            return;
        }

        const storedUsers = getStoredUsers();

        if (storedUsers[username] && storedUsers[username] === password) {
            console.info('User logged in:', username);
            localStorage.setItem('loggedInUser', username);

            if (loginMessage) {
                loginMessage.textContent = ` Velkomin, ${username}!`;
                loginMessage.style.color = 'green';
            }

            if (loginForm) loginForm.style.display = 'none';
            if (quizWrapper) quizWrapper.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'block';

            if (typeof fetchQuizCategories === 'function') {
                console.info('📢 Calling fetchQuizCategories()');
                fetchQuizCategories();
            }
        } else {
            console.error('Innskráning mistókst.');
            if (loginMessage) {
                loginMessage.textContent = 'Rangt notandanafn eða lykilorð.';
                loginMessage.style.color = 'red';
            }
        }
    }

   
    function logout() {
        console.info('Logging out user');
        localStorage.removeItem('loggedInUser');
        location.reload();
    }


    function registerUser(event) {
        event.preventDefault();

        const newUsername = document.getElementById('new-username')?.value.trim();
        const newPassword = document.getElementById('new-password')?.value.trim();
        const registerMessage = document.getElementById('register-message');

        if (!newUsername || !newPassword) {
            console.error(' Missing username or password');
            if (registerMessage) {
                registerMessage.textContent = 'Vinsamlegast fylltu út bæði svæði.';
                registerMessage.style.color = 'red';
            }
            return;
        }

        let storedUsers = getStoredUsers();

        if (storedUsers[newUsername]) {
            console.error('Username already exists:', newUsername);
            if (registerMessage) {
                registerMessage.textContent = 'Notandanafn er þegar í notkun.';
                registerMessage.style.color = 'red';
            }
        } else {
            console.info('Registering new user:', newUsername);
            storedUsers[newUsername] = newPassword;
            localStorage.setItem('users', JSON.stringify(storedUsers));

            if (registerMessage) {
                registerMessage.textContent = ' Nýr notandi skráður! Þú getur nú skráð þig inn.';
                registerMessage.style.color = 'green';
            }

            setTimeout(() => {
                showLoginForm();
            }, 1500);
        }
    }

    if (toggleRegister) toggleRegister.addEventListener('click', showRegisterForm);
    if (toggleLogin) toggleLogin.addEventListener('click', showLoginForm);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', registerUser);
    if (logoutButton) logoutButton.addEventListener('click', logout);

    checkLoginStatus();
});