(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ensure=(id,patch)=>{
    let p=byId(id);
    if(!p){p=normalize({id,...patch});people.push(p)}
    else{
      for(const [k,v] of Object.entries(patch)){
        if(['parents','children','spouses','related'].includes(k))p[k]=uniq([...(p[k]||[]),...(v||[])]);
        else if((p[k]===undefined||p[k]===null||p[k]==='')&&v!==undefined&&v!==null)p[k]=v;
      }
    }
    return p;
  };
  const SOURCE='Original Bandiguptapu genealogy PDF — relationship inferred from the visible green parent/child connector line.';
  const narasappa=ensure('narasappa',{fullName:'Narasappa',surname:'Bandi / Bandiguptapu tradition',gender:'Male',generationHint:0,parents:[],spouses:[],children:['hist-reddappa-1','hist-perappa-2','hist-achappa-1','hist-venkappa-3'],confidence:'familyrecord',sourceAudit:'pdf-verified-connector',sourceNote:SOURCE});
  const sons=[
    ['hist-reddappa-1','Reddappa','Senanayakudu / troop leader'],
    ['hist-perappa-2','Perappa','Recorded martial / administrative role'],
    ['hist-achappa-1','Achappa','Disciplinary / enforcement role'],
    ['hist-venkappa-3','Venkappa','Messenger / diplomatic duty']
  ];
  for(const [id,name,occupation] of sons){
    const p=ensure(id,{fullName:name,surname:'Bandiguptapu',gender:'Male',occupation,generationHint:1,parents:['narasappa'],spouses:[],children:[],confidence:'familyrecord',sourceAudit:'pdf-verified-connector',sourceNote:SOURCE});
    p.parents=uniq([...(p.parents||[]),'narasappa']);
  }
  narasappa.children=uniq([...(narasappa.children||[]),...sons.map(x=>x[0])]);
  try{if(typeof repairRelationships==='function')repairRelationships(false)}catch(e){}
  try{sset(KEY,JSON.stringify({version:10,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true,pdfConnectorMapping:true}))}catch(e){}
  try{render()}catch(e){console.error('Origin relationship render',e)}
})();
