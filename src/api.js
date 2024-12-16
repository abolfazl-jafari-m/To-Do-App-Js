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
    }
}

async function showTask(id) {
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
    }
}

function taskModalContent(task){
    showTaskModal.innerHTML =  "";
    let {bgPriority , textPriority} = priorityColor[task.priority];
    let {bgStatus , textStatus} = statusColor[task.status];
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

taskFormModal.addEventListener("submit", async (e) => {

    e.preventDefault();
    let {taskTitle, description, status, priority, deadLine} = e.target;
    await createTask(taskTitle.value, description.value, status.value, priority.value, deadLine.value);
    closeFormModal();
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
        }
    } catch (err) {
        console.log(err)
    } finally {
        renderTasks();
    }
}

async function updateTask() {
    try {
        const response = await fetch(`${API_URL}/${task.id}`, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify({
                title: taskTitle.value,
                description: description.value,
                status: status.value,
                priority: document.querySelector("input[name=priority]:checked").value,
                deadLine: deadLine.value
            })
        });
        if (!response.ok) {
            throw new Error("connection is failed")
        } else {
            const result = await response.json();
            console.log(result);
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
        }
    } catch (err) {
        console.log(err);
    } finally {
        renderTasks();
    }

}

async function renderTasks() {
    toDoTable.innerHTML = "";
    await getTasks();
    tasks.forEach((item) => {
        let {bgPriority , textPriority} = priorityColor[item.priority];
        let {bgStatus , textStatus} = statusColor[item.status];
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