import { useState, useEffect, type FormEvent } from 'react';
import { getEvolutionConfig, saveEvolutionConfig } from '../../services/evolutionApi';
import type { EvolutionConfig } from '../../types';

export default function Settings() {
  const [config, setConfig] = useState<EvolutionConfig>(getEvolutionConfig());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getEvolutionConfig());
  }, []);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    saveEvolutionConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateField = (field: keyof EvolutionConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className="settings-form" onSubmit={handleSave}>
      <div className="settings-form__section">
        <h3>Evolution API</h3>
        <div className="settings-form__field">
          <label>URL da API</label>
          <input
            type="url"
            value={config.apiUrl}
            onChange={(e) => updateField('apiUrl', e.target.value)}
            placeholder="https://sua-evolution-api.com"
          />
          <div className="settings-form__hint">
            Endereço onde a Evolution API está rodando (ex: http://localhost:8080)
          </div>
        </div>
        <div className="settings-form__field">
          <label>API Key</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => updateField('apiKey', e.target.value)}
            placeholder="Sua chave de autenticação"
          />
          <div className="settings-form__hint">
            Valor da AUTHENTICATION_API_KEY no .env da Evolution API
          </div>
        </div>
        <div className="settings-form__field">
          <label>Nome da Instância</label>
          <input
            type="text"
            value={config.instanceName}
            onChange={(e) => updateField('instanceName', e.target.value)}
            placeholder="vertex-consulting"
          />
          <div className="settings-form__hint">
            Identificador único da instância WhatsApp
          </div>
        </div>
      </div>

      <div className="settings-form__section">
        <h3>Mensagem WhatsApp</h3>
        <div className="settings-form__field">
          <label>Template da Mensagem</label>
          <textarea
            value={config.messageTemplate}
            onChange={(e) => updateField('messageTemplate', e.target.value)}
            placeholder="Olá {nome}! Recebemos sua solicitação..."
            rows={4}
          />
          <div className="settings-form__hint">
            Use {'{nome}'} para inserir o nome do lead automaticamente. Esta mensagem será enviada via WhatsApp quando o formulário for preenchido.
          </div>
        </div>
      </div>

      {saved && (
        <div className="form-msg form-msg--success" style={{ marginBottom: 16 }}>
          Configurações salvas com sucesso!
        </div>
      )}

      <button type="submit" className="btn btn--primary" style={{ padding: '12px 28px' }}>
        Salvar Configurações
      </button>
    </form>
  );
}
