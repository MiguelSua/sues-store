import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function CancelarCita() {
  const { token } = useParams();
  const [estado, setEstado] = useState("Procesando...");

  useEffect(() => {
    axios
      .delete(`https://sues-store-production.up.railway.app/cancelar/${token}`)
      .then(() => {
        setEstado("✅ Tu cita ha sido cancelada exitosamente.");
      })
      .catch((err) => {
        console.error("Error al cancelar cita:", err);
        setEstado("❌ No se pudo cancelar la cita. Verifica el enlace o contacta soporte.");
      });
  }, [token]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>SUES Barbershop 💈</h1>
      <p>{estado}</p>
    </div>
  );
}

export default CancelarCita;
