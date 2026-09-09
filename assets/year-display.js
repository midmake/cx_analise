(() => {
  const badgeLabel = document.querySelector('.hero__badge span');
  if (badgeLabel) badgeLabel.textContent = 'Arquivo';

  const updated = document.getElementById('updatedAt');
  if (updated) updated.textContent = '2026 — em elaboração';

  const checked = document.getElementById('currentCheckedAt');
  if (checked) checked.textContent = 'Mensalidades atuais de 2025';

  const script = document.createElement('script');
  script.src = 'assets/fix-stability.js?v=2';
  document.body.appendChild(script);
})();