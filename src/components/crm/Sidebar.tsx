import { Views, type View } from '../../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { view: View; label: string }[] = [
  { view: Views.Dashboard, label: 'Dashboard' },
  { view: Views.Contacts, label: 'Contatos' },
  { view: Views.Conversations, label: 'Conversas' },
  { view: Views.WhatsApp, label: 'WhatsApp' },
];

export default function Sidebar({ currentView, setCurrentView, isOpen, onClose }: SidebarProps) {
  const handleNav = (view: View) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar__overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <img src="/logo.jpeg" alt="Vertex" />
          <span>VERTEX CRM</span>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.view}
              className={`sidebar__item ${currentView === item.view ? 'sidebar__item--active' : ''}`}
              onClick={() => handleNav(item.view)}
            >
              <span className="sidebar__item-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <a href="/" className="sidebar__item">
            <span className="sidebar__item-label">Voltar ao site</span>
          </a>
        </div>
      </aside>
    </>
  );
}
