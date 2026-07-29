import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CRMApp from './pages/CRMApp';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crm/login" element={<LoginPage />} />
        <Route
          path="/crm"
          element={
            <ProtectedRoute>
              <CRMApp />
            </ProtectedRoute>
          }
        />
        {/* Redireciona qualquer subrota do CRM para o login */}
        <Route path="/crm/*" element={<Navigate to="/crm" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
