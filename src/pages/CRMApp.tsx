import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Sidebar from '../components/crm/Sidebar';
import Dashboard from '../components/crm/Dashboard';
import Contacts from '../components/crm/Contacts';
import WhatsAppPanel from '../components/crm/WhatsAppPanel';
import ChatView from '../components/crm/chat/ChatView';
import { Views, type View } from '../types';
import './CRMApp.css';

export default function CRMApp() {
  const [currentView, setCurrentView] = useState<View>(Views.Dashboard);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/crm/login');
  };

  const renderView = useCallback(() => {
    switch (currentView) {
      case Views.Dashboard:
        return <Dashboard />;
      case Views.Contacts:
        return <Contacts />;
      case Views.Conversations:
        return <ChatView />;
      case Views.WhatsApp:
        return <WhatsAppPanel />;
      default:
        return <Dashboard />;
    }
  }, [currentView]);

  return (
    <div className="crm">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="crm__main">
        <header className="crm__header">
          <button
            className="crm__menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
          <h1 className="crm__title">{currentView}</h1>
          <div className="crm__header-actions">
            <a href="/" className="crm__back-link">Voltar ao site</a>
            <button className="crm__logout-btn" onClick={handleLogout}>Sair</button>
          </div>
        </header>
        <main className={`crm__content${currentView === Views.Conversations ? ' crm__content--chat' : ''}`}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
