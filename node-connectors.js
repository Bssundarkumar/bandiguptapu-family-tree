(()=>{
  const GEN_LINES=['#A97918','#4A76B7','#3D896E','#B75F78','#7562A7','#B47142','#478496','#718746','#60769A','#3E867E'];
  const direct=(p,type)=>Array.isArray(p?.[type])?p[type]:[];
  const gen=p=>Number.isFinite(+p?.generationHint)?Math.max(0,+p.generationHint):0;
  const lineColor=p=>GEN_LINES[gen(p)%GEN_LINES.length];
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];

  // Build lineage edges from BOTH sides of the relationship. This prevents a missing
  // connector when only parent.children or only child.parents is populated.
  function parentChildEdges(){
    const edges=new Map();
    const add=(parentId,childId)=>{
      if(!parentId||!childId||parentId===childId)return;
      if(!byId(parentId)||!byId(childId))return;
      edges.set(`${parentId}→${childId}`,{parentId,childId});
    };
    for(const p of people){
      for(const cid of direct(p,'children')) add(p.id,cid);
      for(const pid of direct(p,'parents')) add(pid,p.id);
      if(window.relationshipIds){
        try{for(const cid of relationshipIds(p,'children')||[]) add(p.id,cid)}catch(e){}
        try{for(const pid of relationshipIds(p,'parents')||[]) add(pid,p.id)}catch(e){}
      }
    }
    return [...edges.values()];
  }

  function spouseEdges(){
    const edges=new Map();
    for(const p of people){
      const ids=uniq([...direct(p,'spouses'),...(window.relationshipIds?(()=>{try{return relationshipIds(p,'spouses')||[]}catch(e){return[]}})():[])]);
      for(const sid of ids){
        if(!byId(sid)||sid===p.id)continue;
        const pair=[p.id,sid].sort();edges.set(pair.join('↔'),pair);
      }
    }
    return [...edges.values()];
  }

  function nodePos(canvas,id){
    const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;
    return {x:el.offsetLeft+el.offsetWidth/2,top:el.offsetTop,bottom:el.offsetTop+el.offsetHeight,mid:el.offsetTop+el.offsetHeight/2,left:el.offsetLeft,right:el.offsetLeft+el.offsetWidth};
  }

  function drawNodeConnections(){
    const canvas=document.querySelector('.fullTreeCanvas'),svg=canvas?.querySelector('.fullTreeSvg');if(!canvas||!svg)return;
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const out=[];
    const grouped=new Map();
    for(const e of parentChildEdges()){
      if(!grouped.has(e.parentId))grouped.set(e.parentId,[]);
      grouped.get(e.parentId).push(e.childId);
    }

    for(const [parentId,childIds] of grouped){
      const parent=byId(parentId),pp=nodePos(canvas,parentId);if(!parent||!pp)continue;
      const kids=uniq(childIds).map(byId).filter(Boolean).map(ch=>({ch,pos:nodePos(canvas,ch.id)})).filter(x=>x.pos);
      if(!kids.length)continue;

      // Draw only actual node-to-node relationships. Children can be in different rows;
      // each branch ends at the exact child card.
      const nearestTop=Math.min(...kids.map(x=>x.pos.top));
      const gap=Math.max(18,nearestTop-pp.bottom);
      const junctionY=pp.bottom+Math.max(18,Math.min(52,gap*.42));
      const trunkColor=lineColor(kids[0].ch);
      out.push(`<path d="M ${pp.x} ${pp.bottom} L ${pp.x} ${junctionY}" fill="none" stroke="${trunkColor}" stroke-width="4" stroke-linecap="round"/>`);

      if(kids.length===1){
        const {ch,pos:cp}=kids[0],cc=lineColor(ch);
        out.push(`<path d="M ${pp.x} ${junctionY} L ${cp.x} ${junctionY} L ${cp.x} ${cp.top}" fill="none" stroke="${cc}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
      }else{
        const minX=Math.min(...kids.map(x=>x.pos.x)),maxX=Math.max(...kids.map(x=>x.pos.x));
        out.push(`<path d="M ${minX} ${junctionY} L ${maxX} ${junctionY}" fill="none" stroke="${trunkColor}" stroke-width="4" stroke-linecap="round"/>`);
        for(const {ch,pos:cp} of kids){
          const cc=lineColor(ch);
          out.push(`<path d="M ${cp.x} ${junctionY} L ${cp.x} ${cp.top}" fill="none" stroke="${cc}" stroke-width="4" stroke-linecap="round"/>`);
          out.push(`<circle cx="${cp.x}" cy="${junctionY}" r="4.5" fill="${cc}"/>`);
        }
      }
      out.push(`<circle cx="${pp.x}" cy="${junctionY}" r="5" fill="${trunkColor}"/>`);
    }

    for(const [aId,bId] of spouseEdges()){
      const a=nodePos(canvas,aId),b=nodePos(canvas,bId);if(!a||!b)continue;
      const x1=a.x<b.x?a.right:a.left,x2=a.x<b.x?b.left:b.right;
      out.push(`<path d="M ${x1} ${a.mid} L ${x2} ${b.mid}" fill="none" stroke="#A65E83" stroke-width="3.2" stroke-dasharray="9 7" stroke-linecap="round"/>`);
    }
    svg.innerHTML=out.join('');
  }

  const css=document.createElement('style');css.textContent=`
    .fullGenRow:after{display:none!important}
    .fullTreeSvg{z-index:1!important;overflow:visible!important}
    .fullGenRow,.personNode{position:relative;z-index:2!important}
    .fullTreeCanvas{row-gap:54px!important}
    @media(max-width:680px){.fullTreeCanvas{row-gap:46px!important}}
  `;document.head.appendChild(css);

  window.drawNodeConnections=drawNodeConnections;
  let raf=0;const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>requestAnimationFrame(drawNodeConnections))};
  const ob=new MutationObserver(schedule);ob.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize',()=>setTimeout(schedule,80));
  window.addEventListener('load',schedule);
  document.addEventListener('click',e=>{if(e.target.closest('.personNode,#zoomIn,#zoomOut,#zoomFit,#zoomReset'))setTimeout(schedule,100)});
  document.addEventListener('touchend',()=>setTimeout(schedule,120),{passive:true});
  setTimeout(schedule,100);setTimeout(schedule,450);setTimeout(schedule,1200);
})();