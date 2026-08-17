(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ensure=(id,patch={})=>{let p=byId(id);if(!p){p=normalize({id,fullName:patch.fullName||id,surname:'Bandiguptapu',parents:[],children:[],spouses:[],related:[],confidence:'familyrecord'});people.push(p)}Object.assign(p,Object.fromEntries(Object.entries(patch).filter(([k,v])=>!['parents','children','spouses','related'].includes(k)&&v!==undefined)));for(const k of ['parents','children','spouses','related'])if(patch[k])p[k]=uniq([...(p[k]||[]),...patch[k]]);return p};
  const link=(parent,children)=>{const p=ensure(parent);for(const cid of children){const c=ensure(cid);p.children=uniq([...(p.children||[]),cid]);c.parents=uniq([...(c.parents||[]),parent]);c.sourceAudit='pdf-connector-verified';}p.sourceAudit='pdf-connector-verified';};

  // Generation 1: root shown in the source chart.
  ensure('narasappa',{fullName:'Narasappa',surname:'Bandiguptapu',generationHint:0,parents:[],sourceAudit:'pdf-connector-verified',sourceNote:'Original genealogy connector hierarchy — root generation.'});

  // Generation 2: four sons directly connected to Narasappa.
  const gen2=[
    ['hist-reddappa-1','Reddappa'],['hist-perappa-2','Perappa'],['hist-achappa-1','Achappa'],['hist-venkappa-3','Venkappa']
  ];
  for(const [id,n] of gen2)ensure(id,{fullName:n,generationHint:1,branchGroup:'Narasappa sons',sourceAudit:'pdf-connector-verified'});
  link('narasappa',gen2.map(x=>x[0]));

  // Generation 3: the next blue boxes are grouped by the connector emerging from each son.
  // Reddappa branch (three visible children in the chart/order).
  ensure('hist-venkatrayudu-2',{fullName:'Venkatrayudu',generationHint:2});
  ensure('hist-nagappa-1',{fullName:'Nagappa',generationHint:2});
  ensure('hist-venkatesh-1',{fullName:'Venkatesh',generationHint:2,occupation:'Pettandar / local authority'});
  link('hist-reddappa-1',['hist-venkatrayudu-2','hist-nagappa-1','hist-venkatesh-1']);

  // Perappa branch.
  ensure('hist-paramesh-1',{fullName:'Paramesh',generationHint:2,occupation:'Agriculture'});
  ensure('hist-paddappa-2',{fullName:'Paddappa',generationHint:2});
  link('hist-perappa-2',['hist-paramesh-1','hist-paddappa-2']);

  // Achappa branch.
  ensure('hist-ramappa-3',{fullName:'Ramappa',generationHint:2});
  ensure('hist-narasappa-3',{fullName:'Narasappa',generationHint:2,occupation:'Senadhipathi at Devaguptam fort (as recorded)'});
  link('hist-achappa-1',['hist-ramappa-3','hist-narasappa-3']);

  // Venkappa branch.
  ensure('hist-ramappa-4',{fullName:'Ramappa',generationHint:2});
  ensure('hist-narasappa-4',{fullName:'Narasappa',generationHint:2});
  ensure('hist-nagappa-2',{fullName:'Nagappa',generationHint:2});
  link('hist-venkappa-3',['hist-ramappa-4','hist-narasappa-4','hist-nagappa-2']);

  // A later migration branch in the PDF is headed by Venkappa, followed by eight children on a common connector.
  ensure('hist-venkappa-4',{fullName:'Venkappa',generationHint:2,branchGroup:'Peddapuram migration branch',sourceAudit:'pdf-connector-verified'});
  const mig1=[
    ['hist-paddappa-3','Paddappa'],['hist-narasappa-5','Narasappa'],['hist-subbappa-2','Subbappa'],['hist-devappa-2','Devappa'],
    ['hist-nagappa-3','Nagappa'],['hist-timmappa-1','Timmappa'],['hist-reddappa-2','Reddappa'],['hist-peddappa-1','Peddappa']
  ];
  for(const [id,n] of mig1)ensure(id,{fullName:n,generationHint:3,branchGroup:'Peddapuram migration branch'});
  link('hist-venkappa-4',mig1.map(x=>x[0]));

  // Nuzvid cohort shown on one generation line. The PDF indicates these are a sibling-generation group;
  // upstream connector is retained as cohort rather than inventing a father where the crop is ambiguous.
  const nuz=[
    ['hist-peddappa-2','Peddappa'],['hist-venkappa-5','Venkappa'],['hist-ramappa-5','Ramappa'],['hist-rajappa-2','Rajappa'],
    ['hist-nagappa-4','Nagappa'],['hist-timmappa-2','Timmappa'],['hist-venkappa-6','Venkappa'],['hist-rajappa-3','Rajappa']
  ];
  for(const [id,n] of nuz)ensure(id,{fullName:n,generationHint:3,branchGroup:'Nuzvid fort migration branch',sourceAudit:'pdf-sibling-cohort'});
  for(const [id] of nuz){const p=byId(id);p.related=uniq([...(p.related||[]),...nuz.map(x=>x[0]).filter(x=>x!==id)]);}

  // Peddapuram Maharaja Sardar cohort from the next source section.
  const sardars=[
    ['hist-rajappa-4','Rajappa'],['hist-simhadrappa-1','Simhadrappa'],['hist-jagatappa-1','Jagatappa'],['hist-sattappa-1','Sattappa'],
    ['hist-ramappa-6','Ramappa'],['hist-narasappa-6','Narasappa'],['hist-venkappa-7','Venkappa'],['hist-paddayya-1','Paddayya'],['hist-narasayya-1','Narasayya']
  ];
  for(const [id,n] of sardars)ensure(id,{fullName:n,generationHint:3,branchGroup:'Peddapuram Maharaja Sardar branch',sourceAudit:'pdf-sibling-cohort'});
  for(const [id] of sardars){const p=byId(id);p.related=uniq([...(p.related||[]),...sardars.map(x=>x[0]).filter(x=>x!==id)]);}

  // The audited Allavaram/modern branch remains linked generation-by-generation by relationship-integrity.js.
  // Mark all existing imported records with an explicit audit status so the UI never implies unmapped = verified.
  for(const p of people){
    if(!p.sourceAudit && String(p.id).startsWith('hist-'))p.sourceAudit='pdf-structure-pending';
  }

  // Recalculate generation hints from mapped ancestors where possible, while preserving known modern generation values.
  const depth=(p,seen=new Set())=>{if(!p||seen.has(p.id))return Number.isFinite(+p.generationHint)?+p.generationHint:0;seen.add(p.id);if(!(p.parents||[]).length)return Number.isFinite(+p.generationHint)?+p.generationHint:0;return 1+Math.max(...p.parents.map(id=>depth(byId(id),new Set(seen))))};
  for(const p of people){if(p.sourceAudit==='pdf-connector-verified')p.generationHint=depth(p);}

  // Persist and expose a root-navigation helper.
  window.goToFirstGeneration=()=>selectPerson('narasappa',true);
  try{sset(KEY,JSON.stringify({version:10,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true,pdfConnectorHierarchy:true}))}catch(e){}

  const nav=document.createElement('button');nav.textContent='⇡ Narasappa';nav.title='Go to first generation';nav.style.cssText='position:fixed;left:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:45;border:1px solid rgba(243,201,120,.32);background:linear-gradient(135deg,rgba(55,34,14,.94),rgba(25,20,17,.94));color:#ffd992;border-radius:999px;padding:8px 11px;font:800 11px system-ui;box-shadow:0 10px 30px rgba(0,0,0,.25)';nav.onclick=goToFirstGeneration;document.body.appendChild(nav);

  try{if(typeof repairRelationships==='function')repairRelationships(true)}catch(e){}
  try{render()}catch(e){console.error('PDF hierarchy render',e)}
})();