(() => {
  const reviewCss = document.createElement('link');
  reviewCss.rel = 'stylesheet';
  reviewCss.href = 'assets/review.css';
  document.head.appendChild(reviewCss);

  const data = window.CURRENT_MARKET_SUMMARY;
  if (!data) return;

  data.marketPosition = {
    note: '1º = menor mensalidade. Só entram comparações com público e frequência equivalentes. Quando não existe amostra suficiente, a tela informa isso sem criar ranking.',
    groups: [
      {
        label: 'Natação 2x',
        socio: {
          caixeiros: 'R$ 170', position: '3º de 5',
          comparison: 'Mediana concorrentes: R$ 163 · Caixeiros 4,3% acima',
          base: 'GNG R$ 148 · ACM R$ 152 · Recreio R$ 174 · GNU R$ 249'
        },
        naoSocio: {
          caixeiros: 'R$ 340', position: '2º de 3',
          comparison: 'Mediana concorrentes: R$ 383 · Caixeiros 11,2% abaixo',
          base: 'GNG R$ 268 · GNU R$ 498'
        }
      },
      {
        label: 'Hidroginástica 2x',
        socio: {
          caixeiros: 'R$ 170', position: 'Dentro da faixa',
          comparison: 'Faixa concorrente confirmada: R$ 124 a R$ 204',
          base: 'ACM R$ 124 · GNG R$ 163 · Recreio Dia R$ 151 / Noite R$ 204'
        },
        naoSocio: {
          caixeiros: 'R$ 340', position: 'Comparação direta',
          comparison: 'GNG R$ 295 · Caixeiros 15,3% acima',
          base: 'Demais concorrentes sem preço não-sócio 2x equivalente confirmado.'
        }
      },
      {
        label: 'Vôlei escola 2x',
        socio: {
          caixeiros: 'R$ 170', position: '2º de 3',
          comparison: 'Mediana concorrentes: R$ 153 · Caixeiros 11,1% acima',
          base: 'GNG R$ 109 · GNU R$ 197. Recreio R$ 147 confirmado, mas sem classificação equivalente de escola para entrar no ranking.'
        },
        naoSocio: {
          caixeiros: 'R$ 240', position: '2º de 3',
          comparison: 'Mediana concorrentes: R$ 257 · Caixeiros 6,6% abaixo',
          base: 'GNG R$ 219 · GNU R$ 295'
        }
      }
    ]
  };

  const $ = s => document.querySelector(s);
  const pending = data.pendingLabel || 'Aguardando dados do Administrativo — Setor de Esportes';

  const valueOrPending = value => (value === null || value === undefined || value === '')
    ? `<span class="pending">${pending}</span>` : value;

  const sourceLinks = item => {
    const links = [item.source, item.source2, item.source3, item.source4].filter(Boolean);
    if (!links.length) return '<span class="source-muted">Fonte pública oficial não localizada</span>';
    return links.map((url, i) => `<a href="${url}" target="_blank" rel="noopener">Fonte${links.length > 1 ? ` ${i + 1}` : ''}</a>`).join(' · ');
  };

  const statusBadge = status => {
    const confirmed = String(status || '').toUpperCase().startsWith('CONFIRMADO ATUAL');
    return confirmed ? `<span class="confirmed-badge">${status}</span>` : `<span class="pending">${pending}</span>`;
  };

  const ref = data.reference;
  const aq = $('#currentCaixeirosAquatics');
  const vo = $('#currentCaixeirosVolley');

  if (aq) aq.innerHTML = ref.aquatics.map(item => `
    <div class="current-line">
      <div class="current-line__title">${item.activity}</div>
      <div><strong>Sócio:</strong> ${valueOrPending(item.socio)}</div>
      <div><strong>Não sócio:</strong> ${valueOrPending(item.nonSocio)}</div>
      ${item.extra ? `<small>${item.extra}</small>` : ''}
    </div>`).join('');

  if (vo) vo.innerHTML = ref.volleyball.map(item => `
    <div class="current-line">
      <div class="current-line__title">${item.activity}</div>
      <div><strong>Sócio:</strong> ${valueOrPending(item.socio)}</div>
      <div><strong>Não sócio:</strong> ${valueOrPending(item.nonSocio)}</div>
      ${item.extra ? `<small>${item.extra}</small>` : ''}
    </div>`).join('');

  const referenceCard = document.querySelector('.current-reference-card');
  if (referenceCard && !document.querySelector('.caixeiros-position-card')) {
    const card = document.createElement('article');
    card.className = 'card caixeiros-position-card';
    card.innerHTML = `
      <div class="position-head">
        <div><span class="eyebrow dark">POSIÇÃO DO CAIXEIROS</span><h2>Caixeiros Viajantes em relação ao mercado</h2></div>
        <span class="confirmed-badge">BASE CONFIRMADA</span>
      </div>
      <div class="position-grid">
        ${data.marketPosition.groups.map(group => `
          <div class="position-item">
            <span class="position-label">${group.label}</span>
            <div class="audience-compare">
              <div class="audience-block">
                <span class="audience-title">SÓCIO</span>
                <div class="position-main"><strong>${group.socio.caixeiros}</strong><b>${group.socio.position}</b></div>
                <span class="position-comparison">${group.socio.comparison}</span>
                <small>${group.socio.base}</small>
              </div>
              <div class="audience-block">
                <span class="audience-title">NÃO SÓCIO</span>
                <div class="position-main"><strong>${group.naoSocio.caixeiros}</strong><b>${group.naoSocio.position}</b></div>
                <span class="position-comparison">${group.naoSocio.comparison}</span>
                <small>${group.naoSocio.base}</small>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <p class="position-note">${data.marketPosition.note}</p>`;
    referenceCard.insertAdjacentElement('beforebegin', card);
  }

  const tbody = $('#currentCompetitorsTable tbody');
  if (tbody) tbody.innerHTML = data.competitors.map(c => `
    <tr>
      <td class="club-name">${c.club}</td>
      <td>
        <div class="mini-value"><strong>Natação:</strong> ${valueOrPending(c.natacao)}</div>
        <div class="mini-value"><strong>Hidro:</strong> ${valueOrPending(c.hidro)}</div>
        <div class="mini-value"><strong>Equipe de natação:</strong> ${valueOrPending(c.equipeNatacao)}</div>
      </td>
      <td><div class="mini-value">${valueOrPending(c.volei)}</div></td>
      <td><div class="market-status">${statusBadge(c.status)}</div><div class="source-links">${sourceLinks(c)}</div></td>
    </tr>`).join('');

  const refSources = $('#referenceSources');
  if (refSources) refSources.innerHTML = `<div class="reference-status">${statusBadge(ref.status)}</div>${sourceLinks(ref)}`;

  const checked = $('#currentCheckedAt');
  if (checked) checked.textContent = `Verificação pública atualizada em ${data.checkedAt}`;

  // Arquivos históricos: os botões baixam os arquivos Excel originais enviados para a análise.
  const dataPanel = document.querySelector('#data');
  if (dataPanel && !document.querySelector('.historical-files-card')) {
    const card = document.createElement('article');
    card.className = 'card historical-files-card';
    card.innerHTML = `
      <div class="section-head">
        <div><span class="eyebrow dark">FONTES HISTÓRICAS</span><h2>Arquivos Excel originais</h2></div>
      </div>
      <div class="historical-files-grid">
        <button class="historical-file-btn" data-source-file="2024"><strong>Arquivo 2024</strong><span>Mensalidades praticadas em 2023</span><small>PESQUISA MENSALIDADES NATAÇÃO 2024.xlsx</small></button>
        <button class="historical-file-btn" data-source-file="2025"><strong>Arquivo 2025</strong><span>Mensalidades praticadas em 2024</span><small>VALORES CLUBES.xlsx</small></button>
      </div>`;
    dataPanel.insertBefore(card, dataPanel.firstChild);
  }

  async function downloadHistorical(year) {
    const cfg = year === '2024'
      ? { parts: ['sources/arquivo-2024-a.txt','sources/arquivo-2024-b.txt'], name: 'PESQUISA MENSALIDADES NATAÇÃO 2024.xlsx' }
      : { parts: ['sources/arquivo-2025-a.txt','sources/arquivo-2025-b.txt'], name: 'VALORES CLUBES.xlsx' };
    try {
      const texts = await Promise.all(cfg.parts.map(p => fetch(p).then(r => { if (!r.ok) throw new Error(); return r.text(); })));
      const arrays = texts.map(t => {
        const bin = atob(t.trim());
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return arr;
      });
      const blob = new Blob(arrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = cfg.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) { alert('Arquivo histórico indisponível no momento.'); }
  }
  document.querySelectorAll('[data-source-file]').forEach(btn => btn.addEventListener('click', () => downloadHistorical(btn.dataset.sourceFile)));

  const toolbar = document.querySelector('.toolbar');
  const tabs = [...document.querySelectorAll('.tab')];
  function syncToolbar() {
    const overviewActive = document.querySelector('.tab[data-tab="overview"]')?.classList.contains('active');
    if (toolbar) toolbar.classList.toggle('toolbar-hidden-home', !!overviewActive);
  }

  const yearSelect = $('#yearFilter');
  const enforceSingleYear = () => {
    if (!yearSelect) return;
    [...yearSelect.options].forEach(option => { if (option.value === 'Todos') option.remove(); });
    if (!yearSelect.value || yearSelect.value === 'Todos') { yearSelect.value = '2025'; yearSelect.dispatchEvent(new Event('change')); }
  };
  if (yearSelect) { new MutationObserver(enforceSingleYear).observe(yearSelect, { childList: true }); enforceSingleYear(); }
  $('#resetFilters')?.addEventListener('click', () => setTimeout(enforceSingleYear, 0));

  const compareChartCard = document.querySelector('#compare .chart-card');
  if (compareChartCard) compareChartCard.classList.add('audit-hidden');
  const compareTableCard = document.querySelector('#compare .card:not(.chart-card)');
  if (compareTableCard && !document.querySelector('#compare .comparison-rule')) {
    compareTableCard.querySelector('.section-head')?.insertAdjacentHTML('afterend', '<p class="comparison-rule"><strong>Regra:</strong> um ano por vez. A tabela mantém todos os planos confirmados; nenhum valor é escolhido ou estimado automaticamente.</p>');
  }

  const evolutionFrame = document.querySelector('#evolution .chart-frame');
  if (evolutionFrame && !document.querySelector('#evolution .chart-note')) {
    evolutionFrame.insertAdjacentHTML('afterend', '<p class="chart-note"><strong>Legenda:</strong> 2023 = mensalidades do arquivo 2024 · 2024 = mensalidades do arquivo 2025 · 2025 = mensalidades atuais do arquivo 2026 em elaboração.</p>');
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setTimeout(syncToolbar, 0)));
  syncToolbar();
})();