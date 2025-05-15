function addtask(){
    const inputbox = document.getElementById("taskInput");
    const taskText = inputbox.value;

    if (taskText !== "") {
   
    const li = document.createElement("li");
    li.textContent = taskText;
  document.getElementById("taskList").appendChild(li);

    
     inputbox.value = "";
  } else {
    alert("Please enter a task.");
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

function deleteAllTasks() {
    const taskList = document.getElementById("taskList");
    while (taskList.firstChild) {
        taskList.removeChild(taskList.firstChild);
    }
}
