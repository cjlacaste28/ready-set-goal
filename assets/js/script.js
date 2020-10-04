//database setup
let adapter = new LocalStorage("GoalsDB");
let GoalsDB = low(adapter);

const baseurl = window.location.origin.location;
const usersDB = GoalsDB.get('users');
const currLogin = GoalsDB.get('currLogin');
const goals = GoalsDB.get('goals');

//Session Check
function check_session() {
    if (currLogin.value().length === 0) {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Redirecting to login page...',
            showConfirmButton: false,
            timer: 1500
        }).then((result) => {
            location.replace(`${baseurl}/index.html`);
        })
    }
}
window.onload = check_session();

/********************* INITIALIZATION ***********************/
const goalTitle = document.getElementById('goal-title');
//const settingsBtn = document.getElementById('titleModal');
const titleInput = document.getElementById('title-input');
const logoutBtn = document.getElementById('logout');
const saveTitleBtn = document.getElementById('save-title');

const addGoalBtn = document.getElementById('add-goal');
const saveGoalBtn = document.getElementById('save-goal');
const updateGoalBtn = document.getElementById('update-goal');
const termPicker = document.getElementById('term-picker');
const goalInput = document.getElementById('validationServer04');
const goalsForm = document.getElementById('goalsForm');







const user = currLogin.value()[0].username;
const title = currLogin.value()[0].title;

let currIdForUpdate = 0;
// const ltListElement = document.getElementById('lt-list');
// const mtListElement = document.getElementById('mt-list');
// const stListElement = document.getElementById('st-list');


const ltGoals = goals.filter(e => e.term === "long-term" && e.username === user).value();
const ltList = document.getElementById('lt-list');

const mtGoals = goals.filter(e => e.term === "midium-term" && e.username === user).value();
const mtList = document.getElementById('mt-list');

const stGoals = goals.filter(e => e.term === "short-term" && e.username === user).value();
const stList = document.getElementById('st-list');



/*****************  UTILITY FUNCTION  ******************/
//remove data from currLogin and back to login page
const logout = () => currLogin.remove({ title: title }).write();

//add goal
const addGoal = (goalObj) => goals.push(goalObj).write();

//delete goal record
const deleteGoal = (goalID) => goals.remove({ id: goalID }).write();

//edit goal record
const editGoal = (goalID, term, goalName) =>
    goals.find({ id: goalID }).assign({ term: term }, { goal: goalName }).write();

//update status
const setStatus = (goalID, stats) =>
    goals.find({ id: goalID }).assign({ status: stats }).write();



//update goal title
const updateTitle = (currTitle) => {
    currLogin.find({ username: user }).assign({ title: currTitle }).write()
    usersDB.find({ username: user }).assign({ title: currTitle }).write()
}


//load goals data
const loadGoals = (terms, list) => {
    let isDone, isUndone;
    terms.forEach((el) => {
        isDone = '', isUndone = '';
        (el.status == 'undone') ? isUndone = "d-none" : isDone = "d-none";
        const data = `
        <li data-id="${el.id}">
            <div class="goalData">
                <span class="${el.status}">${el.goal}</span>
                <div class="ellipsis-menu">
                    <div class="dropdown dropleft">
                        <a type="button" id="dropdownMenu2" data-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false"
                            class="w-100 text-dark text-center">
                            <i class="fas fa-ellipsis-v"></i>
                        </a>
                        <div class="dropdown-menu dropdown-primary goal-buttons">
                            <a class="dropdown-item done-goal ${isDone}" href="#"><i
                                    class="fas fa-check"></i>&nbsp;&nbsp;Done</a>
                            <a class="dropdown-item undone-goal ${isUndone}" href="#"><i
                                    class="fas fa-redo"></i>&nbsp;&nbsp;Undone</a>
                            <a class="dropdown-item edit-goal" data-toggle="modal" data-target="#addGoalsModal" id="edit-goal" href="#"><i
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

//counts the goals at specific term <ul>
const termLengthChecker = (term) => {
    return goals.filter(e => e.term === term && e.username === user).value().length;
}

//add mode
const addMode = () => {
    document.querySelector('#update-goal').classList.add('d-none')
    document.querySelector('#save-goal').classList.remove('d-none')
}
//edit mode
const editMode = () => {
    document.querySelector('#save-goal').classList.add('d-none')
    document.querySelector('#update-goal').classList.remove('d-none')
}

//goal set to done
const setDone = (goalID) => {
    //show undone button
    document.querySelectorAll(`li[data-id="${goalID}"] > div > div > div > div > a`)[1]
        .classList.remove('d-none');
    //hide done button    
    document.querySelectorAll(`li[data-id="${goalID}"] > div > div > div > div > a`)[0]
        .classList.add('d-none');
    //put line-through on goal text
    const goalName = document.querySelector(`li[data-id="${goalID}"] > div > span`)
        .classList.replace("undone", "done")
    //update status on database    
    setStatus(goalID, "done");
}

//goal set to undone
const setUndone = (goalID) => {
    //show done button
    document.querySelectorAll(`li[data-id="${goalID}"] > div > div > div > div > a`)[0]
        .classList.remove('d-none');
    //hide undone button    
    document.querySelectorAll(`li[data-id="${goalID}"] > div > div > div > div > a`)[1]
        .classList.add('d-none');
    //remove line-through on goal text
    const goalName = document.querySelector(`li[data-id="${goalID}"] > div > span`)
        .classList.replace("done", "undone")
    //update status on database    
    setStatus(goalID, "undone");
}


const deleteConfirm = (element, id, term, list) => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            //delete from storage
            deleteGoal(id);
            //delete UI
            element.remove();
            //checks if the list in empty
            if (termLengthChecker(term) < 1) {
                //display List empty icon
                document.querySelector(list).previousElementSibling.classList.remove('d-none')
            }
            Swal.fire(
                'Deleted!',
                'Goal record has been deleted.',
                'success'
            )
        }
    })
}

//setup edit on popup form
const editGoalInit = (goalID, term, list) => {
    const goalName = document.querySelector(`li[data-id="${goalID}"] > div > span`).innerText
    editMode();
    goalsForm.classList.remove("was-validated");
    termPicker.value = term;
    goalInput.value = goalName;
    currIdForUpdate = goalID;
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
            location.replace(`${baseurl}/index.html`);
        }
    })
});

saveTitleBtn.addEventListener('click', () => {
    if (titleInput.value.trim() !== '') {
        updateTitle(titleInput.value.trim());
        Swal.fire(
            'Done!',
            'Update Successful',
            'success'
        ).then((result) => {
            location.reload();
        })
    } else {
        Swal.fire(
            'Opss...',
            'Goal Title should not be empty ',
            'error'
        ).then((result) => {
            location.reload();
        })
    }
});

//floating add button
addGoalBtn.addEventListener('click', () => {
    addMode(); goalsForm.reset();
    goalsForm.classList.remove("was-validated");
});

//add goal record
saveGoalBtn.addEventListener('click', () => {
    const goalObj = goalsAddInputCheck()
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
//update goal record
updateGoalBtn.addEventListener('click', () => {
    const goalObj = goalUpdateInputCheck(currIdForUpdate)
    if (goalObj.isSuccess) {
        Swal.fire(
            'Successful!',
            goalObj.msg,
            'success'
        ).then((result) => {
            location.reload();
        })
    }
});

//LONG TERM LIST
ltList.addEventListener("click", function (event) {
    const goalElement = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
    const goalID = parseInt(goalElement.dataset.id);
    if (event.target.className.includes("delete-goal")) {
        deleteConfirm(goalElement, goalID, "long-term", '#lt-list');
    }

    if (event.target.className.includes("edit-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        editGoalInit(goalID, "long-term", '#lt-list');
    }
    // console.log(document.querySelectorAll(`li[data-id="${goalID}"] > div > div > div > div > a`)[1].classList.remove('d-none'));
    if (event.target.className.includes("done-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        setDone(goalID);
    }
    if (event.target.className.includes("undone-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        setUndone(goalID);
    }


});
//MIDIUM TERM LIST
mtList.addEventListener("click", function (event) {
    const goalElement = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
    const goalID = parseInt(goalElement.dataset.id);
    if (event.target.className.includes("delete-goal")) {
        deleteConfirm(goalElement, goalID, "midium-term", '#mt-list');
    }

    if (event.target.className.includes("edit-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        editGoalInit(goalID, "midium-term", '#mt-list');
    }
    if (event.target.className.includes("done-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        setDone(goalID);
    }
    if (event.target.className.includes("undone-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        setUndone(goalID);
    }

});
//SHORT TERM LIST
stList.addEventListener("click", function (event) {
    const goalElement = event.target.parentNode.parentNode.parentNode.parentNode.parentNode;
    const goalID = parseInt(goalElement.dataset.id);
    if (event.target.className.includes("delete-goal")) {
        deleteConfirm(goalElement, goalID, "short-term", '#st-list');
    }

    if (event.target.className.includes("edit-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        editGoalInit(goalID, "short-term", '#st-list');
    }
    if (event.target.className.includes("done-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        setDone(goalID);
    }
    if (event.target.className.includes("undone-goal")) {
        console.log(`Debug Info -> Goal ID: ${goalID} and Goal Element: ${goalElement}`);
        setUndone(goalID);
    }

});


/*****************  VALIDATION  ******************/
//add input validation
const goalsAddInputCheck = () => {
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
                    status: "undone",
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
//update  goal input validation
const goalUpdateInputCheck = (currId) => {
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
            editGoal(currId, termPicker.value, goalVal)
            return {
                isSuccess: true,
                msg: 'Goal has been updated'
            }
        } else {
            return {
                isSuccess: false,
                msg: 'Please check the fields error'
            }
        }
    }

}





function my_code() {

    //title init 
    goalTitle.innerText = title
    titleInput.value = title;

    /**Record Filter */

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
