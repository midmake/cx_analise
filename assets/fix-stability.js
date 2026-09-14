(() => {
  const $ = s => document.querySelector(s);
  const badge = $('.hero__badge span');
  if (badge) badge.textContent = 'Arquivo';
  const updated = document.getElementById('updatedAt');
  if (updated) updated.textContent = '2026';
  const checked = document.getElementById('currentCheckedAt');
  if (checked) checked.textContent = 'Valores atuais de 2026';

  const homeTitle = document.querySelector('.home-heading h2');
  if (homeTitle) homeTitle.textContent = 'Valores atuais de 2026 — Atividades Aquáticas e Vôlei';
  const homeText = document.querySelector('.home-heading p');
  if (homeText) homeText.textContent = 'Levantamento atual de 2026 usado na análise comparativa de mercado do clube.';
  const refTitle = document.querySelector('.current-reference-card h2');
  if (refTitle) refTitle.textContent = 'Caixeiros Viajantes — valores atuais de 2026';
  const compTitle = document.querySelector('.competitors-current-card h2');
  if (compTitle) compTitle.textContent = 'Valores atuais de 2026 dos concorrentes';
  const evoHint = document.querySelector('#evolution .hint');
  if (evoHint) evoHint.textContent = 'Mensalidades 2023 = arquivo 2024 · mensalidades 2024 = arquivo 2025 · valores atuais 2026 = arquivo 2026.';

  document.getElementById('rankingChart')?.remove();
  document.getElementById('compareChart')?.remove();

  const files = {
    2024: {href:'downloads/PESQUISA_MENSALIDADES_NATACAO_2024.xlsx', label:'Arquivo 2024'},
    2025: {href:'downloads/VALORES_CLUBES.xlsx', label:'Arquivo 2025'},
    2026: {href:'downloads/ANALISE_MERCADO_CLUBES_2026.xlsx', label:'Arquivo 2026'}
  };

  function patchSources() {
    document.querySelectorAll('#dataTable tbody tr').forEach(row => {
      const c = row.querySelectorAll('td');
      if (c.length < 10) return;
      const origin = c[1].textContent || '';
      let year = origin.includes('2024') ? 2024 : origin.includes('2025') ? 2025 : origin.includes('2026') ? 2026 : null;
      if (!year) return;
      c[1].textContent = files[year].label;
      if (year === 2024 || year === 2025) {
        c[9].innerHTML = `<a class="source-link" href="${files[year].href}" download>Baixar Excel original</a>`;
      } else if (!c[9].querySelector('a')) {
        c[9].innerHTML = `<a class="source-link" href="${files[year].href}" download>Arquivo 2026</a>`;
      }
    });
  }

  patchSources();
  ['yearFilter','clubFilter','modalityFilter','audienceFilter','frequencyFilter'].forEach(id =>
    document.getElementById(id)?.addEventListener('change', () => setTimeout(patchSources,0))
  );
  document.querySelectorAll('.tab').forEach(tab =>
    tab.addEventListener('click', () => setTimeout(patchSources,0))
  );
})();