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

export default function WhatsAppPanel() {
  const config = getEvolutionConfig();

  // apiUrl e instanceName têm defaults — apenas apiKey é obrigatório em runtime
  const hasDefaults = !!config.apiUrl && !!config.instanceName;
  const hasApiKey   = !!config.apiKey;

  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [instanceExists, setInstanceExists] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(() => {
    return localStorage.getItem('vertex_msg_template') || DEFAULT_TEMPLATE;
  });
  const [templateSaved, setTemplateSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const state = connectionState?.instance?.state ?? null;
  const isOnline     = state === 'open';
  const isConnecting = state === 'connecting';
  const needsConnect = instanceExists && !isOnline;

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchState = async () => {
    try {
      const s = await getConnectionState(config.instanceName);
      setConnectionState(s);
      setError('');
      setInstanceExists(true);

      const stateVal = s.instance?.state;

      if (stateVal === 'open') {
        setStatusMsg('WhatsApp conectado com sucesso.');
        setQrBase64(null);
        clearPolling();
      } else if (stateVal === 'close') {
        setStatusMsg('WhatsApp desconectado. Conecte novamente.');
        setQrBase64(null);
        clearPolling();
      } else {
        // connecting — ainda aguardando scan
        setStatusMsg('');
      }
      return s;
    } catch {
      setConnectionState(null);
      setInstanceExists(false);
      setQrBase64(null);
      setStatusMsg('');
      setError('');
      return null;
    } finally {
      setInitialChecking(false);
    }
  };

  // On mount: verifica estado imediatamente, depois polling a cada 7s
  useEffect(() => {
    if (!hasDefaults) {
      setInitialChecking(false);
      return;
    }
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
      setStatusMsg('Instância criada. Conecte via QR Code.');
      clearPolling();
      intervalRef.current = setInterval(fetchState, 7000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar instância');
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
        setStatusMsg('Escaneie o QR Code com o WhatsApp do número que deseja conectar.');
        clearPolling();
        intervalRef.current = setInterval(fetchState, 5000);
      } else {
        setStatusMsg('Aguardando QR Code...');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar');
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
      setStatusMsg('WhatsApp desconectado.');
      clearPolling();
      intervalRef.current = setInterval(fetchState, 7000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar');
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
      setStatusMsg('Instância excluída.');
      clearPolling();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER: Evolution não configurada ──
  if (!hasDefaults) {
    return (
      <div className="whatsapp-panel">
        <div className="whatsapp-panel__section">
          <h3>Conexão WhatsApp</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 12 }}>
            Evolution API não configurada. Defina as variáveis de ambiente no Vercel e faça deploy novamente.
          </p>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 2, listStyle: 'none' }}>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_API_URL</code></li>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_API_KEY</code></li>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_INSTANCE</code></li>
          </ul>
        </div>
      </div>
    );
  }

  // ── RENDER: principal ──
  return (
    <div className="whatsapp-panel">
      <div className="whatsapp-panel__section">

        {/* Cabeçalho + badge de status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Conexão WhatsApp</h3>

          {initialChecking ? (
            <span className="whatsapp-status-badge whatsapp-status-badge--checking">
              <span className="whatsapp-status-dot" />
              Verificando...
            </span>
          ) : state === 'open' ? (
            <span className="whatsapp-status-badge whatsapp-status-badge--open">
              <span className="whatsapp-status-dot whatsapp-status-dot--pulse" />
              Online
            </span>
          ) : state === 'connecting' ? (
            <span className="whatsapp-status-badge whatsapp-status-badge--connecting">
              <span className="whatsapp-status-dot" />
              Conectando
            </span>
          ) : state === 'close' ? (
            <span className="whatsapp-status-badge whatsapp-status-badge--close">
              <span className="whatsapp-status-dot" />
              Offline
            </span>
          ) : !instanceExists && !initialChecking ? (
            <span className="whatsapp-status-badge whatsapp-status-badge--none">
              <span className="whatsapp-status-dot" />
              Sem instância
            </span>
          ) : null}
        </div>

        {/* Aviso de apiKey ausente */}
        {!hasApiKey && (
          <p style={{ fontSize: '0.85rem', color: 'var(--warning)', marginBottom: 12,
            background: 'rgba(255,183,77,0.08)', border: '1px solid rgba(255,183,77,0.2)',
            borderRadius: 4, padding: '8px 12px' }}>
            Variável <code>VITE_EVOLUTION_API_KEY</code> não definida. As chamadas à API irão falhar.
          </p>
        )}

        {/* Mensagem de status */}
        {statusMsg && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            {statusMsg}
          </p>
        )}
        {error && (
          <p style={{ fontSize: '0.88rem', color: 'var(--error)', marginBottom: 12,
            background: 'var(--error-bg)', border: '1px solid rgba(244,67,54,0.2)',
            borderRadius: 4, padding: '8px 12px' }}>
            {error}
          </p>
        )}

        {/* QR Code */}
        {qrBase64 && (
          <div className="whatsapp-panel__qr" style={{ marginBottom: 16 }}>
            <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8 }}>
              <img src={qrBase64} alt="QR Code WhatsApp" style={{ width: 220, height: 220 }} />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Abra o WhatsApp no celular, vá em "Aparelhos conectados" e escaneie
            </p>
          </div>
        )}

        {/* Ações */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!instanceExists && !initialChecking && (
            <button className="btn btn--primary" onClick={handleCreateInstance} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Instância'}
            </button>
          )}

          {needsConnect && !isConnecting && (
            <button className="btn btn--primary" onClick={handleConnect} disabled={loading}>
              {loading ? 'Conectando...' : 'Conectar via QR Code'}
            </button>
          )}

          {isOnline && (
            <>
              <button
                className="btn btn--secondary"
                onClick={handleDisconnect}
                disabled={loading}
                style={{ borderColor: 'rgba(234,179,8,0.4)', color: '#eab308' }}
              >
                {loading ? '...' : 'Desconectar'}
              </button>
              <button
                className="btn btn--secondary"
                onClick={handleDelete}
                disabled={loading}
                style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
              >
                {loading ? '...' : 'Excluir Instância'}
              </button>
            </>
          )}

          <button
            className="btn btn--secondary"
            onClick={fetchState}
            disabled={loading}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Verificar Status
          </button>
        </div>
      </div>

      {/* Mensagem automática para leads */}
      <div className="whatsapp-panel__section">
        <h3>Mensagem automática para leads</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 12 }}>
          Use <code style={{ color: 'var(--gold)' }}>{'{nome}'}</code> para inserir o nome do lead.
        </p>
        <textarea
          value={messageTemplate}
          onChange={(e) => setMessageTemplate(e.target.value)}
          rows={4}
          style={{
            width: '100%', padding: 12, borderRadius: 4, fontSize: '0.85rem',
            background: 'rgba(0,0,0,0.3)', color: 'var(--text-body)',
            border: '1px solid var(--line)', resize: 'vertical', fontFamily: 'inherit',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--gold)'}
          onBlur={e => e.target.style.borderColor = 'var(--line)'}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <button
            className="btn btn--primary"
            style={{ padding: '8px 20px', fontSize: '0.82rem' }}
            onClick={() => {
              localStorage.setItem('vertex_msg_template', messageTemplate);
              setTemplateSaved(true);
              setTimeout(() => setTemplateSaved(false), 2000);
            }}
          >
            Salvar Mensagem
          </button>
          {templateSaved && (
            <span style={{ fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}>
              Salvo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
