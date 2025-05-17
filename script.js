function addtask(){
    const inputbox = document.getElementById("taskInput");
    const taskText = inputbox.value;
    const taskList = document.getElementById("taskList");
    // let numberOfTasks = taskList.getElementsByTagName("li").length;
    if (taskText !== "") {

        const li = document.createElement("li");
        // li.id = "task" + (numberOfTasks + 1);
        li.textContent = taskText;
        taskList.appendChild(li);

        inputbox.value = "";
    } else {
    alert("Please enter a task.");
  }
}


function deleteAllTasks() {
    const taskList = document.getElementById("taskList");
    while (taskList.firstChild) {
        taskList.removeChild(taskList.lastChild);
    }
}

function deleteTask() {
    const taskList = document.getElementById("taskList");
    const tasks = taskList.getElementsByTagName("li");
    if (tasks.length > 0) {
        taskList.removeChild(tasks[tasks.length - 1]);
    } else {
        alert("No tasks to delete.");
    }
}

const taskList = document.getElementById("taskList");
console.log(taskList);
taskList.addEventListener("click", function(event) {
    console.log(event.target.textContent);
    taskList.removeChild(event.target);
})

function markTaskAsDone(event) {
    const task = event.target;
    if (task.tagName === "LI") {
        task.classList.toggle("done");
    }
}


