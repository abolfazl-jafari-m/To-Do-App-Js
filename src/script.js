const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const toDoForm = document.getElementById('toDoForm');
const toDoTable = document.getElementById("toDoTable");
const taskNameMessage = document.getElementById("taskName-message");
const dateMessage = document.getElementById("date-message");
const taskName = document.getElementById('taskName');
const status = document.getElementById('status');
const deadLine = document.getElementById('deadLine');
const priorities = document.getElementsByName('priority');
const addTaskBtn = document.getElementById('addTaskBtn');
const editTaskBtn = document.getElementById('editTaskBtn');
const showTaskModal = document.getElementById('showTaskModal');
const messageBox = document.getElementById('messageBox');


let toDoArray = [];
let task = null;

function showModal(taskId) {
    if (taskId) {
        task = toDoArray.find(item => item.id === taskId);
        taskName.value = task.taskName;
        status.value = task.status;
        deadLine.value = task.deadLine;
        for (const item of priorities) {
            item.checked = task.priority === item.value;
        }
        addTaskBtn.classList.add('hidden')
        editTaskBtn.classList.remove('hidden');
    } else {
        toDoForm.reset();
        addTaskBtn.classList.remove('hidden')
        editTaskBtn.classList.add('hidden');
    }
    modal.classList.remove("invisible", "opacity-0", 'hidden');
    overlay.classList.remove("invisible", "opacity-0", "hidden");
    overlay.classList.add("visible", "opacity-60");
    modal.classList.add("visible", "flex");
}

toDoForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    let {taskName, priority, status, deadLine} = evt.target
    let toDo = {
        id: Date.now().toString(36),
        taskName: (taskName.value === "") ? validate(taskNameMessage, "required") : (taskName.value.length <= 3) ? validate(taskNameMessage, "length") : accepted(taskNameMessage, taskName.value),
        priority: priority.value,
        status: status.value,
        deadLine: (deadLine.value === "") ? validate(dateMessage, "required") : accepted(dateMessage, deadLine.value)
    }
    if (!Object.values(toDo).includes(undefined)) {
        toDoArray.push(toDo);
        localStorage.setItem('toDoList', JSON.stringify(toDoArray));
        closeModal();
        renderToDoList();
        message("Your Task Successfully Add" , "#047857");
    }


});

function deleteTask(id) {
    let taskIndex = toDoArray.findIndex(item => item.id === id);
    toDoArray.splice(taskIndex, 1);
    localStorage.setItem('toDoList', JSON.stringify(toDoArray));
    renderToDoList();
    message("Your Task Successfully Delete" , "#BE123C");
}


function updateTask() {
    task.taskName = (taskName.value === "") ? validate(taskNameMessage, 'required') :
             (taskName.value.length <= 3) ? validate(taskNameMessage, "length") :
            accepted(taskNameMessage, taskName.value);
    task.priority = document.querySelector("input[name=priority]:checked").value
    task.status = status.value;
    task.deadLine = deadLine.value;
    localStorage.setItem('toDoList', JSON.stringify(toDoArray));
    closeModal();
    toDoForm.reset();
    renderToDoList();
    message("Your Task Successfully Update" , "#075985");
}

function showTask(id){
    showTaskModal.innerHTML = "";
    showTaskModal.classList.remove('hidden');
    showTaskModal.classList.add('flex')
    let task = toDoArray.find(item => item.id === id);
    showTaskModal.innerHTML = `
    <h3 class="font-bold text-2xl ">${task.taskName}</h3>
        <div class="flex w-full justify-between items-center">
            <div class="flex gap-3 items-center">
                <span class="font-semibold">Priority</span>
                <span class="bg-red-800 px-2 py-1 rounded-md">${task.priority}</span>
            </div>
            <div class="flex gap-3 items-center">
                <span class="font-semibold">Status</span>
                <span class="bg-yellow-600 px-2 py-1 rounded-md text-black">${task.status}</span>
            </div>
        </div>
        <p class="font-light">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci dolor eos fugiat harum, minus nihil
            non repellat repudiandae rerum tenetur!</p>
        <div class="text-xs flex gap-4">
            <span>DeadLine</span>
            <span dir="rtl">${new Date(task.deadLine).toLocaleDateString('fa-IR')}</span>
        </div>
        <span class="text-red-500 absolute top-3 right-5 font-bold text-2xl cursor-pointer" onclick="closeTaskShow()">&Cross;</span>
    `;
}

function closeTaskShow(){
    showTaskModal.classList.remove('flex');
    showTaskModal.classList.add('hidden');
}

function message(message , color){
    messageBox.innerHTML = message;
    messageBox.classList.remove( "invisible" , 'opacity-0');
    messageBox.classList.add( "visible" , 'opacity-100');
    messageBox.style.backgroundColor = color;

    setTimeout(()=>{
        messageBox.classList.remove( "visible" , 'opacity-100');
        messageBox.classList.add( "invisible" , 'opacity-0');
    }, 2000);
}

function validate(input, ...validation) {
    if (validation.includes("required")) {
        input.innerHTML = "This Field is Required"
    }
    if (validation.includes("length")) {
        input.innerHTML = "Min length is 4";
    }
}

function accepted(input, value) {
    input.innerHTML = "";
    return value
}

function closeModal() {
    modal.classList.remove("visible", 'flex');
    overlay.classList.remove("visible", "opacity-60");
    overlay.classList.add("invisible", "opacity-0", "hidden");
    modal.classList.add("invisible", "hidden");
}

function renderToDoList() {
    toDoTable.innerHTML = "";
    toDoArray = JSON.parse(localStorage.getItem('toDoList'));
    if (toDoArray) {
        toDoArray.forEach((item) => {
            toDoTable.innerHTML += `
         <tr>
                <td class="border border-gray-500 p-2">${item.taskName}</td>
                <td class="border border-gray-500 p-2"><span
                        class="px-2 py-1.5 bg-gray-400 rounded-2xl font-semibold text-xs">${item.priority}</span></td>
                <td class="border border-gray-500 p-2"><span
                        class="px-2 py-1.5 bg-red-700  rounded-2xl text-white font-semibold text-xs">${item.status}</span></td>
                <td class="border border-gray-500 p-2 hidden sm:table-cell"><span dir="rtl"
                        class="px-2 py-1 border-2 border-blue-300 rounded-2xl">${new Date(item.deadLine).toLocaleDateString('fa-IR', {
                year: "numeric",
                month: "long",
                day: "numeric"
            })}</span></td>
                <td class="border border-gray-500 p-2">
                    <button class="bg-red-600 p-1 rounded-md " onclick="deleteTask('${item.id}')"><img src="./assets/Image/delete-svgrepo-com.svg"
                                                                    alt="delete" class=" w-4"></button>
                    <button class="bg-blue-600 p-1 rounded-md " onclick="showModal('${item.id}')"><img src="./assets/Image/pen-f-svgrepo-com.svg"
                                                                     alt="edit" class="w-4"></button>
                    <button class="bg-gray-500 p-1 rounded-md " onclick="showTask('${item.id}')"><img src="./assets/Image/eye-svgrepo-com.svg" alt="see"
                                                                     class="w-4"></button>
                </td>
        </tr>
        `
        });
    } else {
        toDoArray = [];
    }
}

renderToDoList();