import { useState, useEffect, useRef } from 'react';
import {
  getEvolutionConfig,
  createInstance,
  connectInstance,
  getConnectionState,
} from '../../services/evolutionApi';
import type { ConnectionState } from '../../types';

export default function WhatsAppPanel() {
  const [config, setConfig] = useState(getEvolutionConfig());
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isConfigured = config.apiUrl && config.apiKey && config.instanceName;

  useEffect(() => {
    if (isConfigured) {
      checkConnection();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    try {
      const state = await getConnectionState(config.instanceName);
      setConnectionState(state);
      setError('');
      if (state.state === 'open') {
        setQrBase64(null);
        setStatusMsg('WhatsApp conectado com sucesso.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao verificar conexão';
      setConnectionState(null);
      setError(msg);
    }
  };

  const handleCreateInstance = async () => {
    if (!isConfigured) {
      setError('Configure a URL, API Key e nome da instância nas Configurações.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createInstance(config.instanceName);
      setStatusMsg('Instância criada. Clique em "Conectar" para gerar o QR Code.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar instância';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isConfigured) {
      setError('Configure a URL, API Key e nome da instância nas Configurações.');
      return;
    }
    setLoading(true);
    setError('');
    setQrBase64(null);
    try {
      const response = await connectInstance(config.instanceName);
      if (response.base64) {
        setQrBase64(response.base64);
        setStatusMsg('Escaneie o QR Code com o WhatsApp do número que deseja conectar.');
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
          setStatusMsg('WhatsApp conectado com sucesso!');
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // keep polling
      }
    }, 5000);
  };

  const handleRefreshConfig = () => {
    const newConfig = getEvolutionConfig();
    setConfig(newConfig);
  };

  const stateLabel = connectionState?.state || 'desconhecido';

  return (
    <div className="whatsapp-panel">
      <div className="whatsapp-panel__section">
        <h3>Conexão WhatsApp — Evolution API</h3>

        {!isConfigured ? (
          <div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 12 }}>
              Configure a Evolution API na aba Configurações antes de conectar.
            </p>
            <button className="btn btn--secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={handleRefreshConfig}>
              Verificar Configuração
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 4 }}>
                Instância: <span style={{ color: 'var(--text-bright)' }}>{config.instanceName}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                API: <span style={{ color: 'var(--text-bright)' }}>{config.apiUrl}</span>
              </div>
            </div>

            <div className="whatsapp-panel__actions">
              <button
                className="btn btn--secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={handleCreateInstance}
                disabled={loading}
              >
                Criar Instância
              </button>
              <button
                className="btn btn--primary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? 'Conectando...' : 'Conectar (QR Code)'}
              </button>
              <button
                className="btn btn--secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                onClick={checkConnection}
              >
                Verificar Status
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {(connectionState || statusMsg || error) && (
        <div className="whatsapp-panel__section">
          <h3>Status da Conexão</h3>
          {connectionState && (
            <div style={{ marginBottom: 12 }}>
              <span className={`whatsapp-panel__status whatsapp-panel__status--${stateLabel}`}>
                {stateLabel === 'open' ? 'Conectado' : stateLabel === 'close' ? 'Desconectado' : 'Conectando...'}
              </span>
            </div>
          )}
          {statusMsg && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{statusMsg}</p>
          )}
          {error && (
            <p style={{ fontSize: '0.88rem', color: 'var(--error)' }}>{error}</p>
          )}
        </div>
      )}

      {/* QR Code */}
      {qrBase64 && (
        <div className="whatsapp-panel__section">
          <h3>QR Code</h3>
          <div className="whatsapp-panel__qr">
            <img src={qrBase64} alt="QR Code WhatsApp" />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Abra o WhatsApp no celular e escaneie este QR Code para conectar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
