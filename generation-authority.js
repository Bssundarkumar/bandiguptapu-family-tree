(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ensure=(id,patch={})=>{
    let p=byId(id);
    if(!p){p=normalize({id,fullName:patch.fullName||id,surname:'Bandiguptapu',parents:[],children:[],spouses:[],related:[],confidence:'familyrecord'});people.push(p)}
    for(const [k,v] of Object.entries(patch)){
      if(['parents','children','spouses','related'].includes(k)) p[k]=uniq(v||[]);
      else if(v!==undefined) p[k]=v;
    }
    return p;
  };
  const unlinkParent=(child,parentId)=>{if(child)child.parents=(child.parents||[]).filter(x=>x!==parentId)};
  const root=ensure('hist-venkatrayudu-1',{fullName:'Venkatarayudu',surname:'Bandiguptapu',gender:'Male',generationHint:0,parents:[],sourceAudit:'family-confirmed-pdf-structure',sourceNote:'Generation 1 confirmed by family from the provided genealogy.'});
  const g2=[
    ensure('hist-paddappa-1',{fullName:'Peddhappa',surname:'Bandiguptapu',gender:'Male',generationHint:1,parents:[root.id],sourceAudit:'family-confirmed-pdf-structure'}),
    ensure('hist-natsappa-1',{fullName:'Natsappa',surname:'Bandiguptapu',gender:'Male',generationHint:1,parents:[root.id],sourceAudit:'family-confirmed-pdf-structure'}),
    ensure('hist-ramappa-1',{fullName:'Ramappa',surname:'Bandiguptapu',gender:'Male',generationHint:1,parents:[root.id],sourceAudit:'family-confirmed-pdf-structure'}),
    ensure('hist-venkappa-1',{fullName:'Venkappa',surname:'Bandiguptapu',gender:'Male',generationHint:1,parents:[root.id],sourceAudit:'family-confirmed-pdf-structure'})
  ];
  root.children=g2.map(x=>x.id);

  // Keep Generation 1 and 2 exact. Any other historical record that was previously
  // placed there only because of an import hint is moved below them until its PDF
  // connector is explicitly verified.
  const locked=new Set([root.id,...g2.map(x=>x.id)]);
  for(const p of people){
    if(locked.has(p.id))continue;
    if(String(p.id).startsWith('hist-') && (+p.generationHint<2 || !Number.isFinite(+p.generationHint))){
      p.generationHint=2;
      if(!String(p.sourceAudit||'').includes('verified'))p.sourceAudit='pdf-structure-pending';
    }
    unlinkParent(p,root.id);
  }
  for(const p of g2)p.parents=[root.id];

  window.FAMILY_GENERATION_AUTHORITY={root:root.id,generation2:g2.map(x=>x.id),expectedGeneration3Count:14};
  window.goToFirstGeneration=()=>selectPerson(root.id,true);

  try{if(typeof repairRelationships==='function')repairRelationships(true)}catch(e){}
  try{sset(KEY,JSON.stringify({version:14,updatedAt:new Date().toISOString(),people,root:root.id,generationAuthority:true,expectedGeneration3Count:14}))}catch(e){}
  try{render()}catch(e){console.error('Generation authority render',e)}
})();