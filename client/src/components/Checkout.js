import React, { useState } from "react";
import axios from "axios";

const Checkout = ({ carrito }) => {
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [pago, setPago] = useState("contraentrega");

  const enviarPedido = async () => {
    try {
      for (let item of carrito) {
        await axios.post("https://sues-store-production.up.railway.app/pedido", {
          cliente,
          telefono,
          direccion,
          pago,
          producto: item.nombre,
          cantidad: item.cantidad,
        });
      }
      alert("✅ Pedido enviado con éxito");
    } catch (error) {
      console.error("❌ Error al enviar pedido:", error);
      alert("Hubo un error al enviar el pedido");
    }
  };

  return (
    <div>
      <h3>Confirmar pedido si</h3>
      <input placeholder="Nombre" value={cliente} onChange={(e) => setCliente(e.target.value)} />
      <input placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      <input placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      <select value={pago} onChange={(e) => setPago(e.target.value)}>
        <option value="contraentrega">Contraentrega</option>
        <option value="otro">Otro (no habilitado)</option>
      </select>
      <br />
      <button onClick={enviarPedido}>🧾 Enviar Pedido</button>
    </div>
  );
};

export default Checkout;