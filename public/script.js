const form = document.querySelector('#task-form');
const taskIdInput = document.querySelector('#task-id');
const titleInput = document.querySelector('#title');
const descriptionInput = document.querySelector('#description');
const dueDateInput = document.querySelector('#dueDate');
const statusInput = document.querySelector('#status');
const formTitle = document.querySelector('#form-title');
const cancelEditButton = document.querySelector('#cancel-edit');
const formError = document.querySelector('#form-error');
const listMessage = document.querySelector('#list-message');
const tasksList = document.querySelector('#tasks-list');
const searchInput = document.querySelector('#search');
const taskCount = document.querySelector('#task-count');
const taskSubtitle = document.querySelector('#task-subtitle');
const taskTemplate = document.querySelector('#task-template');

let searchTimer;

function showMessage(element, message, type = 'error') {
  element.textContent = message;
  element.className = `message ${type}`;
}

function hideMessage(element) {
  element.textContent = '';
  element.className = 'message hidden';
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const detail = Array.isArray(data.errors) ? ` ${data.errors.join(' ')}` : '';
    throw new Error((data.message || 'Ocorreu um erro.') + detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function loadTasks(search = '') {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const tasks = await request(`/api/tasks${query}`);
    renderTasks(tasks);
    hideMessage(listMessage);
  } catch (error) {
    showMessage(listMessage, error.message);
    tasksList.innerHTML = '';
  }
}

function renderTasks(tasks) {
  tasksList.innerHTML = '';
  taskCount.textContent = tasks.length;
  taskSubtitle.textContent = tasks.length === 1 ? '1 tarefa encontrada' : `${tasks.length} tarefas encontradas`;

  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty">Nenhuma tarefa encontrada.</div>';
    return;
  }

  tasks.forEach((task) => {
    const fragment = taskTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.task-card');
    const title = fragment.querySelector('.task-title');
    const description = fragment.querySelector('.task-description');
    const date = fragment.querySelector('.task-date');
    const badge = fragment.querySelector('.status-badge');
    const editButton = fragment.querySelector('.edit-button');
    const deleteButton = fragment.querySelector('.delete-button');

    title.textContent = task.title;
    description.textContent = task.description || 'Sem descrição.';
    date.textContent = `Data prevista: ${formatDate(task.due_date)}`;
    badge.textContent = task.status;
    badge.classList.toggle('done', task.status === 'Concluída');

    if (task.status === 'Concluída') {
      card.classList.add('completed');
    }

    editButton.addEventListener('click', () => startEdit(task));
    deleteButton.addEventListener('click', () => deleteTask(task.id, task.title));

    tasksList.appendChild(fragment);
  });
}

function startEdit(task) {
  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description || '';
  dueDateInput.value = task.due_date;
  statusInput.value = task.status;
  formTitle.textContent = 'Editar tarefa';
  cancelEditButton.classList.remove('hidden');
  hideMessage(formError);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  titleInput.focus();
}

function resetForm() {
  form.reset();
  taskIdInput.value = '';
  statusInput.value = 'Pendente';
  formTitle.textContent = 'Nova tarefa';
  cancelEditButton.classList.add('hidden');
  hideMessage(formError);
}

async function handleSubmit(event) {
  event.preventDefault();
  hideMessage(formError);

  if (!form.reportValidity()) return;

  const payload = {
    title: titleInput.value,
    description: descriptionInput.value,
    dueDate: dueDateInput.value,
    status: statusInput.value
  };

  try {
    const id = taskIdInput.value;
    await request(id ? `/api/tasks/${id}` : '/api/tasks', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });

    resetForm();
    await loadTasks(searchInput.value.trim());
    showMessage(listMessage, id ? 'Tarefa atualizada com sucesso.' : 'Tarefa criada com sucesso.', 'success');
  } catch (error) {
    showMessage(formError, error.message);
  }
}

async function deleteTask(id, title) {
  const confirmed = window.confirm(`Deseja excluir a tarefa "${title}"?`);
  if (!confirmed) return;

  try {
    await request(`/api/tasks/${id}`, { method: 'DELETE' });
    if (taskIdInput.value === String(id)) resetForm();
    await loadTasks(searchInput.value.trim());
    showMessage(listMessage, 'Tarefa excluída com sucesso.', 'success');
  } catch (error) {
    showMessage(listMessage, error.message);
  }
}

form.addEventListener('submit', handleSubmit);
cancelEditButton.addEventListener('click', resetForm);
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadTasks(searchInput.value.trim()), 250);
});

loadTasks();
