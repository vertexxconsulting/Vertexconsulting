import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Sidebar, ViewType } from '../components/Sidebar';
import { LeadDrawerProvider } from '../context/LeadDrawerContext';
import { LeadDrawer } from '../components/LeadDrawer';
import './CRMApp.css';

// Views
import { PipelineView } from './views/PipelineView';
import { DealsView } from './views/DealsView';
import { ServiceView } from './views/ServiceView';
import { CalendarView } from './views/CalendarView';
import { DashboardView } from './views/DashboardView';
import { TeamView } from './views/TeamView';
import { AutomationsView } from './views/AutomationsView';
import { ProductsView } from './views/ProductsView';
import { SettingsView } from './views/SettingsView';

export default function CRMApp() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('pipeline');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId: string) {
    const { data } = await supabase.from('team_members').select('role').eq('id', userId).single();
    if (data) {
      setUserRole(data.role);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
    if (error) setLoginError('E-mail ou senha inválidos.');
  };

  if (!session) {
    return (
      <div className="crm-page">
        <div id="login-screen" className="login-page">
          <div className="login-card">
            <div className="login-logo">
              <img src="/logo.jpeg" alt="Vertex Consulting" />
              <span>VERTEX</span>
            </div>
            <p className="login-subtitle">Acesso restrito — CRM interno</p>

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label>E-mail</label>
                <input 
                  type="email" 
                  required 
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com" 
                />
              </div>
              <div className="login-field">
                <label>Senha</label>
                <input 
                  type="password" 
                  required 
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  placeholder="••••••••" 
                />
              </div>
              
              {loginError && <p className="login-error">{loginError}</p>}
              
              <button className="login-btn" type="submit">Entrar</button>
            </form>
            
            <a href="/" className="login-back">← Voltar ao site</a>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'pipeline': return <PipelineView />;
      case 'deals': return <DealsView />;
      case 'service': return <ServiceView />;
      case 'calendar': return <CalendarView />;
      case 'dashboard': return <DashboardView />;
      case 'team': return userRole === 'admin' ? <TeamView /> : <PipelineView />;
      case 'automations': return userRole === 'admin' ? <AutomationsView /> : <PipelineView />;
      case 'products': return <ProductsView />;
      case 'settings': return <SettingsView />;
      default: return <PipelineView />;
    }
  };

  return (
    <LeadDrawerProvider>
      <div className="crm-layout">
        <Sidebar activeView={activeView} onChangeView={setActiveView} userRole={userRole} />
        <main className="crm-main-content">
          {renderActiveView()}
        </main>
        <LeadDrawer />
      </div>
    </LeadDrawerProvider>
  );
}
