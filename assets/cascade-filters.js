(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const byId = id => document.getElementById(id);
  const numeric = v => typeof v === 'number' && Number.isFinite(v);
  const uniq = a => [...new Set(a.filter(v => v !== null && v !== undefined && v !== ''))];
  const money = v => numeric(v) ? v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : '';
  const pct = v => `${v >= 0 ? '+' : ''}${(v*100).toFixed(1).replace('.',',')}%`;

  const normAudience = v => {
    const s=String(v||'').trim(), l=s.toLowerCase();
    if(l.includes('associado light')) return 'Associado Light';
    if(l.includes('não sócio')||l.includes('não associado')) return 'Não sócio';
    if(l.includes('sócio')||l==='associado') return 'Sócio';
    return s;
  };
  const normFreq = v => {
    const s=String(v||'').trim();
    if(/livre/i.test(s)) return 'Livre';
    const m=s.match(/([1-6])x/i); return m?`${m[1]}x`:s;
  };
  const confirmed = r => numeric(r.value) && !/DESATUALIZADO|NÃO LOCALIZADO|NECESSITA|A CONFIRMAR/i.test(String(r.status||''));
  const freqOrder={'1x':1,'2x':2,'3x':3,'4x':4,'5x':5,'6x':6,'Livre':7,'Não informado':8,'Conforme equipe':9};
  const sortFreq = a => [...a].sort((x,y)=>(freqOrder[x]||99)-(freqOrder[y]||99)||String(x).localeCompare(String(y),'pt-BR'));

  function setOptions(el, values, preferred, fallback){
    if(!el) return '';
    const valid=values.map(String);
    el.innerHTML=values.map(v=>`<option value="${String(v).replaceAll('"','&quot;')}">${v}</option>`).join('');
    const next=valid.includes(String(preferred))?String(preferred):(valid.includes(String(fallback))?String(fallback):(valid[0]||''));
    el.value=next; return next;
  }

  let internal=false;
  function rebuild(){
    if(internal) return;
    const yearEl=byId('yearFilter'), clubEl=byId('clubFilter'), modEl=byId('modalityFilter'), audEl=byId('audienceFilter'), freqEl=byId('frequencyFilter');
    if(!yearEl||!clubEl||!modEl||!audEl||!freqEl) return;
    const prev={club:clubEl.value,mod:modEl.value,aud:audEl.value,freq:freqEl.value};
    const year=yearEl.value;
    const inYear=records.filter(r=>String(r.year)===String(year));
    const clubs=uniq(inYear.map(r=>r.club)).sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const club=setOptions(clubEl,['Todos',...clubs],prev.club,'Todos');

    const inClub=inYear.filter(r=>club==='Todos'||r.club===club);
    const mods=uniq(inClub.map(r=>r.modality)).filter(x=>x&&x!=='Hidrobike').sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const mod=setOptions(modEl,['Todas',...mods],prev.mod,mods.includes('Escola de Natação')?'Escola de Natação':'Todas');

    const inMod=inClub.filter(r=>mod==='Todas'||r.modality===mod);
    const auds=uniq(inMod.map(r=>normAudience(r.audience))).filter(x=>x&&!/a confirmar/i.test(x)).sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const aud=setOptions(audEl,['Todos',...auds],prev.aud,auds.includes('Sócio')?'Sócio':'Todos');

    const inAud=inMod.filter(r=>aud==='Todos'||normAudience(r.audience)===aud);
    const freqs=sortFreq(uniq(inAud.map(r=>normFreq(r.frequency))).filter(x=>x&&!/a confirmar/i.test(x)));
    setOptions(freqEl,['Todas',...freqs],prev.freq,freqs.includes('2x')?'2x':'Todas');

    internal=true;
    freqEl.dispatchEvent(new Event('change',{bubbles:true}));
    internal=false;
    setTimeout(renderEvolution,0);
  }

  function renderEvolution(){
    const canvas=byId('evolutionChart'), summary=byId('evolutionSummary');
    if(!canvas||!summary||typeof Chart==='undefined') return;
    const club=byId('clubFilter')?.value==='Todos'?'Caixeiros Viajantes':byId('clubFilter')?.value;
    const mod=byId('modalityFilter')?.value||'Todas';
    const aud=byId('audienceFilter')?.value||'Todos';
    const freq=byId('frequencyFilter')?.value||'Todas';
    const years=uniq(records.map(r=>Number(r.year)).filter(Number.isFinite)).sort((a,b)=>a-b);

    const pts=years.map(year=>{
      const rs=records.filter(r=>Number(r.year)===year&&r.club===club&&(mod==='Todas'||r.modality===mod)&&(aud==='Todos'||normAudience(r.audience)===aud)&&(freq==='Todas'||normFreq(r.frequency)===freq)&&confirmed(r));
      const vals=uniq(rs.map(r=>r.value).filter(numeric));
      return {year,value:vals.length===1?vals[0]:null,ambiguous:vals.length>1,sourceYear:rs[0]?.sourceFileYear||rs[0]?.researchYear};
    });

    const old=Chart.getChart(canvas); if(old) old.destroy();
    new Chart(canvas,{type:'line',data:{labels:pts.map(p=>p.year),datasets:[{label:club,data:pts.map(p=>p.value),borderColor:'#1768ac',backgroundColor:'#1768ac',pointRadius:5,pointHoverRadius:7,tension:.18,spanGaps:false}]},options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.raw===null?'Sem valor único para este recorte':money(c.raw)}}},scales:{y:{ticks:{callback:v=>'R$ '+v,font:{size:10}},grid:{color:'#edf1f5'}},x:{ticks:{font:{size:10}},grid:{display:false}}}}});

    summary.innerHTML='';
    pts.forEach((p,i)=>{
      const prev=pts.slice(0,i).filter(x=>numeric(x.value)).pop();
      const change=numeric(p.value)&&prev?p.value/prev.value-1:null;
      const d=document.createElement('div'); d.className='evo-card';
      const valueText=p.ambiguous?'Mais de um plano no recorte':numeric(p.value)?money(p.value):'Sem dado para este recorte';
      const changeText=p.ambiguous?'Refine os filtros.':change===null?'Sem comparação anterior':`Variação desde ${prev.year}: ${pct(change)}`;
      const source=p.sourceYear?` · Arquivo ${p.sourceYear}`:'';
      d.innerHTML=`<span>${p.year}${source}</span><strong>${valueText}</strong><span>${changeText}</span>`;
      summary.appendChild(d);
    });
  }

  ['yearFilter','clubFilter','modalityFilter','audienceFilter','frequencyFilter'].forEach(id=>byId(id)?.addEventListener('change',()=>{if(internal)return;rebuild();setTimeout(renderEvolution,0);}));
  document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{if(tab.dataset.tab==='evolution')setTimeout(renderEvolution,30);}));
  rebuild(); setTimeout(renderEvolution,20);
})();