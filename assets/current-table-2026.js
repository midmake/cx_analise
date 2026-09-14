(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const money = v => Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const current = records
    .filter(r => Number(r.year) === 2026 && r.club !== 'Caixeiros Viajantes' && typeof r.value === 'number' && Number.isFinite(r.value))
    .sort((a,b) =>
      String(a.club).localeCompare(String(b.club),'pt-BR') ||
      String(a.modality).localeCompare(String(b.modality),'pt-BR') ||
      String(a.audience).localeCompare(String(b.audience),'pt-BR') ||
      String(a.category).localeCompare(String(b.category),'pt-BR') ||
      String(a.frequency).localeCompare(String(b.frequency),'pt-BR')
    );

  const card = document.querySelector('.competitors-current-card');
  const table = document.getElementById('currentCompetitorsTable');
  if (card && table) {
    const h2 = card.querySelector('h2');
    const hint = card.querySelector('.hint');
    if (h2) h2.textContent = 'Mensalidades atuais de 2026 dos concorrentes';
    if (hint) hint.textContent = 'Uma linha por modalidade, público, plano e frequência. Valores sem estimativa.';
    table.innerHTML = `
      <thead><tr><th>Clube</th><th>Modalidade</th><th>Público</th><th>Plano</th><th>Frequência</th><th>Valor</th></tr></thead>
      <tbody></tbody>`;
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = current.map(r => `
      <tr>
        <td class="club-name"><strong>${r.club}</strong></td>
        <td>${r.modality}</td>
        <td>${r.audience || 'Público geral'}</td>
        <td>${r.category || '—'}</td>
        <td>${r.frequency || '—'}</td>
        <td class="price"><strong>${money(r.value)}</strong></td>
      </tr>`).join('');
    const wrap = card.querySelector('.table-wrap');
    if (wrap) wrap.classList.add('excel-market-wrap');
  }

  const pendingCard = document.getElementById('contactsList')?.closest('article.card');
  if (pendingCard) pendingCard.remove();
  const auditCard = document.getElementById('sourceStats')?.closest('article.card');
  if (auditCard) {
    const grid = auditCard.parentElement;
    if (grid) grid.classList.add('audit-grid-single');
    const p = auditCard.querySelector('.muted');
    if (p) p.textContent = 'Base 2026 consolidada com os valores recebidos e as fontes já registradas. Sem estimativas.';
    const stats = document.getElementById('sourceStats');
    if (stats) {
      const clubs = new Set(records.filter(r => Number(r.year)===2026 && r.club !== 'Caixeiros Viajantes').map(r=>r.club)).size;
      stats.innerHTML = `
        <div class="stat"><strong>${current.length}</strong><span>registros atuais de concorrentes</span></div>
        <div class="stat"><strong>${clubs}</strong><span>concorrentes com dados em 2026</span></div>
        <div class="stat"><strong>0</strong><span>pendências exibidas na base atual</span></div>`;
    }
  }

  const heading = document.querySelector('.home-heading');
  if (heading) {
    const eyebrow = heading.querySelector('.eyebrow');
    const title = heading.querySelector('h2');
    const desc = heading.querySelector('p');
    if (eyebrow) eyebrow.textContent = 'ARQUIVO 2026 — ATUALIZADO';
    if (title) title.textContent = 'Valores atuais de 2026 — Atividades Aquáticas e Vôlei';
    if (desc) desc.textContent = 'Base consolidada em formato de planilha: clube, modalidade, público, plano, frequência e valor.';
  }
  const checked = document.getElementById('currentCheckedAt');
  if (checked) checked.textContent = 'Base revisada em 14/09/2026';
  const badge = document.querySelector('.hero__badge strong');
  if (badge) badge.textContent = '2026 — atualizado';
  const refTitle = document.querySelector('.current-reference-card h2');
  if (refTitle) refTitle.textContent = 'Caixeiros Viajantes — mensalidades atuais de 2026';
  const reset = document.getElementById('resetFilters');
  if (reset) reset.addEventListener('click', () => setTimeout(() => {
    const year = document.getElementById('yearFilter');
    if (year && [...year.options].some(o => o.value === '2026')) { year.value = '2026'; year.dispatchEvent(new Event('change',{bubbles:true})); }
  }, 0));

  const style = document.createElement('style');
  style.textContent = `
    .excel-market-wrap{max-height:620px;overflow:auto;border:1px solid #e1e8ee;border-radius:10px}
    .excel-market-wrap table{min-width:940px}
    .excel-market-wrap thead th{position:sticky;top:0;z-index:2;background:#f3f7fa}
    .excel-market-wrap td,.excel-market-wrap th{white-space:nowrap}
    .excel-market-wrap tbody tr:nth-child(even){background:#fbfdfe}
    .audit-grid-single{grid-template-columns:1fr!important}
    @media(max-width:800px){.excel-market-wrap{max-height:520px}}
  `;
  document.head.appendChild(style);
})();