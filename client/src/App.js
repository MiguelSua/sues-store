import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const horasPorDia = {
  lunes: generarHoras(9, 20),
  martes: generarHoras(9, 20),
  miércoles: generarHoras(9, 20),
  jueves: generarHoras(9, 20),
  viernes: generarHoras(9, 20),
  sábado: generarHoras(9, 21),
  domingo: generarHoras(9, 18),
};

function generarHoras(inicio, fin) {
  const horas = [];
  for (let h = inicio; h < fin; h++) {
    horas.push(`${h}:00`);
  }
  return horas;
}

function App() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    if (fechaSeleccionada) {
      axios
        .get(`https://sues-store-production.up.railway.app/citas?fecha=${fechaSeleccionada}`)
        .then((res) => setHorasOcupadas(res.data.map((r) => r.hora)))
        .catch((err) => console.error("Error cargando reservas:", err));
    }
  }, [fechaSeleccionada]);

  const manejarReserva = (hora) => {
    const nombre = prompt("Ingresa tu nombre:");
    const email = prompt("Ingresa tu correo:");

    axios
      .post("https://sues-store-production.up.railway.app/citas", {
        fecha: fechaSeleccionada,
        hora,
        nombre,
        email,
      })
      .then(() => {
        alert("Reserva realizada con éxito.");
        setHorasOcupadas((prev) => [...prev, hora]);
      })
      .catch(() => alert("Error al reservar. Intenta de nuevo."));
  };

  const obtenerDiaDeSemana = (fechaStr) => {
    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    return dias[new Date(fechaStr).getDay()];
  };

  return (
    <div className="App">
      <h1>SUES Barbershop 💈</h1>
      <input
        type="date"
        value={fechaSeleccionada}
        onChange={(e) => setFechaSeleccionada(e.target.value)}
      />

      {fechaSeleccionada && (
        <>
          <h2>Horarios disponibles para {fechaSeleccionada}:</h2>
          <ul>
            {(horasPorDia[obtenerDiaDeSemana(fechaSeleccionada)] || []).map((hora) => (
              <li key={hora}>
                {hora}{" "}
                {horasOcupadas.includes(hora) ? (
                  <span style={{ color: "red" }}> (Ocupado)</span>
                ) : (
                  <button onClick={() => manejarReserva(hora)}>Reservar</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;

