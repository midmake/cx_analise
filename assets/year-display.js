(() => {
  function normalizeYearLabels() {
    document.querySelectorAll('#evolutionSummary .evo-card span:first-child').forEach(el => {
      el.textContent = el.textContent.replace(/pesquisa\s+(2024|2025|2026)/gi, 'arquivo $1');
    });

    document.querySelectorAll('#dataTable tbody tr td:nth-child(2)').forEach(el => {
      el.textContent = el.textContent.replace(/^Pesquisa\s+/i, 'Arquivo ');
    });

    const badgeLabel = document.querySelector('.hero__badge span');
    if (badgeLabel) badgeLabel.textContent = 'Arquivo';

    const updated = document.getElementById('updatedAt');
    if (updated) updated.textContent = '2026 — em elaboração';

    const checked = document.getElementById('currentCheckedAt');
    if (checked) checked.textContent = 'Levantamento em andamento · mensalidades de 2025';
  }

  normalizeYearLabels();

  const observer = new MutationObserver(() => normalizeYearLabels());
  observer.observe(document.body, { childList: true, subtree: true });
})();
