import { useState, useCallback } from 'react';
import Sidebar from '../components/crm/Sidebar';
import Dashboard from '../components/crm/Dashboard';
import Contacts from '../components/crm/Contacts';
import WhatsAppPanel from '../components/crm/WhatsAppPanel';
import Settings from '../components/crm/Settings';
import { Views, type View } from '../types';
import './CRMApp.css';

export default function CRMApp() {
  const [currentView, setCurrentView] = useState<View>(Views.Dashboard);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = useCallback(() => {
    switch (currentView) {
      case Views.Dashboard:
        return <Dashboard />;
      case Views.Contacts:
        return <Contacts />;
      case Views.WhatsApp:
        return <WhatsAppPanel />;
      case Views.Settings:
        return <Settings />;
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
          <a href="/" className="crm__back-link">Voltar ao site</a>
        </header>
        <main className="crm__content">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
