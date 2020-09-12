function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
}


////////////////////////////////////////////


//database setup
let adapter = new LocalStorage("GoalsDB");
let GoalsDB = low(adapter);

/********************* INITIALIZATION ***********************/
const goalTitle = document.getElementById('goal-title');
//const settingsBtn = document.getElementById('titleModal');
const titleInput = document.getElementById('title-input');
const logoutBtn = document.getElementById('logout');
const saveTitleBtn = document.getElementById('save-title');

const addGoalBtn = document.getElementById('add-goal');
const saveGoalBtn = document.getElementById('save-goal');
const termPicker = document.getElementById('term-picker');
const goalInput = document.getElementById('validationServer04');
const goalsForm = document.getElementById('goalsForm');


const usersDB = GoalsDB.get('users')
const currLogin = GoalsDB.get('currLogin')
const goals = GoalsDB.get('goals')
const user = currLogin.value()[0].username
const title = currLogin.value()[0].title



/*****************  UTILITY FUNCTION  ******************/
//remove data from currLogin and back to login page
const logout = () => currLogin.remove({ title: title }).write()

//add goal
const addGoal = (goalObj) => goals.push(goalObj).write();

//update goal title
const updateTitle = (currTitle) => {
    currLogin.find({ username: user }).assign({ title: currTitle }).write()
    usersDB.find({ username: user }).assign({ title: currTitle }).write()
}

//load goals data
const loadGoals = (terms, list) => {
    terms.forEach((el) => {
        const data = `
        <li data-id="${el.id}">
            <div class="goalData">
                <span>${el.goal}</span>
                <div class="ellipsis-menu">
                    <div class="dropdown dropleft">
                        <a type="button" id="dropdownMenu2" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false"
                            class="w-100 text-dark text-center">
                            <i class="fas fa-ellipsis-v"></i>
                        </a>
                        <div class="dropdown-menu dropdown-primary">
                            <a class="dropdown-item done-goal" href="#"><i
                                    class="fas fa-check"></i>&nbsp;&nbsp;Done</a>
                            <a class="dropdown-item undone-goal d-none" href="#"><i
                                    class="fas fa-redo"></i>&nbsp;&nbsp;Undone</a>
                            <a class="dropdown-item edit-goal" href="#"><i
                                    class="fas fa-edit"></i>&nbsp;&nbsp;Edit</a>
                            <a class="dropdown-item delete-goal" href="#"><i
                                    class="fas fa-trash"></i>&nbsp;&nbsp;Remove</a>
                        </div>
                    </div>
                </div>
            </div>
        </li>`
        list.innerHTML += data;
    })
}




/*****************  EVENT LISTENER  ******************/
logoutBtn.addEventListener('click', () => {
    logout();
    Swal.fire(
        'Goodbye!',
        'Logout Successful',
        'success'
    ).then((result) => {
        if (result.isConfirmed) {
            location.replace("http://127.0.0.1:5500/login.html");
        }
    })
});

saveTitleBtn.addEventListener('click', () => {
    updateTitle(titleInput.value.trim());
    Swal.fire(
        'Done!',
        'Update Successful',
        'success'
    ).then((result) => {
        location.reload();
    })
});

addGoalBtn.addEventListener('click', () => {
    goalsForm.classList.remove("was-validated")
});

saveGoalBtn.addEventListener('click', () => {
    const goalObj = goalsInputCheck()
    if (goalObj.isSuccess) {
        addGoal(goalObj.data)
        Swal.fire(
            'Successful!',
            goalObj.msg,
            'success'
        ).then((result) => {
            location.reload();
        })
    }
});




/*****************  VALIDATION  ******************/

const goalsInputCheck = () => {
    const goalVal = goalInput.value.trim();
    let ctr = 0;

    if (termPicker.value === '') {
        goalsForm.classList.add("was-validated")
        ctr++;
    } else if (goalVal === '') {
        goalsForm.classList.add("was-validated")
        ctr++;
    } else {
        if (ctr === 0) {
            return {
                isSuccess: true,
                msg: 'Goal has been added',
                data: {
                    id: Math.floor(Math.random() * Date.now()),
                    term: termPicker.value,
                    goal: goalVal,
                    status: "ongoing",
                    username: user
                }
            }
        } else {
            return {
                isSuccess: false,
                msg: 'Please check the fields error',
                data: null
            }
        }
    }
}

function my_code() {
    //title init 
    goalTitle.innerText = title
    titleInput.value = title;

    const ltGoals = goals.filter(e => e.term === "long-term" && e.username === user).value();
    const ltList = document.getElementById('lt-list');

    const mtGoals = goals.filter(e => e.term === "midium-term" && e.username === user).value();
    const mtList = document.getElementById('mt-list');

    const stGoals = goals.filter(e => e.term === "short-term" && e.username === user).value();
    const stList = document.getElementById('st-list');


    if (ltGoals.length > 0) {
        document.querySelector('#lt-list').previousElementSibling.classList.add('d-none')
        loadGoals(ltGoals, ltList)
    }

    if (mtGoals.length > 0) {
        document.querySelector('#mt-list').previousElementSibling.classList.add('d-none')
        loadGoals(mtGoals, mtList)
    }

    if (stGoals.length > 0) {
        document.querySelector('#st-list').previousElementSibling.classList.add('d-none')
        loadGoals(stGoals, stList)
    }
}

window.onload = my_code();
