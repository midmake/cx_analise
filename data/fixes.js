(() => {
  const records = window.DASHBOARD_DATA?.records || [];
  for (const r of records) {
    // Mantém o histórico de 2024 consistente com a sigla usada nos anos seguintes.
    if (r.club === 'Grêmio Náutico Gaúcho') r.club = 'GNG';

    // Valores explicitamente marcados como desatualizados não entram como preço vigente de 2026.
    if (r.year === 2026 && String(r.status || '').toUpperCase().includes('DESATUALIZADO')) {
      r.displayValue = r.value;
      r.value = null;
    }

    // Corrige URLs que vieram abreviadas na extração da planilha.
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
