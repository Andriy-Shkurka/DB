const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Підключення EJS
app.set("view engine", "ejs");

// Підключення статичних файлів
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Маршрути
const carsRoutes = require("./routes/cars");
const clientsRoutes = require("./routes/clients");
const employeesRoutes = require("./routes/employees");
const ordersRoutes = require("./routes/orders");
const servicesRoutes = require("./routes/services");
const infoRoutes = require("./routes/info");

// Головна сторінка
app.get("/", (req, res) => {
  res.render("index");
});

// Підключення маршрутів
app.use("/cars", carsRoutes);
app.use("/clients", clientsRoutes);
app.use("/employees", employeesRoutes);
app.use("/orders", ordersRoutes);
app.use("/info", infoRoutes);
app.use("/services", servicesRoutes);

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
