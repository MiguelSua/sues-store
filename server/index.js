require('dotenv').config();
const mysql = require('mysql2');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Parser } = require("json2csv");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Asegúrate de tener esto arriba


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

  const nodemailer = require("nodemailer");
 require("dotenv").config(); // Asegúrate de tener esto arriba
  // Transportador de correos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Después de guardar el pedido en la base de datos
const enviarCorreo = (pedido) => {
  const mailOptions = {
    from: `"SUES Store" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Tú mismo recibirás el correo
    subject: `🛒 Nuevo pedido de ${pedido.cliente}`,
    html: `
      <h3>📦 Pedido recibido</h3>
      <p><b>Cliente:</b> ${pedido.cliente}</p>
      <p><b>Teléfono:</b> ${pedido.telefono}</p>
      <p><b>Dirección:</b> ${pedido.direccion}</p>
      <p><b>Pago:</b> ${pedido.pago}</p>
      <p><b>Producto:</b> ${pedido.producto}</p>
      <p><b>Cantidad:</b> ${pedido.cantidad}</p>
      <p><b>Fecha:</b> ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error al enviar correo:", error);
    } else {
      console.log("📧 Correo enviado:", info.response);
    }
  });
};


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

        enviarCorreo({
  cliente,
  telefono,
  direccion,
  pago,
  producto,
  cantidad,
});

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
      <a href="/descargar-csv?auth=${auth}">
        <button style="margin-bottom: 10px;">📄 Descargar CSV</button>
      </a>
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
          <td>
            <button onclick="eliminarPedido(${row.id})">❌ Eliminar</button>
          </td>
          
        </tr>
      `;
    }

    html += "</table>";
    html += `
  </table>
  <br />
  <button onclick="eliminarTodos()">🗑️ Eliminar todos los pedidos</button>

  <script>
    function eliminarPedido(id) {
      if (confirm("¿Estás seguro de eliminar el pedido " + id + "?")) {
        fetch('/eliminar/' + id + '?auth=${process.env.ADMIN_KEY}', {
          method: 'DELETE'
        })
        .then(res => res.text())
        .then(msg => {
          alert(msg);
          location.reload();
        })
        .catch(err => {
          alert("❌ Error al eliminar");
          console.error(err);
        });
      }
    }

    function eliminarTodos() {
      if (confirm("⚠️ Esta acción eliminará TODOS los pedidos.") &&
          confirm("¿Estás completamente seguro?")) {
        fetch('/eliminar-todos?auth=${process.env.ADMIN_KEY}', {
          method: 'DELETE'
        })
        .then(res => res.text())
        .then(msg => {
          alert(msg);
          location.reload();
        })
        .catch(err => {
          alert("❌ Error al eliminar todos los pedidos");
          console.error(err);
        });
      }
    }
  </script>
`;

    html += `
  </table>
  
  <script>
    function eliminarPedido(id) {
      if (confirm("¿Estás seguro de eliminar el pedido " + id + "?")) {
        fetch('/eliminar/' + id + '?auth=${process.env.ADMIN_KEY}', {
          method: 'DELETE'
        })
        .then(res => res.text())
        .then(msg => {
          alert(msg);
          location.reload();
        })
        .catch(err => {
          alert("❌ Error al eliminar");
          console.error(err);
        });
      }
    }
  </script>
`;
    res.send(html);
  });
});

app.delete("/eliminar/:id", (req, res) => {
  const { auth } = req.query;
  const { id } = req.params;

  if (auth !== process.env.ADMIN_KEY) {
    return res.status(403).send("Acceso denegado");
  }

  db.query("DELETE FROM orders WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar pedido:", err);
      return res.status(500).send("Error al eliminar");
    }
    res.send("✅ Pedido eliminado");
  });
});

app.delete("/eliminar-todos", (req, res) => {
  const { auth } = req.query;

  if (auth !== process.env.ADMIN_KEY) {
    return res.status(403).send("Acceso denegado");
  }

  db.query("DELETE FROM orders", (err, result) => {
    if (err) {
      console.error("❌ Error al eliminar todos los pedidos:", err);
      return res.status(500).send("Error al eliminar todos");
    }
    res.send("✅ Todos los pedidos eliminados");
  });
});

app.get("/descargar-csv", (req, res) => {
  const { auth } = req.query;

  if (auth !== process.env.ADMIN_KEY) {
    return res.status(403).send("Acceso denegado");
  }

  db.query("SELECT * FROM orders", (err, results) => {
    if (err) {
      console.error("❌ Error al obtener pedidos para CSV:", err);
      return res.status(500).send("Error al obtener pedidos");
    }

    const fields = ["id", "cliente", "telefono", "direccion", "pago", "producto", "cantidad", "fecha"];
    const parser = new Parser({ fields, delimiter: ";" });
    const csv = parser.parse(results);

    res.header("Content-Type", "text/csv; charset=utf-8");
    res.attachment("pedidos.csv");
    res.send("\uFEFF" + csv); // BOM para Excel
  });
});




