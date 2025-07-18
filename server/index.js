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

app.post("/citas", (req, res) => {
  const { cliente, correo, telefono, fecha, hora } = req.body;
  const fechaActual = new Date().toISOString();

  // Primero verificar si ya existe una cita en esa fecha y hora
  const verificarQuery = `
    SELECT * FROM appointments
    WHERE fecha = ? AND hora = ?
  `;

  db.query(verificarQuery, [fecha, hora], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar cita:", err);
      return res.status(500).send("Error al verificar disponibilidad");
    }

    if (results.length > 0) {
      // Ya hay una cita para esa fecha y hora
      return res.status(409).send("La hora ya está ocupada");
    }

    // Si no hay cita, entonces insertar
    const insertarQuery = `
      INSERT INTO appointments (cliente, correo, telefono, fecha, hora, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertarQuery,
      [cliente, correo, telefono, fecha, hora, fechaActual],
      (error, result) => {
        if (error) {
          console.error("❌ Error al guardar cita:", error);
          return res.status(500).send("Error al guardar la cita");
        } else {
          console.log("✅ Cita guardada con éxito");
          return res.status(200).send("Cita guardada");
        }
      }
    );
  });
});

// Ruta para obtener horas ocupadas en una fecha
app.get("/citas", (req, res) => {
  const { fecha } = req.query;

  if (!fecha) return res.status(400).json({ mensaje: "Falta la fecha" });

  const query = "SELECT hora FROM appointments WHERE fecha = ?";

  db.query(query, [fecha], (err, results) => {
    if (err) {
      console.error("❌ Error al obtener citas:", err);
      return res.status(500).json({ mensaje: "Error al obtener citas" });
    }

    const horasOcupadas = results.map((row) => row.hora);
    res.status(200).json(horasOcupadas);
  });
});

// Ruta para ver todas las citas (debug)
app.get("/citas-debug", (req, res) => {
  db.query("SELECT * FROM appointments", (err, result) => {
    if (err) {
      console.error("Error al obtener citas:", err);
      return res.status(500).json({ error: "Error" });
    }
    console.log("Citas guardadas:", result);
    res.json(result);
  });
});

db.query("DROP TABLE IF EXISTS orders", (err) => {
  if (err) {
    console.error("❌ Error al eliminar tabla:", err);
  } else {
    console.log("✅ Tabla 'orders' eliminada");
  }
});












