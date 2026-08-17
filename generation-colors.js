(()=>{
  const GEN=[
    {bg:'#FFF4CC',female:'#FDE7B8',border:'#B78A24',line:'#B78A24'},
    {bg:'#DDEBFF',female:'#E7DFFF',border:'#4D78B8',line:'#4D78B8'},
    {bg:'#DDF4EA',female:'#E5F2D2',border:'#3D8C70',line:'#3D8C70'},
    {bg:'#FBE4E7',female:'#F6DDF0',border:'#B86178',line:'#B86178'},
    {bg:'#E9E3FA',female:'#F3E1FA',border:'#7663A8',line:'#7663A8'},
    {bg:'#FDE8D5',female:'#F8E2CF',border:'#B87545',line:'#B87545'},
    {bg:'#E1F0F4',female:'#DCECF8',border:'#4B879A',line:'#4B879A'},
    {bg:'#EAF2D9',female:'#F2E6D8',border:'#718747',line:'#718747'}
  ];
  const rel=(p,type)=>window.relationshipIds?relationshipIds(p,type):(p?.[type]||[]);
  const generationIndex=p=>Math.max(0,Number.isFinite(+p?.generationHint)?+p.generationHint:0);
  const palette=p=>GEN[generationIndex(p)%GEN.length];

  const css=document.createElement('style');
  css.textContent=`
    .fullGenRow{transition:background .2s ease,border-color .2s ease}
    .personNode{font-size:16px!important}
    .personNode .nm{font-size:16px!important;font-weight:850!important}
    .personNode .nodeSub{font-size:13px!important}
    .personNode.genFemale{filter:saturate(.92)}
    .fullGenLabel{font-size:15px!important;font-weight:850!important}
  `;
  document.head.appendChild(css);

  function style(){
    document.querySelectorAll('.personNode[data-id]').forEach(el=>{
      const p=byId(el.dataset.id);if(!p)return;const pal=palette(p);
      const bg=p.gender==='Female'?pal.female:pal.bg;
      el.style.setProperty('background',bg,'important');
      el.style.setProperty('border-color',pal.border,'important');
      el.classList.toggle('genFemale',p.gender==='Female');
    });
    document.querySelectorAll('.fullGenRow').forEach((row,i)=>{
      const pal=GEN[i%GEN.length];
      row.style.setProperty('background',`linear-gradient(180deg,#fff,${pal.bg}66)`,'important');
      row.style.setProperty('border-color',pal.border+'55','important');
    });
  }

  function pos(canvas,id){const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;return{x:el.offsetLeft+el.offsetWidth/2,y1:el.offsetTop,y2:el.offsetTop+el.offsetHeight,midY:el.offsetTop+el.offsetHeight/2}}
  function redraw(){
    const canvas=document.querySelector('.fullTreeCanvas'),svg=canvas?.querySelector('.fullTreeSvg');if(!canvas||!svg)return;
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const paths=[];
    for(const p of people){
      const a=pos(canvas,p.id);if(!a)continue;
      for(const cid of rel(p,'children')){const c=byId(cid),b=pos(canvas,cid);if(!c||!b)continue;const pal=palette(c),my=(a.y2+b.y1)/2;paths.push(`<path d="M ${a.x} ${a.y2} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y1}" fill="none" stroke="${pal.line}" stroke-width="3.2" stroke-linecap="round" opacity=".9"/>`)}
      for(const sid of rel(p,'spouses')){if(p.id>=sid)continue;const b=pos(canvas,sid);if(!b)continue;paths.push(`<path d="M ${a.x} ${a.midY} L ${b.x} ${b.midY}" fill="none" stroke="#A65E83" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" opacity=".85"/>`)}
    }
    svg.innerHTML=paths.join('');
  }
  const refresh=()=>{style();setTimeout(redraw,10)};
  new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>setTimeout(redraw,80));
  setTimeout(refresh,80);setTimeout(refresh,500);
})();