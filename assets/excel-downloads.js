(() => {
  function renderExcelDownloads() {
    const panel = document.getElementById('data');
    if (!panel) return;
    let card = panel.querySelector('.historical-files-card');
    if (!card) {
      card = document.createElement('article');
      card.className = 'card historical-files-card';
      panel.insertAdjacentElement('afterbegin', card);
    }
    card.innerHTML = `
      <div class="section-head">
        <div><span class="eyebrow dark">ARQUIVOS EXCEL</span><h2>Arquivos usados no levantamento</h2></div>
        <span class="hint">O Arquivo 2026 reúne os valores atuais de 2026 e acompanha a base do dashboard.</span>
      </div>
      <div class="historical-files-grid">
        <a class="historical-file-link" href="downloads/PESQUISA_MENSALIDADES_NATACAO_2024.xlsx" download>
          <strong>Arquivo 2024</strong><span>Mensalidades praticadas em 2023 · baixar Excel</span>
        </a>
        <a class="historical-file-link" href="downloads/VALORES_CLUBES.xlsx" download>
          <strong>Arquivo 2025</strong><span>Mensalidades praticadas em 2024 · baixar Excel</span>
        </a>
        <a class="historical-file-link" href="downloads/ANALISE_MERCADO_CLUBES_2026.xlsx" download>
          <strong>Arquivo 2026 — valores atuais</strong><span>Valores atuais de 2026 · baixar Excel</span>
        </a>
      </div>`;
  }

  setTimeout(renderExcelDownloads, 0);
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    if (tab.dataset.tab === 'data') setTimeout(renderExcelDownloads, 0);
  }));
})();