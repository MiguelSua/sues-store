require('dotenv').config();
const mysql = require('mysql2');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
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
    const token = crypto.randomBytes(20).toString("hex");
const cancelarUrl = `https://sues-store-production.up.railway.app/cancelar-cita/${token}`;

const insertarQuery = `
  INSERT INTO appointments (cliente, correo, telefono, fecha, hora, created_at, token)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

db.query(
  insertarQuery,
  [cliente, correo, telefono, fecha, hora, fechaActual, token],
  (error, result) => {
    if (error) {
      console.error("❌ Error al guardar cita:", error);
      return res.status(500).send("Error al guardar la cita");
    } else {
      console.log("✅ Cita guardada con éxito");

      if (correo) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: correo,
          subject: "Confirmación de tu cita - SUES Barbershop 💈",
          html: `
            <p>Hola ${cliente}, tu cita fue agendada para el <strong>${fecha}</strong> a las <strong>${hora}</strong>.</p>
            <p>Si deseas cancelar tu cita, haz clic en el siguiente enlace:</p>
            <a href="${cancelarUrl}">${cancelarUrl}</a>
            <p>Gracias por confiar en SUES Barbershop 💈</p>
          `,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error("❌ Error al enviar correo:", err);
          } else {
            console.log("✅ Correo enviado:", info.response);
          }
        });
      }

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

app.get('/todas-las-citas', (req, res) => {
  const query = "SELECT * FROM appointments ORDER BY fecha, hora";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener citas:", err);
      return res.status(500).send("<h1>Error al obtener citas</h1>");
    }

    let citasJson = JSON.stringify(results);

    let html = `
      <html>
        <head>
          <title>Listado de Citas</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              padding: 20px;
            }
            h1 {
              text-align: center;
            }
            #fechaInput {
              display: block;
              margin: 0 auto 20px auto;
              padding: 10px;
              font-size: 16px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              background-color: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            th, td {
              border: 1px solid #ccc;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #222;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            #sinResultados {
              text-align: center;
              margin-top: 20px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>Listado de Citas Agendadas</h1>
          <input type="date" id="fechaInput" />

          <table id="tablaCitas">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Fecha</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody id="tbodyCitas">
              <!-- Aquí se cargan las filas dinámicamente -->
            </tbody>
          </table>

          <p id="sinResultados" style="display: none;">No hay citas para esta fecha.</p>

          <script>
            const citas = ${citasJson};

            const inputFecha = document.getElementById('fechaInput');
            const tbody = document.getElementById('tbodyCitas');
            const sinResultados = document.getElementById('sinResultados');

            inputFecha.addEventListener('change', () => {
              const fechaSeleccionada = inputFecha.value;
              const citasFiltradas = citas.filter(cita => cita.fecha === fechaSeleccionada);

              tbody.innerHTML = '';

              if (citasFiltradas.length === 0) {
                sinResultados.style.display = 'block';
              } else {
                sinResultados.style.display = 'none';
                citasFiltradas.forEach(cita => {
                  const fila = document.createElement('tr');
                  fila.innerHTML = \`
                    <td>\${cita.id}</td>
                    <td>\${cita.cliente}</td>
                    <td>\${cita.correo}</td>
                    <td>\${cita.fecha}</td>
                    <td>\${cita.hora}</td>
                  \`;
                  tbody.appendChild(fila);
                });
              }
            });
          </script>
        </body>
      </html>
    `;

    res.send(html);
  });
});

app.get("/cancelar-cita/:token", (req, res) => {
  const { token } = req.params;

  const eliminarQuery = `DELETE FROM appointments WHERE token = ?`;

  db.query(eliminarQuery, [token], (err, result) => {
    if (err) {
      console.error("❌ Error al cancelar cita:", err);
      return res.send("<h2>Error al cancelar cita</h2>");
    }

    if (result.affectedRows === 0) {
      return res.send("<h2>Token inválido o la cita ya fue cancelada.</h2>");
    }

    return res.send("<h2>✅ Tu cita ha sido cancelada exitosamente.</h2>");
  });
});
















