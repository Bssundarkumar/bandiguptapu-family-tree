(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ensure=(id,patch={})=>{let p=byId(id);if(!p){p=normalize({id,fullName:patch.fullName||id,surname:'Bandiguptapu',parents:[],children:[],spouses:[],related:[],confidence:'familyrecord'});people.push(p)}for(const [k,v] of Object.entries(patch)){if(['parents','children','spouses','related'].includes(k)){if(v)p[k]=uniq([...(p[k]||[]),...v]);}else if(v!==undefined)p[k]=v;}return p};
  const remove=(arr,id)=>(arr||[]).filter(x=>x!==id);
  const link=(parent,children)=>{const p=ensure(parent);for(const cid of children){const c=ensure(cid);p.children=uniq([...(p.children||[]),cid]);c.parents=uniq([...(c.parents||[]),parent]);c.sourceAudit='pdf-connector-verified'}p.sourceAudit='pdf-connector-verified'};
  const SOURCE='Original Bandiguptapu genealogy PDF connector hierarchy.';
  const ROOT='hist-venkatrayudu-1';

  ensure(ROOT,{fullName:'Venkatrayudu',surname:'Bandiguptapu',gender:'Male',generationHint:0,parents:[],children:['hist-ramappa-1'],sourceAudit:'pdf-connector-verified',sourceNote:SOURCE+' First generation.'});
  ensure('hist-ramappa-1',{fullName:'Ramappa',surname:'Bandiguptapu',gender:'Male',generationHint:1,parents:[ROOT],sourceAudit:'pdf-connector-verified',sourceNote:SOURCE+' Son of Venkatrayudu.'});
  link(ROOT,['hist-ramappa-1']);

  const oldRoot=byId('narasappa');
  const formerlyMapped=['hist-reddappa-1','hist-perappa-2','hist-achappa-1','hist-venkappa-3'];
  if(oldRoot){oldRoot.children=(oldRoot.children||[]).filter(id=>!formerlyMapped.includes(id));oldRoot.generationHint=Math.max(2,Number.isFinite(+oldRoot.generationHint)?+oldRoot.generationHint:2);oldRoot.sourceAudit='pdf-structure-pending'}
  for(const id of formerlyMapped){const p=byId(id);if(!p)continue;p.parents=remove(p.parents,'narasappa');p.sourceAudit='pdf-structure-pending';p.generationHint=Math.max(2,Number.isFinite(+p.generationHint)?+p.generationHint:2)}

  for(const p of people){
    if(String(p.id).startsWith('hist-')&&!p.sourceAudit)p.sourceAudit='pdf-structure-pending';
    // The PDF has exactly one first-generation root. Older flat imports used 0 as a
    // default for unrelated/unmapped records, which incorrectly placed them beside
    // Venkatrayudu. Keep those records visible, but never label them Generation 1.
    if(p.id!==ROOT && Number(p.generationHint)===0){p.generationHint=2;if(p.sourceAudit!=='pdf-connector-verified')p.sourceAudit='pdf-structure-pending'}
  }

  const depth=(p,seen=new Set())=>{if(!p||seen.has(p.id))return Number.isFinite(+p?.generationHint)?+p.generationHint:2;seen.add(p.id);const parents=(p.parents||[]).map(byId).filter(Boolean);if(!parents.length)return p.id===ROOT?0:(Number.isFinite(+p.generationHint)&&+p.generationHint>0?+p.generationHint:2);return 1+Math.max(...parents.map(x=>depth(x,new Set(seen))))};
  for(const p of people){if(p.sourceAudit==='pdf-connector-verified'||p.sourceAudit==='pdf-verified')p.generationHint=depth(p)}
  byId(ROOT).generationHint=0;byId('hist-ramappa-1').generationHint=1;

  window.goToFirstGeneration=()=>selectPerson(ROOT,true);
  const oldNav=[...document.querySelectorAll('button')].find(b=>/Narasappa/i.test(b.textContent||''));if(oldNav)oldNav.remove();
  let nav=document.getElementById('firstGenerationNav');if(!nav){nav=document.createElement('button');nav.id='firstGenerationNav';document.body.appendChild(nav)}
  nav.textContent='⇡ Venkatrayudu';nav.title='Go to first generation';nav.style.cssText='position:fixed;left:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:45;border:1px solid #c9a454;background:#fff4d6;color:#66470e;border-radius:999px;padding:10px 13px;font:800 13px system-ui;box-shadow:0 6px 20px rgba(63,48,22,.14)';nav.onclick=goToFirstGeneration;
  try{if(typeof repairRelationships==='function')repairRelationships(true)}catch(e){}
  try{sset(KEY,JSON.stringify({version:13,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true,pdfConnectorHierarchy:true,root:ROOT}))}catch(e){}
  try{render()}catch(e){console.error('PDF hierarchy render',e)}
})();