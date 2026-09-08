import React from 'react';
import { 
  Kanban, 
  Briefcase, 
  Inbox, 
  Calendar, 
  LayoutDashboard, 
  Users, 
  Zap, 
  Package, 
  Settings,
  LogOut
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export type ViewType = 
  | 'pipeline' 
  | 'deals' 
  | 'service' 
  | 'calendar' 
  | 'dashboard' 
  | 'team' 
  | 'automations' 
  | 'products' 
  | 'settings';

interface SidebarProps {
  activeView: ViewType;
  onChangeView: (view: ViewType) => void;
  userRole: string | null;
}

export function Sidebar({ activeView, onChangeView, userRole }: SidebarProps) {
  const isAdmin = userRole === 'admin';

  return (
    <aside className="crm-sidebar">
      <div className="sidebar-header">
        <div className="brand-name">VERTEX <span>CRM</span></div>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
          onClick={() => onChangeView('pipeline')}
        >
          <Kanban size={18} /> Pipeline
        </button>
        <button 
          className={`nav-item ${activeView === 'deals' ? 'active' : ''}`}
          onClick={() => onChangeView('deals')}
        >
          <Briefcase size={18} /> Negócios
        </button>
        <button 
          className={`nav-item ${activeView === 'service' ? 'active' : ''}`}
          onClick={() => onChangeView('service')}
        >
          <Inbox size={18} /> Atendimento
        </button>
        <button 
          className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => onChangeView('calendar')}
        >
          <Calendar size={18} /> Calendário
        </button>
        <button 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onChangeView('dashboard')}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <div className="nav-divider" />

        {isAdmin && (
          <>
            <button 
              className={`nav-item ${activeView === 'team' ? 'active' : ''}`}
              onClick={() => onChangeView('team')}
            >
              <Users size={18} /> Equipe
            </button>
            <button 
              className={`nav-item ${activeView === 'automations' ? 'active' : ''}`}
              onClick={() => onChangeView('automations')}
            >
              <Zap size={18} /> Automações
            </button>
          </>
        )}

        <button 
          className={`nav-item ${activeView === 'products' ? 'active' : ''}`}
          onClick={() => onChangeView('products')}
        >
          <Package size={18} /> Produtos
        </button>
        <button 
          className={`nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onChangeView('settings')}
        >
          <Settings size={18} /> Configurações
        </button>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout" onClick={() => supabase.auth.signOut()}>
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
}
