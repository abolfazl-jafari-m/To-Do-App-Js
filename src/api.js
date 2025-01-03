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
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error-box");
const errorMessage = document.getElementById('error-message');
const filterBtn = document.getElementById('filter-btn');
const filterModal = document.getElementById('filter-modal');
const filterForm = document.getElementById("filter-form");
const searchInput = document.getElementById('search');
const rowPerPage = document.getElementById('pagination');
const pageNumber = document.getElementById('page-number');

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
let tasksPerPage = [];
let task = null;
let currentPage = 0;
let perPage = "All";


/////////////DOM
toDoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let {taskTitle, description, status, priority, deadLine} = e.target;
    let validated = {
        title:
            (taskTitle.value === "" || taskTitle.value.length < 4) ?
                validate("required | min:4", taskTitleMessage) :
                accepted(taskTitle.value, taskTitleMessage),
        description:
            (description.value === "" || description.value.length < 10) ?
                validate("required | min:10", descriptionMessage) :
                accepted(description.value, descriptionMessage),
        status: status.value,
        priority: priority.value,
        deadLine: (deadLine.value === "") ?
            validate("required", dateMessage) :
            accepted(deadLine.value, dateMessage)
    }
    if (!Object.values(validated).includes(undefined)) {
        loading.classList.remove("hidden");
        loading.classList.add("flex");
        createTask(validated.title, validated.description, validated.status, validated.priority, validated.deadLine)
            .then((res) => {
                tasks.unshift(res)
            }).finally(() => {
            loading.classList.add("hidden");
            loading.classList.remove("flex");
            renderTasks(tasks);
        })
        closeFormModal();
        toDoForm.reset();
    }
})

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

function showBtnHandler(id) {
    loading.classList.remove("hidden");
    loading.classList.add("flex");
    showTask(id)
        .then((res) => {
            showTaskModal.classList.remove("hidden");
            showTaskModal.classList.add("flex");
            taskModalContent(res);
        }).finally(() => {
        loading.classList.add("hidden");
        loading.classList.remove("flex");
    })
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

function deleteBtnHandler(id) {
    loading.classList.remove("hidden");
    loading.classList.add("flex");
    deleteTask(id)
        .then((res) => {
            let index = tasks.findIndex(item => id === item.id);
            tasks.splice(index, 1);
            // console.log(tasks , index , res );
            renderTasks(tasks);
        })
        .finally(() => {
            loading.classList.add("hidden");
            loading.classList.remove("flex");
        })
}

function updateBtnHandler() {
    let validated = {
        title:
            (taskTitle.value === "") ?
                validate("required", taskTitleMessage) :
                (taskTitle.value.length < 4) ?
                    validate("min:4", taskTitleMessage) :
                    accepted(taskTitle.value, taskTitleMessage),
        description:
            (description.value === "") ?
                validate("required", descriptionMessage) :
                (description.value.length < 10) ?
                    validate("min:10", descriptionMessage) :
                    accepted(description.value, descriptionMessage),
        status: status.value,
        priority: document.querySelector("input[name=priority]:checked").value,
        deadLine: (deadLine.value === "") ?
            validate("required", dateMessage) :
            accepted(deadLine.value, dateMessage)
    }
    if (!Object.values(validated).includes(undefined)) {
        loading.classList.remove("hidden");
        loading.classList.add("flex");
        updateTask(task.id, validated.title, validated.description, validated.status, validated.priority, validated.deadLine)
            .then((res) => {
                let index = tasks.findIndex((item) => item.id === res.id);
                tasks.splice(index, 1, res);
            }).finally(() => {
            renderTasks(tasks);
            loading.classList.add("hidden");
            loading.classList.remove("flex");
        })
        closeFormModal();
    }
}

function errorModal() {
    errorBox.classList.remove("hidden");
    setTimeout(() => {
        errorBox.classList.add("hidden");
    }, 5000);
}

function toggleFilterModal() {
    filterModal.classList.toggle("hidden");
}


//////Functionality
filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let {statusFilter, priorityFilter, dateFilter} = e.target;
    filterTasks(statusFilter.value, priorityFilter.value, dateFilter.value);
});

filterForm.addEventListener("reset", (e) => {
    filterTasks("", "", "");
});


function filterTasks(status, priority, deadLine) {
    let filtered;
    filtered = tasks.filter((item) => {
        let statusState = (status === "") ? true : (status === item.status);
        let priorityState = (priority === "") ? true : (priority === item.priority);
        let deadLineState = (deadLine === "") ? true : Date.parse(deadLine) <= Date.parse(item.deadLine);
        return (statusState && priorityState && deadLineState);
    })
    renderTasks(filtered);
}


searchInput.addEventListener("input", (e) => {
    searchTasks(searchInput.value);
});

function searchTasks(searching) {
    let result = tasks.filter(item => {
        // return item.title.includes(searching);
        return item.title.startsWith(searching);
    });
    renderTasks(result);
}

function pagination(arr, current, perPage) {
    tasksPerPage = [];
    if (perPage === "All" || isNaN(perPage)) {
        perPage = arr.length;
    }
    for (let i = 0; i < arr.length; i += perPage) {
        tasksPerPage.push(arr.slice(i, i + perPage));
    }
    let totalPages = Math.ceil(arr.length / perPage) || 1;
    pageNumber.innerHTML = `${current + 1} of ${totalPages}`
    return tasksPerPage[current];
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
    }
    renderTasks(tasks);
}

function nextPage() {
    if (currentPage < tasksPerPage.length - 1) {
        currentPage++;
    }
    renderTasks(tasks);
}

rowPerPage.addEventListener("change", () => {
    currentPage = 0;
    perPage = Number(rowPerPage.value);
    renderTasks(tasks);
})

/////////Fetch Requests
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
            throw new Error("Receiving Data is Failed . Please Try Later");
        } else {
            const result = await response.json();
            tasks = result.records;
            tasks.reverse();
        }
    } catch (err) {
        if (err instanceof TypeError) {
            errorHandler("Fetch Operation is UnSuccessful");
        } else {
            errorHandler(err);
        }
    }
}

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
            throw new Error("Task isn't create Successfully .Please Try Again");
        } else {
            message("Your Task Successfully Add", "#047857");
            return await response.json();
        }
    } catch (err) {
        errorHandler(err);
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!response.ok) {
            throw new Error("Delete Operation not Complete . Please Try Again");
        } else {
            message("Your Task Successfully Delete", "#BE123C");
            return await response.json()
        }
    } catch (err) {
        errorHandler(err)
    }

}

async function showTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            headers: headers,
            method: "GET"
        })
        if (!response.ok) {
            throw new Error("We Can't Get Your Task Right Now");
        } else {
            return await response.json();
        }
    } catch (e) {
        errorHandler(e);
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
            throw new Error("Mission is Failed .Please Try in  a Few Minute Later")
        } else {
            message("Your Task Successfully Update", "#075985");
            return await response.json();
        }
    } catch (err) {
        errorHandler(err)
    }
}

////////Render
function renderTasks(tasks) {
    let result = pagination(tasks, currentPage, perPage) ?? [];
    toDoTable.innerHTML = "";
    result.forEach((item) => {
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
                    <button class="bg-red-600 p-1 rounded-md " onclick="deleteBtnHandler('${item.id}')"><img src="./assets/Image/delete-svgrepo-com.svg"
                                                                    alt="delete" class=" w-4"></button>
                    <button class="bg-blue-600 p-1 rounded-md " onclick="showFormModal('${item.id}')"><img src="./assets/Image/pen-f-svgrepo-com.svg"
                                                                     alt="edit" class="w-4"></button>
                    <button class="bg-gray-500 p-1 rounded-md " onclick="showBtnHandler('${item.id}')"><img src="./assets/Image/eye-svgrepo-com.svg" alt="see"
                                                                     class="w-4"></button>
                </td>
        </tr>
        `
    });
}

////////Helper Function
function clearMessages() {
    messages.forEach(item => {
        item.innerHTML = "";
    })
}

function validate(rules, inputMessage) {
    let messages = []
    let options = [];
    rules = rules.split("|");
    rules = rules.map(item => item.trim());
    rules.forEach(item => {
        let [name, rule = ""] = item.split(":");
        options.push({name, rule});
    })
    options.forEach(item => {
        if (item.name === "required") {
            messages.push("this field is required");
        }
        if (item.name === "min") {
            messages.push("min length is " + item.rule);
        }
    })
    inputMessage.innerHTML = messages.join(" . ");
}

function accepted(value, inputMessage) {
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

function errorHandler(err) {
    errorMessage.innerHTML = err;
    errorModal();
}


////////initial Function
function startProject() {
    loading.classList.remove("hidden");
    loading.classList.add("flex");
    getTasks()
        .then(() => {
            renderTasks(tasks);
        }).finally(() => {
        loading.classList.remove("flex");
        loading.classList.add("hidden");
    })
}

startProject();