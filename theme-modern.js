(()=>{
  const style=document.createElement('style');
  style.textContent=`
  :root{--gold:#f3c978;--cyan:#6fd7ff;--mint:#77dfb2;--rose:#f39ac2;--violet:#b9a4ff;--amber:#ffbe68}
  body{background:radial-gradient(circle at 12% 0%,rgba(89,120,255,.20),transparent 32%),radial-gradient(circle at 92% 8%,rgba(246,182,88,.18),transparent 30%),radial-gradient(circle at 55% 95%,rgba(82,210,175,.11),transparent 35%),#07101b!important}
  .topbar{background:linear-gradient(180deg,rgba(10,18,31,.92),rgba(7,13,23,.82))!important}
  .mark{background:linear-gradient(135deg,#ffd994,#eaa652)!important;box-shadow:0 8px 28px rgba(234,166,82,.25)}
  .personNode{overflow:hidden;isolation:isolate;transition:transform .24s ease,box-shadow .24s ease,border-color .24s ease;background:linear-gradient(145deg,#17253a,#0c1725)!important}
  .personNode:before{content:'';position:absolute;inset:0;z-index:-1;opacity:.18;background:linear-gradient(135deg,var(--tile1,#6fd7ff),transparent 65%)}
  .personNode:hover,.personNode:active{transform:translateY(-3px) scale(1.015)}
  .personNode.role-parent{--tile1:var(--violet);border-color:rgba(185,164,255,.48)!important;box-shadow:0 16px 42px rgba(80,63,150,.20)}
  .personNode.role-spouse{--tile1:var(--rose);border-color:rgba(243,154,194,.50)!important;box-shadow:0 16px 42px rgba(160,65,112,.18)}
  .personNode.role-sibling{--tile1:var(--cyan);border-color:rgba(111,215,255,.45)!important;box-shadow:0 16px 42px rgba(42,138,184,.16)}
  .personNode.role-child{--tile1:var(--mint);border-color:rgba(119,223,178,.48)!important;box-shadow:0 16px 42px rgba(38,145,108,.17)}
  .personNode.role-selected{--tile1:var(--gold);border-color:var(--gold)!important;box-shadow:0 0 0 2px rgba(243,201,120,.16),0 20px 55px rgba(229,158,54,.20)!important}
  .personNode.role-parent .nodeAvatar{background:linear-gradient(135deg,#d8cdff,#937dff)!important;color:#19122e!important}
  .personNode.role-spouse .nodeAvatar{background:linear-gradient(135deg,#ffd0e3,#ed77aa)!important;color:#32111f!important}
  .personNode.role-sibling .nodeAvatar{background:linear-gradient(135deg,#bfeeff,#58c8f5)!important;color:#082533!important}
  .personNode.role-child .nodeAvatar{background:linear-gradient(135deg,#c7f6df,#62d29c)!important;color:#08291b!important}
  .personNode.role-selected .nodeAvatar{background:linear-gradient(135deg,#ffe6ab,#e9ae50)!important;color:#2a1a05!important}
  .nodeBadge{border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(8px)}
  .role-parent .nodeBadge{color:#d9d0ff;background:rgba(139,114,240,.12)}
  .role-spouse .nodeBadge{color:#ffc9df;background:rgba(222,91,146,.12)}
  .role-sibling .nodeBadge{color:#c9f2ff;background:rgba(69,178,226,.12)}
  .role-child .nodeBadge{color:#cdf6e1;background:rgba(71,188,140,.12)}
  .role-selected .nodeBadge{color:#ffe3a8;background:rgba(234,174,75,.13)}
  .connectorV{width:3px!important;border-radius:999px;background:linear-gradient(#efc46e,#68d6bd)!important;box-shadow:0 0 14px rgba(104,214,189,.24)}
  .unionMark{background:linear-gradient(135deg,rgba(243,154,194,.18),rgba(243,201,120,.15))!important;border-color:rgba(243,201,120,.55)!important;box-shadow:0 8px 20px rgba(0,0,0,.18)}
  .branchToolbar{background:rgba(8,14,25,.58);backdrop-filter:blur(18px);border-radius:999px}
  .branchToolbar button.active{background:linear-gradient(135deg,#ffd88f,#dda04a)!important;box-shadow:0 7px 20px rgba(221,160,74,.23)}
  .profileHero{background:linear-gradient(145deg,rgba(61,105,173,.18),rgba(243,201,120,.08))!important;border-color:rgba(130,176,235,.18)!important}
  .rel{background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.018))!important}
  @keyframes nodeIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
  .personNode{animation:nodeIn .38s cubic-bezier(.2,.8,.2,1) both}
  .focusLevel .personNode:nth-child(2){animation-delay:.05s}.focusLevel .personNode:nth-child(3){animation-delay:.09s}.focusLevel .personNode:nth-child(4){animation-delay:.13s}
  @media(max-width:680px){.personNode{box-shadow:0 12px 30px rgba(0,0,0,.18)!important}.focusTree{padding-top:26px!important}.nodeBadge{font-size:.58rem}}
  `;
  document.head.appendChild(style);

  if(typeof window.nodeCard2==='function'){
    const original=window.nodeCard2;
    window.nodeCard2=function(p,label=''){
      let html=original(p,label);
      const role=(label||'').toLowerCase();
      const cls=role==='parent'?'role-parent':role==='spouse'?'role-spouse':role==='sibling'?'role-sibling':role==='child'?'role-child':role==='selected'?'role-selected':'';
      if(cls)html=html.replace('class="personNode ','class="personNode '+cls+' ');
      return html;
    };
  }
  try{render()}catch(e){console.error('Theme render',e)}
})();