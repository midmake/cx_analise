(() => {
  const data = window.DASHBOARD_DATA || {};
  const contact = (data.contacts || []).find(c => String(c.Clube || '').toUpperCase() === 'RAIA CENTER');
  if (!contact) return;
  contact['Itens a confirmar'] = 'Equipe de natação; vôlei';
  contact['O que falta'] = 'Natação e hidro da Zona Norte confirmadas via WhatsApp em 09/09/2026. Falta confirmar equipe competitiva de natação e aulas/equipe de vôlei; validar se a mesma tabela vale nas demais unidades.';
  contact['Mensagem pronta para contato'] = 'Olá! Obrigado pelos valores de natação/hidro. Para completar meu levantamento, vocês possuem equipe competitiva de natação ou aulas/equipe de vôlei? Se sim, quais os valores e taxas? Essa mesma tabela de natação/hidro vale também para as demais unidades?';
  contact['Andamento'] = 'Parcial — aquáticos confirmados (Zona Norte)';
})();
