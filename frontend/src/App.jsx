import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import UploadPage from './pages/UploadPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DetailPage from './pages/DetailPage.jsx';

function NavBar() {
  const location = useLocation();
  const linkStyle = (active) => ({
    color: active ? '#f97316' : '#475569',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: active ? 700 : 400,
    fontFamily: 'monospace',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '6px 12px',
    borderRadius: 6,
    background: active ? '#f9731611' : 'transparent',
    transition: 'all 0.15s',
  });

  return (
    <nav style={{ background: '#020817', borderBottom: '1px solid #1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 4, height: 52, position: 'sticky', top: 0, zIndex: 100 }}>
      <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16, textDecoration: 'none' }}>
        <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #f97316, #ef4444)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛤</div>
        <span style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.06em' }}>RAR</span>
      </NavLink>
      <NavLink to="/" style={({ isActive }) => linkStyle(isActive && location.pathname === '/')}>Upload</NavLink>
      <NavLink to="/detail" style={({ isActive }) => linkStyle(isActive)}>Detail</NavLink>
      <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>Dashboard</NavLink>
    </nav>
  );
}

function AppRoutes() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalysisComplete = (data) => {
    setCurrentAnalysis(data);
    setHistory(prev => [...prev, data]);
  };

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<UploadPage onAnalysisComplete={handleAnalysisComplete} />} />
        <Route path="/detail" element={<DetailPage analysis={currentAnalysis} />} />
        <Route path="/dashboard" element={<DashboardPage history={history} onSelectAnalysis={setCurrentAnalysis} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
