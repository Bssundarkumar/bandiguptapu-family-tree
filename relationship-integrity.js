(()=>{
  const VERSION=7;
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];

  // Source-confirmed family units. These are merged into any older localStorage
  // record instead of being ignored just because the person ID already exists.
  // This makes source corrections global and migration-safe.
  const SOURCE_PEOPLE=[
    {id:'chitti-venkanna',fullName:'Chitti Venkanna',surname:'Bandiguptapu',gender:'Male',ancestralVillage:'Allavaram',generationHint:3,parents:[],spouses:['venkata-subbamma'],children:['venkata-subbarao'],confidence:'familyrecord'},
    {id:'venkata-subbamma',fullName:'Venkata Subbamma',surname:'Merikela',gender:'Female',generationHint:3,parents:[],spouses:['chitti-venkanna'],children:['venkata-subbarao'],confidence:'familyrecord'},
    {id:'venkata-subbarao',fullName:'Venkata Subbarao',surname:'Bandiguptapu',gender:'Male',birthYear:'1929',dod:'2000',ancestralVillage:'Allavaram',occupation:'Teacher',generationHint:4,parents:['chitti-venkanna','venkata-subbamma'],spouses:['sundara-manikyam'],children:['veera-venkata-satyanarayana'],confidence:'familyrecord'},
    {id:'sundara-manikyam',fullName:'Sundara Manikyam',surname:'Motupalli',gender:'Female',generationHint:4,parents:[],spouses:['venkata-subbarao'],children:['veera-venkata-satyanarayana'],confidence:'familyrecord'},
    {id:'veera-venkata-satyanarayana',fullName:'Veera Venkata Satyanarayana',surname:'Bandiguptapu',nickname:'Sattibabu',gender:'Male',dob:'1966-08-08',birthplace:'Allavaram, Andhra Pradesh, India',ancestralVillage:'Allavaram',generationHint:5,parents:['venkata-subbarao','sundara-manikyam'],spouses:['naga-satya-mani'],children:['venkata-siva-subhash','satya-sundar-kumar'],confidence:'confirmed'},
    {id:'naga-satya-mani',fullName:'Naga Satya Mani',surname:'Kankipati',gender:'Female',ancestralVillage:'Allavaram',generationHint:5,parents:[],spouses:['veera-venkata-satyanarayana'],children:['venkata-siva-subhash','satya-sundar-kumar'],confidence:'confirmed'},
    {id:'venkata-siva-subhash',fullName:'Venkata Siva Subhash',surname:'Bandiguptapu',gender:'Male',dob:'1986-12-13',ancestralVillage:'Allavaram',education:'M.B.A. — recorded in inherited genealogy',generationHint:6,parents:['veera-venkata-satyanarayana','naga-satya-mani'],spouses:['gummalla-jhansi-veera-durga-padma-jyothi'],children:['subhash-child-1','subhash-child-2'],confidence:'familyrecord',sourceNote:'Inherited genealogy records Venkata Siva Subhash, M.B.A., 13-12-1986.'},
    {id:'gummalla-jhansi-veera-durga-padma-jyothi',fullName:'Jhansi Veera Durga Padma Jyothi',surname:'Gummalla',gender:'Female',generationHint:6,parents:[],spouses:['venkata-siva-subhash'],children:['subhash-child-1','subhash-child-2'],confidence:'familyrecord',sourceNote:'Name transcribed from the inherited genealogy beside Venkata Siva Subhash.'},
    {id:'subhash-child-1',fullName:'Child 1',surname:'Bandiguptapu',gender:'',generationHint:7,parents:['venkata-siva-subhash','gummalla-jhansi-veera-durga-padma-jyothi'],spouses:[],children:[],confidence:'familyrecord',notes:'The genealogy shows this child box, but the child name is not readable/recorded in the available source image.'},
    {id:'subhash-child-2',fullName:'Child 2',surname:'Bandiguptapu',gender:'',generationHint:7,parents:['venkata-siva-subhash','gummalla-jhansi-veera-durga-padma-jyothi'],spouses:[],children:[],confidence:'familyrecord',notes:'The genealogy shows this child box, but the child name is not readable/recorded in the available source image.'},
    {id:'satya-sundar-kumar',fullName:'Satya Sundar Kumar',surname:'Bandiguptapu',gender:'Male',dob:'1993-08-03',birthplace:'Allavaram, Andhra Pradesh, India',ancestralVillage:'Allavaram',generationHint:6,parents:['veera-venkata-satyanarayana','naga-satya-mani'],spouses:['sarada-prasanna-lakshmi'],children:['viransh'],confidence:'confirmed'},
    {id:'sarada-prasanna-lakshmi',fullName:'Sarada Prasanna Lakshmi',surname:'Chinta',gender:'Female',generationHint:6,parents:[],spouses:['satya-sundar-kumar'],children:['viransh'],confidence:'confirmed'},
    {id:'viransh',fullName:'Viransh',surname:'Bandiguptapu',gender:'Male',generationHint:7,parents:['satya-sundar-kumar','sarada-prasanna-lakshmi'],spouses:[],children:[],confidence:'confirmed'}
  ];

  function ensureSourcePeople(){
    for(const src of SOURCE_PEOPLE){
      let p=byId(src.id);
      if(!p){
        p=normalize(src);
        people.push(p);
        continue;
      }
      // Preserve user-entered details, but fill empty fields from source records.
      for(const [k,v] of Object.entries(src)){
        if(['parents','children','spouses','related','id'].includes(k)) continue;
        if((p[k]===undefined||p[k]===null||p[k]==='') && v!==undefined && v!==null && v!=='') p[k]=v;
      }
      for(const key of ['parents','children','spouses','related']){
        p[key]=uniq([...(p[key]||[]),...(src[key]||[])]);
      }
    }
  }

  const exists=id=>people.some(p=>p.id===id);

  function repairRelationships(persist=true){
    ensureSourcePeople();
    let repairs=0;
    const ids=new Set(people.map(p=>p.id));
    const add=(arr,id)=>{if(!arr.includes(id)){arr.push(id);repairs++;}};

    for(const p of people){
      for(const key of ['parents','children','spouses','related']){
        const before=Array.isArray(p[key])?p[key]:[];
        const after=uniq(before).filter(id=>id!==p.id&&ids.has(id));
        if(JSON.stringify(before)!==JSON.stringify(after))repairs++;
        p[key]=after;
      }
    }

    // Repair every relationship in both directions, no matter which record
    // originally contained the source link.
    for(const p of people){
      for(const pid of [...p.parents]){const q=byId(pid);if(q)add(q.children,p.id)}
      for(const cid of [...p.children]){const q=byId(cid);if(q)add(q.parents,p.id)}
      for(const sid of [...p.spouses]){const q=byId(sid);if(q)add(q.spouses,p.id)}
    }

    // Repeat after newly introduced inverse links.
    for(const p of people){
      for(const pid of p.parents){const q=byId(pid);if(q)add(q.children,p.id)}
      for(const cid of p.children){const q=byId(cid);if(q)add(q.parents,p.id)}
      for(const sid of p.spouses){const q=byId(sid);if(q)add(q.spouses,p.id)}
    }

    // Mark only the records whose PDF relationships have not yet been safely
    // transcribed. This prevents the UI/data layer from pretending they are complete.
    for(const p of people){
      const hasRel=p.parents.length||p.children.length||p.spouses.length;
      if(p.confidence==='familyrecord' && String(p.id).startsWith('hist-') && !hasRel){
        p.sourceRelationshipStatus='unmapped-from-pdf';
      }else if(hasRel){
        p.sourceRelationshipStatus='mapped';
      }
    }

    if(persist){
      try{sset(KEY,JSON.stringify({version:VERSION,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true,sourceMerge:true}))}catch(e){}
    }
    return repairs;
  }

  // Reverse-derived accessors are used by every profile. They are intentionally
  // independent of a single person's arrays, so legacy one-way data can never hide
  // a parent, child, or spouse again.
  const reverseIds=(id,key)=>people.filter(p=>(p[key]||[]).includes(id)).map(p=>p.id);
  window.relationshipIds=function(person,type){
    const p=typeof person==='string'?byId(person):person;if(!p)return[];
    if(type==='parents') return uniq([...(p.parents||[]),...reverseIds(p.id,'children')]).filter(exists);
    if(type==='children') return uniq([...(p.children||[]),...reverseIds(p.id,'parents')]).filter(exists);
    if(type==='spouses') return uniq([...(p.spouses||[]),...reverseIds(p.id,'spouses')]).filter(exists);
    return [];
  };
  window.derivedSiblingIds=function(person){
    const p=typeof person==='string'?byId(person):person;if(!p)return[];
    const out=new Set();
    for(const pid of relationshipIds(p,'parents')){
      const parent=byId(pid);
      for(const cid of relationshipIds(parent,'children')) if(cid!==p.id&&exists(cid))out.add(cid);
    }
    return [...out];
  };

  const context=p=>({
    parents:relationshipIds(p,'parents').map(byId).filter(Boolean),
    spouses:relationshipIds(p,'spouses').map(byId).filter(Boolean),
    siblings:derivedSiblingIds(p).map(byId).filter(Boolean),
    children:relationshipIds(p,'children').map(byId).filter(Boolean)
  });
  window.familyContext2=context;
  try{familyContext=context}catch(e){}

  const startupRepairs=repairRelationships(true);

  // Profile-side rendering also uses reverse-derived relationships, not only the
  // raw arrays. This fixes the same class of bug for every person in the app.
  if(typeof renderSide==='function'){
    const originalRenderSide=renderSide;
    renderSide=function(){
      const p=byId(current);if(!p)return originalRenderSide();
      const raw={parents:p.parents,children:p.children,spouses:p.spouses};
      p.parents=relationshipIds(p,'parents');p.children=relationshipIds(p,'children');p.spouses=relationshipIds(p,'spouses');
      try{return originalRenderSide()}finally{p.parents=raw.parents;p.children=raw.children;p.spouses=raw.spouses}
    };
    window.renderSide=renderSide;
  }

  if(typeof save==='function'){
    const originalSave=save;
    save=function(){repairRelationships(false);return originalSave()};
    window.save=save;
  }
  if(typeof render==='function'){
    const originalRender=render;
    render=function(){repairRelationships(false);return originalRender()};
    window.render=render;
  }

  const badge=document.createElement('div');
  badge.id='integrityBadge';
  badge.textContent='✓ Family links synced';
  badge.title=`Relationship engine v${VERSION}${startupRepairs?` · ${startupRepairs} links repaired`:''}`;
  badge.style.cssText='position:fixed;right:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:40;padding:7px 10px;border-radius:999px;background:rgba(13,24,37,.9);border:1px solid rgba(106,219,167,.28);color:#8fe0b7;font:700 11px system-ui,-apple-system,sans-serif;backdrop-filter:blur(14px);pointer-events:none;opacity:.82;transition:opacity .5s';
  document.body.appendChild(badge);setTimeout(()=>badge.style.opacity='.28',3200);

  try{render()}catch(e){console.error('Relationship integrity render',e)}
})();
