const API_URL = "http://api.alikooshesh.ir:3000/api/records/todo";
const API_KEY = "Jafari-M-124jc4mpkFur7lP4J0WqFJj0hw8sNzKr6yZa5RwkiBsivLPcTsTvUeUkWfyB9xInMPoH0lGppvmHskpCc4qbbEeth6ix3alIWanmDywUK9TjQMKq3hhdwhg";
const headers = new Headers({
    'Content-Type': "application/json",
    'api_key': API_KEY
})


const toDoTable = document.getElementById("toDoTable");
const taskFormModal = document.getElementById('taskFormModal');
const overlay = document.getElementById('overlay');
const toDoForm = document.getElementById('toDoForm');
const taskTitleMessage = document.getElementById("taskTitle-message");
const dateMessage = document.getElementById("date-message");
const descriptionMessage = document.getElementById('description-message')
const taskTitle = document.getElementById('taskTitle');
const description = document.getElementById('description');
const status = document.getElementById('status');
const deadLine = document.getElementById('deadLine');
const priorities = document.getElementsByName('priority');
const addTaskBtn = document.getElementById('addTaskBtn');
const editTaskBtn = document.getElementById('editTaskBtn');
const showTaskModal = document.getElementById('showTaskModal');
const messageBox = document.getElementById('messageBox');
const messages = document.querySelectorAll("span[id$=message]");
const loading = document.getElementById("loading")

const statusColor = {
    toDo: {bgStatus: "bg-[#DC2626]", textStatus: "text-white"},
    Doing: {bgStatus: "bg-[#ffc107]", textStatus: "text-black"},
    Done: {bgStatus: "bg-[#2e7d32]", textStatus: "text-white"},
}
const priorityColor = {
    low: {bgPriority: "bg-gray-300", textPriority: "text-black"},
    medium: {bgPriority: "bg-[#ffc107]", textPriority: "text-black"},
    high: {bgPriority: "bg-[#DC2626]", textPriority: "text-white"}
}


let tasks = [];
let task = null;

function showFormModal(taskId) {
    if (taskId) {
        task = tasks.find(item => item.id === taskId);
        taskTitle.value = task.title;
        description.value = task.description;
        status.value = task.status;
        deadLine.value = task.deadLine;
        for (const item of priorities) {
            if (item.value === task.priority) {
                item.checked = true;
            }
        }

        addTaskBtn.classList.add("hidden");
        editTaskBtn.classList.remove("hidden");
    } else {

        addTaskBtn.classList.remove("hidden");
        editTaskBtn.classList.add("hidden");
    }
    taskFormModal.classList.remove("invisible", "opacity-0", 'hidden');
    overlay.classList.remove("invisible", "opacity-0", "hidden");
    overlay.classList.add("visible", "opacity-60");
    taskFormModal.classList.add("visible", "flex");
}

function closeFormModal() {
    overlay.classList.remove("visible", "opacity-60");
    taskFormModal.classList.remove("visible", "flex");
    taskFormModal.classList.add("invisible", "opacity-0", 'hidden');
    overlay.classList.add("invisible", "opacity-0", "hidden");
    clearMessages();
    toDoForm.reset();
}

function clearMessages() {
    messages.forEach(item => {
        item.innerHTML = "";
    })
}


async function getTasks() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'api_key': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error("connection Failed");
        } else {
            const result = await response.json();
            tasks = result.records;
        }
    } catch (err) {
        console.log(err)
    } finally {
        loading.classList.remove("flex");
        loading.classList.add("hidden");
    }
}

async function showTask(id) {
    loading.classList.remove("hidden");
    loading.classList.add("flex");
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: headers,
            method: "GET"
        })
        if (!response.ok) {
            throw new Error("connection is Failed")
        } else {
            const result = await response.json();
            showTaskModal.classList.remove("hidden");
            showTaskModal.classList.add("flex");
            taskModalContent(result);
        }
    } catch (e) {
        console.log(e);
    } finally {
        loading.classList.remove("flex");
        loading.classList.add("hidden");
    }
}

function taskModalContent(task) {
    showTaskModal.innerHTML = "";
    let {bgPriority, textPriority} = priorityColor[task.priority];
    let {bgStatus, textStatus} = statusColor[task.status];
    showTaskModal.innerHTML = `
     <h3 class="font-bold text-2xl ">${task.title}</h3>
        <div class="flex w-full justify-between items-center">
            <div class="flex gap-3 items-center">
                <span class="font-semibold">Priority</span>
                <span class="${bgPriority} ${textPriority} px-2 py-1 rounded-md">${task.priority}</span>
            </div>
            <div class="flex gap-3 items-center">
                <span class="font-semibold">Status</span>
                <span class="${bgStatus} ${textStatus} px-2 py-1 rounded-md text-black">${task.status}</span>
            </div>
        </div>
        <p class="font-light">${task.description}</p>
        <div class="text-xs flex gap-4">
            <span>DeadLine</span>
            <span dir="rtl">${new Date(task.deadLine).toLocaleDateString('fa-IR')}</span>
        </div>
        <span class="text-red-500 absolute top-3 right-5 font-bold text-2xl cursor-pointer" onclick="closeTaskShow()">&Cross;</span>
    `;
}

function closeTaskShow() {
    showTaskModal.classList.remove('flex');
    showTaskModal.classList.add('hidden');
}

toDoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let {taskTitle, description, status, priority, deadLine} = e.target;
    let validated = {
        title:
            (taskTitle.value === "") ?
                validate(taskTitleMessage, {validation: ['required']}) :
                (taskTitle.value.length < 4) ?
                    validate(taskTitleMessage, {validation: ['length'], option: {length: 4}}) :
                    accepted(taskTitleMessage, taskTitle.value),
        description:
            (description.value === "") ?
                validate(descriptionMessage, {validation: ['required']}) :
                (description.value.length < 10) ?
                    validate(descriptionMessage, {validation: ['length'], option: {length: 10}}) :
                    accepted(descriptionMessage, description.value),
        status: status.value,
        priority: priority.value,
        deadLine: (deadLine.value === "") ?
            validate(dateMessage, {validation: ['required']}) :
            accepted(dateMessage, deadLine.value)
    }
    if (!Object.values(validated).includes(undefined)) {
        loading.classList.remove("hidden");
        loading.classList.add("flex");
        await createTask(validated.title, validated.description, validated.status, validated.priority, validated.deadLine);
        closeFormModal();
        toDoForm.reset();
    }
})

async function createTask(title, description, status, priority, deadLine) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                title,
                description,
                status,
                priority,
                deadLine
            })
        });
        if (!response.ok) {
            throw new Error("connection is failed");
        } else {
            const result = await response.json();
            message("Your Task Successfully Add", "#047857");
        }
    } catch (err) {
        console.log(err)
    } finally {
        renderTasks();
    }
}

async function editTask() {
    let validated = {
        title:
            (taskTitle.value === "") ?
                validate(taskTitleMessage, {validation: ['required']}) :
                (taskTitle.value.length < 4) ?
                    validate(taskTitleMessage, {validation: ['length'], option: {length: 4}}) :
                    accepted(taskTitleMessage, taskTitle.value),
        description:
            (description.value === "") ?
                validate(descriptionMessage, {validation: ['required']}) :
                (description.value.length < 10) ?
                    validate(descriptionMessage, {validation: ['length'], option: {length: 10}}) :
                    accepted(descriptionMessage, description.value),
        status: status.value,
        priority: document.querySelector("input[name=priority]:checked").value,
        deadLine: (deadLine.value === "") ?
            validate(dateMessage, {validation: ['required']}) :
            accepted(dateMessage, deadLine.value)
    }
    if (!Object.values(validated).includes(undefined)) {
        loading.classList.remove("hidden");
        loading.classList.add("flex");
        await updateTask(task.id, validated.title, validated.description, validated.status, validated.priority, validated.deadLine);
        closeFormModal();
    }
}
async function updateTask(id, title, description, status, priority, deadLine) {
    try {
        const response = await fetch(`${API_URL}/${task.id}`, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({
                title,
                description,
                status,
                priority,
                deadLine
            })
        });
        if (!response.ok) {
            throw new Error("connection is failed")
        } else {
            const result = await response.json();
            message("Your Task Successfully Update", "#075985");
        }
    } catch (err) {
        console.log(err)
    } finally {
        closeFormModal();
        renderTasks();
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!response.ok) {
            throw new Error("connection is Failed");
        } else {
            const result = await response.json()
            message("Your Task Successfully Delete", "#BE123C");
        }
    } catch (err) {
        console.log(err);
    } finally {
        renderTasks();
    }

}

async function renderTasks() {
    toDoTable.innerHTML = "";
    loading.classList.remove("hidden");
    loading.classList.add("flex");
    await getTasks();
    tasks.forEach((item) => {
        let {bgPriority, textPriority} = priorityColor[item.priority];
        let {bgStatus, textStatus} = statusColor[item.status];
        toDoTable.innerHTML += `
         <tr>
                <td class="border border-gray-500 p-2">${item.title}</td>
                <td class="border border-gray-500 p-2"><span
                        class="px-2 py-1.5 ${bgPriority} rounded-2xl font-semibold text-xs ${textPriority}">${item.priority}</span></td>
                <td class="border border-gray-500 p-2"><span
                        class="px-2 py-1.5 ${bgStatus} rounded-2xl ${textStatus} font-semibold text-xs">${item.status}</span></td>
                <td class="border border-gray-500 p-2 hidden sm:table-cell"><span dir="rtl"
                        class="px-2 py-1 border-2 border-blue-300 rounded-2xl">${new Date(item.deadLine).toLocaleDateString('fa-IR', {
            year: "numeric",
            month: "long",
            day: "numeric"
        })}</span></td>
                <td class="border border-gray-500 p-2">
                    <button class="bg-red-600 p-1 rounded-md " onclick="deleteTask('${item.id}')"><img src="./assets/Image/delete-svgrepo-com.svg"
                                                                    alt="delete" class=" w-4"></button>
                    <button class="bg-blue-600 p-1 rounded-md " onclick="showFormModal('${item.id}')"><img src="./assets/Image/pen-f-svgrepo-com.svg"
                                                                     alt="edit" class="w-4"></button>
                    <button class="bg-gray-500 p-1 rounded-md " onclick="showTask('${item.id}')"><img src="./assets/Image/eye-svgrepo-com.svg" alt="see"
                                                                     class="w-4"></button>
                </td>
        </tr>
        `
    });
}

renderTasks()
    .catch(e => {
        console.log(e)
    })


function validate(inputMessage, options) {
    let {validation = [], option: {length} = {}} = options;
    let messages = []
    if (validation.includes('required')) {
        messages.push("this field is required");
    }
    if (validation.includes('length')) {
        messages.push("min length is " + length);
    }
    inputMessage.innerHTML = messages.join(" . ");
}

function accepted(inputMessage, value) {
    inputMessage.innerHTML = ""
    return value;
}

function message(message, color) {
    messageBox.innerHTML = message;
    messageBox.classList.remove("invisible", 'opacity-0');
    messageBox.classList.add("visible", 'opacity-100');
    messageBox.style.backgroundColor = color;

    setTimeout(() => {
        messageBox.classList.remove("visible", 'opacity-100');
        messageBox.classList.add("invisible", 'opacity-0');
    }, 3000);
}