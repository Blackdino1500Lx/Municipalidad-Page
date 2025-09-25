import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Importa los estilos por defecto

function Calendario() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  return (
    <div>
      <h2>Selecciona una fecha</h2>
      <Calendar onChange={setFechaSeleccionada} value={fechaSeleccionada} />
      <p>Fecha seleccionada: {fechaSeleccionada.toDateString()}</p>
    </div>
  );
}

export default Calendario;