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
  for(const p of people){
    if(!String(p.id).startsWith('hist-')||p.id===ROOT||gen2ids.has(p.id))continue;
    p.parents=(p.parents||[]).filter(id=>id!==ROOT);
    if(!Number.isFinite(+p.generationHint)||+p.generationHint<2)p.generationHint=2;
  }
  // Keep reverse links exact for the first two rungs.
  for(const p of people){
    if(p.id===ROOT)continue;
    if((p.parents||[]).includes(ROOT)&&!gen2ids.has(p.id))p.parents=p.parents.filter(x=>x!==ROOT);
  }

  const COLORS=[
    {m:'#D9E9FF',f:'#EADFFF',b:'#4C78B8'},
    {m:'#D9F0E5',f:'#FBE9D5',b:'#3F866B'},
    {m:'#E8E1F8',f:'#F8E1EA',b:'#7462A5'},
    {m:'#DDEFF4',f:'#F8E5D5',b:'#438296'},
    {m:'#E7F0D5',f:'#F6E2ED',b:'#708944'},
    {m:'#F8E4D2',f:'#EDE1F8',b:'#AD6C3E'},
    {m:'#E1EAF6',f:'#F8E4DE',b:'#5D7597'},
    {m:'#DDF0ED',f:'#F2E2EC',b:'#3E867E'},
    {m:'#E7E4F3',f:'#F5E6DA',b:'#736987'},
    {m:'#DCEAF0',f:'#EFE2F0',b:'#527A8B'}
  ];
  const generationOf=p=>Number.isFinite(+p?.generationHint)?Math.max(0,+p.generationHint):0;
  const colorFor=p=>COLORS[generationOf(p)%COLORS.length];

  function paintNodes(){
    document.querySelectorAll('.personNode[data-id]').forEach(el=>{
      const p=byId(el.dataset.id);if(!p)return;
      const c=colorFor(p);
      const bg=p.gender==='Female'?c.f:c.m;
      el.style.setProperty('background',bg,'important');
      el.style.setProperty('border-color',c.b,'important');
      el.style.setProperty('color','#202833','important');
    });
    document.querySelectorAll('.fullGenRow').forEach((row,i)=>{
      const c=COLORS[i%COLORS.length];
      row.style.setProperty('border-left',`7px solid ${c.b}`,'important');
      row.style.setProperty('background',`linear-gradient(90deg,${c.m}55,#fff 24%,#fff)`,'important');
    });
  }
  function pos(canvas,id){const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;return{x:el.offsetLeft+el.offsetWidth/2,y1:el.offsetTop,y2:el.offsetTop+el.offsetHeight,midY:el.offsetTop+el.offsetHeight/2}}
  function draw(){
    const canvas=document.querySelector('.fullTreeCanvas'),svg=canvas?.querySelector('.fullTreeSvg');if(!canvas||!svg)return;
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const paths=[];
    for(const p of people){
      const a=pos(canvas,p.id);if(!a)continue;
      const kids=window.relationshipIds?relationshipIds(p,'children'):(p.children||[]);
      for(const cid of kids){const ch=byId(cid),b=pos(canvas,cid);if(!ch||!b)continue;const c=colorFor(ch),my=(a.y2+b.y1)/2;paths.push(`<path d="M ${a.x} ${a.y2} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y1}" fill="none" stroke="${c.b}" stroke-width="3.4" stroke-linecap="round" opacity=".9"/>`)}
      const spouses=window.relationshipIds?relationshipIds(p,'spouses'):(p.spouses||[]);
      for(const sid of spouses){if(p.id>=sid)continue;const b=pos(canvas,sid);if(!b)continue;paths.push(`<path d="M ${a.x} ${a.midY} L ${b.x} ${b.midY}" fill="none" stroke="#B76A8D" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round"/>`)}
    }
    svg.innerHTML=paths.join('');
  }
  function refresh(){paintNodes();draw()}
  const ob=new MutationObserver(()=>requestAnimationFrame(refresh));ob.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>setTimeout(refresh,80));
  try{sset(KEY,JSON.stringify({version:13,updatedAt:new Date().toISOString(),people,root:ROOT,generation1Count:1,generation2Count:4,expectedGeneration3Count:14}))}catch(e){}
  try{render()}catch(e){}
  setTimeout(refresh,100);setTimeout(refresh,600);
})();