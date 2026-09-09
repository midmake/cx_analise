(() => {
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

  const refStatus = $('#referenceStatus');
  if (refStatus) refStatus.innerHTML = statusBadge(ref.status);

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
  if (refSources) refSources.innerHTML = sourceLinks(ref);

  const checked = $('#currentCheckedAt');
  if (checked) checked.textContent = `Verificação pública atualizada em ${data.checkedAt}`;

  const toolbar = document.querySelector('.toolbar');
  const tabs = [...document.querySelectorAll('.tab')];

  function syncToolbar() {
    const overviewActive = document.querySelector('.tab[data-tab="overview"]')?.classList.contains('active');
    if (toolbar) toolbar.classList.toggle('toolbar-hidden-home', !!overviewActive);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setTimeout(syncToolbar, 0)));
  syncToolbar();
})();