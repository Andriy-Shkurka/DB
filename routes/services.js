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

// Відображення всіх послуг
router.get("/", (req, res) => {
  db.query("SELECT * FROM Services", (err, results) => {
    if (err) throw err;
    res.render("pages/services", { services: results });
  });
});

// Додавання послуги
router.post("/add", (req, res) => {
  const { service_name, service_cost, service_duration } = req.body;
  const query = `
    INSERT INTO Services (service_name, service_cost, service_duration)
    VALUES (?, ?, ?);
  `;
  db.query(query, [service_name, service_cost, service_duration], (err) => {
    if (err) throw err;
    res.redirect("/services");
  });
});

// Видалення послуги
router.post("/delete/:id", (req, res) => {
  const serviceId = req.params.id;
  db.query("DELETE FROM Services WHERE service_id = ?", [serviceId], (err) => {
    if (err) throw err;
    res.redirect("/services");
  });
});

// Редагування послуги
router.post("/edit/:id", (req, res) => {
  const serviceId = req.params.id;
  const { service_name, service_cost, service_duration } = req.body;
  const query = `
    UPDATE Services
    SET service_name = ?, service_cost = ?, service_duration = ?
    WHERE service_id = ?;
  `;
  db.query(query, [service_name, service_cost, service_duration, serviceId], (err) => {
    if (err) throw err;
    res.redirect("/services");
  });
});

module.exports = router;
