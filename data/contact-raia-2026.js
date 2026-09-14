(() => {
  const data = window.DASHBOARD_DATA || {};
  const contacts = data.contacts || [];
  const patch = (name, items, missing, progress) => {
    const c = contacts.find(x => String(x.Clube || '').toUpperCase() === name.toUpperCase());
    if (!c) return;
    c['Itens a confirmar'] = items;
    c['O que falta'] = missing;
    c['Andamento'] = progress;
  };

  patch('SOGIPA', 'Equipe de natação', 'Valores 2026 de natação, hidroginástica e vôlei já incorporados. Falta apenas eventual cobrança específica da equipe competitiva de natação, se houver.', 'Parcial — valores 2026 incorporados');
  patch('GAUCHO (CPG)', 'Equipes competitivas', 'Natação, hidroginástica e vôlei 2026 já incorporados. Falta somente confirmar se existem equipes competitivas com cobrança própria.', 'Parcial — valores 2026 incorporados');
  patch('RAIA CENTER', 'Equipe de natação; vôlei', 'Natação e hidro da Zona Norte confirmadas. Falta confirmar equipe competitiva de natação e aulas/equipe de vôlei; não generalizar a tabela para outras unidades sem confirmação.', 'Parcial — aquáticos confirmados (Zona Norte)');
  patch('STILO', 'Equipe de natação; vôlei', 'Natação e hidro 2026 já incorporados. Falta confirmar eventual equipe competitiva de natação e oferta/valores de vôlei.', 'Parcial — aquáticos 2026 incorporados');
  patch('GERALDO SANTANA', 'Vôlei', 'Natação e hidro 2026 já incorporados. Falta somente completar os valores de vôlei, caso exista cobrança própria.', 'Parcial — aquáticos 2026 incorporados');
  patch('ACM', 'Não sócio; vôlei; equipe de natação', 'Valores disponíveis de natação/hidro foram mantidos. Falta confirmar condição de não sócio e valores de vôlei/equipe, quando aplicável.', 'Parcial');
  patch('GNG', 'Equipes', 'Tabela atual de natação 2026 incorporada. Permanecem apenas confirmações específicas de equipes, quando houver cobrança separada.', 'Parcial — natação 2026 incorporada');
  patch('RECREIO DA JUVENTUDE', 'Equipe competitiva de vôlei', 'Valores 2026 de natação, hidro e vôlei foram incorporados como Público geral quando a fonte não separa sócio/não sócio. Falta apenas eventual equipe competitiva de vôlei com cobrança própria.', 'Parcial — valores 2026 incorporados');
})();