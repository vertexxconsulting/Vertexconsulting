import { useState, useEffect } from 'react';
import { fetchContacts } from '../../services/contactService';
import type { ContactData, DashboardMetrics } from '../../types';

function getStatusClass(status: string): string {
  switch (status) {
    case 'Novo': return 'status--novo';
    case 'Em contato': return 'status--em-contato';
    case 'Apresentação':
    case 'Negociação': return 'status--proposta';
    case 'Fechado Ganho': return 'status--fechado-ganho';
    case 'Fechado Perdido': return 'status--fechado-perdido';
    default: return 'status--novo';
  }
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    newToday: 0,
    boltenSynced: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchContacts();
      setContacts(data);

      const today = new Date().toISOString().split('T')[0];
      const totalLeads = data.length;
      const newToday = data.filter((c) => c.created_at?.split('T')[0] === today).length;
      const boltenSynced = data.filter((c) => c.bolten_sync_status === 'synced').length;
      const closed = data.filter((c) => c.status === 'Fechado Ganho').length;
      const conversionRate = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0;

      setMetrics({ totalLeads, newToday, boltenSynced, conversionRate });
    } catch {
      setError('Não foi possível carregar os leads. Verifique sua sessão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="empty-state" aria-live="polite"><p>Carregando leads…</p></div>;
  }

  return (
    <div>
      {error && (
        <div className="crm-inline-error" role="alert">
          <span>{error}</span>
          <button className="btn btn--secondary" onClick={loadData}>Tentar novamente</button>
        </div>
      )}
      <div className="dash-metrics">
        <div className="metric-card">
          <div className="metric-card__label">Total de Leads</div>
          <div className="metric-card__value">{metrics.totalLeads}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Novos Hoje</div>
          <div className="metric-card__value">{metrics.newToday}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Sincronizados no Bolten</div>
          <div className="metric-card__value">{metrics.boltenSynced}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card__label">Taxa de Conversão</div>
          <div className="metric-card__value">{metrics.conversionRate}%</div>
        </div>
      </div>

      <div className="dash-recent">
        <div className="dash-recent__header">
          <h3>Últimos Leads</h3>
          <button className="btn btn--secondary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={loadData}>
            Atualizar
          </button>
        </div>
        {contacts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum lead registrado ainda.</p>
          </div>
        ) : (
          <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Bolten</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {contacts.slice(0, 10).map((c) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.service || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.bolten_sync_status === 'synced' ? 'Sincronizado' : 'Pendente'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {formatDate(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
