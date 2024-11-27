const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Підключення до бази даних
const db = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "password",
  database: "sto",
});

// Відображення всіх працівників
router.get("/", (req, res) => {
  db.query("SELECT * FROM Employees", (err, results) => {
    if (err) throw err;
    res.render("pages/employees", { employees: results });
  });
});

router.post("/add", (req, res) => {
  const { first_name, last_name, position, experience } = req.body;

  // Визначаємо максимальний ID
  const getMaxIdQuery = "SELECT MAX(employee_id) AS max_id FROM Employees";
  db.query(getMaxIdQuery, (err, results) => {
    if (err) throw err;

    const newId = (results[0].max_id || 0) + 1; // Якщо таблиця порожня, почати з 1

    // Вставляємо нового працівника
    const insertQuery = `
      INSERT INTO Employees (employee_id, first_name, last_name, position, experience)
      VALUES (?, ?, ?, ?, ?);
    `;
    db.query(insertQuery, [newId, first_name, last_name, position, experience], (err) => {
      if (err) throw err;
      res.redirect("/employees");
    });
  });
});

router.post("/delete/:id", (req, res) => {
  const employeeId = req.params.id;

  // Видаляємо працівника
  const deleteQuery = "DELETE FROM Employees WHERE employee_id = ?";
  db.query(deleteQuery, [employeeId], (err) => {
    if (err) throw err;

    // Створюємо тимчасову таблицю
    const createTempTableQuery = `
      CREATE TEMPORARY TABLE temp_employees AS 
      SELECT * FROM Employees ORDER BY employee_id;
    `;
    db.query(createTempTableQuery, (err) => {
      if (err) throw err;

      // Очищуємо таблицю Employees
      const deleteAllEmployeesQuery = "DELETE FROM Employees";
      db.query(deleteAllEmployeesQuery, (err) => {
        if (err) throw err;

        // Вставляємо дані з новими ID
        const insertReassignedQuery = `
          INSERT INTO Employees (employee_id, first_name, last_name, position, experience)
          SELECT ROW_NUMBER() OVER () AS employee_id, first_name, last_name, position, experience
          FROM temp_employees;
        `;
        db.query(insertReassignedQuery, (err) => {
          if (err) throw err;

          // Видаляємо тимчасову таблицю
          const dropTempTableQuery = "DROP TEMPORARY TABLE temp_employees";
          db.query(dropTempTableQuery, (err) => {
            if (err) throw err;
            res.redirect("/employees");
          });
        });
      });
    });
  });
});


// Редагування працівника
router.post("/edit/:id", (req, res) => {
  const employeeId = req.params.id;
  const { first_name, last_name, position, experience } = req.body;
  const query = `
    UPDATE Employees
    SET first_name = ?, last_name = ?, position = ?, experience = ?
    WHERE employee_id = ?;
  `;
  db.query(query, [first_name, last_name, position, experience, employeeId], (err) => {
    if (err) throw err;
    res.redirect("/employees");
  });
});

module.exports = router;
