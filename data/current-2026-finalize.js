(() => {
  const records = window.DASHBOARD_DATA?.records || [];
  for (const r of records) {
    if (Number(r.year) === 2026 && !r.valueYear) {
      r.sourceFileYear = 2026;
      r.researchYear = 2026;
      r.valueYear = 2026;
      r.year = 2026;
      r.status = 'CONFIRMADO ATUAL';
    }
  }
  if (window.DASHBOARD_DATA) {
    window.DASHBOARD_DATA.contacts = [];
    window.DASHBOARD_DATA.meta = window.DASHBOARD_DATA.meta || {};
    window.DASHBOARD_DATA.meta.pendingLabel = 'Sem valor registrado';
    window.DASHBOARD_DATA.meta.updated = '14/09/2026';
  }
})();