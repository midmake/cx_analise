(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const yearMap = { 2024: 2023, 2025: 2024, 2026: 2025 };

  data.meta = data.meta || {};
  data.meta.yearLogic = 'Pesquisa 2026 · valores atuais coletados para apoiar a definição das mensalidades de 2026';
  data.meta.pendingLabel = 'Aguardando dados do Administrativo — Setor de Esportes';
  data.meta.warning2024 = null;

  for (const r of records) {
    const originalYear = Number(r.year);
    r.researchYear = originalYear;
    r.year = yearMap[originalYear] || originalYear;

    if (r.club === 'Grêmio Náutico Gaúcho') r.club = 'GNG';

    // Todo valor numérico atual do Caixeiros está publicado nas páginas oficiais do clube.
    if (r.researchYear === 2026 && r.club === 'Caixeiros Viajantes' && typeof r.value === 'number') {
      r.status = 'CONFIRMADO ATUAL';
    }

    // No Recreio, a tabela oficial confirma os valores numéricos. Eventual dúvida de
    // nomenclatura escola/equipe não torna o preço incerto.
    if (
      r.researchYear === 2026 &&
      r.club === 'Recreio da Juventude' &&
      typeof r.value === 'number' &&
      String(r.source || '').includes('recreiodajuventude.com.br')
    ) {
      r.status = 'CONFIRMADO ATUAL';
    }

    // Valores marcados expressamente como desatualizados nunca entram em benchmark atual.
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
