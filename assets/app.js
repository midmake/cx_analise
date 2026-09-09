(() => {
const DATA = window.DASHBOARD_DATA;
const records = DATA.records || [];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmtMoney = v => typeof v === 'number' ? v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) : '—';
const pct = v => typeof v === 'number' && isFinite(v) ? `${v>=0?'+':''}${(v*100).toFixed(1).replace('.',',')}%` : '—';
const uniq = a => [...new Set(a.filter(v=>v!==null&&v!==undefined&&v!==''))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'));
const numeric = v => typeof v === 'number' && isFinite(v);
const median = arr => { const x=arr.filter(numeric).sort((a,b)=>a-b); if(!x.length)return null; const m=Math.floor(x.length/2); return x.length%2?x[m]:(x[m-1]+x[m])/2; };
const byId = id => document.getElementById(id);

let charts = {};
let state = { year: '2026', club: 'Todos', modality: 'Escola de Natação', audience: 'Sócio', frequency: '2x' };

function normalizeAudience(v){
  if(!v) return '';
  const s=String(v).toLowerCase();
  if(s.includes('não sócio')||s.includes('não associado')) return 'Não sócio';
  if(s.includes('associado light')) return 'Associado Light';
  if(s.includes('sócio')||s==='associado') return 'Sócio';
  return v;
}
function normalizeFreq(v){ if(!v)return ''; const m=String(v).match(/([1-5])x/); return m ? `${m[1]}x` : String(v); }
function isReference(r){return r.club==='Caixeiros Viajantes';}
function matches(r, includeClub=true){
  if(state.year!=='Todos' && String(r.year)!==state.year) return false;
  if(includeClub && state.club!=='Todos' && r.club!==state.club) return false;
  if(state.modality!=='Todas' && r.modality!==state.modality) return false;
  if(state.audience!=='Todos' && normalizeAudience(r.audience)!==state.audience) return false;
  if(state.frequency!=='Todas' && normalizeFreq(r.frequency)!==state.frequency) return false;
  return true;
}
function setSelect(id, values, current){
  const el=byId(id); el.innerHTML='';
  values.forEach(v=>{const o=document.createElement('option');o.value=String(v);o.textContent=String(v);el.appendChild(o)});
  if(values.map(String).includes(String(current))) el.value=String(current);
}
function initFilters(){
  setSelect('yearFilter',['Todos',...uniq(records.map(r=>r.year)).sort((a,b)=>b-a)],state.year);
  setSelect('clubFilter',['Todos',...uniq(records.map(r=>r.club))],state.club);
  setSelect('modalityFilter',['Todas',...uniq(records.map(r=>r.modality)).filter(x=>x!=='Hidrobike')],state.modality);
  setSelect('audienceFilter',['Todos','Sócio','Não sócio','Associado Light'],state.audience);
  setSelect('frequencyFilter',['Todas','1x','2x','3x','4x','5x'],state.frequency);
}
function syncState(){ state.year=byId('yearFilter').value; state.club=byId('clubFilter').value; state.modality=byId('modalityFilter').value; state.audience=byId('audienceFilter').value; state.frequency=byId('frequencyFilter').value; }
function marketRows(){return records.filter(r=>matches(r,false)&&numeric(r.value)&&!isReference(r));}
function caixRows(){return records.filter(r=>matches(r,false)&&numeric(r.value)&&isReference(r));}
function currentKpis(){
  const caix=caixRows()[0] || null; const market=marketRows(); const med=median(market.map(r=>r.value)); const diff=caix&&med?caix.value/med-1:null;
  byId('kpiCaix').textContent=caix?fmtMoney(caix.value):'—';
  byId('kpiCaixLabel').textContent=caix?`${caix.category||caix.modality} · ${caix.audience||''} · ${caix.frequency||''}`:'Sem valor comparável nesse recorte.';
  byId('kpiMedian').textContent=med?fmtMoney(med):'—'; byId('kpiPosition').textContent=diff!==null?pct(diff):'—'; byId('kpiPosition').style.color=diff===null?'':(diff<=0?'#147d64':'#b94343');
  byId('kpiPositionLabel').textContent=diff===null?'Sem amostra suficiente.':(diff<0?'Abaixo da mediana dos concorrentes.':'Acima da mediana dos concorrentes.');
  byId('kpiSample').textContent=String(new Set(market.map(r=>r.club)).size);
}
function renderInsights(){
  const target=byId('executiveReading'); target.innerHTML=''; const caix=caixRows()[0]||null, market=marketRows(), med=median(market.map(r=>r.value));
  const add=(text,kind='')=>{const d=document.createElement('div');d.className=`insight ${kind}`;d.textContent=text;target.appendChild(d)};
  if(caix&&med){ const d=caix.value/med-1; add(`No recorte selecionado, o Caixeiros está em ${fmtMoney(caix.value)} contra mediana de ${fmtMoney(med)}. Isso representa ${Math.abs(d*100).toFixed(1).replace('.',',')}% ${d<=0?'abaixo':'acima'} da mediana.`, d<=0?'good':'warn'); }
  else add('Não há amostra numérica suficiente para calcular a posição do Caixeiros nesse recorte.','warn');
  add(`${new Set(market.map(r=>r.club)).size} concorrente(s) têm preço numérico comparável no recorte atual. Dados ausentes continuam visíveis como pendência, em vez de serem estimados.`);
  if(state.year==='2024'||state.year==='Todos') add(DATA.meta.warning2024,'warn');
  if(state.modality==='Vôlei') add('Vôlei é modalidade nova na análise: escola, equipe e atividade adulta são mantidas separadas quando a fonte permite.');
}
function chartOrFallback(canvasId,fallbackId,config){
  const fb=byId(fallbackId), cv=byId(canvasId);
  if(typeof Chart==='undefined'){fb.classList.remove('hidden');fb.textContent='Gráfico disponível quando a página estiver online com acesso ao Chart.js.';cv.classList.add('hidden');return;}
  fb.classList.add('hidden');cv.classList.remove('hidden'); if(charts[canvasId]) charts[canvasId].destroy(); charts[canvasId]=new Chart(cv,config);
}
function rankingData(){ const grouped={}; records.filter(r=>matches(r,false)&&numeric(r.value)).forEach(r=>{if(grouped[r.club]===undefined) grouped[r.club]=r.value}); return Object.entries(grouped).sort((a,b)=>a[1]-b[1]); }
function renderRanking(){
  const rows=rankingData();
  chartOrFallback('rankingChart','rankingFallback',{type:'bar',data:{labels:rows.map(x=>x[0]),datasets:[{label:'Mensalidade',data:rows.map(x=>x[1]),backgroundColor:rows.map(x=>x[0]==='Caixeiros Viajantes'?'#1768ac':'#9fb7c8'),borderRadius:7}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmtMoney(c.raw)}}},scales:{x:{ticks:{callback:v=>'R$ '+v},grid:{color:'#edf1f5'}},y:{grid:{display:false}}},onClick:(evt,els)=>{if(els.length){state.club=rows[els[0].index][0];byId('clubFilter').value=state.club;renderAll();}}}});
}
function renderCompare(){
  const rows=rankingData();
  chartOrFallback('compareChart','compareFallback',{type:'bar',data:{labels:rows.map(x=>x[0]),datasets:[{label:'Valor',data:rows.map(x=>x[1]),backgroundColor:rows.map(x=>x[0]==='Caixeiros Viajantes'?'#0b1f33':'#2b9fc7'),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmtMoney(c.raw)}}},scales:{y:{ticks:{callback:v=>'R$ '+v},grid:{color:'#edf1f5'}},x:{grid:{display:false}}}}});
  const tbody=$('#compareTable tbody');tbody.innerHTML='';
  records.filter(r=>matches(r,false)).sort((a,b)=>(b.value||-1)-(a.value||-1)).forEach(r=>{const tr=document.createElement('tr');tr.innerHTML=`<td><strong>${r.club}</strong></td><td>${r.modality}</td><td>${r.category||'—'}</td><td>${r.audience||'—'}</td><td>${r.frequency||'—'}</td><td class="price">${fmtMoney(r.value)}</td><td class="status">${r.status||'—'}</td>`;tbody.appendChild(tr)});
}
function evolutionRows(){ const club=state.club==='Todos'?'Caixeiros Viajantes':state.club; return records.filter(r=>r.club===club && (state.modality==='Todas'||r.modality===state.modality) && (state.audience==='Todos'||normalizeAudience(r.audience)===state.audience) && (state.frequency==='Todas'||normalizeFreq(r.frequency)===state.frequency) && numeric(r.value)); }
function renderEvolution(){
  const rows=evolutionRows(), years=[2024,2025,2026], club=state.club==='Todos'?'Caixeiros Viajantes':state.club; const vals=years.map(y=>{const rs=rows.filter(r=>r.year===y);return rs.length?rs[0].value:null});
  chartOrFallback('evolutionChart','evolutionFallback',{type:'line',data:{labels:years,datasets:[{label:club,data:vals,borderColor:'#1768ac',backgroundColor:'#1768ac',pointRadius:6,pointHoverRadius:8,tension:.22,spanGaps:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>c.raw===null?'Sem dado':fmtMoney(c.raw)}}},scales:{y:{ticks:{callback:v=>'R$ '+v},grid:{color:'#edf1f5'}},x:{grid:{display:false}}}}});
  const box=byId('evolutionSummary');box.innerHTML=''; years.forEach((y,i)=>{const v=vals[i];let change=null;if(i>0&&numeric(vals[i-1])&&numeric(v))change=v/vals[i-1]-1;const d=document.createElement('div');d.className='evo-card';d.innerHTML=`<span>${y}${y===2024?' · provisório':''}</span><strong>${fmtMoney(v)}</strong><span>${change===null?'Sem comparação anual':`Variação: ${pct(change)}`}</span>`;box.appendChild(d)});
}
function renderClubCards(){
  const clubs=uniq(records.filter(r=>state.year==='Todos'||String(r.year)===state.year).map(r=>r.club)), box=byId('clubCards');box.innerHTML='';
  clubs.forEach(c=>{const rs=records.filter(r=>r.club===c&&(state.year==='Todos'||String(r.year)===state.year));const priced=rs.filter(r=>numeric(r.value)).length;const d=document.createElement('button');d.className=`club-card ${c==='Caixeiros Viajantes'?'reference':''}`;d.innerHTML=`<strong>${c}</strong><small>${priced} preço(s) numérico(s)</small>`;d.onclick=()=>{state.club=c;byId('clubFilter').value=c;$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='data'));$$('.tab-panel').forEach(x=>x.classList.toggle('active',x.id==='data'));renderAll();};box.appendChild(d)});
}
function renderData(){
  const tbody=$('#dataTable tbody');tbody.innerHTML=''; records.filter(r=>matches(r,true)).slice(0,500).forEach(r=>{const src=r.source?`<a class="source-link" href="${r.source}" target="_blank" rel="noopener">abrir</a>`:'—';const tr=document.createElement('tr');tr.innerHTML=`<td>${r.year}</td><td><strong>${r.club}</strong></td><td>${r.modality}</td><td>${r.type||''}${r.category?` · ${r.category}`:''}</td><td>${r.audience||'—'}</td><td>${r.frequency||'—'}</td><td class="price">${fmtMoney(r.value)}</td><td class="status">${r.status||'—'}</td><td>${src}</td>`;tbody.appendChild(tr)});
}
function renderContacts(){
  const box=byId('contactsList');box.innerHTML=''; (DATA.contacts||[]).forEach(c=>{const club=c['Clube']||c['CLUBE']||Object.values(c)[0];const ask=c['O que perguntar / confirmar']||c['O QUE PERGUNTAR / CONFIRMAR']||'';const tel=c['Telefone']||c['TELEFONE']||'';const wa=c['WhatsApp']||c['WHATSAPP']||'';const mail=c['E-mail']||c['E-MAIL']||'';const d=document.createElement('div');d.className='contact';d.innerHTML=`<strong>${club}</strong><p>${ask||'Pendência de confirmação.'}</p><div class="channels">${tel?`<span>☎ ${tel}</span>`:''}${wa?`<span>WhatsApp ${wa}</span>`:''}${mail?`<span>✉ ${mail}</span>`:''}</div>`;box.appendChild(d)});
}
function renderSourceStats(){
  const box=byId('sourceStats');box.innerHTML=''; const total=(DATA.sources||[]).length; const current=records.filter(r=>r.year===2026&&String(r.status||'').includes('ATUAL')).length; const pending=records.filter(r=>r.year===2026&&(String(r.status||'').includes('NÃO LOCALIZADO')||String(r.status||'').includes('NECESSITA'))).length;
  [[total,'fontes registradas'],[current,'registros atuais'],[pending,'registros pendentes'],[new Set(records.filter(r=>r.year===2026).map(r=>r.club)).size,'instituições 2026']].forEach(([n,l])=>{const d=document.createElement('div');d.className='stat';d.innerHTML=`<strong>${n}</strong><span>${l}</span>`;box.appendChild(d)});
}
function exportCsv(){ const rs=records.filter(r=>matches(r,true)); const cols=['year','club','modality','type','category','audience','frequency','value','status','quality','note','source']; const esc=v=>`"${String(v??'').replaceAll('"','""')}"`; const csv=[cols.join(';'),...rs.map(r=>cols.map(c=>esc(r[c])).join(';'))].join('\n'); const blob=new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='analise_mercado_recorte.csv';a.click();URL.revokeObjectURL(a.href); }
function renderWarning(){const w=byId('warning2024');if(state.year==='2024'||state.year==='Todos'){w.textContent=DATA.meta.warning2024;w.classList.remove('hidden')}else w.classList.add('hidden')}
function renderAll(){syncState();currentKpis();renderWarning();renderInsights();renderRanking();renderCompare();renderEvolution();renderClubCards();renderData();}
function bind(){
  ['yearFilter','clubFilter','modalityFilter','audienceFilter','frequencyFilter'].forEach(id=>byId(id).addEventListener('change',renderAll));
  byId('resetFilters').onclick=()=>{state={year:'2026',club:'Todos',modality:'Escola de Natação',audience:'Sócio',frequency:'2x'};initFilters();renderAll();}; byId('exportCsv').onclick=exportCsv;
  $$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===t));$$('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===t.dataset.tab));setTimeout(()=>{Object.values(charts).forEach(c=>c.resize())},30)});
}
byId('updatedAt').textContent=DATA.meta.updated; initFilters();bind();renderContacts();renderSourceStats();renderAll();
})();
