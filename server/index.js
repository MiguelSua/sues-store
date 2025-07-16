require('dotenv').config();
const mysql = require('mysql2');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Servidor de SUES Barbershop funcionando");
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

// Endpoint para reservar cita
app.post("/reservar", (req, res) => {
  const { nombre, telefono, fecha, hora } = req.body;

  // Verificar si ya hay una cita en esa fecha y hora
  const verificar = `SELECT * FROM citas WHERE fecha = ? AND hora = ?`;

  db.query(verificar, [fecha, hora], (err, results) => {
    if (err) {
      console.error("❌ Error al verificar cita:", err);
      return res.status(500).json({ mensaje: "Error al verificar disponibilidad" });
    }

    if (results.length > 0) {
      return res.status(409).json({ mensaje: "⛔ Esa hora ya está reservada" });
    }

    // Si no hay conflicto, insertamos la nueva cita
    const insertar = `
      INSERT INTO citas (nombre, telefono, fecha, hora, fecha_reserva)
      VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(insertar, [nombre, telefono, fecha, hora], (err, result) => {
      if (err) {
        console.error("❌ Error al agendar cita:", err);
        return res.status(500).json({ mensaje: "Error al agendar cita" });
      }

      // Enviar correo de confirmación
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"SUES Barbershop" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `✂️ Nueva cita reservada por ${nombre}`,
        html: `
          <h3>📅 Cita confirmada</h3>
          <p><b>Nombre:</b> ${nombre}</p>
          <p><b>Teléfono:</b> ${telefono}</p>
          <p><b>Fecha:</b> ${fecha}</p>
          <p><b>Hora:</b> ${hora}</p>
          <p><b>Reservada el:</b> ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("❌ Error al enviar correo:", error);
        } else {
          console.log("📧 Correo enviado:", info.response);
        }
      });

      res.status(200).json({ mensaje: "✅ Cita reservada con éxito", id: result.insertId });
    });
  });
});

// Obtener todas las citas (con autorización)
app.get("/citas", (req, res) => {
  const auth = req.query.auth;

  if (auth !== process.env.ADMIN_KEY) {
    return res.status(401).send("No autorizado");
  }

  db.query("SELECT * FROM citas", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener las citas:", err);
      return res.status(500).send("Error al obtener citas");
    }

    res.json(results);
  });
});





