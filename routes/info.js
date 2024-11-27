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

// Запит для отримання інформації про автомобілі, власників, співробітників та послуги
router.get("/", (req, res) => {
  const carQuery = `
    SELECT 
      cars.make, cars.model, 
      clients.first_name AS client_first_name, 
      clients.last_name AS client_last_name,
      clients.phone, clients.email
    FROM Cars AS cars
    JOIN Clients AS clients ON cars.owner_id = clients.client_id
  `;
  
  const employeeQuery = `
    SELECT 
      employees.first_name AS employee_first_name, 
      employees.last_name AS employee_last_name,
      employees.position, 
      employees.experience
    FROM Employees AS employees
  `;

  const serviceQuery = `
    SELECT 
      services.service_name, 
      services.service_cost, 
      services.service_duration
    FROM Services AS services
  `;

  db.query(carQuery, (err, carResults) => {
    if (err) {
      console.log('Error executing car query:', err);
      return res.status(500).send("Error fetching car info.");
    }

    db.query(employeeQuery, (err, employeeResults) => {
      if (err) {
        console.log('Error executing employee query:', err);
        return res.status(500).send("Error fetching employee info.");
      }

      db.query(serviceQuery, (err, serviceResults) => {
        if (err) {
          console.log('Error executing service query:', err);
          return res.status(500).send("Error fetching service info.");
        }

        // Передаємо отримані дані в шаблон info.ejs
        res.render("info", { cars: carResults, employees: employeeResults, services: serviceResults });
      });
    });
  });
});

module.exports = router;
