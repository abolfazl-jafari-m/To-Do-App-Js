const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const toDoForm = document.getElementById('toDoForm');
const toDoTable = document.getElementById("toDoTable");
const taskNameMessage = document.getElementById("taskName-message");
const dateMessage = document.getElementById("date-message");


let toDoArray = [];


function showAddModal() {
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
        taskName: (taskName.value === "") ? validate(taskNameMessage, "required") : (taskName.value.length <= 3) ? validate(taskNameMessage , "length") :accepted(taskNameMessage, taskName.value),
        priority: priority.value,
        status: status.value,
        deadLine: (deadLine.value === "") ? validate(dateMessage, "required") : accepted(dateMessage,
            new Date(deadLine.value).toLocaleDateString('fa-IR', {
            year: "numeric",
            month: "long",
            day: "numeric"
        }))
    }

    if (!Object.values(toDo).includes(undefined)) {
        toDoArray.push(toDo);
        localStorage.setItem('toDoList', JSON.stringify(toDoArray));
        closeModal();
        renderToDoList();
    }


});

function deleteTask(id){
    let taskIndex = toDoArray.findIndex(item => item.id === id);
    console.log(taskIndex)
    toDoArray.splice(taskIndex, 1);
    localStorage.setItem('toDoList', JSON.stringify(toDoArray));
    renderToDoList();
}

function validate(input, ...validation) {
    if (validation.includes("required")) {
        input.innerHTML = "This Field is Required"
    }
    if (validation.includes("length")){
        input.innerHTML = "Min length is 4";
    }
}

function accepted(input, value) {
    input.innerHTML = "";
    return value
}

function closeModal() {
    modal.classList.remove("visible", "animate-fadeIn", 'flex');
    overlay.classList.remove("visible", "opacity-60");
    overlay.classList.add("invisible", "opacity-0", "hidden");
    modal.classList.add("invisible", "hidden", "animate-fadeOut");
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
                        class="px-2 py-1 border-2 border-blue-300 rounded-2xl">${item.deadLine}</span></td>
                <td class="border border-gray-500 p-2">
                    <button class="bg-red-600 p-1 rounded-md " onclick="deleteTask('${item.id}')"><img src="./assets/Image/delete-svgrepo-com.svg"
                                                                    alt="delete" class=" w-4"></button>
                    <button class="bg-blue-600 p-1 rounded-md "><img src="./assets/Image/pen-f-svgrepo-com.svg"
                                                                     alt="edit" class="w-4"></button>
                    <button class="bg-gray-500 p-1 rounded-md "><img src="./assets/Image/eye-svgrepo-com.svg" alt="see"
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