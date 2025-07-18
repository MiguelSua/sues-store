import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Genera arreglo de horas con formato "HH:00"
const generarHoras = (inicio, fin) => {
  const horas = [];
  for (let h = inicio; h < fin; h++) {
    horas.push(`${h}:00`);
  }
  return horas;
};

// Horarios por día
const horasPorDia = {
  lunes: generarHoras(9, 20),
  martes: generarHoras(9, 20),
  miércoles: generarHoras(9, 20),
  jueves: generarHoras(9, 20),
  viernes: generarHoras(9, 20),
  sábado: generarHoras(9, 21),
  domingo: generarHoras(9, 18),
};

// Días de la semana
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
  const fecha = new Date(fechaStr + "T00:00");
  return dias[fecha.getDay()];
};

function App() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);

  useEffect(() => {
    if (fechaSeleccionada) {
      axios
        .get("https://sues-store-production.up.railway.app/citas", {
          params: { fecha: fechaSeleccionada },
        })
        .then((res) => {
          const ocupadas = res.data;
          setHorasOcupadas(ocupadas);
        })
        .catch((err) => {
          console.error("Error cargando citas:", err);
          alert("❌ Error al cargar las citas. Intenta nuevamente.");
        });
    }
  }, [fechaSeleccionada]);

  const manejarReserva = async (hora) => {
    const cliente = prompt("Ingresa tu nombre:")?.trim();
    if (!cliente) return alert("❌ El nombre es obligatorio.");

    const telefono = prompt("Ingresa tu teléfono:")?.trim();
    if (!telefono) return alert("❌ El teléfono es obligatorio.");

    const correo = prompt("Ingresa tu correo (opcional):")?.trim();

    try {
      await axios.post("https://sues-store-production.up.railway.app/citas", {
        cliente,
        telefono,
        correo,
        fecha: fechaSeleccionada,
        hora,
      });
      alert("✅ Cita agendada con éxito");
      setHorasOcupadas((prev) => [...prev, hora]);
    } catch (err) {
      console.error("Error al guardar cita:", err);
      alert("❌ No se pudo guardar la cita. Intenta nuevamente.");
    }
  };

  const esFechaPasada = (fechaStr) => {
    const hoy = new Date();
    const fecha = new Date(fechaStr + "T00:00");
    return fecha < new Date(hoy.toDateString());
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
          {esFechaPasada(fechaSeleccionada) ? (
            <p style={{ color: "red" }}>
              ❌ No puedes agendar en fechas pasadas.
            </p>
          ) : (
            <>
              <h2>Horarios disponibles para {fechaSeleccionada}:</h2>
              <ul>
                {(horasPorDia[obtenerDiaDeSemana(fechaSeleccionada)] || []).map(
                  (hora) => {
                    const ocupado = horasOcupadas.includes(hora);
                    return (
                      <li key={hora}>
                        {hora}{" "}
                        {ocupado ? (
                          <span style={{ color: "red" }}> (Ocupado)</span>
                        ) : (
                          <button onClick={() => manejarReserva(hora)}>
                            Reservar
                          </button>
                        )}
                      </li>
                    );
                  }
                )}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;


