import { useState, useEffect, useRef } from 'react';
import {
  getEvolutionConfig,
  createInstance,
  connectInstance,
  disconnectInstance,
  deleteInstance,
  getConnectionState,
} from '../../services/evolutionApi';
import type { ConnectionState } from '../../types';

const DEFAULT_TEMPLATE = 'Olá {nome}! Recebemos sua solicitação na Vertex Consulting. Nossa equipe entrará em contato em breve. Obrigado!';

const statusConfig: Record<string, { label: string; cor: string; bg: string }> = {
  open: { label: 'Online', cor: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  close: { label: 'Offline', cor: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  connecting: { label: 'Conectando', cor: '#eab308', bg: 'rgba(234,179,8,0.15)' },
};

export default function WhatsAppPanel() {
  const config = getEvolutionConfig();
  const isConfigured = !!config.apiUrl && !!config.apiKey && !!config.instanceName;

  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [instanceExists, setInstanceExists] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(() => {
    return localStorage.getItem('vertex_msg_template') || DEFAULT_TEMPLATE;
  });
  const [templateSaved, setTemplateSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const status = connectionState?.state
    ? (statusConfig[connectionState.state] ?? { label: 'Desconhecido', cor: '#888', bg: 'rgba(136,136,136,0.15)' })
    : null;

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchState = async () => {
    try {
      const state = await getConnectionState(config.instanceName);
      setConnectionState(state);
      setError('');

      if (state.state === 'open') {
        setInstanceExists(true);
        setQrBase64(null);
        setStatusMsg('✅ WhatsApp conectado com sucesso!');
        clearPolling();
      } else if (state.state === 'close') {
        setInstanceExists(true);
        setQrBase64(null);
        setStatusMsg('⚠️ WhatsApp desconectado. Conecte novamente.');
        clearPolling();
      } else {
        // connecting — instância existe mas ainda não pareou
        setInstanceExists(true);
        setStatusMsg('');
      }
      return state;
    } catch {
      setConnectionState(null);
      setInstanceExists(false);
      setQrBase64(null);
      setStatusMsg('');
      setError('');
      return null;
    }
  };

  // On mount: check connection immediately, then poll every 7s
  useEffect(() => {
    if (!isConfigured) return;
    fetchState();
    intervalRef.current = setInterval(fetchState, 7000);
    return () => clearPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateInstance = async () => {
    setLoading(true);
    setError('');
    try {
      await createInstance(config.instanceName);
      setInstanceExists(true);
      setStatusMsg('✅ Instância criada! Conecte o QR Code.');
      // Start polling to detect state changes
      clearPolling();
      intervalRef.current = setInterval(fetchState, 7000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar instância';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    setQrBase64(null);
    try {
      setStatusMsg('Gerando QR Code...');
      const response = await connectInstance(config.instanceName);
      if (response.base64) {
        setQrBase64(response.base64);
        setInstanceExists(true);
        setStatusMsg('📱 Escaneie o QR Code com o WhatsApp do número que deseja conectar.');
        // Poll while waiting for scan
        clearPolling();
        intervalRef.current = setInterval(fetchState, 5000);
      } else {
        setStatusMsg('Aguardando QR Code...');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao conectar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Desconectar o WhatsApp?')) return;
    setLoading(true);
    setError('');
    try {
      await disconnectInstance(config.instanceName);
      setConnectionState(null);
      setQrBase64(null);
      setStatusMsg('⚠️ WhatsApp desconectado.');
      clearPolling();
      intervalRef.current = setInterval(fetchState, 7000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao desconectar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir a instância permanentemente?')) return;
    setLoading(true);
    setError('');
    try {
      await deleteInstance(config.instanceName);
      setConnectionState(null);
      setInstanceExists(false);
      setQrBase64(null);
      setStatusMsg('🗑️ Instância excluída.');
      clearPolling();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isOnline = connectionState?.state === 'open';
  const needsConnect = instanceExists && !isOnline;

  // ── RENDER ──

  if (!isConfigured) {
    return (
      <div className="whatsapp-panel">
        <div className="whatsapp-panel__section">
          <h3>Conexão WhatsApp</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Evolution API não configurada. Defina as variáveis no Vercel e faça deploy novamente.
          </p>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12, lineHeight: 2 }}>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_API_URL</code></li>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_API_KEY</code></li>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_INSTANCE</code></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-panel">
      <div className="whatsapp-panel__section">
        {/* TITLE WITH INLINE STATUS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Conexão WhatsApp</h3>
          {status && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
              background: status.bg, color: status.cor,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: status.cor, flexShrink: 0,
              }} />
              {status.label}
            </span>
          )}
        </div>

        {/* STATUS MESSAGE */}
        {statusMsg && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 12 }}>{statusMsg}</p>
        )}
        {error && (
          <p style={{ fontSize: '0.88rem', color: '#ef4444', marginBottom: 12 }}>{error}</p>
        )}

        {/* QR CODE */}
        {qrBase64 && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-block', padding: 12, background: '#fff', borderRadius: 12, marginBottom: 8,
            }}>
              <img src={qrBase64} alt="QR Code WhatsApp" style={{ width: 220, height: 220 }} />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Abra o WhatsApp no celular, vá em "Aparelhos conectados" e escaneie
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!instanceExists && (
            <button className="btn btn--primary" onClick={handleCreateInstance} disabled={loading}>
              {loading ? 'Criando...' : '➕ Criar Instância'}
            </button>
          )}

          {needsConnect && (
            <button className="btn btn--primary" onClick={handleConnect} disabled={loading}>
              {loading ? 'Conectando...' : '📱 Conectar (QR Code)'}
            </button>
          )}

          {isOnline && (
            <>
              <button className="btn btn--secondary" onClick={handleDisconnect} disabled={loading}
                style={{ borderColor: '#eab308', color: '#eab308' }}>
                {loading ? '...' : '⏹ Desconectar'}
              </button>
              <button className="btn btn--secondary" onClick={handleDelete} disabled={loading}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                {loading ? '...' : '🗑️ Excluir Instância'}
              </button>
            </>
          )}

          <button className="btn btn--secondary" onClick={fetchState} disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            🔄 Verificar Status
          </button>
        </div>
      </div>

      {/* MENSAGEM WHATSAPP */}
      <div className="whatsapp-panel__section" style={{ marginTop: 24 }}>
        <h3>Mensagem automática para leads</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 8 }}>
          Use {'{nome}'} para inserir o nome do lead.
        </p>
        <textarea
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          rows={4}
          style={{
            width: '100%', padding: 12, borderRadius: 8, fontSize: '0.85rem',
            background: '#111', color: '#d8d8d8', border: '1px solid rgba(201,168,76,0.2)',
            resize: 'vertical', fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <button
            className="btn btn--primary"
            style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            onClick={() => {
              localStorage.setItem('vertex_msg_template', messageTemplate);
              setTemplateSaved(true);
              setTimeout(() => setTemplateSaved(false), 2000);
            }}
          >
            Salvar Mensagem
          </button>
          {templateSaved && (
            <span style={{ fontSize: '0.82rem', color: '#22c55e' }}>✅ Salva</span>
          )}
        </div>
      </div>
    </div>
  );
}
