(() => {
  const $ = (s) => document.querySelector(s);

  // Identificação clara do arquivo atual.
  const badgeLabel = $('.hero__badge span');
  if (badgeLabel) badgeLabel.textContent = 'Arquivo';
  const updated = document.getElementById('updatedAt');
  if (updated) updated.textContent = '2026 — em elaboração';
  const checked = document.getElementById('currentCheckedAt');
  if (checked) checked.textContent = 'Mensalidades atuais de 2025';

  // Evita processamento de gráficos que não são exibidos.
  document.getElementById('rankingChart')?.remove();
  document.getElementById('compareChart')?.remove();

  // Caixa simples de posição do Caixeiros: uma modalidade por vez.
  const positionData = {
    natacao: {
      title: 'Natação · 2x por semana',
      socio: {
        value: 'R$ 170,00',
        rank: '3º de 5',
        detail: 'Mediana dos concorrentes: R$ 163,00 · Caixeiros 4,3% acima.',
        base: 'GNG R$ 148 · ACM R$ 152 · Recreio R$ 174 · GNU R$ 249'
      },
      naoSocio: {
        value: 'R$ 340,00',
        rank: '2º de 3',
        detail: 'Mediana dos concorrentes: R$ 383,00 · Caixeiros 11,2% abaixo.',
        base: 'GNG R$ 268 · GNU R$ 498'
      }
    },
    volei: {
      title: 'Vôlei escola · 2x por semana',
      socio: {
        value: 'R$ 170,00',
        rank: '2º de 3',
        detail: 'Mediana dos concorrentes equivalentes: R$ 153,00 · Caixeiros 11,1% acima.',
        base: 'GNG R$ 109 · GNU R$ 197'
      },
      naoSocio: {
        value: 'R$ 240,00',
        rank: '2º de 3',
        detail: 'Mediana dos concorrentes equivalentes: R$ 257,00 · Caixeiros 6,6% abaixo.',
        base: 'GNG R$ 219 · GNU R$ 295'
      }
    }
  };

  const oldPosition = $('.caixeiros-position-card');
  if (oldPosition) {
    const card = document.createElement('article');
    card.className = 'card caixeiros-position-card position-simple';
    card.innerHTML = `
      <div class="position-simple-head">
        <div>
          <span class="eyebrow dark">POSIÇÃO DO CAIXEIROS</span>
          <h2>Caixeiros Viajantes em relação ao mercado</h2>
        </div>
        <label class="position-selector">Modalidade
          <select id="positionModality">
            <option value="natacao">Natação</option>
            <option value="volei">Vôlei</option>
          </select>
        </label>
      </div>
      <div id="positionSimpleContent"></div>
      <p class="position-simple-note">1º = menor mensalidade. Só entram no ranking preços com público e frequência equivalentes.</p>`;
    oldPosition.replaceWith(card);

    const renderPosition = () => {
      const key = document.getElementById('positionModality')?.value || 'natacao';
      const d = positionData[key];
      const target = document.getElementById('positionSimpleContent');
      if (!target) return;
      const row = (label, item) => `
        <div class="position-simple-row">
          <div class="position-simple-public">${label}</div>
          <div class="position-simple-value">${item.value}</div>
          <div class="position-simple-rank">${item.rank}</div>
          <div class="position-simple-detail">${item.detail}</div>
          <div class="position-simple-base">${item.base}</div>
        </div>`;
      target.innerHTML = `
        <h3>${d.title}</h3>
        <div class="position-simple-grid">
          ${row('Sócio', d.socio)}
          ${row('Não sócio', d.naoSocio)}
        </div>`;
    };
    document.getElementById('positionModality')?.addEventListener('change', renderPosition);
    renderPosition();
  }

  // Fontes históricas: os Excel originais enviados pelo usuário.
  const files = {
    2024: {
      href: 'downloads/PESQUISA_MENSALIDADES_NATACAO_2024.xlsx',
      title: 'Arquivo 2024 — mensalidades de 2023',
      name: 'PESQUISA MENSALIDADES NATAÇÃO 2024.xlsx'
    },
    2025: {
      href: 'downloads/VALORES_CLUBES.xlsx',
      title: 'Arquivo 2025 — mensalidades de 2024',
      name: 'VALORES CLUBES.xlsx'
    }
  };

  const dataPanel = document.getElementById('data');
  if (dataPanel && !dataPanel.querySelector('.historical-files-card')) {
    const card = document.createElement('article');
    card.className = 'card historical-files-card';
    card.innerHTML = `
      <div class="section-head">
        <div><span class="eyebrow dark">FONTES HISTÓRICAS</span><h2>Arquivos Excel originais</h2></div>
      </div>
      <div class="historical-files-grid">
        ${Object.values(files).map(f => `
          <a class="historical-file-link" href="${f.href}" download>
            <strong>${f.title}</strong><span>${f.name}</span>
          </a>`).join('')}
      </div>`;
    dataPanel.insertAdjacentElement('afterbegin', card);
  }

  function patchHistoricalSources() {
    document.querySelectorAll('#dataTable tbody tr').forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 10) return;
      const origin = cells[1].textContent || '';
      const year = origin.includes('2024') ? 2024 : origin.includes('2025') ? 2025 : null;
      if (!year) return;
      const f = files[year];
      cells[1].textContent = `Arquivo ${year}`;
      cells[9].innerHTML = `<a class="source-link" href="${f.href}" download>Baixar Excel original</a>`;
    });
  }

  patchHistoricalSources();
  ['yearFilter','clubFilter','modalityFilter','audienceFilter','frequencyFilter'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', patchHistoricalSources);
  });
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => setTimeout(patchHistoricalSources, 0)));

  const style = document.createElement('style');
  style.textContent = `
    .position-simple{padding:18px!important;overflow:hidden}
    .position-simple-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:14px}
    .position-simple-head h2{margin:3px 0 0;font-size:20px;color:#0b1f33}
    .position-selector{display:flex;flex-direction:column;gap:5px;font-size:10px;font-weight:800;color:#607080;text-transform:uppercase;letter-spacing:.4px;min-width:160px}
    .position-selector select{height:38px;border:1px solid #cfd9e2;border-radius:9px;background:#fff;padding:0 10px;font-size:13px;font-weight:700;color:#0b1f33}
    #positionSimpleContent h3{margin:0 0 10px;font-size:14px;color:#526675;font-weight:800}
    .position-simple-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .position-simple-row{display:grid;grid-template-columns:auto auto;column-gap:12px;row-gap:4px;align-items:baseline;padding:14px;border:1px solid #dce6ed;border-radius:12px;background:#fff}
    .position-simple-public{grid-column:1/-1;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.6px;color:#657482}
    .position-simple-value{font-size:24px;font-weight:800;color:#0b1f33;white-space:nowrap}
    .position-simple-rank{justify-self:end;font-size:14px;font-weight:900;color:#1768ac;white-space:nowrap}
    .position-simple-detail{grid-column:1/-1;font-size:11px;color:#344b5c;line-height:1.4}
    .position-simple-base{grid-column:1/-1;border-top:1px solid #edf1f4;padding-top:7px;margin-top:3px;font-size:9.5px;color:#75818b;line-height:1.35}
    .position-simple-note{margin:10px 2px 0;font-size:10px;color:#6b7882}
    .historical-files-card{margin-bottom:14px}
    .historical-files-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .historical-file-link{display:flex;flex-direction:column;gap:4px;padding:13px;border:1px solid #dce6ed;border-radius:11px;background:#f8fafc;text-decoration:none;color:#0b1f33}
    .historical-file-link strong{font-size:12px}.historical-file-link span{font-size:10px;color:#6c7882}
    @media(max-width:760px){.position-simple-head{display:block}.position-selector{margin-top:12px}.position-simple-grid,.historical-files-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
})();