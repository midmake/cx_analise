(() => {
  const FILES = {
    2024: {
      href: 'downloads/PESQUISA_MENSALIDADES_NATACAO_2024.xlsx',
      label: 'Arquivo 2024 — mensalidades de 2023',
      original: 'PESQUISA MENSALIDADES NATAÇÃO 2024.xlsx'
    },
    2025: {
      href: 'downloads/VALORES_CLUBES.xlsx',
      label: 'Arquivo 2025 — mensalidades de 2024',
      original: 'VALORES CLUBES.xlsx'
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .historical-files-card{margin-bottom:14px}
    .historical-files-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .historical-file-link{display:flex;flex-direction:column;gap:4px;padding:13px 14px;border:1px solid #dfe6ed;border-radius:12px;background:#f8fafc;color:#0b1f33;text-decoration:none}
    .historical-file-link:hover{border-color:#8eb3ca;background:#f2f8fb}
    .historical-file-link strong{font-size:13px}.historical-file-link span{font-size:11px;color:#66717d}
    .position-dual-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .position-dual-card{border:1px solid #dfe6ed;border-radius:13px;background:#fbfcfd;padding:13px}
    .position-dual-card h3{margin:0 0 10px;font-size:14px;color:#0b1f33}
    .position-row{padding:9px 0;border-top:1px solid #e7edf2}.position-row:first-of-type{border-top:0;padding-top:0}
    .position-row-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
    .position-row-head span{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:#66717d}
    .position-row-head strong{font-size:20px;color:#0b1f33}
    .position-rank{display:block;margin-top:3px;font-weight:800;font-size:12px;color:#1768ac}
    .position-detail{display:block;margin-top:3px;font-size:11px;line-height:1.35;color:#66717d}
    .historical-source-link{font-weight:700;color:#1768ac;text-decoration:none}.historical-source-link:hover{text-decoration:underline}
    @media(max-width:900px){.position-dual-grid{grid-template-columns:1fr}.historical-files-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function renderHistoricalFiles() {
    const dataPanel = document.querySelector('#data');
    if (!dataPanel || dataPanel.querySelector('.historical-files-card')) return;
    const card = document.createElement('article');
    card.className = 'card historical-files-card';
    card.innerHTML = `
      <div class="section-head">
        <div>
          <span class="eyebrow dark">ARQUIVOS ORIGINAIS</span>
          <h2>Fontes históricas em Excel</h2>
        </div>
        <span class="hint">Arquivos enviados e usados como fonte dos anos anteriores.</span>
      </div>
      <div class="historical-files-grid">
        ${Object.values(FILES).map(file => `
          <a class="historical-file-link" href="${file.href}" download>
            <strong>${file.label}</strong>
            <span>Baixar Excel original · ${file.original}</span>
          </a>
        `).join('')}
      </div>`;
    dataPanel.insertAdjacentElement('afterbegin', card);
  }

  function patchHistoricalTableSources() {
    document.querySelectorAll('#dataTable tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 10) return;
      const originText = cells[1].textContent || '';
      const year = originText.includes('2024') ? 2024 : (originText.includes('2025') ? 2025 : null);
      if (!year || !FILES[year]) return;
      const file = FILES[year];
      cells[9].innerHTML = `<a class="historical-source-link" href="${file.href}" download>Baixar Excel — Arquivo ${year}</a>`;
    });
  }

  function renderMarketPosition() {
    const old = document.querySelector('.caixeiros-position-card');
    if (!old) return;
    const card = document.createElement('article');
    card.className = 'card caixeiros-position-card';
    card.innerHTML = `
      <div class="position-head">
        <div>
          <span class="eyebrow dark">POSIÇÃO DO CAIXEIROS</span>
          <h2>Caixeiros Viajantes em relação ao mercado</h2>
        </div>
        <span class="confirmed-badge">BASE CONFIRMADA</span>
      </div>
      <div class="position-dual-grid">
        <section class="position-dual-card">
          <h3>Natação · 2x por semana</h3>
          <div class="position-row">
            <div class="position-row-head"><span>Sócio</span><strong>R$ 170</strong></div>
            <b class="position-rank">3º de 5</b>
            <span class="position-detail">Mediana dos concorrentes: R$ 163 · Caixeiros 4,3% acima.</span>
          </div>
          <div class="position-row">
            <div class="position-row-head"><span>Não sócio</span><strong>R$ 340</strong></div>
            <b class="position-rank">2º de 3</b>
            <span class="position-detail">Mediana dos concorrentes: R$ 383 · Caixeiros 11,2% abaixo.</span>
          </div>
        </section>
        <section class="position-dual-card">
          <h3>Hidroginástica · 2x por semana</h3>
          <div class="position-row">
            <div class="position-row-head"><span>Sócio</span><strong>R$ 170</strong></div>
            <b class="position-rank">Dentro da faixa confirmada</b>
            <span class="position-detail">Concorrentes confirmados equivalentes: R$ 124 a R$ 204.</span>
          </div>
          <div class="position-row">
            <div class="position-row-head"><span>Não sócio</span><strong>R$ 340</strong></div>
            <b class="position-rank">Base insuficiente para ranking</b>
            <span class="position-detail">Único valor 2x não sócio equivalente confirmado: GNG R$ 295. Outros clubes não têm comparação equivalente confirmada.</span>
          </div>
        </section>
        <section class="position-dual-card">
          <h3>Vôlei escola · 2x por semana</h3>
          <div class="position-row">
            <div class="position-row-head"><span>Sócio</span><strong>R$ 170</strong></div>
            <b class="position-rank">2º de 3</b>
            <span class="position-detail">Mediana dos concorrentes equivalentes: R$ 153 · Caixeiros 11,1% acima.</span>
          </div>
          <div class="position-row">
            <div class="position-row-head"><span>Não sócio</span><strong>R$ 240</strong></div>
            <b class="position-rank">2º de 3</b>
            <span class="position-detail">Mediana dos concorrentes equivalentes: R$ 257 · Caixeiros 6,6% abaixo.</span>
          </div>
        </section>
      </div>
      <p class="position-note"><strong>Leitura:</strong> 1º = menor mensalidade. Só entram no ranking valores com modalidade, público e frequência equivalentes. O R$ 147 do Recreio no vôlei continua confirmado na tabela, mas não entra no ranking de escola enquanto a equivalência da categoria não estiver confirmada.</p>`;
    old.replaceWith(card);
  }

  renderHistoricalFiles();
  renderMarketPosition();
  patchHistoricalTableSources();

  const tableBody = document.querySelector('#dataTable tbody');
  if (tableBody) new MutationObserver(patchHistoricalTableSources).observe(tableBody, { childList: true, subtree: true });
})();
