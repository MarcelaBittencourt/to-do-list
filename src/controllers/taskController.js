const pool = require('../config/database');

const ALLOWED_STATUS = ['Pendente', 'Concluída'];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateTaskInput({ title, dueDate, status }) {
  const errors = [];

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.push('O título é obrigatório.');
  } else if (title.trim().length > 120) {
    errors.push('O título deve ter no máximo 120 caracteres.');
  }

  if (!isValidDate(dueDate)) {
    errors.push('A data prevista deve ser válida.');
  }

  if (status !== undefined && !ALLOWED_STATUS.includes(status)) {
    errors.push('O status informado é inválido.');
  }

  return errors;
}

async function listTasks(req, res) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    let result;

    if (search) {
      result = await pool.query(
        `SELECT id, title, description, due_date, status, created_at, updated_at
         FROM tasks
         WHERE title ILIKE $1 OR COALESCE(description, '') ILIKE $1
         ORDER BY due_date ASC, id DESC`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        `SELECT id, title, description, due_date, status, created_at, updated_at
         FROM tasks
         ORDER BY due_date ASC, id DESC`
      );
    }

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Não foi possível carregar as tarefas.' });
  }
}

async function getTask(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, title, description, due_date, status, created_at, updated_at
       FROM tasks WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Não foi possível carregar a tarefa.' });
  }
}

async function createTask(req, res) {
  const { title, description, dueDate, status = 'Pendente' } = req.body;
  const errors = validateTaskInput({ title, dueDate, status });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, due_date, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, due_date, status, created_at, updated_at`,
      [title.trim(), description?.trim() || null, dueDate, status]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Não foi possível criar a tarefa.' });
  }
}

async function updateTask(req, res) {
  const { title, description, dueDate, status } = req.body;
  const errors = validateTaskInput({ title, dueDate, status });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           due_date = $3,
           status = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, title, description, due_date, status, created_at, updated_at`,
      [title.trim(), description?.trim() || null, dueDate, status, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Não foi possível atualizar a tarefa.' });
  }
}

async function deleteTask(req, res) {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Não foi possível excluir a tarefa.' });
  }
}

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
