require('dotenv').config();
const mysql = require('mysql2');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
  } else {
    console.log("✅ Conectado a la base de datos MySQL");
  }
});

app.post("/pedido", (req, res) => {
  const { cliente, telefono, producto, cantidad, direccion, pago } = req.body;

  const query = `
    INSERT INTO orders (cliente, telefono, producto, cantidad, direccion, pago, fecha)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [cliente, telefono, producto, cantidad, direccion, pago],
    (err, result) => {
      if (err) {
        console.error("❌ Error al registrar pedido:", err);
        res.status(500).json({ mensaje: "Error al registrar el pedido" });
      } else {
        res.status(200).json({ mensaje: "✅ Pedido registrado con éxito", id: result.insertId });
      }
    }
  );
});

app.get("/pedidos", (req, res) => {
  db.query("SELECT * FROM orders", (err, resultados) => {
    if (err) {
      console.error("❌ Error al obtener pedidos:", err);
      res.status(500).send("Error al obtener los pedidos");
    } else {
      res.json(resultados);
    }
  });
});
