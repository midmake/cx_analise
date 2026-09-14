(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const oldCard = document.querySelector('.caixeiros-position-card');
  if (!oldCard) return;

  const css = document.createElement('style');
  css.textContent = `
    .position-filter-card{padding:18px;border:1px solid #aac9dc;background:linear-gradient(135deg,#fafdff,#f2f8fc)}
    .position-filter-head{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:16px}
    .position-filter-head h2{margin:3px 0 0;font-size:20px;color:#0b1f33}
    .position-controls{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
    .position-control{display:flex;flex-direction:column;gap:5px}
    .position-control label{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#65727d}
    .position-control select{min-width:155px;padding:9px 30px 9px 10px;border:1px solid #cfdce5;border-radius:9px;background:#fff;color:#0b1f33;font-weight:700;font-size:12px}
    .position-results{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .position-result{background:#fff;border:1px solid #dce7ee;border-radius:12px;padding:14px}
    .position-result-title{display:block;font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#60717e;margin-bottom:8px}
    .position-value-row{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:7px}
    .position-price{font-size:25px;line-height:1;font-weight:800;color:#0b1f33;white-space:nowrap}
    .position-rank-clean{font-size:13px;font-weight:800;color:#1768ac;text-align:right}
    .position-market-line{font-size:11px;line-height:1.4;color:#425869;margin-top:5px}
    .position-base-line{font-size:9.5px;line-height:1.4;color:#74808a;margin-top:7px;padding-top:7px;border-top:1px solid #edf1f4}
    .position-no-data{font-size:13px;font-weight:700;color:#687681;padding:8px 0}
    .position-filter-note{margin:10px 2px 0;font-size:10px;color:#687681;line-height:1.4}
    @media(max-width:850px){.position-filter-head{display:block}.position-controls{margin-top:12px}.position-results{grid-template-columns:1fr}.position-control{flex:1}.position-control select{width:100%;min-width:0}}
  `;
  document.head.appendChild(css);

  const card = document.createElement('article');
  card.className = 'card caixeiros-position-card position-filter-card';
  card.innerHTML = `
    <div class="position-filter-head">
      <div><span class="eyebrow dark">POSIÇÃO DO CAIXEIROS</span><h2>Caixeiros Viajantes em relação ao mercado</h2></div>
      <div class="position-controls">
        <div class="position-control"><label for="positionModality">Modalidade</label><select id="positionModality"><option value="natacao">Natação</option><option value="volei">Vôlei</option></select></div>
        <div class="position-control"><label for="positionFrequency">Frequência</label><select id="positionFrequency">
          <option value="1x">1 vez por semana</option><option value="2x" selected>2 vezes por semana</option>
          <option value="3x">3 vezes por semana</option><option value="4x">4 vezes por semana</option>
          <option value="5x">5 vezes por semana</option><option value="Livre">Livre</option>
        </select></div>
      </div>
    </div>
    <div class="position-results"><section class="position-result" data-audience="Sócio"></section><section class="position-result" data-audience="Não sócio"></section></div>
    <p class="position-filter-note">1º = menor mensalidade. Só entram valores de 2026 com modalidade, público e frequência equivalentes. Se um clube tiver mais de um plano no mesmo recorte, ele não entra no ranking até o plano ser selecionado nos filtros.</p>`;
  oldCard.replaceWith(card);

  const money = v => Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2});
  const normAudience = v => {
    const s=String(v||'').toLowerCase();
    if (s.includes('não sócio')||s.includes('não associado')) return 'Não sócio';
    if (s.includes('sócio')||s==='associado') return 'Sócio';
    return String(v||'');
  };
  const normFreq = v => {
    const s=String(v||'').trim();
    if (/livre/i.test(s)) return 'Livre';
    const m=s.match(/([1-5])x/i); return m?`${m[1]}x`:s;
  };
  const valid = r => Number(r.year)===2026 && typeof r.value==='number' && isFinite(r.value) &&
    !/DESATUALIZADO|NÃO LOCALIZADO|NECESSITA|A CONFIRMAR/i.test(String(r.status||''));
  const modalityMatch = (r,m) => m==='natacao'
    ? r.modality==='Escola de Natação'
    : (r.modality==='Escola de Vôlei' || r.modality==='Vôlei');
  const median = xs => { const a=[...xs].sort((x,y)=>x-y); if(!a.length)return null; const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };

  function uniqueClubValues(rows){
    const g=new Map();
    rows.forEach(r=>{ if(!g.has(r.club))g.set(r.club,new Set()); g.get(r.club).add(r.value); });
    return [...g.entries()].filter(([,v])=>v.size===1).map(([club,v])=>({club,value:[...v][0]}));
  }

  function renderAudience(audience, modality, frequency){
    const target=card.querySelector(`[data-audience="${audience}"]`);
    const rows=records.filter(r=>valid(r)&&modalityMatch(r,modality)&&normAudience(r.audience)===audience&&normFreq(r.frequency)===frequency);
    const vals=uniqueClubValues(rows);
    const caix=vals.find(x=>x.club==='Caixeiros Viajantes');
    const comp=vals.filter(x=>x.club!=='Caixeiros Viajantes');
    if(!caix){target.innerHTML=`<span class="position-result-title">${audience}</span><div class="position-no-data">Sem valor confirmado do Caixeiros para este recorte.</div>`;return;}
    let rank='Base insuficiente para ranking';
    if(comp.length>=2){const ord=[caix,...comp].sort((a,b)=>a.value-b.value);rank=`${ord.findIndex(x=>x.club==='Caixeiros Viajantes')+1}º de ${ord.length}`;}
    else if(comp.length===1) rank=caix.value<=comp[0].value?'Menor na comparação direta':'Maior na comparação direta';
    const med=median(comp.map(x=>x.value));
    let line=comp.length?`${comp.length} concorrente${comp.length>1?'s':''} comparável${comp.length>1?'eis':''}.`:'Nenhum concorrente equivalente confirmado.';
    if(med!==null){const d=caix.value/med-1;line+=` Mediana: ${money(med)} · Caixeiros ${Math.abs(d*100).toFixed(1).replace('.',',')}% ${d<=0?'abaixo':'acima'}.`;}
    const base=comp.length?comp.sort((a,b)=>a.value-b.value).map(x=>`${x.club} ${money(x.value)}`).join(' · '):'Sem base concorrente confirmada para este recorte.';
    target.innerHTML=`<span class="position-result-title">${audience}</span><div class="position-value-row"><strong class="position-price">${money(caix.value)}</strong><b class="position-rank-clean">${rank}</b></div><div class="position-market-line">${line}</div><div class="position-base-line">${base}</div>`;
  }

  function update(){const m=document.getElementById('positionModality').value;const f=document.getElementById('positionFrequency').value;renderAudience('Sócio',m,f);renderAudience('Não sócio',m,f);}
  document.getElementById('positionModality').addEventListener('change',update);
  document.getElementById('positionFrequency').addEventListener('change',update);
  update();
})();