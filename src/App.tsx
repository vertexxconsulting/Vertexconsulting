import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CRMApp from './pages/CRMApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/crm" element={<CRMApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
