//database setup
let adapter = new LocalStorage("GoalsDB");
let GoalsDB = low(adapter);
//db init
GoalsDB.defaults({ users: [], goals: [], currLogin: [] }).write();
const baseurl = window.location;
console.log(baseurl);
/********************* INITIALIZATION ***********************/
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

const registerForm = document.getElementById('registerForm');
const title = document.getElementById('title');
const username = document.getElementById('username');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

const loginForm = document.getElementById('loginForm');
const usernameLogin = document.getElementById('usernameLogin');
const passwordLogin = document.getElementById('passwordLogin');

const usersDB = GoalsDB.get('users')
const currLoginDB = GoalsDB.get('currLogin')

/********************* FORM BUTTON EVENTLISTENER ***********************/
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
    loginForm.children[1].classList.remove("error");
    loginForm.children[2].classList.remove("error");
    loginForm.children[1].classList.remove("success");
    loginForm.children[2].classList.remove("success");
    loginForm.reset();
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
    regArr = registerForm.querySelectorAll('div')
    regArr.forEach(element => {
        element.classList.remove("error");
        element.classList.remove("success");
    });
    registerForm.reset();
});


/*****************  UTILITY FUNCTION  ******************/
//checks username at the storage
const hasUsername = (x) => usersDB.find({ username: x }).has('username').value();
//checks if credentials is correct
const checkAccount = (usernameVal, pw) => usersDB.find({ username: usernameVal }).value().password === pw
//set current account login
const setSession = (currLoginObj) => currLoginDB.push(currLoginObj).write();
//create account
const createAccount = (regObj) => usersDB.push(regObj).write();




/*****************  LOGIN & REGISTRATION  ******************/
//REGISTER
registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const regObj = checkInputsRegister()
    if (regObj.success) {
        createAccount(regObj.data)
        Swal.fire(
            'Congratulations!',
            regObj.msg,
            'success'
        ).then((result) => {
            if (result.isConfirmed) {
                location.reload();
            }
        })
    }/*
     else {
        Swal.fire(
            'Oops...',
            regObj.msg,
            'warning'
        )
    }*/
});

//LOGIN
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const regObj = checkInputsLogin();
    if (regObj.success) {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Login Successful!',
            showConfirmButton: false,
            timer: 2000
        }).then((result) => {
            location.replace(`${baseurl}/main.html`);
        })
    }
});

/**REGISTER VALIDATION */
function checkInputsRegister() {
    // trim to remove the whitespaces
    const titleValue = title.value.trim();
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const password2Value = password2.value.trim();

    let ctr = 0;

    //validate goals title
    if (titleValue === '') {
        setErrorFor(title, 'Goal title cannot be blank');
    } else {
        setSuccessFor(title);
        ctr++;
    }
    //validate username
    if (usernameValue === '') {
        setErrorFor(username, 'Username cannot be blank');
    } else if (usernameValue.indexOf(' ') !== -1) {
        setErrorFor(username, 'Username must not have white spaces');
    } else if (hasUsername(usernameValue)) {
        setErrorFor(username, 'Username already exist');
    } else {
        setSuccessFor(username);
        ctr++;
    }
    //validate password
    if (passwordValue === '') {
        setErrorFor(password, 'Password cannot be blank');
    } else if (passwordValue.indexOf(' ') !== -1) {
        setErrorFor(password, 'Password must not have white spaces');
    } else if (passwordValue.length < 6) {
        setErrorFor(password, 'Password must be at least 6 characters');
    } else {
        setSuccessFor(password);
        ctr++;
    }
    //confirm password
    if (password2Value === '') {
        setErrorFor(password2, 'Confirm password cannot be blank');
    } else if (passwordValue !== password2Value) {
        setErrorFor(password2, 'Password does not match');
    } else {
        setSuccessFor(password2);
        ctr++;
    }

    //checks if all field are okay
    if (ctr === 4) {
        return {
            success: true,
            msg: "Account successfully created",
            data: { username: usernameValue, password: passwordValue, title: titleValue }
        }
    } else {
        return {
            success: false,
            msg: "Please check the input fields"
        }
    }
}

/**LOGIN VALIDATION */
function checkInputsLogin() {
    // trim to remove the whitespaces
    const usernameLoginValue = usernameLogin.value.trim();
    const passwordLoginValue = passwordLogin.value.trim();
    let ctr = 0;

    //login
    if (usernameLoginValue === '') {
        setErrorFor(usernameLogin, 'Username cannot be blank');
    } else if (!hasUsername(usernameLoginValue)) {
        setErrorFor(usernameLogin, 'Username does not exist');
    } else {
        setSuccessFor(usernameLogin);
        if (passwordLoginValue === '') {
            setErrorFor(passwordLogin, 'Password cannot be blank');
        } else {

            if (checkAccount(usernameLoginValue, passwordLoginValue)) {
                setSession(usersDB.find({ username: usernameLoginValue }).value())
                return {
                    success: true,
                    msg: "Login Successful"
                }
            } else {
                setErrorFor(passwordLogin, 'Incorrect Password');
                return {
                    success: false,
                    msg: "Login Failed."
                }
            }
        }
    }
    // if (passwordLoginValue === '') {
    //     setErrorFor(passwordLogin, 'Password cannot be blank');
    // } else {
    //     setSuccessFor(passwordLogin);
    // }
}


function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    formControl.className = 'form-control error';
    small.innerText = message;
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
}

/******************************* */
function my_code() {
    if (currLoginDB.value().length !== 0) {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'You are still logged in..',
            showConfirmButton: false,
            timer: 3000
        }).then((result) => {
            location.replace(`${baseurl}/ready-set-goal/main.html`);
        })
    }
}
window.onload = my_code();
