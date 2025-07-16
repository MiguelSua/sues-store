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
  const auth = req.query.auth;

  if (auth !== process.env.ADMIN_KEY) {
    return res.status(401).send("No autorizado");
  }

  db.query("SELECT * FROM orders", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener los pedidos:", err);
      return res.status(500).send("Error al obtener pedidos");
    }

    let html = `
      <h2>📦 Pedidos Recibidos</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>ID</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th>Pago</th>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Fecha</th>
        </tr>
    `;

    for (let row of results) {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.cliente}</td>
          <td>${row.telefono}</td>
          <td>${row.direccion}</td>
          <td>${row.pago}</td>
          <td>${row.producto}</td>
          <td>${row.cantidad}</td>
          <td>${row.fecha}</td>
        </tr>
      `;
    }

    html += "</table>";
    res.send(html);
  });
});


