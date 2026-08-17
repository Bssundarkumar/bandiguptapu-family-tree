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
  const SOURCE='Original Bandiguptapu genealogy PDF — visible top connector shows Venkatrayudu as first generation and Ramappa as his son.';

  // Correct PDF root.
  const root=ensure('hist-venkatrayudu-1',{
    fullName:'Venkatrayudu',surname:'Bandiguptapu',gender:'Male',generationHint:0,
    parents:[],spouses:[],children:['hist-ramappa-1'],confidence:'familyrecord',
    sourceAudit:'pdf-verified-connector',sourceNote:SOURCE
  });
  const ramappa=ensure('hist-ramappa-1',{
    fullName:'Ramappa',surname:'Bandiguptapu',gender:'Male',generationHint:1,
    parents:['hist-venkatrayudu-1'],spouses:[],children:[],confidence:'familyrecord',
    sourceAudit:'pdf-verified-connector',sourceNote:SOURCE
  });
  root.children=uniq([...(root.children||[]),'hist-ramappa-1']);
  ramappa.parents=uniq([...(ramappa.parents||[]),'hist-venkatrayudu-1']);

  // Remove the old, incorrect Narasappa-root relationship introduced by an earlier build.
  const nar=byId('narasappa');
  if(nar){
    nar.parents=(nar.parents||[]).filter(id=>id!=='hist-venkatrayudu-1'&&id!=='hist-ramappa-1');
    nar.generationHint=Math.max(2,Number.isFinite(+nar.generationHint)?+nar.generationHint:2);
    nar.sourceAudit=nar.sourceAudit==='pdf-verified-connector'?'pdf-structure-pending':nar.sourceAudit;
    nar.sourceNote='Historical Narasappa record retained; exact upstream connector will be assigned only where confirmed from the PDF.';
  }
  const oldSons=['hist-reddappa-1','hist-perappa-2','hist-achappa-1','hist-venkappa-3'];
  if(nar) nar.children=(nar.children||[]).filter(id=>!oldSons.includes(id));
  for(const id of oldSons){
    const p=byId(id); if(!p) continue;
    p.parents=(p.parents||[]).filter(pid=>pid!=='narasappa');
    if(p.sourceAudit==='pdf-verified-connector')p.sourceAudit='pdf-structure-pending';
  }

  try{if(typeof repairRelationships==='function')repairRelationships(false)}catch(e){}
  try{sset(KEY,JSON.stringify({version:12,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true,pdfRootCorrected:true}))}catch(e){}
  try{render()}catch(e){console.error('Origin relationship render',e)}
})();