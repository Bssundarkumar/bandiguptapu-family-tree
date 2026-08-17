(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const setLink=(parentId,childIds,gen)=>{
    const p=byId(parentId); if(!p) return;
    p.children=uniq([...(p.children||[]),...childIds]);
    p.sourceAudit='pdf-connector-verified';
    for(const cid of childIds){const c=byId(cid);if(!c)continue;c.parents=uniq([...(c.parents||[]),parentId]);if(Number.isFinite(gen))c.generationHint=gen;c.sourceAudit='pdf-connector-verified';}
  };
  const ROOT='hist-venkatrayudu-1';
  const GEN2=['hist-paddappa-1','hist-narasappa-2','hist-ramappa-1','hist-venkappa-1'];
  const root=byId(ROOT);if(root){root.fullName='Venkatarayudu';root.parents=[];root.children=[...GEN2];root.generationHint=0;root.sourceAudit='family-confirmed-pdf-structure';}
  const gen2Names={
    'hist-paddappa-1':'Peddhappa',
    'hist-narasappa-2':'Natsappa',
    'hist-ramappa-1':'Ramappa',
    'hist-venkappa-1':'Venkappa'
  };
  for(const id of GEN2){const p=byId(id);if(!p)continue;p.fullName=gen2Names[id];p.parents=[ROOT];p.generationHint=1;p.sourceAudit='family-confirmed-pdf-structure';}

  // Verified directly from the green connector lines in the upper PDF section.
  // Peddhappa branches to Ramappa and Rajappa.
  setLink('hist-paddappa-1',['hist-ramappa-2','hist-rajappa-1'],2);
  // Natsappa/Narasappa branches to Reddappa, Perappa, Achappa and Venkappa.
  setLink('hist-narasappa-2',['hist-reddappa-1','hist-perappa-2','hist-achappa-1','hist-venkappa-3'],2);

  // Preserve the verified modern Allavaram links already present elsewhere in the data.
  try{if(typeof repairRelationships==='function')repairRelationships(true)}catch(e){}
  try{sset(KEY,JSON.stringify({version:16,updatedAt:new Date().toISOString(),people,root:ROOT,verifiedPdfConnections:true}))}catch(e){}
  try{render()}catch(e){}
})();