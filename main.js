const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function App() {
   const todosStore = STORAGE("todosStore");
   const darkModeStorage = STORAGE("darkmode");
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

   const handleAddTodo = () => {
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
         dateCreated: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      };

      const getTodosStore = todosStore.get("todos");
      let newTodosStore;

      if (!inputTextValue) {
         alert("You have not entered Todo");
         return;
      }

      getTodosStore && getTodosStore.unshift(state);
      newTodosStore = getTodosStore ? JSON.parse(JSON.stringify(getTodosStore)) : [state];
      todosStore.set("todos", newTodosStore);

      inputText.value = "";
      calendar.clear();
      calendar.close();
      renderTodos();
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
            remainingTodosCopied.unshift(todo);

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
            remainingTodosCopied.unshift(todo);

            todosStore.set("todos", remainingTodosCopied);

            renderDoingTodos();
            renderDoneTodo();
         });
      });
   };

   const handleDragTodoItem = () => {
      const contentCols = $$(".content-col");
      const todoItems = $$(".todo-list-item");
      let currDraggingEl = null;

      todoItems.forEach((item) => {
         item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("id", item.dataset.id);
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
            // const id = e.dataTransfer.getData("id");
            // const todos = todosStore.get("todos");
            // const todosCopied = JSON.parse(JSON.stringify(todos));
            // const draggingItem = todosCopied.find((item) => item.id === id);
            // const draggingIndex = todosCopied.findIndex((item) => item.id === id);
            // const lastDragover = $$(".content-col.dragover");
            // const draggingEl = currDraggingEl;
            // const nextEl = draggingEl.nextElementSibling;
            // const prevEl = draggingEl.previousElementSibling;
            // let nextId = null;
            // let prevId = null;
            // let nextIndex = null;
            // let prevIndex = null;

            // if (lastDragover) lastDragover.forEach((item) => item.classList.remove("dragover"));

            // if (nextEl) {
            //    nextId = nextEl.dataset.id;
            //    nextIndex = todosCopied.findIndex((item) => item.id === nextId);
            // }
            // if (prevEl) {
            //    prevId = prevEl.dataset.id;
            //    prevIndex = todosCopied.findIndex((item) => item.id === prevId);
            // }

            // todosCopied.splice(draggingIndex, 1);

            // if (!nextIndex && nextIndex !== 0) {
            //    todosCopied.push(draggingItem);
            // } else if (!prevIndex && prevIndex !== 0) {
            //    todosCopied.unshift(draggingItem);
            // } else if (draggingIndex > nextIndex) {
            //    if (prevIndex === 0) {
            //       todosCopied.splice(nextIndex, 0, draggingItem);
            //    } else if (!nextIndex && !prevIndex && nextIndex !== 0 && prevIndex !== 0) {
            //       todosCopied.splice(draggingIndex, 0, draggingItem);
            //    } else if (nextIndex && prevIndex) {
            //       todosCopied.splice(nextIndex, 0, draggingItem);
            //    } else {
            //       todosCopied.splice(nextIndex, 0, draggingItem);
            //    }
            // } else if (draggingIndex < nextIndex) {
            //    if (prevIndex === 0) {
            //       todosCopied.splice(Number(nextIndex) - 1, 0, draggingItem);
            //    } else if (!nextIndex && !prevIndex && nextIndex !== 0 && prevIndex !== 0) {
            //       todosCopied.splice(draggingIndex, 0, draggingItem);
            //    } else if (nextIndex && prevIndex) {
            //       todosCopied.splice(Number(nextIndex) - 1, 0, draggingItem);
            //    } else {
            //       todosCopied.splice(nextIndex, 0, draggingItem);
            //    }
            // }

            const id = e.dataTransfer.getData("id");
            const todoItems = $$(".todo-list-item");
            const todos = todosStore.get("todos");
            const todosCopied = JSON.parse(JSON.stringify(todos));
            const draggingItem = todosCopied.find((item) => item.id === id);
            const lastDragover = $$(".content-col.dragover");
            const arrId = [...todoItems].map((item) => item.dataset.id);
            let arrIdToObj = {};
            arrId.forEach((item, index) => {
               arrIdToObj[item] = index;
            });

            todosCopied.sort((a, b) => arrIdToObj[a.id] - arrIdToObj[b.id]);

            draggingItem.status = e.currentTarget.classList[1][0].toUpperCase() + e.currentTarget.classList[1].slice(1);
            if (lastDragover) lastDragover.forEach((item) => item.classList.remove("dragover"));

            todosStore.set("todos", todosCopied);

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
         currDraggingEl = draggingEl;

         if (lastDragover) lastDragover.forEach((item) => item.classList.remove("dragover"));
         e.currentTarget.classList.add("dragover");

         if (!draggingEl) return;

         const checkIcon = draggingEl.querySelector(".check-icon");
         const remainingEl = e.currentTarget.querySelectorAll(".todo-list-item:not(.dragging)");
         const todoList = e.currentTarget.querySelector(".todo-list ul");

         const targetEl = Array.from(remainingEl).find((item) => e.pageY <= item.offsetTop + item.offsetHeight / 2);

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
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        width="20"
                        height="20"
                        x="0"
                        y="0"
                        viewBox="0 0 426.667 426.667"
                        xml:space="preserve"
                        class=""
                     >
                        <g>
                           <circle cx="42.667" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                           <circle cx="213.333" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                           <circle cx="384" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                        </g>
                     </svg>
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
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        width="20"
                        height="20"
                        x="0"
                        y="0"
                        viewBox="0 0 426.667 426.667"
                        xml:space="preserve"
                        class=""
                     >
                        <g>
                           <circle cx="42.667" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                           <circle cx="213.333" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                           <circle cx="384" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                        </g>
                     </svg>
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
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     version="1.1"
                     xmlns:xlink="http://www.w3.org/1999/xlink"
                     width="20"
                     height="20"
                     x="0"
                     y="0"
                     viewBox="0 0 426.667 426.667"
                     xml:space="preserve"
                     class=""
                  >
                     <g>
                        <circle cx="42.667" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                        <circle cx="213.333" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                        <circle cx="384" cy="213.333" r="42.667" fill="currentColor" opacity="1" data-original="#000000"></circle>
                     </g>
                  </svg>
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
               const todoDuaDate = parent.querySelector(".todo-list-item__content-due-date span");
               currTodoId = parent.dataset.id;

               addTodoInputText.value = todoContent.innerText;
               addTodoInputText.focus();
               calendar.set("minDate", null);
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
            const currTodo = todosCopied.find((item) => item.id === id);

            if (confirm(`Are you sure you want to delete ${currTodo.value}?`) == true) {
               const remainingTodosCopied = todosCopied.filter((item) => item.id !== id);

               if (currTodoId === id) {
                  addTodoInputText.value = "";
                  calendar.clear();
                  addTodoBtn.classList.remove("d-none");
                  cancelEditBtn.classList.add("d-none");
                  saveTodoBtn.classList.add("d-none");
                  currTodoId = null;
               }

               todosStore.set("todos", remainingTodosCopied);

               renderTodos();
               renderDoingTodos();
               renderDoneTodo();
            }
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

         addTodoInputText.value = "";
         calendar.clear();
         calendar.close();
         addTodoBtn.classList.remove("d-none");
         cancelEditBtn.classList.add("d-none");
         e.currentTarget.classList.add("d-none");
         currTodoId = null;

         if (currTodoIndex === -1) return;

         todosStore.set("todos", todosCopied);

         renderTodos();
         renderDoingTodos();
         renderDoneTodo();
      };
   };

   const handleCheckDueDate = () => {
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

            if (index >= hasDueDate.length - 1) firstRender = false;
            if (currDate <= time) return;

            const detectTodoLateDueDates = $$(".todo-list-item:not(.announced)");

            detectTodoLateDueDates.forEach((item) => {
               const detectDueDate = item.querySelector(".todo-list-item__content-due-date span").innerText;
               const getTimeDueDate = new Date(detectDueDate).getTime();

               if (detectDueDate && getTimeDueDate <= Date.now()) item.classList.add("announced");
            });

            item.announced = true;
            todosStore.set("todos", todosCopied);

            const datas = {
               content,
               dueDate,
            };

            renderNotifiItem(index, datas);
         });
      }
   };

   const renderNotifiItem = (index, datas) => {
      const notifiWrapper = $(".notification-wrapper");
      const notifiEL = document.createElement("div");

      notifiEL.className = "notification-item";
      notifiEL.style = `--delay: ${index / 2}s`;
      notifiEL.innerHTML = `
         <div class="notification-item-left">
            <span class="notification-item-title">You are late for this todo!</span>
            <div class="notification-item-content">
               <span class="notification-item-content__todo-name">${datas.content}</span>
               <span class="notification-item-content__todo-due-date"><b>Deadline:</b> ${datas.dueDate}</span>
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
   };

   const handleDarkMode = () => {
      const darkModeBtn = $(".darkmode-btn");
      const circle = $(".darkmode-btn .circle");
      const localDarkMode = darkModeStorage.get("dark-mode");

      if (localDarkMode) {
         circle.classList.add("active");
         window.document.body.classList.add("dark-mode");
      } else {
         circle.classList.remove("active");
         window.document.body.classList.remove("dark-mode");
      }

      darkModeBtn.onclick = () => {
         if (circle.classList.contains("active")) {
            circle.classList.remove("active");
            window.document.body.classList.remove("dark-mode");
            darkModeStorage.set("dark-mode", false);
            return;
         }

         circle.classList.add("active");
         window.document.body.classList.add("dark-mode");
         darkModeStorage.set("dark-mode", true);
      };
   };

   function flatpickrSetUp() {
      let condition = true;
      const config = {
         enableTime: true,
         dateFormat: "Y-m-d H:i:S",
         minDate: "today",
         // minTime: "08:00",
         // maxTime: "18:00",
         // defaultDate: "today",
         time_24hr: true,
         wrap: true,
         altInput: true,
         allowInput: true,
         enableSeconds: true,
         //  altFormat: "F j, Y h:S K",
         altFormat: "Y/m/d H:i:S",
         minuteIncrement: 1,
         // inline: true,
         // disable: [
         //    function (date) {
         //       return date.getDay() === 0 || date.getDay() === 6;
         //    },
         // ],
         locale: {
            firstDayOfWeek: 1,
         },
         onChange: function (selectedDates, dateStr, instance) {
            const datePicked = selectedDates[0];

            if (!datePicked) return;

            const formatDatePicked = `${datePicked.getFullYear()}/${datePicked.getMonth() + 1}/${datePicked.getDate()}`;
            const timeDatePicked = new Date(formatDatePicked).getTime();
            const currDate = new Date();
            const formatCurrDate = `${currDate.getFullYear()}/${currDate.getMonth() + 1}/${currDate.getDate()}`;
            const timeCurrDate = new Date(formatCurrDate).getTime();
            const minTime = `${currDate.getHours()}:${currDate.getMinutes()}:${currDate.getSeconds()}`;

            calendar.set("minTime", timeDatePicked === timeCurrDate ? minTime : undefined);
            calendar.set("minDate", "today");

            if (timeDatePicked === timeCurrDate) {
               condition && calendar.setDate(`${formatCurrDate} ${minTime}`);
               condition = false;
            } else {
               !condition && calendar.setDate(`${formatDatePicked} 12:00`);
               condition = true;
            }
         },
         onOpen: function (selectedDates, dateStr, instance) {
            condition = true;
         },
         onClose: function (selectedDates, dateStr, instance) {
            condition = false;
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

   addTodoBtn.onclick = () => {
      handleAddTodo();
   };

   cancelEditBtn.onclick = (e) => {
      addTodoInputText.value = "";
      calendar.clear();
      calendar.set("minDate", "today");
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
      handleDarkMode();
   };
   start();
}

window.document.addEventListener("DOMContentLoaded", App());
