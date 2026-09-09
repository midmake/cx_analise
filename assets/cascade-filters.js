(() => {
  const DATA = window.DASHBOARD_DATA || {};
  const records = DATA.records || [];
  const byId = id => document.getElementById(id);
  const numeric = v => typeof v === 'number' && Number.isFinite(v);
  const uniq = arr => [...new Set(arr.filter(v => v !== null && v !== undefined && v !== ''))];
  const money = v => numeric(v) ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
  const pct = v => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1).replace('.', ',')}%`;

  // "Livre" só existe quando a própria fonte registra explicitamente LIVRE.
  // Corrige os registros históricos importados cuja categoria dizia LIVRE,
  // mas a coluna técnica de frequência havia sido preenchida como 1x.
  records.forEach(r => {
    const explicit = `${r.category || ''} ${r.type || ''}`;
    if (/\blivre\b/i.test(explicit)) r.frequency = 'Livre';
  });

  function normAudience(v) {
    const s = String(v || '').trim();
    const l = s.toLowerCase();
    if (l.includes('associado light')) return 'Associado Light';
    if (l.includes('não sócio') || l.includes('não associado')) return 'Não sócio';
    if (l.includes('sócio') || l === 'associado') return 'Sócio';
    return s;
  }

  function normFreq(v) {
    const s = String(v || '').trim();
    if (/\blivre\b/i.test(s)) return 'Livre';
    const m = s.match(/([1-6])x/i);
    return m ? `${m[1]}x` : s;
  }

  function confirmed(r) {
    if (!numeric(r.value)) return false;
    const s = String(r.status || '').toUpperCase();
    if (Number(r.researchYear) === 2026 && (
      s.includes('NÃO LOCALIZADO') || s.includes('NECESSITA') ||
      s.includes('DESATUALIZADO') || s.includes('A CONFIRMAR')
    )) return false;
    return true;
  }

  function sortedFreq(values) {
    const order = ['1x','2x','3x','4x','5x','6x','Livre','Plano mensal','Conforme equipe'];
    return [...values].sort((a,b) => {
      const ia = order.indexOf(a), ib = order.indexOf(b);
      if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      return String(a).localeCompare(String(b), 'pt-BR');
    });
  }

  function setOptions(el, values, preferred, fallback) {
    if (!el) return { changed:false, value:null };
    const before = el.value;
    el.innerHTML = '';
    values.forEach(v => {
      const o = document.createElement('option');
      o.value = String(v);
      o.textContent = String(v);
      el.appendChild(o);
    });
    const valStrings = values.map(String);
    let next = valStrings.includes(String(preferred)) ? String(preferred) : null;
    if (!next && fallback && valStrings.includes(String(fallback))) next = String(fallback);
    if (!next) next = valStrings[0] || '';
    el.value = next;
    return { changed: before !== next, value: next };
  }

  let internal = false;

  function rebuildCascade() {
    if (internal) return;
    const yearEl = byId('yearFilter');
    const clubEl = byId('clubFilter');
    const modalityEl = byId('modalityFilter');
    const audienceEl = byId('audienceFilter');
    const freqEl = byId('frequencyFilter');
    if (!yearEl || !clubEl || !modalityEl || !audienceEl || !freqEl) return;

    const year = yearEl.value;
    const previous = {
      club: clubEl.value,
      modality: modalityEl.value,
      audience: audienceEl.value,
      frequency: freqEl.value
    };

    const inYear = records.filter(r => String(r.year) === String(year));
    const clubs = uniq(inYear.map(r => r.club)).sort((a,b) => a.localeCompare(b,'pt-BR'));
    const clubResult = setOptions(clubEl, ['Todos', ...clubs], previous.club, 'Todos');
    const club = clubResult.value;

    const inClub = inYear.filter(r => club === 'Todos' || r.club === club);
    const modalities = uniq(inClub.map(r => r.modality)).filter(x => x && x !== 'Hidrobike').sort((a,b) => a.localeCompare(b,'pt-BR'));
    const modalityResult = setOptions(modalityEl, ['Todas', ...modalities], previous.modality, modalities.includes('Escola de Natação') ? 'Escola de Natação' : 'Todas');
    const modality = modalityResult.value;

    const inModality = inClub.filter(r => modality === 'Todas' || r.modality === modality);
    const audiences = uniq(inModality.map(r => normAudience(r.audience)))
      .filter(x => x && !/a confirmar/i.test(x))
      .sort((a,b) => a.localeCompare(b,'pt-BR'));
    const audienceResult = setOptions(audienceEl, ['Todos', ...audiences], previous.audience, audiences.includes('Sócio') ? 'Sócio' : 'Todos');
    const audience = audienceResult.value;

    const inAudience = inModality.filter(r => audience === 'Todos' || normAudience(r.audience) === audience);
    const frequencies = sortedFreq(uniq(inAudience.map(r => normFreq(r.frequency))).filter(x => x && !/a confirmar/i.test(x)));
    const freqResult = setOptions(freqEl, ['Todas', ...frequencies], previous.frequency, frequencies.includes('2x') ? '2x' : 'Todas');

    const changed = clubResult.changed || modalityResult.changed || audienceResult.changed || freqResult.changed;
    if (changed) {
      internal = true;
      // O listener original do dashboard lê todos os controles e redesenha a tela.
      freqEl.dispatchEvent(new Event('change', { bubbles:true }));
      internal = false;
    }

    setTimeout(renderEvolutionExact, 0);
  }

  function evolutionFilter() {
    const club = byId('clubFilter')?.value === 'Todos' ? 'Caixeiros Viajantes' : byId('clubFilter')?.value;
    return {
      club,
      modality: byId('modalityFilter')?.value || 'Todas',
      audience: byId('audienceFilter')?.value || 'Todos',
      frequency: byId('frequencyFilter')?.value || 'Todas'
    };
  }

  function renderEvolutionExact() {
    const canvas = byId('evolutionChart');
    const summary = byId('evolutionSummary');
    if (!canvas || !summary || typeof Chart === 'undefined') return;

    const f = evolutionFilter();
    const years = [2023, 2024, 2025].filter(y => records.some(r => Number(r.year) === y));

    const points = years.map(year => {
      const rows = records.filter(r =>
        Number(r.year) === year && r.club === f.club &&
        (f.modality === 'Todas' || r.modality === f.modality) &&
        (f.audience === 'Todos' || normAudience(r.audience) === f.audience) &&
        (f.frequency === 'Todas' || normFreq(r.frequency) === f.frequency) &&
        confirmed(r)
      );
      const values = uniq(rows.map(r => r.value).filter(numeric));
      const sourceYear = rows[0]?.sourceFileYear || rows[0]?.researchYear || (year + 1);
      return { year, sourceYear, value: values.length === 1 ? values[0] : null, ambiguous: values.length > 1 };
    });

    const old = Chart.getChart(canvas);
    if (old) old.destroy();
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: points.map(p => p.year),
        datasets: [{
          label: f.club,
          data: points.map(p => p.value),
          borderColor: '#1768ac',
          backgroundColor: '#1768ac',
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: .18,
          spanGaps: false
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false, animation:false,
        plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c => c.raw === null ? 'Sem valor único para este recorte' : money(c.raw)}}},
        scales:{ y:{ticks:{callback:v => `R$ ${v}`,font:{size:10}},grid:{color:'#edf1f5'}}, x:{ticks:{font:{size:10}},grid:{display:false}} }
      }
    });

    summary.innerHTML = '';
    points.forEach((p,i) => {
      const prev = points.slice(0,i).filter(x => numeric(x.value)).pop();
      const change = numeric(p.value) && prev ? p.value / prev.value - 1 : null;
      const d = document.createElement('div');
      d.className = 'evo-card';
      const valueText = p.ambiguous ? 'Mais de um plano no recorte' : numeric(p.value) ? money(p.value) : 'Sem dado para este recorte';
      const changeText = p.ambiguous ? 'Refine os filtros.' : change === null ? 'Sem comparação anterior' : `Variação desde ${prev.year}: ${pct(change)}`;
      d.innerHTML = `<span>${p.year} · Arquivo ${p.sourceYear}</span><strong>${valueText}</strong><span>${changeText}</span>`;
      summary.appendChild(d);
    });
  }

  ['yearFilter','clubFilter','modalityFilter','audienceFilter','frequencyFilter'].forEach(id => {
    byId(id)?.addEventListener('change', () => {
      if (internal) return;
      rebuildCascade();
      setTimeout(renderEvolutionExact, 0);
    });
  });

  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    if (tab.dataset.tab === 'evolution') setTimeout(renderEvolutionExact, 30);
  }));

  rebuildCascade();
  setTimeout(renderEvolutionExact, 20);
})();