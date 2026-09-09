(() => {
  const reviewCss = document.createElement('link');
  reviewCss.rel = 'stylesheet';
  reviewCss.href = 'assets/review.css';
  document.head.appendChild(reviewCss);

  const data = window.CURRENT_MARKET_SUMMARY;
  if (!data) return;

  const $ = (s) => document.querySelector(s);
  const pending = data.pendingLabel || 'Aguardando dados do Administrativo — Setor de Esportes';

  const valueOrPending = (value) => {
    if (value === null || value === undefined || value === '') {
      return `<span class="pending">${pending}</span>`;
    }
    return value;
  };

  const sourceLinks = (item) => {
    const links = [item.source, item.source2, item.source3, item.source4].filter(Boolean);
    if (!links.length) return '<span class="source-muted">Fonte pública oficial não localizada</span>';
    return links.map((url, i) => `<a href="${url}" target="_blank" rel="noopener">Fonte${links.length > 1 ? ` ${i + 1}` : ''}</a>`).join(' · ');
  };

  const statusBadge = (status) => {
    const confirmed = String(status || '').toUpperCase().startsWith('CONFIRMADO ATUAL');
    if (confirmed) return `<span class="confirmed-badge">${status}</span>`;
    return `<span class="pending">${pending}</span>`;
  };

  const ref = data.reference;
  const aq = $('#currentCaixeirosAquatics');
  const vo = $('#currentCaixeirosVolley');

  if (aq) {
    aq.innerHTML = ref.aquatics.map(item => `
      <div class="current-line">
        <div class="current-line__title">${item.activity}</div>
        <div><strong>Sócio:</strong> ${valueOrPending(item.socio)}</div>
        <div><strong>Não sócio:</strong> ${valueOrPending(item.nonSocio)}</div>
        ${item.extra ? `<small>${item.extra}</small>` : ''}
      </div>
    `).join('');
  }

  if (vo) {
    vo.innerHTML = ref.volleyball.map(item => `
      <div class="current-line">
        <div class="current-line__title">${item.activity}</div>
        <div><strong>Sócio:</strong> ${valueOrPending(item.socio)}</div>
        <div><strong>Não sócio:</strong> ${valueOrPending(item.nonSocio)}</div>
        ${item.extra ? `<small>${item.extra}</small>` : ''}
      </div>
    `).join('');
  }

  const referenceCard = document.querySelector('.current-reference-card');
  const position = data.marketPosition;
  if (referenceCard && position && !document.querySelector('.caixeiros-position-card')) {
    const positionCard = document.createElement('article');
    positionCard.className = 'card caixeiros-position-card';
    positionCard.innerHTML = `
      <div class="position-head">
        <div>
          <span class="eyebrow dark">POSIÇÃO DO CAIXEIROS</span>
          <h2>Como o clube está em relação ao mercado</h2>
        </div>
        <span class="confirmed-badge">BASE CONFIRMADA</span>
      </div>
      <div class="position-grid">
        ${position.items.map(item => `
          <div class="position-item">
            <span class="position-label">${item.label}</span>
            <div class="position-main"><strong>${item.caixeiros}</strong><b>${item.position}</b></div>
            <span class="position-comparison">${item.comparison}</span>
            <small>${item.base}</small>
          </div>
        `).join('')}
      </div>
      <p class="position-note">${position.note}</p>
    `;
    referenceCard.insertAdjacentElement('afterend', positionCard);
  }

  const tbody = $('#currentCompetitorsTable tbody');
  if (tbody) {
    tbody.innerHTML = data.competitors.map(c => {
      const aquatic = `
        <div class="mini-value"><strong>Natação:</strong> ${valueOrPending(c.natacao)}</div>
        <div class="mini-value"><strong>Hidro:</strong> ${valueOrPending(c.hidro)}</div>
        <div class="mini-value"><strong>Equipe de natação:</strong> ${valueOrPending(c.equipeNatacao)}</div>
      `;
      return `
        <tr>
          <td class="club-name">${c.club}</td>
          <td>${aquatic}</td>
          <td><div class="mini-value">${valueOrPending(c.volei)}</div></td>
          <td>
            <div class="market-status">${statusBadge(c.status)}</div>
            <div class="source-links">${sourceLinks(c)}</div>
          </td>
        </tr>
      `;
    }).join('');
  }

  const refSources = $('#referenceSources');
  if (refSources) {
    refSources.innerHTML = `<div class="reference-status">${statusBadge(ref.status)}</div>${sourceLinks(ref)}`;
  }

  const checked = $('#currentCheckedAt');
  if (checked) checked.textContent = `Verificação pública atualizada em ${data.checkedAt}`;

  const toolbar = document.querySelector('.toolbar');
  const tabs = [...document.querySelectorAll('.tab')];

  function syncToolbar() {
    const overviewActive = document.querySelector('.tab[data-tab="overview"]')?.classList.contains('active');
    if (toolbar) toolbar.classList.toggle('toolbar-hidden-home', !!overviewActive);
  }

  // Não permitimos misturar anos no filtro de comparação. A evolução anual tem aba própria.
  const yearSelect = $('#yearFilter');
  const enforceSingleYear = () => {
    if (!yearSelect) return;
    [...yearSelect.options].forEach(option => {
      if (option.value === 'Todos') option.remove();
    });
    if (!yearSelect.value || yearSelect.value === 'Todos') {
      yearSelect.value = '2025';
      yearSelect.dispatchEvent(new Event('change'));
    }
  };
  if (yearSelect) {
    new MutationObserver(enforceSingleYear).observe(yearSelect, { childList: true });
    enforceSingleYear();
  }
  $('#resetFilters')?.addEventListener('click', () => setTimeout(enforceSingleYear, 0));

  // O gráfico genérico de comparação foi retirado: alguns clubes possuem mais de um plano
  // válido no mesmo recorte. A tabela abaixo preserva todos os valores sem escolher um arbitrariamente.
  const compareChartCard = document.querySelector('#compare .chart-card');
  if (compareChartCard) compareChartCard.classList.add('audit-hidden');
  const compareTableCard = document.querySelector('#compare .card:not(.chart-card)');
  if (compareTableCard && !document.querySelector('#compare .comparison-rule')) {
    compareTableCard.querySelector('.section-head')?.insertAdjacentHTML('afterend', '<p class="comparison-rule"><strong>Regra:</strong> um ano por vez. A tabela mantém todos os planos confirmados; nenhum valor é escolhido ou estimado automaticamente.</p>');
  }

  const evolutionFrame = document.querySelector('#evolution .chart-frame');
  if (evolutionFrame && !document.querySelector('#evolution .chart-note')) {
    evolutionFrame.insertAdjacentHTML('afterend', '<p class="chart-note"><strong>Legenda:</strong> 2023 = valores da pesquisa 2024 · 2024 = valores da pesquisa 2025 · 2025 = valores da pesquisa atual. Cada ponto é um valor registrado naquele período.</p>');
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setTimeout(syncToolbar, 0)));
  syncToolbar();
})();