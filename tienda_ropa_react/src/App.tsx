import { Route, Routes, useLocation } from 'react-router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import ProductoList from './pages/ProductoList';
import ProductoDetalle from './pages/ProductoDetalle';
import CarritoPage from './pages/CarritoPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import FavoritosPage from './pages/FavoritosPage';
import MisComprasPage from './pages/MisComprasPage';
import AdminPage from './pages/AdminPage';

const App = () => {
  const location = useLocation();
  // En el panel admin ocultamos el navbar y footer publicos igual que en el proyecto original
  const esRutaAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      {!esRutaAdmin && <Navbar />}

      <div className="flex-grow-1 d-flex flex-column">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/productos" element={<ProductoList />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/mis-compras" element={<MisComprasPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>

      {!esRutaAdmin && <Footer />}
    </div>
  );
};

export default App;
