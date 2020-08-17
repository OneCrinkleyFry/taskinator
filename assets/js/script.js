var tasksToDoEl = document.querySelector("#tasks-to-do");
var buttonEl = document.querySelector("#save-task");

var createTaskHandler = function() {
    var taskItemEl = document.createElement("li");
    taskItemEl.textContent = "this is a new task";
    taskItemEl.className = "task-item";
    tasksToDoEl.appendChild(taskItemEl);
}

buttonEl.addEventListener("click", createTaskHandler);