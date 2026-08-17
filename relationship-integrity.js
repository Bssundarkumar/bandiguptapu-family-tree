(()=>{
  const VERSION=5;
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const hasPerson=id=>!!byId(id);

  function repairRelationships(persist=true){
    let repairs=0;
    const ids=new Set(people.map(p=>p.id));

    // Normalize all relationship arrays and remove dangling/self references.
    for(const p of people){
      for(const key of ['parents','children','spouses','related']){
        const before=Array.isArray(p[key])?p[key]:[];
        const after=uniq(before).filter(id=>id!==p.id && ids.has(id));
        if(JSON.stringify(before)!==JSON.stringify(after)) repairs++;
        p[key]=after;
      }
    }

    const link=(arr,id)=>{ if(!arr.includes(id)){arr.push(id);repairs++;} };

    // Make every known relationship reciprocal.
    // If A says B is a parent, B must say A is a child.
    // If A says B is a child, B must say A is a parent.
    // Spouse links are always mutual.
    for(const p of people){
      for(const pid of [...p.parents]){
        const parent=byId(pid);
        if(parent) link(parent.children,p.id);
      }
      for(const cid of [...p.children]){
        const child=byId(cid);
        if(child) link(child.parents,p.id);
      }
      for(const sid of [...p.spouses]){
        const spouse=byId(sid);
        if(spouse) link(spouse.spouses,p.id);
      }
    }

    // A second pass guarantees links introduced above are fully symmetric.
    for(const p of people){
      for(const pid of p.parents){const parent=byId(pid);if(parent)link(parent.children,p.id)}
      for(const cid of p.children){const child=byId(cid);if(child)link(child.parents,p.id)}
      for(const sid of p.spouses){const spouse=byId(sid);if(spouse)link(spouse.spouses,p.id)}
    }

    if(persist){
      try{sset(KEY,JSON.stringify({version:VERSION,updatedAt:new Date().toISOString(),people,relationshipIntegrity:true}))}catch(e){}
    }
    return repairs;
  }

  // Repair the entire imported/local tree immediately on every launch.
  const startupRepairs=repairRelationships(true);

  // Siblings are intentionally DERIVED, never stored manually.
  // Sharing any recorded parent makes two people siblings in navigation.
  window.derivedSiblingIds=function(person){
    const p=typeof person==='string'?byId(person):person;
    if(!p)return[];
    const out=new Set();
    for(const pid of p.parents||[]){
      const parent=byId(pid);
      for(const cid of parent?.children||[]) if(cid!==p.id && hasPerson(cid)) out.add(cid);
    }
    return [...out];
  };

  // Upgrade both branch-context implementations to use the same global rule.
  window.familyContext2=function(p){
    return {
      parents:(p.parents||[]).map(byId).filter(Boolean),
      spouses:(p.spouses||[]).map(byId).filter(Boolean),
      siblings:derivedSiblingIds(p).map(byId).filter(Boolean),
      children:(p.children||[]).map(byId).filter(Boolean)
    };
  };
  if(typeof familyContext!=='undefined'){
    familyContext=function(p){
      return {
        parents:(p.parents||[]).map(byId).filter(Boolean),
        spouses:(p.spouses||[]).map(byId).filter(Boolean),
        siblings:derivedSiblingIds(p).map(byId).filter(Boolean),
        children:(p.children||[]).map(byId).filter(Boolean)
      };
    };
  }

  // Run validation before every save so newly added/edited people cannot create
  // one-directional relationships.
  if(typeof save==='function'){
    const originalSave=save;
    save=function(){repairRelationships(false);return originalSave()};
    window.save=save;
  }

  // Also validate before rendering. This protects imported/legacy data even if
  // it entered the app without going through the form.
  if(typeof render==='function'){
    const originalRender=render;
    render=function(){repairRelationships(false);return originalRender()};
    window.render=render;
  }

  // Small non-intrusive integrity indicator for troubleshooting.
  const badge=document.createElement('div');
  badge.id='integrityBadge';
  badge.textContent='✓ Relationships synced';
  badge.title=`Family relationship integrity v${VERSION}${startupRepairs?` · ${startupRepairs} links repaired on load`:''}`;
  badge.style.cssText='position:fixed;right:12px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:40;padding:7px 10px;border-radius:999px;background:rgba(13,24,37,.9);border:1px solid rgba(106,219,167,.28);color:#8fe0b7;font:700 11px system-ui,-apple-system,sans-serif;backdrop-filter:blur(14px);pointer-events:none;opacity:.82';
  document.body.appendChild(badge);
  setTimeout(()=>badge.style.opacity='.35',3500);

  // Refresh the current view using repaired relationships.
  try{render()}catch(e){console.error('Relationship integrity render',e)}
})();
