(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const yearMap = { 2024: 2023, 2025: 2024, 2026: 2026 };

  data.meta = data.meta || {};
  data.meta.yearLogic = 'Arquivo 2024 = mensalidades de 2023 · Arquivo 2025 = mensalidades de 2024 · Arquivo 2026 = valores atuais de 2026';
  data.meta.pendingLabel = 'Aguardando dados do Administrativo — Setor de Esportes';
  data.meta.warning2024 = null;

  for (const r of records) {
    const sourceFileYear = Number(r.year);
    r.sourceFileYear = sourceFileYear;
    r.researchYear = sourceFileYear;
    r.valueYear = yearMap[sourceFileYear] || sourceFileYear;
    r.year = r.valueYear;

    if (r.club === 'Grêmio Náutico Gaúcho') r.club = 'GNG';
    if (r.club === 'Professor Gaúcho') r.club = 'Gaúcho (CPG)';

    if ((sourceFileYear === 2024 || sourceFileYear === 2025) && typeof r.value === 'number') {
      r.status = 'VALOR HISTÓRICO CONFIRMADO';
    }

    if (sourceFileYear === 2026 && typeof r.value === 'number') {
      const s = String(r.status || '').toUpperCase();
      const blocked = s.includes('DESATUALIZADO') || s.includes('NÃO LOCALIZADO') ||
        s.includes('NECESSITA') || s.includes('A CONFIRMAR');
      if (!blocked) r.status = 'CONFIRMADO ATUAL';
    }

    if (sourceFileYear === 2026 && String(r.status || '').toUpperCase().includes('DESATUALIZADO')) {
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