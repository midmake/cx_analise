(() => {
  const data = window.DASHBOARD_DATA || {};
  const normClub = c => c === 'Grêmio Náutico Gaúcho' ? 'GNG' : (c === 'Professor Gaúcho' ? 'Gaúcho (CPG)' : c);
  const exact = new Set([
    'ACM|Escola de Natação','Caixeiros Viajantes|Escola de Natação','Caixeiros Viajantes|Equipe de Natação',
    'Caixeiros Viajantes|Hidroginástica','Caixeiros Viajantes|Hidrobike','GNG|Escola de Natação',
    'Gaúcho (CPG)|Escola de Natação','Gaúcho (CPG)|Hidroginástica','Geraldo Santana|Escola de Natação',
    'Geraldo Santana|Hidroginástica','Raia Center|Escola de Natação','Raia Center|Hidroginástica',
    'Recreio da Juventude|Escola de Natação','Recreio da Juventude|Equipe de Natação','Recreio da Juventude|Hidroginástica',
    'SOGIPA|Escola de Natação','SOGIPA|Hidroginástica','Stillo|Escola de Natação','Stillo|Hidroginástica'
  ]);
  const replaceVolley = new Set(['Caixeiros Viajantes','Gaúcho (CPG)','Recreio da Juventude','SOGIPA']);
  data.records = (data.records || []).filter(r => {
    if (Number(r.year) !== 2026) return true;
    const club = normClub(r.club);
    if (replaceVolley.has(club) && /Vôlei/.test(String(r.modality || ''))) return false;
    return !exact.has(`${club}|${r.modality}`);
  });
  for (let i = 1; i <= 6; i++) document.write(`<script src="data/current-2026-part${i}.js"><\/script>`);
})();