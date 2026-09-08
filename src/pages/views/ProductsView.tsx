import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function ProductsView() {
  const [products, setProducts] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    await supabase.from('products').insert({
      name: newName,
      price: Number(newPrice),
      active: true
    });
    setNewName('');
    setNewPrice('');
    loadProducts();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ active: !current }).eq('id', id);
    loadProducts();
  };

  return (
    <>
      <div className="view-header">
        <h1>Produtos e Serviços</h1>
      </div>
      <div className="view-body" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: 2, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Catálogo</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {products.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--card-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: p.active ? 'var(--cream)' : 'var(--muted)', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--gold-bright)' }}>R$ {Number(p.price).toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <button 
                    className={p.active ? "btn btn-ghost" : "btn btn-primary"} 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => toggleActive(p.id, p.active)}
                  >
                    {p.active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Nenhum produto cadastrado.</p>}
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Adicionar ao catálogo</h2>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="field">
              <label>Nome do produto/serviço</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="field">
              <label>Preço (R$)</label>
              <input type="number" min="0" step="10" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: '8px' }}>Adicionar</button>
          </form>
        </div>

      </div>
    </>
  );
}
