const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();

const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasPriorityProperties = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperties = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryProperties = (requestQuery) => {
  return requestQuery.category !== undefined;
};

//API-1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                    SELECT
                        *
                    FROM
                        todo 
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND priority = '${priority}'
                        AND status = '${status}';`;
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                        SELECT
                            *
                        FROM
                            todo 
                        WHERE
                            todo LIKE '%${search_q}%'
                            AND category = '${category}' AND priority = '${priority}';`;
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo category");
      }
      break;
    case hasCategoryAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                        SELECT
                            *
                        FROM
                            todo 
                        WHERE
                            todo LIKE '%${search_q}%'
                        AND category = '${category}' AND status = '${status}';`;
        } else {
          response.status(400);
          response.send("Invalid Todo status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo category");
      }
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                todo LIKE '%${search_q}%'
                AND priority = '${priority}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    todo LIKE '%${search_q}%'
                    AND status = '${status}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo status");
      }
      break;
    case hasCategoryProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    todo LIKE '%${search_q}%'
                    AND category = '${category}';`;
      } else {
        response.status(400);
        response.send("Invalid Todo category");
      }
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }

  data = await database.all(getTodosQuery);
  response.send(data);
});

//API-2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoIdQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;

  const data = await db.get(getTodoIdQuery);

  response.send(data);
});

//API-3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  if (isValid(new Date(date))) {
    const newDate = format(new Data(date), "yyyy-MM-dd");
    const requestQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`;
    const result = await db.all(requestQuery);

    response.send(result);
  } else {
    response.status(400);
    response.send("Invalid due date");
  }
});

//API-4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const postTodoQuery = `INSERT INTO todo(id,todo,priority,status,category,due_date)
    VALUES(
        '${id}',
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}');`;

  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API-5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  let updateColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "DueDate";
      break;
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;

  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      dueDate = '${dueDate}'
    WHERE
      id = '${todoId}';`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

//API-7

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `DELETE FROM todo WHERE id = '${todoId}';`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
