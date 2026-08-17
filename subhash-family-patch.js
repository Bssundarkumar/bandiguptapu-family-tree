(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ensure=(data)=>{
    let p=byId(data.id);
    if(!p){ p=normalize(data); people.push(p); }
    // Apply authoritative family-confirmed corrections while preserving unrelated details.
    for(const [k,v] of Object.entries(data)){
      if(['parents','children','spouses','related','id'].includes(k)) continue;
      if(v!==undefined && v!==null && v!=='') p[k]=v;
    }
    for(const key of ['parents','children','spouses','related']) p[key]=uniq([...(p[key]||[]),...(data[key]||[])]);
    return p;
  };

  const subhash=ensure({
    id:'venkata-siva-subhash',
    fullName:'Venkata Siva Subhash', surname:'Bandiguptapu', gender:'Male',
    dob:'1986-12-13', ancestralVillage:'Allavaram',
    education:'M.B.A. — recorded in inherited genealogy', generationHint:6,
    parents:['veera-venkata-satyanarayana','naga-satya-mani'],
    spouses:['gummalla-jhansi-veera-durga-padma-jyothi'], children:['subhash-child-1','subhash-child-2'], confidence:'familyrecord',
    sourceNote:'Inherited genealogy records Venkata Siva Subhash, M.B.A., 13-12-1986.'
  });

  const spouse=ensure({
    id:'gummalla-jhansi-veera-durga-padma-jyothi',
    fullName:'Jhansi Veera Durga Padma Jyothi', surname:'Gummalla', gender:'Female',
    generationHint:6, parents:[], spouses:['venkata-siva-subhash'], children:['subhash-child-1','subhash-child-2'],
    confidence:'familyrecord',
    sourceNote:'Spouse name is visible in the inherited genealogy beside Venkata Siva Subhash.'
  });

  const child1=ensure({
    id:'subhash-child-1', fullName:'Sreshta', surname:'Bandiguptapu', gender:'',
    generationHint:7, parents:['venkata-siva-subhash','gummalla-jhansi-veera-durga-padma-jyothi'],
    spouses:[], children:[], confidence:'confirmed',
    notes:'Child name supplied and confirmed by family. The corresponding child box is present in the genealogy image but the name is not legible in the rendered source.',
    sourceNote:'Family-confirmed name; child position is shown in inherited genealogy.'
  });
  const child2=ensure({
    id:'subhash-child-2', fullName:'Varnisha', surname:'Bandiguptapu', gender:'',
    generationHint:7, parents:['venkata-siva-subhash','gummalla-jhansi-veera-durga-padma-jyothi'],
    spouses:[], children:[], confidence:'confirmed',
    notes:'Child name supplied and confirmed by family. The corresponding child box is present in the genealogy image but the name is not legible in the rendered source.',
    sourceNote:'Family-confirmed name; child position is shown in inherited genealogy.'
  });

  subhash.spouses=uniq([...(subhash.spouses||[]),spouse.id]);
  spouse.spouses=uniq([...(spouse.spouses||[]),subhash.id]);
  subhash.children=uniq([...(subhash.children||[]),child1.id,child2.id]);
  spouse.children=uniq([...(spouse.children||[]),child1.id,child2.id]);
  child1.parents=uniq([...(child1.parents||[]),subhash.id,spouse.id]);
  child2.parents=uniq([...(child2.parents||[]),subhash.id,spouse.id]);

  const father=byId('veera-venkata-satyanarayana'), mother=byId('naga-satya-mani');
  for(const p of [father,mother]) if(p) p.children=uniq([...(p.children||[]),subhash.id]);
  subhash.parents=uniq([...(subhash.parents||[]),'veera-venkata-satyanarayana','naga-satya-mani']);

  try{sset(KEY,JSON.stringify({version:8,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true}))}catch(e){}
  try{render()}catch(e){console.error('Subhash family patch render',e)}
})();
