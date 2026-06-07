import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './pages/Layout'
import Home from './pages/Home'
import Ventas from './pages/Ventas'
import Inventario from './pages/Inventario'
import Compras from './pages/Compras'
import Equipos from './pages/Equipos'
import Estadisticas from './pages/Estadisticas'
import HistorialVentas from './pages/HistorialVentas'
import RegistrarEmpleado from './pages/RegistrarEmpleado'
import HistorialCajas from './pages/HistorialCajas'

function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/home"         element={<Home />} />
        <Route path="/ventas"       element={<Ventas />} />
        <Route path="/inventario"   element={<Inventario />} />
        <Route path="/compras"      element={<Compras />} />
        <Route path="/equipos"      element={<Equipos />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/ventas/historial" element={<HistorialVentas />} />
        <Route path="/registrar-empleado" element={<RegistrarEmpleado />} />
        <Route path="/cajas" element={<HistorialCajas />} />

      </Route>
    </Routes>
  )
}