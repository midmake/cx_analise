(() => {
  const badgeLabel = document.querySelector('.hero__badge span');
  if (badgeLabel) badgeLabel.textContent = 'Arquivo';

  const stability = document.createElement('script');
  stability.src = 'assets/fix-stability.js?v=6';
  stability.onload = () => {
    const position = document.createElement('script');
    position.src = 'assets/position-filter.js?v=4';
    position.onload = () => {
      const cascade = document.createElement('script');
      cascade.src = 'assets/cascade-filters.js?v=3';
      cascade.onload = () => {
        const year = document.getElementById('yearFilter');
        if (year && [...year.options].some(o => o.value === '2026')) {
          year.value = '2026';
          year.dispatchEvent(new Event('change', { bubbles:true }));
        }
        const table = document.createElement('script');
        table.src = 'assets/current-table-2026.js?v=2';
        document.body.appendChild(table);
      };
      document.body.appendChild(cascade);
    };
    document.body.appendChild(position);
  };
  document.body.appendChild(stability);
})();