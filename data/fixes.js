(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];

  // REGRA DE NEGÓCIO OFICIAL DO LEVANTAMENTO:
  // Arquivo 2024 = mensalidades praticadas em 2023
  // Arquivo 2025 = mensalidades praticadas em 2024
  // Arquivo 2026 (em elaboração) = mensalidades atuais de 2025
  const yearMap = { 2024: 2023, 2025: 2024, 2026: 2025 };

  data.meta = data.meta || {};
  data.meta.yearLogic = 'Arquivo 2024 = mensalidades de 2023 · Arquivo 2025 = mensalidades de 2024 · Arquivo 2026 (em elaboração) = mensalidades atuais de 2025';
  data.meta.pendingLabel = 'Aguardando dados do Administrativo — Setor de Esportes';
  data.meta.warning2024 = null;

  for (const r of records) {
    const sourceFileYear = Number(r.year);
    const valueYear = yearMap[sourceFileYear];

    // Mantemos os dois conceitos separados no dado.
    r.sourceFileYear = sourceFileYear;
    r.researchYear = sourceFileYear; // compatibilidade com o restante do código
    r.valueYear = valueYear || sourceFileYear;
    r.year = r.valueYear;

    if (r.club === 'Grêmio Náutico Gaúcho') r.club = 'GNG';

    // Os arquivos históricos registram os valores praticados na época.
    if ((r.sourceFileYear === 2024 || r.sourceFileYear === 2025) && typeof r.value === 'number') {
      r.status = 'VALOR HISTÓRICO CONFIRMADO';
    }

    // Arquivo 2026 em elaboração: valores atuais de 2025 confirmados diretamente
    // em páginas/documentos oficiais ou na página oficial do próprio Caixeiros.
    if (r.sourceFileYear === 2026 && r.club === 'Caixeiros Viajantes' && typeof r.value === 'number') {
      r.status = 'CONFIRMADO ATUAL';
    }

    if (
      r.sourceFileYear === 2026 &&
      r.club === 'Recreio da Juventude' &&
      typeof r.value === 'number' &&
      String(r.source || '').includes('recreiodajuventude.com.br')
    ) {
      r.status = 'CONFIRMADO ATUAL';
    }

    if (
      r.sourceFileYear === 2026 &&
      r.club === 'GNG' &&
      typeof r.value === 'number' &&
      String(r.source || '').includes('gngaucho.com.br')
    ) {
      r.status = 'CONFIRMADO ATUAL';
    }

    if (
      r.sourceFileYear === 2026 &&
      r.club === 'ACM' &&
      typeof r.value === 'number' &&
      String(r.source || '').includes('acm-rs.com.br')
    ) {
      r.status = 'CONFIRMADO ATUAL';
    }

    // Um valor explicitamente desatualizado só é retirado se não tiver sido revalidado acima.
    if (r.sourceFileYear === 2026 && String(r.status || '').toUpperCase().includes('DESATUALIZADO')) {
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
