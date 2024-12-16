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
const taskNameMessage = document.getElementById("taskName-message");
const dateMessage = document.getElementById("date-message");
const descriptionMessage = document.getElementById('description-message')
const taskName = document.getElementById('taskName');
const description = document.getElementById('description');
const status = document.getElementById('status');
const deadLine = document.getElementById('deadLine');
const priorities = document.getElementsByName('priority');
const addTaskBtn = document.getElementById('addTaskBtn');
const editTaskBtn = document.getElementById('editTaskBtn');
const showTaskModal = document.getElementById('showTaskModal');
const messageBox = document.getElementById('messageBox');

let tasks = [];





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
            console.log(result);
        }
    } catch (e) {
        console.log(e);
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
            throw new Error("connection is failed");
        } else {
            const result = await response.json();
            console.log(result);
        }
    } catch (err) {

    }
}

async function updateTask(id, title, description, status, priority, deadLine) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
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
            console.log(result);
        }
    } catch (err) {
        console.log(err)
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
            console.log(result);
        }
    } catch (err) {
        console.log(err);
    }

}

async function renderTasks() {
    toDoTable.innerHTML = "";
    await getTasks();
    tasks.forEach((item) => {
        let bgStatus = "";
        let textStatus = "";
        let bgPriority = "";
        let textPriority = "";
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