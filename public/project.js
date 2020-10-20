
state.tasksAvailable = state.tasks.filter(task => task.status == 'available')
state.tasksInProgress = state.tasks.filter(task => task.status == 'inProgress')
state.tasksComplete = state.tasks.filter(task => task.status == 'complete')

class Task  {
    constructor(data) {
        this.name = data.get('name')
        this.status = 'available'
    }
}


const view = (state) => `
        <div class="body-contents">
        <div class="topNav">
            <a class ="navButton" href="/projectboards">Manage Projects</a>
        </div>
        <div class="projectBoard">
            <div class="header">${state.projectBoard.name}</div>
            <div class="userContainer">${state.users.map(user => `
            <div class="userLabel" id="${user.id}" draggable="true" ondragstart="app.run('onDrag', event)"><div  class="user-image"  style="background-image: url(${user.image});"></div><div>${user.name}</div></div> `).join("")}</div>
            <div class= "projectContents">
                    <div class ="listCard">
                        <div class="listHeader">To Do</div>
                        <div class="taskContainer" id="container" >
                            ${state.tasksAvailable.map(task => `
                            <div id="${task.id}" class="taskCard" draggable="true" ondragstart="app.run('onDrag', event)">
                                <div class="taskHeader">${task.name}</div>
                                <div ondragover="event.preventDefault()" >
                                    <div class="userLabel" id="${task.id}" draggable="false" ondrop="app.run('onDropUser', event, this)">
                                        <div class= "user-image" style="background-image: url(${state.users.filter(user => user.id == task.UserId).map(user => user.image)});">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `).join("")}
                            <div class="taskCard" ondrop="app.run('onDropUser', event)">
                                <form onsubmit="app.run('add', this);return false;">
                                    <label> Name : </label>
                                    <input name="name" type="text" placeholder="Task Description" required> <br>
                                    <input name="status" value="available" type="hidden">
                                    <button class='submit2'>submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class ="listCard" ondragover="event.preventDefault()" id="inProgress" ondrop="app.run('onDropTask', event, this)">
                        <div class="listHeader">In Progress</div>
                        <div class="taskContainer" id="container" >
                        ${state.tasksInProgress.map(task => `
                        <div id="${task.id}" class="taskCard" draggable="true" ondragstart="app.run('onDrag', event)" ondragover="event.preventDefault()">
                                <div class="taskHeader">${task.name}</div>
                                <div ondragover="event.preventDefault()" >
                                    <div class="userLabel" id="${task.id}" ondrop="app.run('onDropUser', event, this)">
                                        <div class= "user-image" style="background-image: url(${state.users.filter(user => user.id == task.UserId).map(user => user.image)});">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `).join("")}    
                        </div>
                    </div>
                    <div class ="listCard" ondragover="event.preventDefault()" id="complete" ondrop="app.run('onDropTask', event, this)">
                        <div class="listHeader">Done</div>
                        <div class="taskContainer" id="container">
                        ${state.tasksComplete.map(task => `
                        <div id="${task.id}" class="taskCard" draggable="true" ondragstart="app.run('onDrag', event)" ondragover="event.preventDefault()">
                                <div class="taskHeader">${task.name}</div>
                                <div ondragover="event.preventDefault()" >
                                    <div class="userLabel" id="${task.id}" ondrop="app.run('onDropUser', event, this)">
                                        <div class= "user-image" style="background-image: url(${state.users.filter(user => user.id == task.UserId).map(user => user.image)});">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            `).join("")}
                        </div>
                    </div>
            </div>
        </div>
        </div>
`

const update = {
    add: async (state, form) => {
        const data = new FormData(form)
        const task = new Task(data)
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        }
        state.tasksAvailable.push(task)
        fetch(`/addTask/${state.projectBoard.id}`, postRequest).then(() => app.run('getTasks'))
        return state
    },



    onDrag: (state, event) => {
        event.dataTransfer.setData('text', event.target.id)
        return state
    },

    onDropTask: (state, event, statusName) => {
        event.preventDefault()
        console.log(statusName.id)
        const id = event.dataTransfer.getData('text')
        const index = state.tasks.findIndex(task => task.id == id)
        const task = state.tasks[index]
        task.status = statusName.id
        state.tasksAvailable = state.tasks.filter(task => task.status == 'available')
        state.tasksInProgress = state.tasks.filter(task => task.status == 'inProgress')
        state.tasksComplete = state.tasks.filter(task => task.status == 'complete')
        statusName = statusName.id
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task),
                
        }
        fetch('/taskUpdate', postRequest).then(() => app.run('getTasks'))
        // app.run('taskComplete', task)
        return state
    },
    onDropUser:(state, event, taskId) =>{
        const id = event.dataTransfer.getData('text')
        const index = state.users.findIndex(user => user.id == id)
        const user = state.users[index]
        console.log(user)
        const taskIndex = state.tasks.findIndex(task => task.id == taskId.id)
        const task = state.tasks[taskIndex]
        task.UserId = user.id
        state.tasksAvailable = state.tasks.filter(task => task.status == 'available')
        state.tasksInProgress = state.tasks.filter(task => task.status == 'inProgress')
        state.tasksComplete = state.tasks.filter(task => task.status == 'complete')
        const userPK = user.id
        user.TaskId = task.id
        const postRequest = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user),
        }
        
        
        fetch('/assignUserTask', postRequest).then(() => app.run('getTasks'))
        return state
    },
    getTasks: async (state) => {
        const result = await fetch(`/fetchTaskList/${state.projectBoard.id}`).then(res => res.json())
        state.tasks = result[1]
        state.projectBoard = result[0]
        return state
    }
}
app.start('project',state,view,update)
app.run('getTasks')