(()=>{
  const PALETTES=[
    {male:'#DCEBFF',female:'#F4E3FF',border:'#4A78B8',line:'#4A78B8'},
    {male:'#DDF4EA',female:'#FFF0D8',border:'#3E8B70',line:'#3E8B70'},
    {male:'#E7E2FA',female:'#FBE3EC',border:'#7664A8',line:'#7664A8'},
    {male:'#E1F1F5',female:'#F9E7D6',border:'#45869A',line:'#45869A'},
    {male:'#E9F2D8',female:'#F8E4F0',border:'#728B46',line:'#728B46'},
    {male:'#FDE7D2',female:'#F3E4FA',border:'#B66E3E',line:'#B66E3E'},
    {male:'#E3ECF8',female:'#FBE7E1',border:'#5F779B',line:'#5F779B'},
    {male:'#DFF3F0',female:'#F5E5EF',border:'#3F8B82',line:'#3F8B82'}
  ];
  const SPOUSE={bg:'#FFF2E8',female:'#FCE8F1',border:'#C47A55',line:'#C47A55'};
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  const hash=s=>{let h=0;for(const ch of String(s||''))h=((h<<5)-h)+ch.charCodeAt(0)|0;return Math.abs(h)};
  const rel=(p,type)=>window.relationshipIds?relationshipIds(p,type):(p?.[type]||[]);
  const fatherOf=p=>{
    const ids=rel(p,'parents');
    const dad=ids.map(byId).find(x=>x?.gender==='Male');
    return dad?.id||ids[0]||null;
  };
  const spouseOnly=p=>{
    const parents=rel(p,'parents');
    const spouses=rel(p,'spouses');
    if(parents.length||!spouses.length)return false;
    return spouses.some(id=>rel(byId(id),'parents').length>0);
  };
  const familyKey=p=>fatherOf(p)||p?.id||'family';
  const paletteFor=p=>PALETTES[hash(familyKey(p))%PALETTES.length];

  const css=document.createElement('style');
  css.id='accessibleFamilyTheme';
  css.textContent=`
  :root{--text:#202833;--muted:#5F6B78;--line:#D9E0E8;--paper:#FFFFFF;--paper2:#F7F9FC;--focus:#9A6A18}
  html,body{background:#fff!important;color:var(--text)!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif!important;font-size:17px!important}
  body{background:linear-gradient(#fff,#fbfcfe)!important}
  .app,.workspace,.graphPane,.cy,.fallback,.fallback .box{background:#fff!important;color:var(--text)!important}
  .cy{background-image:linear-gradient(#EEF2F6 1px,transparent 1px),linear-gradient(90deg,#EEF2F6 1px,transparent 1px)!important;background-size:32px 32px!important}
  .topbar{background:rgba(255,255,255,.97)!important;border-bottom:1px solid #DCE2E9!important;box-shadow:0 2px 12px rgba(33,45,61,.08)!important;color:var(--text)!important}
  .brand,.brand span,.profileHero h1,.drawerHead h2{color:#26313D!important}.brand small,.meta,.nodeSub,.detail label,.section h3,.selectedMobile span{color:#5F6B78!important}
  .mark{background:#FFF1D5!important;color:#7B5410!important;border:1px solid #E1BF74!important;box-shadow:none!important}
  .search input,.field input,.field select,.field textarea{background:#fff!important;color:#202833!important;border:1.5px solid #B9C3CF!important;font-size:17px!important}
  .search input::placeholder{color:#7A8591!important}.search input:focus,.field input:focus,.field select:focus,.field textarea:focus{border-color:#527FB7!important;box-shadow:0 0 0 3px rgba(82,127,183,.15)!important}
  .btn,.branchToolbar button,.genBtn{background:#fff!important;color:#27313B!important;border:1.5px solid #B8C2CD!important;min-height:44px!important;font-size:16px!important;font-weight:700!important;box-shadow:0 1px 4px rgba(29,42,56,.06)!important}
  .btn.primary,.branchToolbar button.active,.genBtn.active{background:#FFF0CF!important;color:#68490F!important;border-color:#D6AE56!important}
  .branchToolbar,.treeLegend{background:rgba(255,255,255,.96)!important;border:1px solid #D8DEE6!important;box-shadow:0 4px 14px rgba(40,54,70,.10)!important;color:#404A55!important}
  .fullGenLabel{background:#F3F6F9!important;color:#34404C!important;border:1px solid #D8DEE6!important;font-size:14px!important;padding:7px 12px!important}
  .personNode{color:#202833!important;border-width:2px!important;border-radius:16px!important;box-shadow:0 3px 9px rgba(45,58,74,.11)!important;min-height:104px!important;width:215px!important;padding:15px 16px!important;background:#fff!important;animation:none!important}
  .personNode:hover{transform:none!important;box-shadow:0 5px 13px rgba(45,58,74,.16)!important}.personNode:active{transform:scale(.985)!important}
  .personNode:before{display:none!important}.personNode .nm{color:#1F2933!important;font-size:16px!important;line-height:1.28!important;font-weight:800!important}.personNode .nodeSub{color:#4E5A66!important;font-size:13px!important;line-height:1.4!important}.personNode .nodeBadge{color:#34404C!important;background:rgba(255,255,255,.72)!important;border:1px solid rgba(55,68,81,.17)!important;font-size:12px!important;padding:5px 8px!important}
  .personNode .nodeAvatar{width:44px!important;height:44px!important;border-radius:50%!important;background:rgba(255,255,255,.75)!important;color:#26313D!important;border:1px solid rgba(46,59,73,.18)!important;font-size:14px!important}
  .personNode.family-selected,.personNode.active{outline:4px solid #E4B84E!important;outline-offset:2px!important;box-shadow:0 5px 16px rgba(121,89,28,.18)!important}
  .personNode.spouse-card{background:#FFF2E8!important;border-color:#C47A55!important}.personNode.spouse-card[data-gender="Female"]{background:#FCE8F1!important;border-color:#B86C91!important}
  .personNode.pdf-pending{opacity:.72!important;border-style:dashed!important}.fullTreeCanvas .personNode.pdf-pending:after{color:#66717D!important;background:rgba(255,255,255,.8)!important;padding:2px 4px;border-radius:4px}
  .side{background:#FAFBFC!important;color:#202833!important;border-left:1px solid #DDE3EA!important}.profileHero,.detail,.rel{background:#fff!important;border-color:#D9E0E8!important;box-shadow:none!important}.rel strong,.detail div{color:#26313D!important}.confidence{background:#EAF6EF!important;color:#276B4B!important}
  .selectedMobile{background:rgba(255,255,255,.96)!important;color:#202833!important;border:1px solid #D6DEE7!important;box-shadow:0 2px 10px rgba(33,45,61,.10)!important}.selectedMobile b{font-size:16px!important}
  .mobileNav{background:rgba(255,255,255,.98)!important;border:1px solid #D7DEE6!important;box-shadow:0 -2px 12px rgba(33,45,61,.10)!important}.mobileNav button{color:#56616D!important;font-size:12px!important}.mobileNav button.active{background:#FFF0CF!important;color:#68490F!important}
  .drawer{background:#fff!important;color:#202833!important}.drawerHead{background:#fff!important}.toast{background:#26313D!important;color:#fff!important}
  .treeLegend .legendPdf{background:#4C8B72!important}.treeLegend .legendFamily{background:#D5A84E!important}.treeLegend .legendPending{background:#87919C!important}
  .branchHint{color:#596571!important;font-size:14px!important;line-height:1.45!important}
  #familyZoomControls{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:80;display:grid;gap:8px;padding:9px;background:rgba(255,255,255,.97);border:1px solid #CFD7E0;border-radius:16px;box-shadow:0 4px 18px rgba(36,49,63,.15)}
  #familyZoomControls button{width:52px;min-height:48px;border:1.5px solid #B9C3CF;background:#fff;color:#24303B;border-radius:11px;font-size:22px;font-weight:800}#familyZoomControls button.zoomText{font-size:12px;line-height:1.15;padding:5px}
  #familyZoomReadout{text-align:center;color:#4E5965;font-size:12px;font-weight:800}
  @media(max-width:680px){html,body{font-size:17px!important}.personNode{width:202px!important;min-height:102px!important}.personNode .nm{font-size:15px!important}.personNode .nodeSub{font-size:12.5px!important}.fullGenRow{gap:22px!important}.fullTreeCanvas{gap:78px!important;padding-left:72px!important}#familyZoomControls{left:7px;top:auto;bottom:calc(82px + env(safe-area-inset-bottom));transform:none;padding:6px;gap:5px}#familyZoomControls button{width:46px;min-height:43px;font-size:20px}.branchToolbar button{font-size:14px!important}}
  `;
  document.head.appendChild(css);

  function styleNodes(root=document){
    root.querySelectorAll('.personNode[data-id]').forEach(el=>{
      const p=byId(el.dataset.id);if(!p)return;
      el.dataset.gender=p.gender||'';
      el.classList.toggle('family-selected',p.id===current);
      const sp=spouseOnly(p);
      el.classList.toggle('spouse-card',sp);
      if(sp){el.style.setProperty('background',p.gender==='Female'?SPOUSE.female:SPOUSE.bg,'important');el.style.setProperty('border-color',SPOUSE.border,'important');return;}
      const pal=paletteFor(p);
      const bg=p.gender==='Female'?pal.female:p.gender==='Male'?pal.male:'#F1F4F7';
      el.style.setProperty('background',bg,'important');
      el.style.setProperty('border-color',pal.border,'important');
    });
  }

  function position(canvas,id){
    const el=canvas.querySelector(`.personNode[data-id="${CSS.escape(id)}"]`);if(!el)return null;
    return{x:el.offsetLeft+el.offsetWidth/2,y1:el.offsetTop,y2:el.offsetTop+el.offsetHeight,midY:el.offsetTop+el.offsetHeight/2};
  }
  function redrawBranchConnectors(){
    const canvas=document.querySelector('.fullTreeCanvas'),svg=canvas?.querySelector('.fullTreeSvg');if(!canvas||!svg)return;
    const w=canvas.scrollWidth,h=canvas.scrollHeight;svg.setAttribute('width',w);svg.setAttribute('height',h);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const paths=[];
    for(const p of people){
      const a=position(canvas,p.id);if(!a)continue;
      for(const cid of rel(p,'children')){
        const child=byId(cid),b=position(canvas,cid);if(!child||!b)continue;
        const pal=paletteFor(child),my=(a.y2+b.y1)/2;
        paths.push(`<path d="M ${a.x} ${a.y2} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y1}" fill="none" stroke="${pal.line}" stroke-width="3" stroke-linecap="round" opacity=".82"/>`);
      }
      for(const sid of rel(p,'spouses')){
        if(p.id>=sid)continue;const b=position(canvas,sid);if(!b)continue;
        paths.push(`<path d="M ${a.x} ${a.midY} L ${b.x} ${b.midY}" fill="none" stroke="#B86C91" stroke-width="3" stroke-dasharray="8 6" stroke-linecap="round" opacity=".8"/>`);
      }
    }
    svg.innerHTML=paths.join('');
  }

  let zoom=1;
  function canvas(){return document.querySelector('.fullTreeCanvas')}
  function applyZoom(v){zoom=Math.max(.5,Math.min(1.6,v));const c=canvas();if(c)c.style.zoom=zoom;const r=document.getElementById('familyZoomReadout');if(r)r.textContent=Math.round(zoom*100)+'%';setTimeout(redrawBranchConnectors,40)}
  function fitTree(){const c=canvas(),host=document.getElementById('fallback');if(!c||!host)return;const vw=Math.max(280,host.clientWidth-90),vh=Math.max(300,host.clientHeight-120);applyZoom(Math.max(.5,Math.min(1,Math.min(vw/c.scrollWidth,vh/c.scrollHeight))));host.scrollTo({left:0,top:0,behavior:'smooth'})}
  function addZoom(){if(document.getElementById('familyZoomControls'))return;const z=document.createElement('div');z.id='familyZoomControls';z.setAttribute('aria-label','Tree zoom controls');z.innerHTML='<button id="zoomIn" aria-label="Zoom in">＋</button><div id="familyZoomReadout">100%</div><button id="zoomOut" aria-label="Zoom out">−</button><button id="zoomFit" class="zoomText" aria-label="Fit tree">FIT</button><button id="zoomReset" class="zoomText" aria-label="Reset zoom">100%</button>';document.body.appendChild(z);z.querySelector('#zoomIn').onclick=()=>applyZoom(zoom+.1);z.querySelector('#zoomOut').onclick=()=>applyZoom(zoom-.1);z.querySelector('#zoomFit').onclick=fitTree;z.querySelector('#zoomReset').onclick=()=>applyZoom(1)}

  const refresh=()=>{styleNodes();redrawBranchConnectors();addZoom()};
  const observer=new MutationObserver(()=>requestAnimationFrame(refresh));observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('.personNode'))setTimeout(refresh,30)});
  window.addEventListener('resize',()=>setTimeout(redrawBranchConnectors,80));
  setTimeout(refresh,80);setTimeout(refresh,500);
})();