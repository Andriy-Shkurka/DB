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

// Відображення всіх клієнтів
router.get("/", (req, res) => {
  const queryClients = `
    SELECT 
      cl.first_name, cl.last_name, cl.phone, cl.email,
      ca.make, ca.model
    FROM Clients cl
    LEFT JOIN Cars ca ON cl.client_id = ca.owner_id;
  `;
  
  db.query(queryClients, (err, clientsResults) => {
    if (err) throw err;

    // Запит для списку автомобілів у випадаючому меню
    const queryCars = `
      SELECT car_id, make, model, year, license_plate
      FROM Cars;
    `;
    db.query(queryCars, (err, carsResults) => {
      if (err) throw err;
      res.render("pages/clients", { clients: clientsResults, cars: carsResults });
    });
  });
});




// Додавання клієнта разом з оновленням його автомобіля
router.post("/add", (req, res) => {
  const { first_name, last_name, phone, email, car_id } = req.body;

  // Додавання клієнта
  const insertClientQuery = "INSERT INTO Clients (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)";
  db.query(insertClientQuery, [first_name, last_name, phone, email], (err, result) => {
    if (err) throw err;

    // Отримання нового client_id
    const newClientId = result.insertId;

    // Оновлення owner_id в таблиці Cars
    if (car_id) {
      const updateCarQuery = "UPDATE Cars SET owner_id = ? WHERE car_id = ?";
      db.query(updateCarQuery, [newClientId, car_id], (err) => {
        if (err) throw err;
        res.redirect("/clients");
      });
    } else {
      res.redirect("/clients");
    }
  });
});


// Відображення всіх клієнтів
router.get("/", (req, res) => {
  const queryClients = `
    SELECT 
      cl.first_name, cl.last_name, cl.phone, cl.email,
      ca.make, ca.model
    FROM Clients cl
    LEFT JOIN Cars ca ON cl.client_id = ca.owner_id;
  `;
  
  db.query(queryClients, (err, clientsResults) => {
    if (err) throw err;

    // Запит для списку автомобілів у випадаючому меню
    const queryCars = `
      SELECT car_id, make, model, year, license_plate
      FROM Cars;
    `;
    db.query(queryCars, (err, carsResults) => {
      if (err) throw err;
      res.render("pages/clients", { clients: clientsResults, cars: carsResults });
    });
  });
});


// Редагування клієнта та його автомобіля
router.post("/edit/:id", (req, res) => {
  const clientId = req.params.id;
  const { first_name, last_name, phone, email, car_id } = req.body;

  const updateClientQuery = `
    UPDATE Clients 
    SET first_name = ?, last_name = ?, phone = ?, email = ? 
    WHERE client_id = ?`;

  db.query(updateClientQuery, [first_name, last_name, phone, email, clientId], (err) => {
    if (err) throw err;

    // Оновлення автомобіля
    const updateCarQuery = `
      UPDATE Cars 
      SET owner_id = NULL WHERE owner_id = ?`; // Скидаємо попередній owner_id
    db.query(updateCarQuery, [clientId], (err) => {
      if (err) throw err;

      if (car_id) {
        const setOwnerQuery = `
          UPDATE Cars 
          SET owner_id = ? WHERE car_id = ?`;
        db.query(setOwnerQuery, [clientId, car_id], (err) => {
          if (err) throw err;
          res.redirect("/clients");
        });
      } else {
        res.redirect("/clients");
      }
    });
  });
});


module.exports = router;
