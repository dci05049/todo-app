document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('add-btn');
  const todoList = document.getElementById('todo-list');
  const filterBar = document.getElementById('filter-bar');
  const itemCount = document.getElementById('item-count');
  const emptyState = document.getElementById('empty-state');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let currentFilter = localStorage.getItem('filter') || 'all';

  function getTodos() {
    const data = localStorage.getItem('todos');
    return data ? JSON.parse(data) : [];
  }

  function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const todo = { id: Date.now().toString(), text: trimmed, completed: false };
    const todos = getTodos();
    todos.push(todo);
    saveTodos(todos);
    return todo;
  }

  function toggleTodo(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos(todos);
    }
  }

  function deleteTodo(id) {
    const todos = getTodos().filter(t => t.id !== id);
    saveTodos(todos);
  }

  function setFilter(filter) {
    currentFilter = filter;
    localStorage.setItem('filter', filter);
    filterButtons.forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.filter === filter);
    });
    render();
  }

  function render() {
    const todos = getTodos();
    const activeCount = todos.filter(t => !t.completed).length;
    const hasTodos = todos.length > 0;

    filterBar.hidden = !hasTodos;
    emptyState.hidden = hasTodos;

    itemCount.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} left`;

    let filtered = todos;
    if (currentFilter === 'active') {
      filtered = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filtered = todos.filter(t => t.completed);
    }

    todoList.innerHTML = '';

    if (hasTodos && filtered.length === 0) {
      const msg = document.createElement('p');
      msg.className = 'empty-state';
      msg.textContent = `No ${currentFilter} todos.`;
      todoList.appendChild(msg);
      return;
    }

    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;
      li.dataset.id = todo.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);

      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '\u00D7';
      deleteBtn.setAttribute('aria-label', `Delete todo: ${todo.text}`);

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const todo = addTodo(input.value);
    if (todo) {
      input.value = '';
      addBtn.disabled = true;
      render();
      input.focus();
    }
  });

  input.addEventListener('input', () => {
    addBtn.disabled = !input.value.trim();
  });

  todoList.addEventListener('click', (e) => {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.type === 'checkbox') {
      toggleTodo(id);
      render();
    } else if (e.target.classList.contains('delete-btn')) {
      deleteTodo(id);
      render();
    }
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  // Initialize
  filterButtons.forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.filter === currentFilter);
  });
  render();
  input.focus();
});
