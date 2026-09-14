(() => {
  const summary = window.CURRENT_MARKET_SUMMARY;
  if (!summary) return;
  const item = (summary.competitors || []).find(c => c.club === 'Raia Center');
  if (!item) return;
  const values = 'Zona Norte — Anual 1+11: 1x R$ 235 · 2x R$ 266 · 3x R$ 297 · 5x R$ 325 | Semestral 1+5: 1x R$ 285 · 2x R$ 320 · 3x R$ 360 · 5x R$ 390 | Mensal: 1x R$ 335 · 2x R$ 380 · 3x R$ 425 · 5x R$ 465';
  item.natacao = values;
  item.hidro = values;
  item.equipeNatacao = null;
  item.volei = null;
  item.status = 'CONFIRMADO ATUAL — PARCIAL';
  item.source = 'https://wa.me/5551984206591';
})();
