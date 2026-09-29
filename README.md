# To-do List — Teste Inicial Climba

Aplicação web de gerenciamento de tarefas desenvolvida como teste inicial de programação.

## Funcionalidades

- Adicionar tarefa
- Listar tarefas
- Editar tarefa
- Excluir tarefa
- Pesquisar por título ou descrição
- Definir data prevista
- Alterar status entre Pendente e Concluída
- Validar título obrigatório
- Validar data prevista

## Tecnologias

- HTML, CSS e JavaScript
- Node.js + Express
- PostgreSQL
- Git/GitHub

## Estrutura

```text
climba-todo-list/
├── database/
│   └── schema.sql
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── taskController.js
│   ├── routes/
│   │   └── taskRoutes.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── RELATO.md
```

## Como executar localmente

### 1. Pré-requisitos

- Node.js instalado
- PostgreSQL instalado e em execução
- Um banco PostgreSQL chamado `todo_list`

### 2. Criar o banco

No PostgreSQL, crie o banco:

```sql
CREATE DATABASE todo_list;
```

Depois execute o conteúdo de `database/schema.sql` dentro desse banco.

### 3. Configurar as variáveis de ambiente

Copie `.env.example` para `.env` e ajuste a conexão:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:senha@localhost:5432/todo_list
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Executar

```bash
npm start
```

Para desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Endpoints da API

| Método | Endpoint | Função |
|---|---|---|
| GET | `/api/tasks` | Lista tarefas |
| GET | `/api/tasks/:id` | Busca uma tarefa |
| POST | `/api/tasks` | Cria tarefa |
| PUT | `/api/tasks/:id` | Atualiza tarefa |
| DELETE | `/api/tasks/:id` | Exclui tarefa |
| GET | `/api/tasks?search=texto` | Pesquisa tarefas |
| GET | `/api/health` | Verifica servidor e banco |

## Exemplo de criação

```json
{
  "title": "Estudar JavaScript",
  "description": "Revisar funções e arrays",
  "dueDate": "2026-09-30",
  "status": "Pendente"
}
```

## Publicação

A aplicação pode ser publicada em um serviço de hospedagem compatível com Node.js. O banco PostgreSQL deve ser disponibilizado em um serviço externo e sua URL deve ser configurada na variável `DATABASE_URL`.
