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

type Step = 'config' | 'instance' | 'qr' | 'connected';

const statusConfig = {
  open: { label: 'Online', cor: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  close: { label: 'Offline', cor: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  connecting: { label: 'Conectando', cor: '#eab308', bg: 'rgba(234,179,8,0.15)' },
};

export default function WhatsAppPanel() {
  const config = getEvolutionConfig();
  const isConfigured = !!config.apiUrl && !!config.apiKey && !!config.instanceName;

  const [step, setStep] = useState<Step>('config');
  const [instanceCreated, setInstanceCreated] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-check connection on mount if configured
  useEffect(() => {
    if (!isConfigured) {
      setStep('config');
      return;
    }
    checkConnection();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    if (!isConfigured) return;
    try {
      const state = await getConnectionState(config.instanceName);
      setConnectionState(state);
      setError('');
      if (state.state === 'open') {
        setStep('connected');
        setInstanceCreated(true);
        setQrBase64(null);
        setStatusMsg('WhatsApp conectado com sucesso.');
      } else if (state.state === 'close') {
        // Instance exists but disconnected
        setStep('qr');
        setInstanceCreated(true);
        setStatusMsg('Instância existe mas desconectada. Clique em "Conectar" para gerar o QR Code.');
      } else {
        setStep('instance');
        setInstanceCreated(true);
        setStatusMsg('Instância criada. Clique em "Conectar".');
      }
    } catch {
      setConnectionState(null);
      setInstanceCreated(false);
      setStep('instance');
      setStatusMsg('');
    }
  };

  const handleCreateInstance = async () => {
    if (!isConfigured) return;
    setLoading(true);
    setError('');
    try {
      await createInstance(config.instanceName);
      setInstanceCreated(true);
      setStep('qr');
      setStatusMsg('✅ Instância criada com sucesso! Clique em "Conectar" para gerar o QR Code.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar instância';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isConfigured) return;
    setLoading(true);
    setError('');
    setQrBase64(null);
    try {
      setStatusMsg('Gerando QR Code...');
      const response = await connectInstance(config.instanceName);
      if (response.base64) {
        setQrBase64(response.base64);
        setStep('qr');
        setStatusMsg('📱 Escaneie o QR Code com o WhatsApp do número que deseja conectar.');
        startPolling();
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

  const startPolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      try {
        const state = await getConnectionState(config.instanceName);
        setConnectionState(state);
        if (state.state === 'open') {
          setQrBase64(null);
          setStep('connected');
          setStatusMsg('✅ WhatsApp conectado com sucesso!');
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // keep polling
      }
    }, 5000);
  };

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp?')) return;
    setLoading(true);
    setError('');
    try {
      await disconnectInstance(config.instanceName);
      setConnectionState(null);
      setQrBase64(null);
      setStep('qr');
      setStatusMsg('⚠️ WhatsApp desconectado. Clique em "Conectar" para gerar novo QR Code.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao desconectar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza? Isso apaga a instância permanentemente.')) return;
    setLoading(true);
    setError('');
    try {
      await deleteInstance(config.instanceName);
      setConnectionState(null);
      setInstanceCreated(false);
      setQrBase64(null);
      setStep('instance');
      setStatusMsg('🗑️ Instância excluída. Crie uma nova quando quiser.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const status = connectionState?.state
    ? statusConfig[connectionState.state as keyof typeof statusConfig]
    : null;

  // ── Render ──

  if (!isConfigured) {
    return (
      <div className="whatsapp-panel">
        <div className="whatsapp-panel__section">
          <h3>Conexão WhatsApp — Evolution API</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Evolution API não configurada. Defina as variáveis no Vercel e faça deploy novamente.
          </p>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 12, lineHeight: 2 }}>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_API_URL</code> — URL da Evolution API</li>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_API_KEY</code> — Chave de autenticação</li>
            <li><code style={{ color: 'var(--gold)' }}>VITE_EVOLUTION_INSTANCE</code> — Nome da instância</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="whatsapp-panel">
      {/* INFO */}
      <div className="whatsapp-panel__section">
        <h3>Conexão WhatsApp</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: 16 }}>
          <span>Instância: <strong style={{ color: 'var(--text-bright)' }}>{config.instanceName}</strong></span>
          <span>API: <strong style={{ color: 'var(--text-bright)' }}>{config.apiUrl}</strong></span>
        </div>

        {/* STATUS INDICATOR */}
        {status && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 8, background: status.bg, marginBottom: 16,
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%', background: status.cor,
              boxShadow: `0 0 8px ${status.cor}80`, flexShrink: 0,
            }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: status.cor }}>
              {status.label}
            </span>
          </div>
        )}

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
          {!instanceCreated && (
            <button className="btn btn--primary" onClick={handleCreateInstance} disabled={loading}>
              {loading ? 'Criando...' : '➕ Criar Instância'}
            </button>
          )}

          {instanceCreated && step !== 'connected' && (
            <button className="btn btn--primary" onClick={handleConnect} disabled={loading}>
              {loading ? 'Conectando...' : '📱 Conectar (QR Code)'}
            </button>
          )}

          {step === 'connected' && (
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

          <button className="btn btn--secondary" onClick={checkConnection} disabled={loading}
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
            🔄 Verificar Status
          </button>
        </div>
      </div>
    </div>
  );
}
