import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const todasLasHoras = [
    "09:00:00", "10:00:00", "11:00:00", "12:00:00",
    "13:00:00", "14:00:00", "15:00:00", "16:00:00",
    "17:00:00", "18:00:00", "19:00:00", "20:00:00"
  ];

  useEffect(() => {
    if (fecha) {
      fetch(`https://sues-store-production.up.railway.app/horas-ocupadas?fecha=${fecha}`)
        .then((res) => res.json())
        .then((data) => setHorasOcupadas(data.ocupadas || []))
        .catch((err) => console.error("❌ Error al obtener horas:", err));
    }
  }, [fecha]);

  const agendarCita = () => {
    if (!nombre || !telefono || !fecha || !hora) {
      setMensaje("⚠️ Por favor completa todos los campos.");
      return;
    }

    fetch("https://sues-store-production.up.railway.app/agendar-cita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, fecha, hora }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMensaje(data.mensaje || "✅ Cita agendada");
        setNombre("");
        setTelefono("");
        setHora("");
      })
      .catch(() => {
        setMensaje("❌ Error al agendar la cita");
      });
  };

  return (
    <div className="App">
      <h1>💈 SUES Barbershop</h1>
      <h2>Agenda tu corte de cabello</h2>

      <label>👤 Nombre completo:</label><br />
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} /><br />

      <label>📱 Teléfono:</label><br />
      <input value={telefono} onChange={(e) => setTelefono(e.target.value)} /><br />

      <label>📅 Fecha:</label><br />
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /><br />

      <label>🕒 Hora:</label><br />
      <select value={hora} onChange={(e) => setHora(e.target.value)}>
        <option value="">Selecciona una hora</option>
        {todasLasHoras.map((h) => (
          <option key={h} value={h} disabled={horasOcupadas.includes(h)}>
            {h.slice(0, 5)} {horasOcupadas.includes(h) ? "⛔ Ocupada" : ""}
          </option>
        ))}
      </select>

      <br /><br />
      <button onClick={agendarCita}>📆 Reservar</button>

      {mensaje && <p style={{ marginTop: "10px" }}>{mensaje}</p>}
    </div>
  );
}

export default App;
