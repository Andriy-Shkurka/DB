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

// Route to fetch specific client details
router.get("/clients/:id", (req, res) => {
  const clientId = req.params.id;
  db.query("SELECT * FROM Clients WHERE client_id = ?", [clientId], (err, client) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching client.");
    }

    res.json(client[0]); // Send back the client data as JSON
  });
});


module.exports = router;
