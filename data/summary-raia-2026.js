(() => {
  const data = window.CURRENT_MARKET_SUMMARY;
  const dashboard = window.DASHBOARD_DATA || {};
  if (!data) return;

  data.checkedAt = '14/09/2026';
  data.purpose = 'Valores atuais de 2026';

  const money = v => Number(v).toLocaleString('pt-BR', {style:'currency',currency:'BRL',minimumFractionDigits:0,maximumFractionDigits:2});
  const freqOrder = {'1x':1,'2x':2,'3x':3,'4x':4,'5x':5,'6x':6,'Livre':7,'Não informado':8,'Conforme equipe':9};
  const valid = r => Number(r.year) === 2026 && typeof r.value === 'number' && isFinite(r.value) &&
    !/DESATUALIZADO|NÃO LOCALIZADO|NECESSITA|A CONFIRMAR/i.test(String(r.status || ''));

  function summarize(rows) {
    if (!rows.length) return null;
    const groups = new Map();
    rows.forEach(r => {
      const audience = String(r.audience || 'Público geral');
      if (!groups.has(audience)) groups.set(audience, new Map());
      const f = String(r.frequency || 'Não informado');
      if (!groups.get(audience).has(f)) groups.get(audience).set(f, new Set());
      groups.get(audience).get(f).add(r.value);
    });
    return [...groups.entries()].map(([audience, freqs]) => {
      const parts = [...freqs.entries()]
        .sort((a,b) => (freqOrder[a[0]] || 99) - (freqOrder[b[0]] || 99))
        .map(([f, vals]) => `${f}: ${[...vals].sort((a,b)=>a-b).map(money).join(' / ')}`);
      return `${audience}: ${parts.join(' · ')}`;
    }).join(' | ');
  }

  const all = (dashboard.records || []).filter(valid);
  const clubs = [...new Set(all.filter(r => r.club !== 'Caixeiros Viajantes').map(r => r.club))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const existing = new Map((data.competitors || []).map(c => [c.club, c]));

  data.competitors = clubs.map(club => {
    const rows = all.filter(r => r.club === club);
    const old = existing.get(club) || {};
    const nat = rows.filter(r => r.modality === 'Escola de Natação');
    const hidro = rows.filter(r => r.modality === 'Hidroginástica');
    const equipe = rows.filter(r => r.modality === 'Equipe de Natação');
    const volei = rows.filter(r => /Vôlei/.test(r.modality));
    const firstUrl = rows.map(r => r.source).find(s => /^https?:\/\//.test(String(s || ''))) || old.source || null;
    return {
      club,
      natacao: summarize(nat),
      hidro: summarize(hidro),
      equipeNatacao: summarize(equipe),
      volei: summarize(volei),
      status: 'CONFIRMADO ATUAL',
      source: firstUrl,
      source2: old.source2 || null,
      source3: old.source3 || null,
      source4: old.source4 || null
    };
  });

  const pendingNames = ['Brilhante'];
  pendingNames.forEach(name => {
    if (!data.competitors.some(c => c.club === name)) {
      const old = existing.get(name);
      if (old) data.competitors.push(old);
    }
  });

  if (data.reference) data.reference.status = 'CONFIRMADO ATUAL';
})();