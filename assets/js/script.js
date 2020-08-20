//global variables
var tasksToDoEl = document.querySelector("#tasks-to-do");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var formEl = document.querySelector("#task-form");
var pageContentEL = document.querySelector("#page-content");
var taskIdCounter = 0;
var tasks = [];

//function to create the list item element in html
var createTaskEl = function(taskDataObj){
    var listItemEl = document.createElement("li");

    listItemEl.className = "task-item";
    listItemEl.setAttribute("data-task-id", taskIdCounter);
    listItemEl.setAttribute("draggable", true);

    var taskInfoEl = document.createElement("div");
    taskInfoEl.className = "task-info";
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

    listItemEl.appendChild(taskInfoEl);

    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);

    tasksToDoEl.appendChild(listItemEl);

    taskDataObj.id = taskIdCounter;

    tasks.push(taskDataObj);

    saveTasks();

    taskIdCounter++;
};

//dynamically adds the form to the existing list item
var createTaskActions = function(taskId){
    //creates a div to hold the form.
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    //creates the edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(editButtonEl);

    //creates the delete button.
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    //Creates the select element.
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(statusSelectEl);

    var statusChoices = ["To Do", "In Progress", "Completed"];

    for (var i = 0; i < statusChoices.length; i++) {
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        statusSelectEl.appendChild(statusOptionEl);
    }
    return actionContainerEl;
};

// takes a task, and replaces the current content with those in the button.
var completeEditTask = function(taskName, taskType, taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    }
    
    saveTasks();

    alert("Task Updated!");

    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";
};

//deletes the list item
var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    var updatedTaskArr = [];

    for (var i = 0; i < tasks.length; i++) {
       if (tasks[i].id !== parseInt(taskId)) {
           updatedTaskArr.push(tasks[i]);
       } 
    }

    tasks = updatedTaskArr;

    saveTasks();
};

//assigns the task to be edited, moves it to the form, and passes it to the completeEdit function to finish the job.
var editTask = function(taskId) {
    console.log("editing task #" + taskId);

    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;

    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;
    document.querySelector("#save-task").textContent = "Save Task";

    formEl.setAttribute("data-task-id", taskId);
};

//Event handlers:

// gets the input from the user, and validates it, creates a task object and passes it to the createTaskEl function.
var taskFormHandler = function() {

    event.preventDefault();

    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }
    formEl.reset();

    var isEdit = formEl.hasAttribute("data-task-id"); 

    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    } 
    else {
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        };

        createTaskEl(taskDataObj);
    }
};

//determines which button is being pushed, and passes it to the appropriate function.
var taskButtonHandler = function(event) {

    var targetEl = event.target;

    if (event.target.matches(".delete-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
    else if (event.target.matches(".edit-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }
};

//finds the task that the event is attached to appends the task to the correct list.
var taskStatusChangeHandler = function(event) {
    var taskId = event.target.getAttribute("data-task-id");
    var statusValue = event.target.value.toLowerCase();
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }

        
    saveTasks();
};

//when the task is picked up, sets an identifier on the task to be found when dropped.
var dragTaskHandler = function(event) {
    var taskId = event.target.getAttribute("data-task-id");

    event.dataTransfer.setData("text/plain", taskId);

    var getId = event.dataTransfer.getData("text/plain");
};

//when an object is dragged over, determines if it is a list. if so allows dropping of the task
//applies visual changes to indicate it can be dropped onto the correct area.
var dropZoneDragHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        event.preventDefault();
        taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
    }
};


//determines what is being dropped, also appends the item to the closest list.
// removes styling from the previous drop zone handler
var dropTaskHandler = function(event) {
    var id = event.dataTransfer.getData("text/plain");
    var draggableElement = document.querySelector("[data-task-id='" + id + "']");
    var dropZoneEl = event.target.closest(".task-list");
    var statusType = dropZoneEl.id;
    var statusSelectEl = draggableElement.querySelector("select[name='status-change']");

    if (statusType === "tasks-to-do") {
        statusSelectEl.selectedIndex = 0;
    }
    else if (statusType === "tasks-in-progress") {
        statusSelectEl.selectedIndex = 1;
    }
    else if (statusType === "tasks-completed") {
        statusSelectEl.selectedIndex = 2;
    }

    dropZoneEl.appendChild(draggableElement);
    dropZoneEl.removeAttribute("style");

    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(id)) {
            tasks[i].status = statusSelectEl.value.toLowerCase();
        }
    }

    saveTasks();
};

//removes the styling when a dragged task leaves the closest task list.
var dragLeaveHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        taskListEl.removeAttribute("style");
    }
};

// a reusable function to save tasks objects to the local storage.
var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

var loadTasks = function() {
    //get task items fr4om local storage.
    tasks = localStorage.getItem("tasks");

    if (!tasks) {
        tasks = [];
        return false;
    }

    //Converts tasks from the stringified format back into an array of objects
    tasks = JSON.parse(tasks);
    //Iterates through tasks array and creates task elements on the page from it
    for (var i = 0; i < tasks.length; i++) {
        tasks[i].id = taskIdCounter;
        var listItemEl = document.createElement("li");
        listItemEl.className = "task-item";
        listItemEl.setAttribute("data-task-id", taskIdCounter);
        listItemEl.setAttribute("draggable", true);

        var taskInfoEl = document.createElement("div");
        taskInfoEl.className = "task-info";
        taskInfoEl.innerHTML = "<h3 class='task-name'>" + tasks[i].name + "</h3><span class='task-type'>" + tasks[i].type + "</span>";

        listItemEl.appendChild(taskInfoEl);

        var taskActionEl = createTaskActions(tasks[i]);
        listItemEl.appendChild(taskActionEl);

        if (tasks[i].status === "to do") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 0;
            tasksToDoEl.appendChild(listItemEl);
        }
        else if (tasks[i].status === "in progress") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 1;
            tasksInProgressEl.appendChild(listItemEl);
        }
        else if (tasks[i].status === "complete") {
            listItemEl.querySelector("select[name='status-change']").selectedIndex = 2;
            tasksCompletedEl.appendChild(listItemEl);
        }
        taskIdCounter++;
    }
};

loadTasks();

//Event listener
////calls the taskFormHandler in the event of a form submission
formEl.addEventListener("submit", taskFormHandler);

////calls the taskButtonHandler function in the event of a click.
pageContentEL.addEventListener("click", taskButtonHandler);

////calls the taskStatusChangeHandler in the event of an element change.
pageContentEL.addEventListener("change", taskStatusChangeHandler);

////calls the dragTaskHandler when you start to drag the element.
pageContentEL.addEventListener("dragstart", dragTaskHandler);

////calls the dropZoneDragHandler when you drag a draggable element over the zone.
pageContentEL.addEventListener("dragover", dropZoneDragHandler);

////calls the dropTaskHandler when you drop a draggable element into the zone.
pageContentEL.addEventListener("drop", dropTaskHandler);

////calls the dragLeaveHandler when the drag passes over the item and leaves.
pageContentEL.addEventListener("dragleave", dragLeaveHandler);