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

// Відображення всіх автомобілів
router.get("/", (req, res) => {
  const query = `
    SELECT ca.car_id, ca.make, ca.model, ca.year, ca.license_plate
    FROM Cars ca;
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.render("pages/cars", { cars: results });
  });
});


// Додавання автомобіля з динамічним оновленням ID
router.post("/add", (req, res) => {
  const { make, model, year, license_plate } = req.body;

  // Запит на додавання нового автомобіля
  const insertQuery = `
    INSERT INTO Cars (make, model, year, license_plate)
    VALUES (?, ?, ?, ?);
  `;

  db.query(insertQuery, [make, model, year, license_plate], (err) => {
    if (err) throw err;

    // 1. Скинути змінну для нового ID
    db.query("SET @new_id = 0;", (err) => {
      if (err) throw err;

      // 2. Оновити ID у таблиці Cars
      db.query("UPDATE Cars SET car_id = (@new_id := @new_id + 1);", (err) => {
        if (err) throw err;

        // 3. Скинути AUTO_INCREMENT
        db.query("ALTER TABLE Cars AUTO_INCREMENT = 1;", (err) => {
          if (err) throw err;

          // Перенаправлення на сторінку автомобілів
          res.redirect("/cars");
        });
      });
    });
  });
});



// Видалення автомобіля з динамічним оновленням ID
router.post("/delete/:id", (req, res) => {
  const carId = parseInt(req.params.id, 10);

  // Видалення автомобіля
  db.query("DELETE FROM Cars WHERE car_id = ?", [carId], (err) => {
    if (err) throw err;

    // 1. Скинути змінну для нового ID
    db.query("SET @new_id = 0;", (err) => {
      if (err) throw err;

      // 2. Оновити ID у таблиці Cars
      db.query("UPDATE Cars SET car_id = (@new_id := @new_id + 1);", (err) => {
        if (err) throw err;

        // 3. Скинути AUTO_INCREMENT
        db.query("ALTER TABLE Cars AUTO_INCREMENT = 1;", (err) => {
          if (err) throw err;

          // Повернутися на сторінку списку автомобілів
          res.redirect("/cars");
        });
      });
    });
    
  });
    // Скидання прив'язки автомобілів до клієнта
    const resetCarsQuery = `
    UPDATE Cars 
    SET owner_id = NULL 
    WHERE owner_id = ?`;

  db.query(resetCarsQuery, [clientId], (err) => {
    if (err) {
      console.error("Error resetting car ownership:", err);
      return res.status(500).send("Error while resetting car ownership.");
    }

    // Видалення клієнта
    const deleteClientQuery = `
      DELETE FROM Clients 
      WHERE client_id = ?`;

    db.query(deleteClientQuery, [clientId], (err) => {
      if (err) {
        console.error("Error deleting client:", err);
        return res.status(500).send("Error while deleting client.");
      }

      // Повернення на сторінку клієнтів
      res.redirect("/clients");
    });
  });

});


// Редагування автомобіля
router.post("/edit/:id", (req, res) => {
  const carId = req.params.id;
  const { make, model, year, license_plate} = req.body;
  const query = `
    UPDATE Cars
    SET make = ?, model = ?, year = ?, license_plate = ?
    WHERE car_id = ?;
  `;
  db.query(query, [make, model, year, license_plate, carId], (err) => {
    if (err) throw err;
    res.redirect("/cars");
  });
});

module.exports = router;
