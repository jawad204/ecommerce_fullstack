import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellPage from './pages/SellPage';


function App() {
  return (
    <BrowserRouter>
      < NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/sell" element={<SellPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;