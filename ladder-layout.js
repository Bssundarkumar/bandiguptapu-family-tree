(()=>{
  const style=document.createElement('style');
  style.id='ladderLayoutStyles';
  style.textContent=`
  .fullTreeCanvas{align-items:stretch!important;gap:28px!important;padding-top:34px!important}
  .fullGenLabel{position:relative!important;left:auto!important;align-self:center!important;margin:0 0 -8px!important;min-width:170px;text-align:center;background:#fff8e8!important;border:2px solid #d8b568!important;color:#5c4317!important;font-size:15px!important;font-weight:850!important;box-shadow:0 3px 10px rgba(73,55,22,.08)!important}
  .fullGenRow{position:relative!important;display:flex!important;justify-content:center!important;align-items:flex-start!important;gap:24px!important;min-height:132px!important;padding:24px 24px 34px!important;border-radius:20px!important;border:1px solid #e1e6ec!important;background:linear-gradient(180deg,#ffffff,#fafbfd)!important;box-shadow:0 2px 8px rgba(41,54,68,.05)!important}
  .fullGenRow:after{content:'';position:absolute;left:4%;right:4%;bottom:-15px;height:2px;background:linear-gradient(90deg,transparent,#c6ced8 14%,#c6ced8 86%,transparent);z-index:0}
  .fullGenRow:last-of-type:after{display:none}
  .fullGenRow .personNode{z-index:2!important}
  .fullTreeCanvas .personNode[data-id="hist-venkatrayudu-1"]{outline:4px solid #d7ae4f!important;outline-offset:3px!important;box-shadow:0 5px 18px rgba(130,92,20,.18)!important}
  .fullTreeCanvas .personNode[data-id="hist-venkatrayudu-1"] .nodeBadge:after{content:' · First generation'}
  .fullTreeCanvas .personNode[data-id="hist-ramappa-1"]{box-shadow:0 5px 16px rgba(63,99,145,.15)!important}
  .treeLegend{font-size:13px!important;line-height:1.4!important}
  @media(max-width:680px){.fullTreeCanvas{gap:22px!important;padding-top:22px!important}.fullGenRow{padding:20px 18px 30px!important;gap:18px!important;border-radius:16px!important}.fullGenLabel{font-size:14px!important;min-width:150px}.fullGenRow:after{bottom:-12px}}
  `;
  document.head.appendChild(style);

  function annotate(){
    const rows=[...document.querySelectorAll('.fullGenRow')];
    rows.forEach((row,i)=>{
      row.setAttribute('aria-label',`Generation ${i+1}`);
      const label=row.previousElementSibling;
      if(label?.classList.contains('fullGenLabel')){
        const n=row.querySelectorAll('.personNode').length;
        label.textContent=`Generation ${i+1} · ${n} ${n===1?'person':'people'}`;
      }
    });
  }
  const ob=new MutationObserver(()=>requestAnimationFrame(annotate));
  ob.observe(document.body,{childList:true,subtree:true});
  setTimeout(annotate,120);
})();