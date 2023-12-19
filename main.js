const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function App() {
   const todosStore = STORAGE("todosStore");
   const calendar = flatpickrSetUp();
   let currTodoId = null;
   let firstRender = true;

   // functions
   const globalEvents = () => {
      window.document.ondrop = (e) => {
         e.preventDefault();
      };

      window.document.ondragover = (e) => {
         e.preventDefault();
      };

      window.document.addEventListener("mousedown", (e) => {
         const activedTodoMenu = document.querySelector(".todo-list-item__right-menu.active");
         const parentEl = activedTodoMenu?.closest(".todo-list-item");

         if (activedTodoMenu && !parentEl.contains(e.target)) {
            activedTodoMenu.style = "";
            activedTodoMenu.ontransitionend = (e) => {
               e.currentTarget.classList.remove("active");
               e.currentTarget.ontransitionend = () => {};
            };
         }
      });
   };

   const handleAddTodo = (e) => {
      const inputText = $("#add-todo-form__input-text");
      const inputDatepicker = $("#add-todo-form__input-datepicker + .form-control.input");
      const inputTextValue = inputText.value;
      const inputDatepickerValue = inputDatepicker.value;
      const date = new Date();

      const state = {
         id: String(Date.now()),
         value: inputTextValue,
         dueDate: inputDatepickerValue,
         status: "Todo",
         dateCreated: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
      };

      const getTodosStore = todosStore.get("todos");
      let newTodosStore;

      if (!inputTextValue) return;

      getTodosStore && getTodosStore.push(state);
      newTodosStore = getTodosStore ? JSON.parse(JSON.stringify(getTodosStore)) : [state];
      todosStore.set("todos", newTodosStore);

      inputText.value = "";
   };

   const handleAddDoingTodo = () => {
      const contentTodoCol = $(".content-col.todo");
      const todoItems = contentTodoCol.querySelectorAll(".todo-list-item");

      todoItems.forEach((item) => {
         item.addEventListener("click", (e) => {
            const todoMenu = e.currentTarget.querySelector(".todo-list-item__right-menu");

            if (todoMenu.contains(e.target)) return;

            const id = e.currentTarget.dataset.id;
            const todos = todosStore.get("todos");
            const todosCopied = JSON.parse(JSON.stringify(todos));
            const todo = todosCopied.find((item) => item.id === id);

            todo.status = "Doing";

            const remainingTodosCopied = todosCopied.filter((item) => item.id !== todo.id);
            remainingTodosCopied.push(todo);

            todosStore.set("todos", remainingTodosCopied);

            renderTodos();
            renderDoingTodos();
         });
      });
   };

   const handleAddDoneTodo = () => {
      const contentTodoCol = $(".content-col.doing");
      const todoItems = contentTodoCol.querySelectorAll(".todo-list-item");

      todoItems.forEach((item) => {
         item.addEventListener("click", (e) => {
            const todoMenu = e.currentTarget.querySelector(".todo-list-item__right-menu");

            if (todoMenu.contains(e.target)) return;

            const id = e.currentTarget.dataset.id;
            const todos = todosStore.get("todos");
            const todosCopied = JSON.parse(JSON.stringify(todos));
            const todo = todosCopied.find((item) => item.id === id);

            todo.status = "Done";

            const remainingTodosCopied = todosCopied.filter((item) => item.id !== todo.id);
            remainingTodosCopied.push(todo);

            todosStore.set("todos", remainingTodosCopied);

            renderDoingTodos();
            renderDoneTodo();
         });
      });
   };

   const handleDragTodoItem = () => {
      const contentCols = $$(".content-col");
      const todoItems = $$(".todo-list-item");

      todoItems.forEach((item) => {
         item.addEventListener("dragstart", (e) => {
            e.target.contains(item) && e.target.classList.add("dragging");
         });

         item.addEventListener("dragend", (e) => {
            e.target.contains(item) && e.target.classList.remove("dragging");
         });
      });

      contentCols.forEach((item) => {
         item.ondragover = contentColsDragover;

         item.ondrop = (e) => {
            e.preventDefault();
            const lastDragover = $$(".content-col.dragover");
            const todos = e.currentTarget.querySelectorAll(".todo-list-item");
            const arrTodo = [];
            const getTodosStore = todosStore.get("todos");
            const todoStoreCopied = JSON.parse(JSON.stringify(getTodosStore));

            if (lastDragover) lastDragover.forEach((item) => item.classList.remove("dragover"));

            todos.forEach((item) => {
               const dueDate = item.querySelector(".todo-list-item__content-due-date span").innerText;
               const value = item.querySelector(".todo-list-item__content-text").innerText;
               const dateCreated = item.querySelector(".todo-list-item__content-date-created span").innerText;

               const state = {
                  id: item.dataset.id,
                  value,
                  dueDate,
                  status: e.currentTarget.classList[1][0].toUpperCase() + e.currentTarget.classList[1].slice(1),
                  dateCreated,
               };

               if (item.classList.contains("announced")) state.announced = true;

               arrTodo.push(state);
            });

            const remainingTodo = todoStoreCopied.filter((item1) => !arrTodo.find((item2) => item2.id === item1.id));
            const newTodos = remainingTodo.concat(arrTodo);

            todosStore.set("todos", newTodos);

            renderTodos();
            renderDoingTodos();
            renderDoneTodo();
         };
      });

      // inner func
      function contentColsDragover(e) {
         e.preventDefault();

         const lastDragover = $$(".content-col.dragover");
         const draggingEl = $(".todo-list-item.dragging");

         if (lastDragover) lastDragover.forEach((item) => item.classList.remove("dragover"));
         e.currentTarget.classList.add("dragover");

         if (!draggingEl) return;

         const checkIcon = draggingEl.querySelector(".check-icon");
         const remainingEl = e.currentTarget.querySelectorAll(".todo-list-item:not(.dragging)");
         const todoList = e.currentTarget.querySelector(".todo-list ul");

         const targetEl = Array.from(remainingEl).find((item) => e.clientY <= item.offsetTop + item.offsetHeight / 2);

         todoList.insertBefore(draggingEl, targetEl);

         checkIcon.innerHTML = `
            ${
               e.currentTarget.classList.contains("doing")
                  ? `<i class="fa-solid fa-gear fa-spin"></i>`
                  : e.currentTarget.classList.contains("done")
                  ? `<i class="fa-solid fa-check"></i>`
                  : ""
            }
         `;
      }
   };

   const renderTodos = () => {
      const contentTodoCol = $(".content-col.todo");
      const todosList = contentTodoCol.querySelector(".todo-list ul");
      const getTodosStore = todosStore.get("todos");

      const htmls = getTodosStore?.map((item) => {
         if (item.status !== "Todo") return;
         return `
            <li data-id="${item.id}" class="${item.announced ? "announced" : ""} todo-list-item" draggable="true">
               <div class="check-icon"></div>
               <div class="todo-list-item__content">
                  <span class="select-none todo-list-item__content-text">${item.value}</span>
                  <div class="todo-list-item__content-date-created">
                     From: <span>${item.dateCreated}</span>
                  </div>
                  <div class="todo-list-item__content-due-date">
                     ${item.dueDate ? "To: " : ""}<span>${item.dueDate}</span>
                  </div>
               </div>
               <div class="todo-list-item__right">
                  <button class="todo-list-item__right-more-btn">
                     <img src="./assets/icons/more-icon.svg" alt="">
                  </button>
                  <nav class="todo-list-item__right-menu">
                     <ul>
                        <li class="right-menu__edit-btn">Edit <i class="fa-solid fa-pen"></i></li>
                        <li class="right-menu__delete-btn">Delete <i class="fa-solid fa-trash"></i></li>
                     </ul>
                  </nav>
               </div>
            </li>
         `;
      });

      todosList.innerHTML = htmls?.join("\n") || "";

      handleAddDoingTodo();
      handleDragTodoItem();
      handleTodoMenu();
   };

   const renderDoingTodos = () => {
      const contentTodoCol = $(".content-col.doing");
      const todosList = contentTodoCol.querySelector(".todo-list ul");
      const getTodosStore = todosStore.get("todos");

      const htmls = getTodosStore?.map((item) => {
         if (item.status !== "Doing") return;
         return `
            <li data-id="${item.id}" class="${item.announced ? "announced" : ""} todo-list-item" draggable="true">
               <div class="check-icon">
                  <i class="fa-solid fa-gear fa-spin"></i>
               </div>
               <div class="todo-list-item__content">
                  <span class="select-none todo-list-item__content-text">${item.value}</span>
                  <div class="todo-list-item__content-date-created">
                     From: <span>${item.dateCreated}</span>
                  </div>
                  <div class="todo-list-item__content-due-date">
                     ${item.dueDate ? "To: " : ""}<span>${item.dueDate}</span>
                  </div>
               </div>
               <div class="todo-list-item__right">
                  <button class="todo-list-item__right-more-btn">
                     <img src="./assets/icons/more-icon.svg" alt="">
                  </button>
                  <nav class="todo-list-item__right-menu">
                     <ul>
                        <li class="right-menu__edit-btn">Sửa <i class="fa-solid fa-pen"></i></li>
                        <li class="right-menu__delete-btn">Xóa <i class="fa-solid fa-trash"></i></li>
                     </ul>
                  </nav>
               </div>
            </li>
         `;
      });

      todosList.innerHTML = htmls?.join("\n") || "";

      handleAddDoneTodo();
      handleDragTodoItem();
      handleTodoMenu();
   };

   const renderDoneTodo = () => {
      const contentTodoCol = $(".content-col.done");
      const todosList = contentTodoCol.querySelector(".todo-list ul");
      const getTodosStore = todosStore.get("todos");

      const htmls = getTodosStore?.map((item) => {
         if (item.status !== "Done") return;
         return `
            <li data-id="${item.id}" class="${item.announced ? "announced" : ""} todo-list-item" draggable="true">
               <div class="check-icon">
                  <i class="fa-solid fa-check"></i>
               </div>
               <div class="todo-list-item__content">
                  <span class="select-none todo-list-item__content-text">${item.value}</span>
                  <div class="todo-list-item__content-date-created">
                     From: <span>${item.dateCreated}</span>
                  </div>
                  <div class="todo-list-item__content-due-date">
                     ${item.dueDate ? "To: " : ""}<span>${item.dueDate}</span>
                  </div>
               </div>
               <div class="todo-list-item__right">
               <button class="todo-list-item__right-more-btn">
                  <img src="./assets/icons/more-icon.svg" alt="">
               </button>
               <nav class="todo-list-item__right-menu">
                  <ul>
                     <li class="right-menu__delete-btn">Delete <i class="fa-solid fa-trash"></i></li>
                  </ul>
               </nav>
            </div>
            </li>
         `;
      });

      todosList.innerHTML = htmls?.join("\n") || "";

      handleDragTodoItem();
      handleTodoMenu();
   };

   const gradientCanvas = () => {
      const gradient = new Gradient();
      gradient.initGradient(".gradient-canvas");
   };

   const handleTodoMenu = () => {
      const moreBtns = $$(".todo-list-item__right-more-btn");
      const todoMenus = $$(".todo-list-item__right-menu");
      const addTodoInputText = $("#add-todo-form__input-text");
      const addTodoInputDueDate = $("#add-todo-form__input-datepicker");
      const addTodoBtn = $(".add-todo-form__input-wrapper .add-todo-btn");
      const saveTodoBtn = $(".add-todo-form__input-wrapper .save-todo-btn");
      const cancelEditBtn = $(".add-todo-form__input-wrapper .cancel-todo-btn");

      moreBtns.forEach((item) => {
         item.onclick = (e) => {
            e.stopPropagation();

            const activedMenu = document.querySelectorAll(".todo-list-item__right-menu.active");
            const parentEl = e.target.closest(".todo-list-item__right");
            const menu = parentEl.querySelector(".todo-list-item__right-menu");
            const menuUl = parentEl.querySelector(".todo-list-item__right-menu ul");

            if (activedMenu.length) {
               activedMenu.forEach((item) => {
                  item.style = "";
                  item.ontransitionend = (e) => {
                     e.currentTarget.classList.remove("active");
                     e.currentTarget.ontransitionend = () => {};
                  };
               });
            }

            if (menu.classList.contains("active")) {
               menu.style = "";
               menu.ontransitionend = (e) => {
                  e.currentTarget.classList.remove("active");
                  e.currentTarget.ontransitionend = () => {};
               };
               return;
            }

            menu.classList.add("active");
            menu.style.height = menuUl.scrollHeight + "px";
         };
      });

      todoMenus.forEach((item) => {
         const editBtn = item.querySelector(".right-menu__edit-btn");
         const deleteBtn = item.querySelector(".right-menu__delete-btn");

         if (editBtn) {
            editBtn.onclick = () => {
               const parent = item.closest(".todo-list-item");
               const todoContent = parent.querySelector(".todo-list-item__content-text");
               const todoDuaDate = parent.querySelector(".todo-list-item__content-due-date");
               currTodoId = parent.dataset.id;

               addTodoInputText.value = todoContent.innerText;
               addTodoInputText.focus();
               calendar.setDate(todoDuaDate.innerText);
               addTodoBtn.classList.add("d-none");
               saveTodoBtn.classList.remove("d-none");
               cancelEditBtn.classList.remove("d-none");
            };
         }

         deleteBtn.onclick = () => {
            const parent = item.closest(".todo-list-item");
            const id = parent.dataset.id;
            const todos = todosStore.get("todos");
            const todosCopied = JSON.parse(JSON.stringify(todos));

            const remainingTodosCopied = todosCopied.filter((item) => item.id !== id);

            todosStore.set("todos", remainingTodosCopied);

            renderTodos();
            renderDoingTodos();
            renderDoneTodo();
         };
      });

      saveTodoBtn.onclick = (e) => {
         const todos = todosStore.get("todos");
         const todosCopied = JSON.parse(JSON.stringify(todos));

         const currTodoIndex = todosCopied.findIndex((item) => item.id === currTodoId);
         todosCopied[currTodoIndex] = {
            ...todosCopied[currTodoIndex],
            value: addTodoInputText.value,
            dueDate: addTodoInputDueDate.value,
         };
         delete todosCopied[currTodoIndex].announced;

         todosStore.set("todos", todosCopied);

         addTodoInputText.value = "";
         calendar.clear();
         calendar.close();
         addTodoBtn.classList.remove("d-none");
         cancelEditBtn.classList.add("d-none");
         e.currentTarget.classList.add("d-none");
         currTodoId = null;

         renderTodos();
         renderDoingTodos();
         renderDoneTodo();
      };
   };

   const handleCheckDueDate = () => {
      const notifiWrapper = $(".notification-wrapper");

      setInterval(innerFunc, 1000);

      // inner func
      function innerFunc() {
         const todos = todosStore.get("todos");

         if (!todos) return;

         const todosCopied = JSON.parse(JSON.stringify(todos));
         const hasDueDate = todosCopied.filter((item) => item.dueDate && item.status !== "Done");

         hasDueDate.forEach((item, index) => {
            const dueDate = item.dueDate;

            if (item.announced && !firstRender) return;

            const content = item.value;
            const time = new Date(dueDate).getTime();
            const currDate = Date.now();

            if (currDate <= time) return;

            const detectTodoLateDueDates = $$(".todo-list-item:not(.announced)");

            detectTodoLateDueDates.forEach((item) => {
               const detectDueDate = item.querySelector(".todo-list-item__content-due-date span").innerText;

               if (detectDueDate) item.classList.add("announced");
            });

            item.announced = true;
            todosStore.set("todos", todosCopied);
            if (index >= hasDueDate.length - 1) firstRender = false;

            const notifiEL = document.createElement("div");
            notifiEL.className = "notification-item";
            notifiEL.style = `--delay: ${index / 2}s`;
            notifiEL.innerHTML = `
               <div class="notification-item-left">
                  <span class="notification-item-title">You are late for this todo!</span>
                  <div class="notification-item-content">
                     <span class="notification-item-content__todo-name">${content}</span>
                     <span class="notification-item-content__todo-due-date"><b>Deadline:</b> ${dueDate}</span>
                  </div>
               </div>
               <button class="notification-item__close-btn"><i class="fa-solid fa-xmark"></i></button>
               <div class="notification-item__progress"></div>
            `;
            notifiWrapper.appendChild(notifiEL);

            const notifiProgress = notifiEL.querySelector(".notification-item__progress");
            const notifiCloseBtn = notifiEL.querySelector(".notification-item__close-btn");

            notifiProgress.onanimationend = (e) => {
               e.stopPropagation();
               notifiEL.classList.add("remove");
               notifiEL.onanimationend = (e) => {
                  e.currentTarget.remove();
               };
            };

            notifiCloseBtn.onclick = (e) => {
               notifiEL.classList.add("remove");
               notifiEL.onanimationend = (e) => e.currentTarget.remove();
            };
         });
      }
   };

   function flatpickrSetUp() {
      const config = {
         enableTime: true,
         dateFormat: "Y-m-d H:i",
         minDate: "today",
         // minTime: "08:00",
         // maxTime: "18:00",
         // defaultDate: "today",
         time_24hr: true,
         wrap: true,
         altInput: true,
         //  altFormat: "F j, Y h:S K",
         altFormat: "Y/m/d H:i",
         disable: [
            function (date) {
               return date.getDay() === 0 || date.getDay() === 6;
            },
         ],
         locale: {
            firstDayOfWeek: 1,
         },
      };

      const calendar = flatpickr(".add-todo-form__input-wrapper", config);

      return calendar;
   }

   // main
   const inputWrapper = $(".add-todo-form__input.datepicker");
   const clearBtn = $(".input__clear-btn");
   const addTodoForm = $(".add-todo-form");
   const addTodoBtn = $(".add-todo-form__input-wrapper .add-todo-btn");
   const addTodoInputText = $("#add-todo-form__input-text");
   const saveTodoBtn = $(".add-todo-form__input-wrapper .save-todo-btn");
   const cancelEditBtn = $(".add-todo-form__input-wrapper .cancel-todo-btn");

   // block default submit action from form
   addTodoForm.onsubmit = (e) => e.preventDefault();

   inputWrapper.onclick = () => {
      calendar.open();
   };

   clearBtn.onclick = (e) => {
      e.stopPropagation();
      calendar.clear();
   };

   addTodoBtn.onclick = (e) => {
      handleAddTodo(e);
      calendar.clear();
      calendar.close();
      renderTodos();
   };

   cancelEditBtn.onclick = (e) => {
      addTodoInputText.value = "";
      calendar.clear();
      addTodoBtn.classList.remove("d-none");
      saveTodoBtn.classList.add("d-none");
      e.currentTarget.classList.add("d-none");
      currTodoId = null;
   };

   const start = () => {
      globalEvents();
      gradientCanvas();
      renderTodos();
      renderDoingTodos();
      renderDoneTodo();
      handleCheckDueDate();
   };
   start();
}

window.document.addEventListener("DOMContentLoaded", App());
