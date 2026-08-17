(()=>{
  const COLORS=['#A97918','#4A76B7','#3D896E','#B75F78','#7562A7','#B47142','#478496','#718746','#60769A','#3E867E'];
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  const rel=(p,type)=>window.relationshipIds?relationshipIds(p,type):(p?.[type]||[]);
  const gen=p=>Number.isFinite(+p?.generationHint)?Math.max(0,+p.generationHint):0;
  const edgeColor=child=>COLORS[gen(child)%COLORS.length];
  const css=document.createElement('style');
  css.textContent=`.fullTreeSvg{display:none!important}.verifiedConnectionSvg{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:visible}.fullTreeCanvas .personNode,.fullTreeCanvas .fullGenRow,.fullTreeCanvas .fullGenLabel{position:relative;z-index:2!important}`;
  document.head.appendChild(css);

  function pos(canvas,id){
    const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;
    return {x:el.offsetLeft+el.offsetWidth/2,top:el.offsetTop,bottom:el.offsetTop+el.offsetHeight,mid:el.offsetTop+el.offsetHeight/2,left:el.offsetLeft,right:el.offsetLeft+el.offsetWidth};
  }
  function edgeSet(){
    const set=new Map();
    for(const p of people){
      for(const cid of rel(p,'children')) if(byId(cid)) set.set(`${p.id}>${cid}`,[p.id,cid]);
      for(const pid of rel(p,'parents')) if(byId(pid)) set.set(`${pid}>${p.id}`,[pid,p.id]);
    }
    return [...set.values()];
  }
  function spouseSet(){
    const set=new Map();
    for(const p of people) for(const sid of rel(p,'spouses')) if(byId(sid)){
      const a=[p.id,sid].sort();set.set(a.join('|'),a);
    }
    return [...set.values()];
  }
  function draw(){
    const canvas=document.querySelector('.fullTreeCanvas');if(!canvas)return;
    let svg=canvas.querySelector('.verifiedConnectionSvg');
    if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('verifiedConnectionSvg');canvas.prepend(svg)}
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const grouped=new Map();
    for(const [pid,cid] of edgeSet()){
      const p=byId(pid),c=byId(cid),pp=pos(canvas,pid),cp=pos(canvas,cid);if(!p||!c||!pp||!cp)continue;
      if(!grouped.has(pid))grouped.set(pid,[]);grouped.get(pid).push({child:c,pos:cp});
    }
    const out=[];
    for(const [pid,kids] of grouped){
      const pp=pos(canvas,pid);if(!pp||!kids.length)continue;
      kids.sort((a,b)=>a.pos.x-b.pos.x);
      const nearest=Math.min(...kids.map(k=>k.pos.top));
      const gap=Math.max(24,nearest-pp.bottom);
      const jy=pp.bottom+Math.min(64,Math.max(24,gap*.46));
      const trunkColor=edgeColor(kids[0].child);
      out.push(`<path d="M ${pp.x} ${pp.bottom} L ${pp.x} ${jy}" fill="none" stroke="${trunkColor}" stroke-width="4" stroke-linecap="round"/>`);
      if(kids.length===1){
        const k=kids[0],cc=edgeColor(k.child);
        out.push(`<path d="M ${pp.x} ${jy} L ${k.pos.x} ${jy} L ${k.pos.x} ${k.pos.top}" fill="none" stroke="${cc}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
      }else{
        out.push(`<path d="M ${kids[0].pos.x} ${jy} L ${kids[kids.length-1].pos.x} ${jy}" fill="none" stroke="${trunkColor}" stroke-width="4" stroke-linecap="round"/>`);
        for(const k of kids){const cc=edgeColor(k.child);out.push(`<path d="M ${k.pos.x} ${jy} L ${k.pos.x} ${k.pos.top}" fill="none" stroke="${cc}" stroke-width="4" stroke-linecap="round"/>`)}
      }
    }
    for(const [a,b] of spouseSet()){
      const pa=pos(canvas,a),pb=pos(canvas,b);if(!pa||!pb)continue;
      const x1=pa.x<pb.x?pa.right:pa.left,x2=pa.x<pb.x?pb.left:pb.right;
      out.push(`<path d="M ${x1} ${pa.mid} L ${x2} ${pb.mid}" fill="none" stroke="#A65E83" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>`);
    }
    svg.innerHTML=out.join('');
  }
  window.drawVerifiedConnections=draw;
  let timer;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(draw,30)};
  const mo=new MutationObserver(schedule);mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('click',schedule);
  document.addEventListener('touchend',schedule,{passive:true});
  [60,180,500,1000,1800].forEach(t=>setTimeout(draw,t));
})();