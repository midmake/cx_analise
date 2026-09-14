(() => {
  const data = window.DASHBOARD_DATA || {};
  const records = data.records || [];
  const byId = id => document.getElementById(id);
  const numeric = v => typeof v === 'number' && Number.isFinite(v);
  const money = v => Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const uniq = a => [...new Set(a)];
  const normAudience = v => {
    const s=String(v||'').toLowerCase();
    if(s.includes('não sócio')||s.includes('não associado')) return 'Não sócio';
    if(s.includes('associado light')) return 'Associado Light';
    if(s.includes('sócio')||s==='associado') return 'Sócio';
    if(s.includes('público geral')||s==='padrão'||s.includes('preço do serviço')) return 'Público geral';
    return String(v||'');
  };
  const normFreq = v => {
    const s=String(v||'').trim();
    if(/\blivre\b/i.test(s)) return 'Livre';
    const m=s.match(/([1-6])x/i);
    return m?`${m[1]}x`:s;
  };
  const confirmed = r => {
    if(!numeric(r.value)) return false;
    const s=String(r.status||'').toUpperCase();
    return !s.includes('NÃO LOCALIZADO')&&!s.includes('NECESSITA')&&!s.includes('DESATUALIZADO')&&!s.includes('A CONFIRMAR');
  };

  const setText=(sel,text)=>{const el=document.querySelector(sel);if(el)el.textContent=text;};
  setText('.home-heading .eyebrow','ARQUIVO 2026 — ATUALIZADO');
  setText('.home-heading h2','Valores atuais de 2026 — Atividades Aquáticas e Vôlei');
  setText('.home-heading p','Levantamento de mercado com os valores atuais de 2026, mantendo o histórico dos anos anteriores para consulta.');
  setText('.current-reference-card h2','Caixeiros Viajantes — mensalidades atuais de 2026');
  setText('.competitors-current-card h2','Mensalidades atuais de 2026 dos concorrentes');
  setText('.hero__badge strong','2026 — atualizado');
  const checked=byId('currentCheckedAt'); if(checked)checked.textContent='Dados atualizados em 14/09/2026';
  const logic=byId('yearLogic'); if(logic)logic.textContent=data.meta?.yearLogic||'';
  const evoHint=document.querySelector('#evolution .section-head .hint');
  if(evoHint)evoHint.textContent='Histórico disponível por ano da mensalidade: 2023, 2024, 2025 e valores atuais de 2026.';
  const chartNote=document.querySelector('#evolution .chart-note');
  if(chartNote)chartNote.innerHTML='<strong>Legenda:</strong> 2023 = arquivo 2024 · 2024 = arquivo 2025 · 2025 = base anterior · 2026 = arquivo 2026 atual.';

  function select2026(){
    const y=byId('yearFilter');
    if(!y)return;
    if([...y.options].some(o=>o.value==='2026') && y.value!=='2026'){
      y.value='2026';
      y.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  setTimeout(select2026,20);
  byId('resetFilters')?.addEventListener('click',()=>setTimeout(select2026,10));

  function renderEvolution2026(){
    const canvas=byId('evolutionChart'), summary=byId('evolutionSummary');
    if(!canvas||!summary||typeof Chart==='undefined')return;
    const club=byId('clubFilter')?.value==='Todos'?'Caixeiros Viajantes':byId('clubFilter')?.value;
    const modality=byId('modalityFilter')?.value||'Todas';
    const audience=byId('audienceFilter')?.value||'Todos';
    const frequency=byId('frequencyFilter')?.value||'Todas';
    const years=[2023,2024,2025,2026];
    const points=years.map(year=>{
      const rs=records.filter(r=>Number(r.year)===year&&r.club===club&&
        (modality==='Todas'||r.modality===modality)&&
        (audience==='Todos'||normAudience(r.audience)===audience)&&
        (frequency==='Todas'||normFreq(r.frequency)===frequency)&&confirmed(r));
      const vals=uniq(rs.map(r=>r.value).filter(numeric));
      return {year,value:vals.length===1?vals[0]:null,ambiguous:vals.length>1};
    });
    const old=Chart.getChart(canvas); if(old)old.destroy();
    new Chart(canvas,{
      type:'line',
      data:{labels:points.map(p=>p.year),datasets:[{label:club,data:points.map(p=>p.value),borderColor:'#1768ac',backgroundColor:'#1768ac',pointRadius:5,pointHoverRadius:7,tension:.18,spanGaps:false}]},
      options:{responsive:true,maintainAspectRatio:false,animation:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.raw===null?'Sem valor único para este recorte':money(c.raw)}}},scales:{y:{ticks:{callback:v=>'R$ '+v,font:{size:10}},grid:{color:'#edf1f5'}},x:{ticks:{font:{size:10}},grid:{display:false}}}}
    });
    summary.innerHTML='';
    points.forEach((p,i)=>{
      const prev=points.slice(0,i).filter(x=>numeric(x.value)).pop();
      const change=numeric(p.value)&&prev?p.value/prev.value-1:null;
      const d=document.createElement('div');d.className='evo-card';
      const value=p.ambiguous?'Mais de um plano no recorte':numeric(p.value)?money(p.value):'Sem dado para este recorte';
      const delta=p.ambiguous?'Refine modalidade, público ou frequência.':change===null?'Sem comparação anterior':`Variação desde ${prev.year}: ${(change*100).toFixed(1).replace('.',',')}%`;
      d.innerHTML=`<span>${p.year}</span><strong>${value}</strong><span>${delta}</span>`;
      summary.appendChild(d);
    });
  }

  ['yearFilter','clubFilter','modalityFilter','audienceFilter','frequencyFilter'].forEach(id=>byId(id)?.addEventListener('change',()=>setTimeout(renderEvolution2026,30)));
  document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{if(t.dataset.tab==='evolution')setTimeout(renderEvolution2026,40);}));
  setTimeout(renderEvolution2026,80);

  function rebuildPosition(){
    const old=document.querySelector('.caixeiros-position-card');
    if(!old)return;
    const fresh=old.cloneNode(false);
    fresh.className='card caixeiros-position-card position-filter-card';
    fresh.innerHTML=`
      <div class="position-filter-head">
        <div><span class="eyebrow dark">POSIÇÃO DO CAIXEIROS</span><h2>Caixeiros Viajantes em relação ao mercado</h2></div>
        <div class="position-controls">
          <div class="position-control"><label for="positionModality2026">Modalidade</label><select id="positionModality2026"><option value="natacao">Natação</option><option value="volei">Vôlei</option></select></div>
          <div class="position-control"><label for="positionFrequency2026">Frequência</label><select id="positionFrequency2026"><option value="1x">1 vez por semana</option><option value="2x" selected>2 vezes por semana</option><option value="3x">3 vezes por semana</option><option value="4x">4 vezes por semana</option><option value="5x">5 vezes por semana</option><option value="Livre">Livre</option></select></div>
        </div>
      </div>
      <div class="position-results"><section class="position-result" data-aud="Sócio"></section><section class="position-result" data-aud="Não sócio"></section></div>
      <p class="position-filter-note">Comparação de 2026. Só entram valores com modalidade, público e frequência equivalentes. Clubes com mais de um plano diferente no mesmo recorte não recebem uma posição única.</p>`;
    old.replaceWith(fresh);

    function rowsFor(mod,freq,aud){
      return records.filter(r=>Number(r.year)===2026&&confirmed(r)&&normAudience(r.audience)===aud&&normFreq(r.frequency)===freq&&
        (mod==='natacao'?r.modality==='Escola de Natação':r.modality==='Vôlei'&&!String(r.type||'').toLowerCase().includes('equipe')));
    }
    function uniqueClubValues(rs){
      const m=new Map();
      rs.forEach(r=>{if(!m.has(r.club))m.set(r.club,new Set());m.get(r.club).add(r.value);});
      return [...m.entries()].filter(([,v])=>v.size===1).map(([club,v])=>({club,value:[...v][0]}));
    }
    function draw(aud){
      const target=fresh.querySelector(`[data-aud="${aud}"]`);
      const mod=byId('positionModality2026').value,freq=byId('positionFrequency2026').value;
      const values=uniqueClubValues(rowsFor(mod,freq,aud));
      const caix=values.find(x=>x.club==='Caixeiros Viajantes');
      const comp=values.filter(x=>x.club!=='Caixeiros Viajantes').sort((a,b)=>a.value-b.value);
      if(!caix){target.innerHTML=`<span class="position-result-title">${aud}</span><div class="position-no-data">Sem valor confirmado do Caixeiros neste recorte.</div>`;return;}
      let pos='Sem posição única';
      if(comp.length){const ord=[caix,...comp].sort((a,b)=>a.value-b.value);pos=`${ord.findIndex(x=>x.club==='Caixeiros Viajantes')+1}º de ${ord.length}`;}
      const base=comp.length?comp.map(x=>`${x.club} ${money(x.value)}`).join(' · '):'Sem concorrente com valor único comparável.';
      target.innerHTML=`<span class="position-result-title">${aud}</span><div class="position-value-row"><strong class="position-price">${money(caix.value)}</strong><b class="position-rank-clean">${pos}</b></div><div class="position-base-line">${base}</div>`;
    }
    const upd=()=>{draw('Sócio');draw('Não sócio');};
    byId('positionModality2026').addEventListener('change',upd);
    byId('positionFrequency2026').addEventListener('change',upd);
    upd();
  }
  setTimeout(rebuildPosition,120);
})();