import React, { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [mensaje, setMensaje] = useState("");

  const agendarCita = async () => {
    if (!nombre || !telefono || !fecha || !hora) {
      setMensaje("⚠️ Por favor completa todos los campos.");
      return;
    }

    try {
      await axios.post("https://sues-store-production.up.railway.app/pedido", {
        cliente: nombre,
        telefono,
        direccion: fecha,    // usamos direccion para guardar la fecha
        pago: hora,          // usamos pago para guardar la hora
        producto: "Cita de barbería",
        cantidad: 1,
      });

      setMensaje("✅ Cita agendada con éxito");
      setNombre("");
      setTelefono("");
      setFecha("");
      setHora("");
    } catch (error) {
      console.error("❌ Error al agendar la cita:", error);
      setMensaje("❌ Error al agendar la cita");
    }
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
        {[
          "09:00", "10:00", "11:00", "12:00", "13:00",
          "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
        ].map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <br /><br />
      <button onClick={agendarCita}>📆 Reservar</button>

      {mensaje && <p style={{ marginTop: "10px" }}>{mensaje}</p>}
    </div>
  );
}

export default App;
