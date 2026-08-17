(()=>{
  const GEN_LINES=['#A97918','#4A76B7','#3D896E','#B75F78','#7562A7','#B47142','#478496','#718746','#60769A','#3E867E'];
  const rel=(p,type)=>window.relationshipIds?relationshipIds(p,type):(p?.[type]||[]);
  const gen=p=>Number.isFinite(+p?.generationHint)?Math.max(0,+p.generationHint):0;
  const lineColor=p=>GEN_LINES[gen(p)%GEN_LINES.length];
  function nodePos(canvas,id){
    const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;
    return {x:el.offsetLeft+el.offsetWidth/2,top:el.offsetTop,bottom:el.offsetTop+el.offsetHeight,mid:el.offsetTop+el.offsetHeight/2,left:el.offsetLeft,right:el.offsetLeft+el.offsetWidth};
  }
  function drawNodeConnections(){
    const canvas=document.querySelector('.fullTreeCanvas'),svg=canvas?.querySelector('.fullTreeSvg');if(!canvas||!svg)return;
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const out=[];
    for(const parent of people){
      const pp=nodePos(canvas,parent.id);if(!pp)continue;
      const kids=rel(parent,'children').map(byId).filter(Boolean).filter(ch=>nodePos(canvas,ch.id));
      if(kids.length){
        const childPositions=kids.map(ch=>({ch,pos:nodePos(canvas,ch.id)}));
        const nearestTop=Math.min(...childPositions.map(x=>x.pos.top));
        const junctionY=pp.bottom+Math.max(22,Math.min(54,(nearestTop-pp.bottom)*.48));
        const color=lineColor(kids[0]);
        // Parent trunk.
        out.push(`<path d="M ${pp.x} ${pp.bottom} L ${pp.x} ${junctionY}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`);
        if(childPositions.length===1){
          const cp=childPositions[0].pos;
          out.push(`<path d="M ${pp.x} ${junctionY} L ${cp.x} ${junctionY} L ${cp.x} ${cp.top}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
        }else{
          const xs=childPositions.map(x=>x.pos.x),minX=Math.min(...xs),maxX=Math.max(...xs);
          out.push(`<path d="M ${minX} ${junctionY} L ${maxX} ${junctionY}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`);
          for(const {ch,pos:cp} of childPositions){
            const cc=lineColor(ch);
            out.push(`<path d="M ${cp.x} ${junctionY} L ${cp.x} ${cp.top}" fill="none" stroke="${cc}" stroke-width="4" stroke-linecap="round"/>`);
            out.push(`<circle cx="${cp.x}" cy="${junctionY}" r="4.5" fill="${cc}"/>`);
          }
        }
        out.push(`<circle cx="${pp.x}" cy="${junctionY}" r="5" fill="${color}"/>`);
      }
      for(const sid of rel(parent,'spouses')){
        if(parent.id>=sid)continue;const sp=nodePos(canvas,sid);if(!sp)continue;
        const x1=pp.x<sp.x?pp.right:pp.left,x2=pp.x<sp.x?sp.left:sp.right;
        out.push(`<path d="M ${x1} ${pp.mid} L ${x2} ${sp.mid}" fill="none" stroke="#A65E83" stroke-width="3.2" stroke-dasharray="9 7" stroke-linecap="round"/>`);
      }
    }
    svg.innerHTML=out.join('');
  }
  // Make generation rows visually neutral so only node-to-node edges communicate lineage.
  const css=document.createElement('style');css.textContent=`
    .fullGenRow:after{display:none!important}
    .fullTreeSvg{z-index:1!important}
    .fullGenRow,.personNode{position:relative;z-index:2!important}
    .fullTreeCanvas{row-gap:42px!important}
    @media(max-width:680px){.fullTreeCanvas{row-gap:34px!important}}
  `;document.head.appendChild(css);
  window.drawNodeConnections=drawNodeConnections;
  const ob=new MutationObserver(()=>requestAnimationFrame(drawNodeConnections));ob.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>setTimeout(drawNodeConnections,100));
  document.addEventListener('click',e=>{if(e.target.closest('.personNode'))setTimeout(drawNodeConnections,100)});
  setTimeout(drawNodeConnections,150);setTimeout(drawNodeConnections,800);
})();