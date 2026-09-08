import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function TeamView() {
  const [members, setMembers] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('atendente');

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    const { data } = await supabase.from('team_members').select('*').order('name');
    if (data) setMembers(data);
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    await supabase.from('team_members').insert({
      name: newName,
      email: newEmail,
      role: newRole,
      active: true
    });
    setNewName('');
    setNewEmail('');
    loadMembers();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('team_members').update({ active: !current }).eq('id', id);
    loadMembers();
  };

  const changeRole = async (id: string, role: string) => {
    await supabase.from('team_members').update({ role }).eq('id', id);
    loadMembers();
  };

  return (
    <>
      <div className="view-header">
        <h1>Equipe</h1>
      </div>
      <div className="view-body" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: 2, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Membros</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: m.active ? 'var(--cream)' : 'var(--muted)' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{m.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <select 
                    value={m.role} 
                    onChange={e => changeRole(m.id, e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--ink)' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="atendente">Atendente</option>
                  </select>
                  <button 
                    className={m.active ? "btn btn-ghost" : "btn btn-primary"} 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => toggleActive(m.id, m.active)}
                  >
                    {m.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
            {members.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Nenhum membro cadastrado.</p>}
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Adicionar membro</h2>
          <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="field">
              <label>Nome</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Papel (Role)</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="vendedor">Vendedor</option>
                <option value="atendente">Atendente</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: '8px' }}>Adicionar</button>
          </form>
        </div>

      </div>
    </>
  );
}
