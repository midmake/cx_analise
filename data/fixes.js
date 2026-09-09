(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const yearMap = { 2024: 2023, 2025: 2024, 2026: 2025 };

  data.meta = data.meta || {};
  data.meta.yearLogic = 'Pesquisa 2024 = valores de 2023 · Pesquisa 2025 = valores de 2024 · Pesquisa 2026 = valores vigentes de 2025, usados para definir os valores de 2026';
  data.meta.pendingLabel = 'Aguardando dados do Administrativo — Setor de Esportes';
  data.meta.warning2024 = null;

  for (const r of records) {
    const originalYear = Number(r.year);
    r.researchYear = originalYear;
    r.year = yearMap[originalYear] || originalYear;

    if (r.club === 'Grêmio Náutico Gaúcho') r.club = 'GNG';

    if (r.researchYear === 2026 && r.club === 'Caixeiros Viajantes' && typeof r.value === 'number') {
      r.status = 'VIGENTE 2025';
    }

    if (r.researchYear === 2026 && String(r.status || '').toUpperCase().includes('DESATUALIZADO')) {
      r.displayValue = r.value;
      r.value = null;
    }

    if (r.source && r.source.includes('...')) {
      if (r.club === 'SOGIPA') {
        r.source = 'https://www.sogipa.com.br/site/noticias/17711/retorno-das-aulas-das-escolas-de-esportes';
      } else if (r.club === 'Recreio da Juventude') {
        r.source = 'https://www.recreiodajuventude.com.br/oficial/2023/userfiles/ckeditor/valores_dos_servicos_2026a_1_2_1.pdf';
      } else if (r.club === 'GNG') {
        r.source = 'https://gngaucho.com.br/';
      }
    }
  }
})();
