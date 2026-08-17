(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ensure=(data)=>{
    let p=byId(data.id);
    if(!p){ p=normalize(data); people.push(p); }
    return p;
  };

  const subhash=ensure({
    id:'venkata-siva-subhash',
    fullName:'Venkata Siva Subhash', surname:'Bandiguptapu', gender:'Male',
    dob:'1986-12-13', ancestralVillage:'Allavaram',
    education:'M.B.A. — recorded in inherited genealogy', generationHint:6,
    parents:['veera-venkata-satyanarayana','naga-satya-mani'],
    spouses:[], children:[], confidence:'familyrecord',
    sourceNote:'Inherited genealogy records Venkata Siva Subhash, M.B.A., 13-12-1986.'
  });

  const spouse=ensure({
    id:'gummalla-jhansi-veera-durga-padma-jyothi',
    fullName:'Jhansi Veera Durga Padma Jyothi', surname:'Gummalla', gender:'Female',
    generationHint:6, parents:[], spouses:['venkata-siva-subhash'], children:[],
    confidence:'familyrecord',
    sourceNote:'Name transcribed from the inherited genealogy beside Venkata Siva Subhash.'
  });

  const child1=ensure({
    id:'subhash-child-1', fullName:'Child 1', surname:'Bandiguptapu', gender:'',
    generationHint:7, parents:['venkata-siva-subhash','gummalla-jhansi-veera-durga-padma-jyothi'],
    spouses:[], children:[], confidence:'familyrecord',
    notes:'The genealogy shows this child box, but the child name is not readable/recorded in the available source image.',
    sourceNote:'Inherited genealogy — child box shown below Venkata Siva Subhash.'
  });
  const child2=ensure({
    id:'subhash-child-2', fullName:'Child 2', surname:'Bandiguptapu', gender:'',
    generationHint:7, parents:['venkata-siva-subhash','gummalla-jhansi-veera-durga-padma-jyothi'],
    spouses:[], children:[], confidence:'familyrecord',
    notes:'The genealogy shows this child box, but the child name is not readable/recorded in the available source image.',
    sourceNote:'Inherited genealogy — child box shown below Venkata Siva Subhash.'
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

  try{sset(KEY,JSON.stringify({version:6,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true}))}catch(e){}
  try{render()}catch(e){console.error('Subhash family patch render',e)}
})();
