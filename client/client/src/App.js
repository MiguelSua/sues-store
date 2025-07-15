import React, { useState } from "react";
import Checkout from "./components/Checkout";
import "./App.css";

function App() {
  const [carrito, setCarrito] = useState([
    { nombre: "Sérum facial", cantidad: 2 },
    { nombre: "Exfoliante", cantidad: 1 },
  ]);

  return (
    <div className="App">
      <h1>SUES Store 🛍️</h1>

      <h2>🛒 Carrito:</h2>
      <ul>
        {carrito.map((item, index) => (
          <li key={index}>
            {item.nombre} - Cantidad: {item.cantidad}
          </li>
        ))}
      </ul>

      <Checkout carrito={carrito} />
    </div>
  );
}

export default App;
