const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "password",
  database: "sto",
});

// Fetch orders and related data
router.get("/", (req, res) => {
  const ordersQuery = `
  SELECT o.order_id, o.order_date, c.first_name AS client_name, 
         e.first_name AS employee_name, o.status, s.service_name, s.service_cost, s.service_duration
  FROM Orders o
  JOIN Clients c ON o.client_id = c.client_id
  JOIN Employees e ON o.employee_id = e.employee_id
  JOIN Services s ON o.service_id = s.service_id
`;



  const clientsQuery = "SELECT * FROM Clients";
  const employeesQuery = "SELECT * FROM Employees";
  const servicesQuery = "SELECT * FROM Services";

  db.query(ordersQuery, (err, orders) => {
    if (err) throw err;

    db.query(clientsQuery, (err, clients) => {
      if (err) throw err;

      db.query(employeesQuery, (err, employees) => {
        if (err) throw err;

        db.query(servicesQuery, (err, services) => {
          if (err) throw err;

          res.render("pages/orders", {
            orders,
            clients,
            employees,
            services,
          });
        });
      });
    });
  });
});

// Add a new order
router.post("/add", (req, res) => {
  const { order_date, client_id, employee_id, status, service_id } = req.body;

  if (!order_date) {
    return res.status(400).send("Order date is required.");
  }

  const insertQuery = `
    INSERT INTO Orders (order_date, client_id, employee_id, status, service_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [order_date, client_id, employee_id, status, service_id],
    (err) => {
      if (err) throw err;
      res.redirect("/orders");
    }
  );
});

// Delete Order
router.post("/delete/:id", (req, res) => {
  const orderId = req.params.id;
  db.query("DELETE FROM Orders WHERE order_id = ?", [orderId], (err) => {
    if (err) throw err;
    res.redirect("/orders");
  });
});

// Edit Order
router.post("/edit/:id", (req, res) => {
  const orderId = req.params.id;
  const { client_id, employee_id, status, service_id } = req.body;

  const updateQuery = `
    UPDATE Orders
    SET client_id = ?, employee_id = ?, status = ?, service_id = ?
    WHERE order_id = ?
  `;

  db.query(updateQuery, [client_id, employee_id, status, service_id, orderId], (err) => {
    if (err) throw err;
    res.redirect("/orders");
  });
});




module.exports = router;
