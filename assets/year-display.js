(() => {
  function normalizeYearLabels() {
    document.querySelectorAll('#evolutionSummary .evo-card span:first-child').forEach(el => {
      el.textContent = el.textContent.replace(/pesquisa\s+(2024|2025|2026)/gi, 'arquivo $1');
    });

    document.querySelectorAll('#dataTable tbody tr td:nth-child(2)').forEach(el => {
      el.textContent = el.textContent.replace(/^Pesquisa\s+/i, 'Arquivo ');
    });
  }

  normalizeYearLabels();

  const observer = new MutationObserver(() => normalizeYearLabels());
  observer.observe(document.body, { childList: true, subtree: true });
})();
