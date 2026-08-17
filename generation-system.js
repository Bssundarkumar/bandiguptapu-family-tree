(()=>{
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).filter(Boolean))];
  const ROOT='hist-venkatrayudu-1';
  const GEN2=[
    ['hist-paddappa-1','Peddhappa'],
    ['hist-narasappa-2','Natsappa'],
    ['hist-ramappa-1','Ramappa'],
    ['hist-venkappa-1','Venkappa']
  ];
  const SOURCE='Generation placement confirmed directly by family while reviewing the original genealogy PDF.';
  const root=byId(ROOT);
  if(root){
    root.fullName='Venkatarayudu';
    root.generationHint=0;
    root.parents=[];
    root.children=GEN2.map(x=>x[0]);
    root.sourceAudit='family-confirmed-pdf-structure';
    root.sourceNote=SOURCE;
  }
  const gen2ids=new Set(GEN2.map(x=>x[0]));
  for(const [id,name] of GEN2){
    const p=byId(id);
    if(!p) continue;
    p.fullName=name;
    p.generationHint=1;
    p.parents=[ROOT];
    p.sourceAudit='family-confirmed-pdf-structure';
    p.sourceNote=SOURCE;
  }
  // Generation 1 and 2 are authoritative. Older flat-import hints are never allowed
  // to create extra people on either rung.
  for(const p of people){
    if(!String(p.id).startsWith('hist-')||p.id===ROOT||gen2ids.has(p.id))continue;
    p.parents=(p.parents||[]).filter(id=>id!==ROOT);
    if(!Number.isFinite(+p.generationHint)||+p.generationHint<2)p.generationHint=2;
  }
  for(const p of people){
    if(p.id===ROOT)continue;
    if((p.parents||[]).includes(ROOT)&&!gen2ids.has(p.id))p.parents=p.parents.filter(x=>x!==ROOT);
  }

  // One base palette per generation. Men and women use close shades inside the same
  // generation so older users can understand the rung first, then gender second.
  const COLORS=[
    {m:'#FFF2C6',f:'#F9E4B2',b:'#A97918'},
    {m:'#DCEBFF',f:'#E7DFFF',b:'#4A76B7'},
    {m:'#DDF4EA',f:'#E8F2D4',b:'#3D896E'},
    {m:'#FBE2E7',f:'#F5DCEF',b:'#B75F78'},
    {m:'#E8E2FA',f:'#F0E0F8',b:'#7562A7'},
    {m:'#FCE6D3',f:'#F5DFCF',b:'#B47142'},
    {m:'#E0EFF4',f:'#DCEBF7',b:'#478496'},
    {m:'#E8F0D6',f:'#F2E4D8',b:'#718746'},
    {m:'#E3EAF6',f:'#F1E1ED',b:'#60769A'},
    {m:'#DDF0ED',f:'#F0E1EA',b:'#3E867E'}
  ];
  const generationOf=p=>Number.isFinite(+p?.generationHint)?Math.max(0,+p.generationHint):0;
  const colorFor=p=>COLORS[generationOf(p)%COLORS.length];

  function paintNodes(){
    document.querySelectorAll('.personNode[data-id]').forEach(el=>{
      const p=byId(el.dataset.id);if(!p)return;
      const c=colorFor(p),bg=p.gender==='Female'?c.f:c.m;
      el.style.setProperty('background',bg,'important');
      el.style.setProperty('border-color',c.b,'important');
      el.style.setProperty('color','#202833','important');
    });
    document.querySelectorAll('.fullGenRow').forEach((row,i)=>{
      const c=COLORS[i%COLORS.length];
      row.style.setProperty('border-left',`7px solid ${c.b}`,'important');
      row.style.setProperty('background',`linear-gradient(90deg,${c.m}70,#fff 22%,#fff)`,'important');
    });
    const labels=[...document.querySelectorAll('.fullGenLabel')];
    labels.forEach((l,i)=>{const n=l.nextElementSibling?.querySelectorAll?.('.personNode').length||0;l.textContent=`Generation ${i+1} · ${n} ${n===1?'person':'people'}`});
  }
  function pos(canvas,id){const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;return{x:el.offsetLeft+el.offsetWidth/2,y1:el.offsetTop,y2:el.offsetTop+el.offsetHeight,midY:el.offsetTop+el.offsetHeight/2}}
  function draw(){
    const canvas=document.querySelector('.fullTreeCanvas'),svg=canvas?.querySelector('.fullTreeSvg');if(!canvas||!svg)return;
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const paths=[];
    for(const p of people){
      const a=pos(canvas,p.id);if(!a)continue;
      const kids=window.relationshipIds?relationshipIds(p,'children'):(p.children||[]);
      for(const cid of kids){
        const ch=byId(cid),b=pos(canvas,cid);if(!ch||!b)continue;
        const c=colorFor(ch),my=(a.y2+b.y1)/2;
        paths.push(`<path d="M ${a.x} ${a.y2} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y1}" fill="none" stroke="${c.b}" stroke-width="3.8" stroke-linecap="round" opacity=".94"/>`)
      }
      const spouses=window.relationshipIds?relationshipIds(p,'spouses'):(p.spouses||[]);
      for(const sid of spouses){if(p.id>=sid)continue;const b=pos(canvas,sid);if(!b)continue;paths.push(`<path d="M ${a.x} ${a.midY} L ${b.x} ${b.midY}" fill="none" stroke="#A65E83" stroke-width="3.2" stroke-dasharray="8 6" stroke-linecap="round"/>`)}
    }
    svg.innerHTML=paths.join('');
  }
  function addAuditNote(){
    const canvas=document.querySelector('.fullTreeCanvas');if(!canvas||canvas.querySelector('.generationAuditNote'))return;
    const rows=canvas.querySelectorAll('.fullGenRow');
    if(rows.length<3)return;
    const count=rows[2].querySelectorAll('.personNode').length;
    if(count===14)return;
    const note=document.createElement('div');note.className='generationAuditNote';note.textContent=`Generation 3 source target: 14 people · currently mapped: ${count}. Unverified father/child links are not invented.`;
    note.style.cssText='align-self:center;padding:9px 13px;border:1px solid #d9b55f;background:#fff7df;color:#654914;border-radius:12px;font:700 13px system-ui;max-width:620px;text-align:center';
    rows[2].after(note);
  }
  function refresh(){paintNodes();draw();addAuditNote()}
  const ob=new MutationObserver(()=>requestAnimationFrame(refresh));ob.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>setTimeout(refresh,80));
  try{sset(KEY,JSON.stringify({version:15,updatedAt:new Date().toISOString(),people,root:ROOT,generation1Count:1,generation2Count:4,expectedGeneration3Count:14}))}catch(e){}
  try{render()}catch(e){}
  setTimeout(refresh,100);setTimeout(refresh,600);
})();