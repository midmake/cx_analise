(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  // Bases historicas: arquivo 2024 -> mensalidades 2023; arquivo 2025 -> mensalidades 2024;
  // a base anterior carregada nos arquivos records-1..6 corresponde ao historico de 2025.
  // Os valores atuais de 2026 sao carregados depois, em data/current-2026.js.
  const yearMap = { 2024: 2023, 2025: 2024, 2026: 2025 };

  data.meta = data.meta || {};
  data.meta.yearLogic = 'Mensalidades 2023, 2024 e 2025 permanecem no histórico · valores atuais de 2026 ficam no Arquivo 2026';
  data.meta.pendingLabel = 'Sem valor registrado';
  data.meta.warning2024 = null;

  for (const r of records) {
    const sourceFileYear = Number(r.year);
    const valueYear = yearMap[sourceFileYear] || sourceFileYear;
    r.sourceFileYear = sourceFileYear;
    r.researchYear = sourceFileYear;
    r.valueYear = valueYear;
    r.year = valueYear;

    if (r.club === 'Grêmio Náutico Gaúcho') r.club = 'GNG';
    if (r.club === 'Professor Gaúcho') r.club = 'Gaúcho (CPG)';

    const status = String(r.status || '').toUpperCase();
    const blocked = status.includes('DESATUALIZADO') || status.includes('NÃO LOCALIZADO') || status.includes('NECESSITA') || status.includes('A CONFIRMAR');

    if (typeof r.value === 'number' && !blocked) r.status = 'VALOR HISTÓRICO CONFIRMADO';
    if (blocked && sourceFileYear === 2026) {
      r.displayValue = r.value;
      r.value = null;
    }

    if (r.source && r.source.includes('...')) {
      if (r.club === 'SOGIPA') r.source = 'https://www.sogipa.com.br/site/horarios-das-escolas';
      else if (r.club === 'Recreio da Juventude') r.source = 'https://www.recreiodajuventude.com.br/';
      else if (r.club === 'GNG') r.source = 'https://gngaucho.com.br/';
    }
  }
})();
