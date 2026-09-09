(() => {
  const badgeLabel = document.querySelector('.hero__badge span');
  if (badgeLabel) badgeLabel.textContent = 'Arquivo';

  const updated = document.getElementById('updatedAt');
  if (updated) updated.textContent = '2026 — em elaboração';

  const checked = document.getElementById('currentCheckedAt');
  if (checked) checked.textContent = 'Mensalidades atuais de 2025';

  const stability = document.createElement('script');
  stability.src = 'assets/fix-stability.js?v=4';
  stability.onload = () => {
    const position = document.createElement('script');
    position.src = 'assets/position-filter.js?v=2';
    position.onload = () => {
      const cascade = document.createElement('script');
      cascade.src = 'assets/cascade-filters.js?v=1';
      document.body.appendChild(cascade);
    };
    document.body.appendChild(position);
  };
  document.body.appendChild(stability);
})();