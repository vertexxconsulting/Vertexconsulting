import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CRMApp from './pages/CRMApp';
import Diagnostico from './pages/Diagnostico';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
        <Route path="/crm" element={<CRMApp />} />
        {/* Redireciona qualquer subrota do CRM para o CRMApp principal */}
        <Route path="/crm/*" element={<Navigate to="/crm" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
