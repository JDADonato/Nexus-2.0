function toggleDropdown() {
    const dropdown = document.getElementById("manageDropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    // Close when clicking outside
    window.addEventListener("click", function closeOutside(e) {
      if (!dropdown.contains(e.target) && !e.target.closest("button[onclick='toggleDropdown()']")) {
        dropdown.style.display = "none";
        window.removeEventListener("click", closeOutside);
      }
    });
  }

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  let types = JSON.parse(localStorage.getItem("types")) || [];
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  function toggleSidePanel() {
    const wrapper = document.querySelector(".side-panel-wrapper");
    const toggleBtn = document.getElementById("toggleSidePanel");
    const icon = toggleBtn.querySelector("i");

    wrapper.classList.toggle("collapsed");

    if (wrapper.classList.contains("collapsed")) {
      icon.classList.remove("fa-chevron-right");
      icon.classList.add("fa-chevron-left");
    } else {
      icon.classList.remove("fa-chevron-left");
      icon.classList.add("fa-chevron-right");
    }
  }

  function showModal(type) {
    document.getElementById("modalOverlay").style.display = "block";
    document.getElementById(`${type}Modal`).style.display = "block";
    if (type === "task") {
      populateDropdown("taskSubject", subjects);
      populateDropdown("taskType", types);
    }
    if (type === "calendar") generateCalendar(currentMonth, currentYear);
  }

  function hideModals() {
    document
      .querySelectorAll(".modal")
      .forEach((m) => (m.style.display = "none"));
    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("taskId").value = "";
  }

  function populateDropdown(id, list) {
    const select = document.getElementById(id);
    select.innerHTML = list
      .map((i) => `<option value="${i.name}">${i.name}</option>`)
      .join("");
  }

  function addSubject() {
    const name = document.getElementById("newSubject").value.trim();
    const color = document.getElementById("subjectColor").value;
    if (!name) return showToast("Subject required");
    if (subjects.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      return showToast("Duplicate subject");
    subjects.push({ name, color });
    localStorage.setItem("subjects", JSON.stringify(subjects));
    renderSubjects();
    populateDropdown("taskSubject", subjects);
    document.getElementById("newSubject").value = "";
  }

  function addType() {
    const name = document.getElementById("newType").value.trim();
    const color = document.getElementById("typeColor").value;
    if (!name) return showToast("Type required");
    if (types.some((t) => t.name.toLowerCase() === name.toLowerCase()))
      return showToast("Duplicate type");
    types.push({ name, color });
    localStorage.setItem("types", JSON.stringify(types));
    renderTypes();
    populateDropdown("taskType", types);
    document.getElementById("newType").value = "";
  }

  function deleteSubject(name) {
    subjects = subjects.filter((s) => s.name !== name);
    localStorage.setItem("subjects", JSON.stringify(subjects));
    renderSubjects();
    populateDropdown("taskSubject", subjects);
    renderTasks();
    updateCounters();
  }

  function deleteType(name) {
    types = types.filter((t) => t.name !== name);
    localStorage.setItem("types", JSON.stringify(types));
    renderTypes();
    populateDropdown("taskType", types);
    renderTasks();
    updateCounters();
  }

  function updateSubjectName(index, newName) {
    const oldName = subjects[index].name;
    if (!newName.trim()) return;
    subjects[index].name = newName.trim();
    tasks.forEach((t) => {
      if (t.subject === oldName) t.subject = newName.trim();
    });
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderSubjects();
    populateDropdown("taskSubject", subjects);
    renderTasks();
    updateCounters();
    showToast("Subject updated");
  }
  function updateSubjectColor(index, newColor) {
    subjects[index].color = newColor;
    localStorage.setItem("subjects", JSON.stringify(subjects));
    renderSubjects();
    renderTasks();
    updateCounters();
    showToast("Subject color updated");
  }

  function updateTypeName(index, newName) {
    const oldName = types[index].name;
    if (!newName.trim()) return;
    types[index].name = newName.trim();
    tasks.forEach((t) => {
      if (t.type === oldName) t.type = newName.trim();
    });
    localStorage.setItem("types", JSON.stringify(types));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTypes();
    populateDropdown("taskType", types);
    renderTasks();
    updateCounters();
    showToast("Type updated");
  }
  function updateTypeColor(index, newColor) {
    types[index].color = newColor;
    localStorage.setItem("types", JSON.stringify(types));
    renderTypes();
    renderTasks();
    updateCounters();
    showToast("Type color updated");
  }

  function renderSubjects() {
    document.getElementById("subjectsList").innerHTML = subjects
      .map(
        (s, index) => `
  <div class="subject-item">
    <input type="text" value="${s.name}" onchange="updateSubjectName(${index}, this.value)" style="flex:1; background:transparent; color:${s.color}; border:none; font-weight:bold; font-size:1em" />
    <input type="color" class="color-picker" value="${s.color}" onchange="updateSubjectColor(${index}, this.value)" />
    <button onclick="deleteSubject('${s.name}')">Delete</button>
  </div>`
      )
      .join("");
  }

  function renderTypes() {
    document.getElementById("typesList").innerHTML = types
      .map(
        (t, index) => `
  <div class="type-item">
    <input type="text" value="${t.name}" onchange="updateTypeName(${index}, this.value)" style="flex:1; background:transparent; color:${t.color}; border:none; font-weight:bold; font-size:1em" />
    <input type="color" class="color-picker" value="${t.color}" onchange="updateTypeColor(${index}, this.value)" />
    <button onclick="deleteType('${t.name}')">Delete</button>
  </div>`
      )
      .join("");
  }

  function saveTask() {
    const id = document.getElementById("taskId").value;
    const subject = document.getElementById("taskSubject").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const type = document.getElementById("taskType").value;
    const details = document.getElementById("taskDetails").value;
    const priority = document.getElementById("taskPriority").value;

    if (!subject || !type) return showToast("Fill all required fields");

    const existingTask = tasks.find((t) => t.id === parseInt(id));
    const task = {
      id: id ? parseInt(id) : Date.now(),
      subject,
      dueDate,
      type,
      details,
      priority,
      completed: existingTask ? existingTask.completed : false,
    };

    if (id) {
      const i = tasks.findIndex((t) => t.id === parseInt(id));
      if (i !== -1) tasks[i] = task;
    } else {
      tasks.push(task);
    }

    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateCounters();
    hideModals();
    showToast(id ? "Task updated" : "Task added");
  }

  function renderTasks({ skipSort = false } = {}) {
    const tbody = document.getElementById("taskBody");
    tbody.innerHTML = "";

    const search = document.getElementById("taskSearch")?.value?.toLowerCase() || "";
    const priority = document.getElementById("priorityFilter")?.value || "";

    let filtered = tasks.filter((t) => {
      return (
        (!search || t.subject.toLowerCase().includes(search) || t.details.toLowerCase().includes(search)) &&
        (!priority || t.priority === priority)
      );
    });

    if (!skipSort) {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    filtered.forEach((task) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", task.id);
      row.innerHTML = `
      <td>
<select onchange="updateTaskField(${task.id
        }, 'subject', this.value)" style="color: ${getSubjectColor(
          task.subject
        )};">
${subjects
          .map(
            (s) =>
              `<option value="${s.name}" ${s.name === task.subject ? "selected" : ""
              }>${s.name}</option>`
          )
          .join("")}
</select>
      </td>
      <td>
        <input type="date" value="${task.dueDate || ''
        }" onchange="updateTaskField(${task.id}, 'dueDate', this.value)">
      </td>
      <td>
<select onchange="updateTaskField(${task.id
        }, 'type', this.value)" style="color: ${getTypeColor(task.type)};">
${types
          .map(
            (t) =>
              `<option value="${t.name}" ${t.name === task.type ? "selected" : ""}>${t.name
              }</option>`
          )
          .join("")}
</select>
      </td>
      <td class="details" contenteditable="true" onblur="updateTaskField(${task.id
        }, 'details', this.textContent.trim())">${task.details}</td>
      <td>
        <select onchange="updateTaskField(${task.id
        }, 'priority', this.value)">
          <option value="High" ${task.priority === "High" ? "selected" : ""
        }>High</option>
          <option value="Medium" ${task.priority === "Medium" ? "selected" : ""
        }>Medium</option>
          <option value="Low" ${task.priority === "Low" ? "selected" : ""
        }>Low</option>
        </select>
      </td>
      <td>
<input type="checkbox" class="status-checkbox" ${task.completed ? "checked" : ""} onclick="toggleStatus(${task.id}, this)">

      </td>
<td class="action-cell">
<button onclick="deleteTask(${task.id})" class="icon-button" title="Delete">
<i class="fa fa-trash"></i>
</button>
<div class="drag-icon-wrapper">
<i class="fa-solid fa-grip-vertical drag-handle" title="Drag to reorder"></i>
</div>
</td>

    `;
      tbody.appendChild(row);
    });
    enableRowDragging();

  }

  function enableRowDragging() {
    const tbody = document.getElementById("taskBody");
    Sortable.create(tbody, {
      animation: 150,
      handle: '.drag-handle', // 👈 restrict dragging to the grip icon only
      onStart: function (evt) {
        const handle = evt.item.querySelector('.drag-handle');
        if (handle) handle.classList.add('dragging');
      },
      onEnd: function (evt) {
        const handle = evt.item.querySelector('.drag-handle');
        if (handle) handle.classList.remove('dragging');

        const newOrder = [];
        document.querySelectorAll("#taskBody tr").forEach((row) => {
          const id = parseInt(row.getAttribute("data-id"));
          const task = tasks.find((t) => t.id === id);
          if (task) newOrder.push(task);
        });
        tasks = newOrder;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks({ skipSort: true });
        updateCounters();
      }
    });
  }

  function getSubjectColor(name) {
    const subject = subjects.find((s) => s.name === name);
    return subject ? subject.color : "#fff";
  }

  function getTypeColor(name) {
    const type = types.find((t) => t.name === name);
    return type ? type.color : "#fff";
  }

  let deletedTask = null;

  function updateTaskField(id, field, value) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task[field] = value;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
      updateCounters();
      showToast(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated`
      );
    }
  }
  function deleteTask(id, button) {
    deletedTask = tasks.find((t) => t.id === id);
    tasks = tasks.filter((t) => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateCounters();
    showUndo();
  }

  function showUndo() {
    const toast = document.getElementById("undoToast");
    toast.innerHTML = `Task deleted. <button onclick="undoDelete()">Undo</button>`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      deletedTask = null;
    }, 4000);
  }

  function undoDelete() {
    if (deletedTask) {
      tasks.push(deletedTask);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
      updateCounters();
      showToast("Task restored");
      deletedTask = null;
    }
  }

  function toggleStatus(id, checkbox) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = checkbox.checked;
      localStorage.setItem("tasks", JSON.stringify(tasks));

      const cardId = `task-card-${id}`;
      const card = document.getElementById(cardId);

      if (card) {
        if (task.completed) {
          card.classList.add("fade-out-card");
          setTimeout(() => {
            card.remove();
            updateCounters();
          }, 500);
        } else {
          updateCounters();
          setTimeout(() => {
            const newCard = document.getElementById(cardId);
            if (newCard) {
              newCard.classList.add("fade-in-card");
            }
          }, 0);
        }
      } else {
        updateCounters();
      }

      renderTasks();
    }
  }


  function filterTasks() {
    renderTasks();
  }

  function editTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    showModal("task");
    document.getElementById("taskId").value = task.id;
    document.getElementById("taskSubject").value = task.subject;
    document.getElementById("taskDueDate").value = task.dueDate;
    document.getElementById("taskType").value = task.type;
    document.getElementById("taskDetails").value = task.details;
  }

  function updateCounters() {
    document.getElementById("totalCounter").textContent = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    document.getElementById("completedCounter").textContent = completed;
    document.getElementById("pendingCounter").textContent =
      tasks.length - completed;
    renderUrgentAndUpcoming();
  }

  function renderUrgentAndUpcoming() {
    const now = new Date();
    const todayString = now.toDateString();

    function renderTaskCard(task) {
      const dueDate = new Date(task.dueDate);
      const subject = subjects.find((s) => s.name === task.subject);
      const color = subject ? subject.color : "#fff";
      const isToday = dueDate.toDateString() === todayString;
      const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      return `
  <div id="task-card-${task.id}" 
       class="side-task-card ${isToday ? "today-highlight" : ""}"
       style="border-left: 6px solid ${color}"
       onclick="highlightTaskById(${task.id})">
    <div class="task-title">${task.subject} - ${task.type}</div>
    <div class="task-date">
      ${formatDateWithoutYear(task.dueDate)} 
      ${isToday
          ? "<span class='today-alert'>❗</span>"
          : `<span class="due-in">${daysDiff} day${daysDiff !== 1 ? "s" : ""} left</span>`}
    </div>
  </div>
`;
    }

    // Update Urgent
    const urgentContainer = document.getElementById("urgentTasks");
    const urgentTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && !t.completed);
    const urgentHtml = urgentTasks.map(renderTaskCard).join("") || "<div>No urgent tasks</div>";

    urgentContainer.innerHTML = urgentHtml;

    // Update Upcoming
    const upcomingContainer = document.getElementById("upcomingTasks");
    const upcomingTasks = tasks.filter(t => {
      const diff = (new Date(t.dueDate) - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3 && !t.completed;
    });
    const upcomingHtml = upcomingTasks.map(renderTaskCard).join("") || "<div>No upcoming tasks</div>";

    upcomingContainer.innerHTML = upcomingHtml;
  }


  function generateCalendar(month, year) {
    const calendarGrid = document.getElementById("calendarGrid");
    const currentMonthElem = document.getElementById("currentMonth");
    const date = new Date(year, month);

    currentMonthElem.textContent = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    calendarGrid.innerHTML = "";

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
      const dayHeader = document.createElement("div");
      dayHeader.textContent = day;
      dayHeader.style.textAlign = "center";
      dayHeader.style.padding = "8px";
      calendarGrid.appendChild(dayHeader);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
      createCalendarDay(new Date(year, month, -i), true);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      createCalendarDay(new Date(year, month, d));
    }

    const nextMonthDays = 7 - (lastDay.getDay() + 1);
    for (let i = 1; i <= nextMonthDays; i++) {
      createCalendarDay(new Date(year, month + 1, i), true);
    }
  }

  function highlightTaskById(id) {
    const row = document.querySelector(`tr[data-id='${id}']`);
    if (row) {
      row.classList.remove("highlight"); // reset if it was already highlighted
      void row.offsetWidth; // force reflow to restart animation
      row.classList.add("highlight");
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => row.classList.remove("highlight"), 1200);
    }
  }

  function createCalendarDay(date, isOtherMonth = false) {
    const dayElement = document.createElement("div");
    dayElement.className = `calendar-day ${isOtherMonth ? "other-month" : ""}`;

    const dayTasks = getTasksForDate(date);

    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    // Build the dots HTML
    const taskDotsHtml = dayTasks.map((task) => {
      const subject = subjects.find((s) => s.name === task.subject);
      const color = subject ? subject.color : "#fff";
      return `<div 
          class="task-dot" 
          style="background: ${color}" 
          onclick="highlightTaskById(${task.id})"
          title="${task.subject} - ${task.type}">
        </div>`;
    }).join("");

    dayElement.innerHTML = `
<div class="calendar-date">${date.getDate()}</div>
<div class="task-dots">${taskDotsHtml}</div>
`;

    dayElement.addEventListener("click", (e) => {
      if (e.target.classList.contains("task-dot")) return;

      const rows = document.querySelectorAll(`#taskBody tr`);
      rows.forEach(row => {
        const dateInput = row.querySelector(`input[type="date"]`);
        if (dateInput && dateInput.value === dateString) {
          row.classList.remove("highlight");
          void row.offsetWidth;
          row.classList.add("highlight");
          row.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => row.classList.remove("highlight"), 1200);
        }
      });
    });

    document.getElementById("calendarGrid").appendChild(dayElement);
  }


  function handleCalendarClick(dateString) {
    hideModals();
    const matchedTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
      return taskDate === dateString;
    });

    if (matchedTasks.length === 0) {
      showToast("No tasks found for this date");
      return;
    }

    const firstTask = document.querySelector(
      `tr td input[type="date"][value="${dateString}"]`
    );
    if (firstTask) {
      const row = firstTask.closest("tr");
      row.classList.add("highlight");
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => row.classList.remove("highlight"), 2000);
    }
  }

  function getTasksForDate(date) {
    return tasks.filter(
      (task) =>
        new Date(task.dueDate).toDateString() === date.toDateString()
    );
  }

  function formatDateWithoutYear(dateString) {
    const options = { month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function changeMonth(offset) {
    currentMonth += offset;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    } else if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
  }

  function init() {
    const savedAccent = localStorage.getItem("accentColor");
    if (savedAccent) {
      document.documentElement.style.setProperty('--accent', savedAccent);
      document.getElementById("accentPicker").value = savedAccent;
    }
  
    renderSubjects();
    renderTypes();
    renderTasks({ skipSort: true });
    updateCounters();
  }
    document.getElementById("accentPicker").addEventListener("input", function () {
    const newColor = this.value;
    document.documentElement.style.setProperty('--accent', newColor);
    localStorage.setItem("accentColor", newColor);
  });
  

  function exportTasks() {
    const data = {
      tasks,
      subjects,
      types
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexus-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup exported");
  }

  function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return showToast("No file selected");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        const importedTasks = Array.isArray(data) ? data : data.tasks || [];
        const importedSubjects = data.subjects || [];
        const importedTypes = data.types || [];

        // Append missing subjects
        importedSubjects.forEach((s) => {
          if (!subjects.some((subj) => subj.name === s.name)) {
            subjects.push(s);
          }
        });

        // Append missing types
        importedTypes.forEach((t) => {
          if (!types.some((typ) => typ.name === t.name)) {
            types.push(t);
          }
        });

        // Append missing tasks
        importedTasks.forEach((task) => {
          if (!tasks.some((t) => t.id === task.id)) {
            tasks.push(task);
          }
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("subjects", JSON.stringify(subjects));
        localStorage.setItem("types", JSON.stringify(types));

        renderSubjects();
        renderTypes();
        renderTasks({ skipSort: true });
        updateCounters();
        showToast("Backup imported and merged");
      } catch (err) {
        showToast("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  init();
