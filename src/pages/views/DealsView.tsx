import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export function DealsView() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    loadDeals();
  }, []);

  async function loadDeals() {
    // Fetching deals and assuming there's a relation to leads
    const { data } = await supabase.from('deals')
      .select('*, leads(name), deal_items(description, quantity, unit_price)')
      .order('created_at', { ascending: false });
    
    if (data) setDeals(data);
  }

  return (
    <>
      <div className="view-header">
        <h1>Negócios</h1>
      </div>
      <div className="view-body">
        {deals.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nenhum negócio encontrado.</p>
        ) : (
          <div className="deals-grid" style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {deals.map(deal => (
              <div key={deal.id} className="kpi-card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--gold-bright)' }}>
                  {deal.leads?.name || 'Lead desconhecido'}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
                  Status: {deal.status || 'Aberto'}
                </div>
                
                <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>ITENS</div>
                  {deal.deal_items && deal.deal_items.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span>{item.quantity}x {item.description}</span>
                      <span>R$ {Number(item.unit_price).toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                  {(!deal.deal_items || deal.deal_items.length === 0) && (
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Sem itens listados.</div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Total</span>
                  <span style={{ fontFamily: 'Fraunces', fontSize: '20px', color: 'var(--cream)' }}>
                    R$ {Number(deal.total_value || deal.amount || 0).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
