(() => {
  const style=document.createElement('style');
  style.textContent=`.historical-files-card{margin-bottom:14px}.historical-files-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.historical-file-link{display:flex;flex-direction:column;gap:4px;padding:13px 14px;border:1px solid #dfe6ed;border-radius:12px;background:#f8fafc;color:#0b1f33;text-decoration:none}.historical-file-link:hover{border-color:#8eb3ca;background:#f2f8fb}.historical-file-link strong{font-size:13px}.historical-file-link span{font-size:11px;color:#66717d}.audience-compare{display:grid;grid-template-columns:1fr 1fr;gap:8px}.audience-block{border-top:1px solid #e7edf2;padding-top:8px}.audience-title{display:block;font-size:9px;font-weight:800;letter-spacing:.5px;color:#66717d;margin-bottom:2px}.historical-source-link{font-weight:700;color:#1768ac;text-decoration:none}@media(max-width:800px){.historical-files-grid,.audience-compare{grid-template-columns:1fr}}`;
  document.head.appendChild(style);

  const dataPanel=document.querySelector('#data');
  document.querySelector('.historical-files-card')?.remove();
  if(dataPanel){
    const card=document.createElement('article');
    card.className='card historical-files-card';
    card.innerHTML=`<div class="section-head"><div><span class="eyebrow dark">ARQUIVOS ORIGINAIS</span><h2>Fontes históricas em Excel</h2></div><span class="hint">Arquivos enviados e usados como fonte dos anos anteriores.</span></div><div class="historical-files-grid"><a class="historical-file-link" href="downloads/PESQUISA_MENSALIDADES_NATACAO_2024.xlsx" download><strong>Arquivo 2024</strong><span>Mensalidades praticadas em 2023 · baixar Excel original</span></a><a class="historical-file-link" href="downloads/VALORES_CLUBES.xlsx" download><strong>Arquivo 2025</strong><span>Mensalidades praticadas em 2024 · baixar Excel original</span></a></div>`;
    dataPanel.insertAdjacentElement('afterbegin',card);
  }

  function patchSources(){
    document.querySelectorAll('#dataTable tbody tr').forEach(row=>{
      const c=row.querySelectorAll('td'); if(c.length<10)return;
      const origin=c[1].textContent||'';
      if(origin.includes('2024')) c[9].innerHTML='<a class="historical-source-link" href="downloads/PESQUISA_MENSALIDADES_NATACAO_2024.xlsx" download>Baixar Excel original — Arquivo 2024</a>';
      if(origin.includes('2025')) c[9].innerHTML='<a class="historical-source-link" href="downloads/VALORES_CLUBES.xlsx" download>Baixar Excel original — Arquivo 2025</a>';
    });
  }
  patchSources();
  const body=document.querySelector('#dataTable tbody'); if(body)new MutationObserver(patchSources).observe(body,{childList:true,subtree:true});
})();