(()=>{
const CDN='https://cdn.jsdelivr.net/npm/cytoscape@3.33.1/dist/cytoscape.min.js';
function load(){return new Promise((ok,no)=>{if(window.cytoscape)return ok();const s=document.createElement('script');s.src=CDN;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
const colors=['#C99728','#4D78B8','#5B956D','#9369B0','#C77A45','#4E9193','#8A7B45','#647FB0','#A4667B','#658B59'];
const ids=(p,k)=>window.relationshipIds?relationshipIds(p,k):(p?.[k]||[]);
const getGen=p=>Math.max(0,Number(p?.generationHint)||0);
function edges(){const seen=new Set(),out=[];for(const p of people||[]){for(const cid of ids(p,'children')){const c=byId(cid);if(!c)continue;const k=p.id+'>'+c.id;if(!seen.has(k)){seen.add(k);out.push({data:{id:'pc-'+k,source:p.id,target:c.id,type:'child',gen:getGen(c)}})}}for(const pid of ids(p,'parents')){const par=byId(pid);if(!par)continue;const k=par.id+'>'+p.id;if(!seen.has(k)){seen.add(k);out.push({data:{id:'pc-'+k,source:par.id,target:p.id,type:'child',gen:getGen(p)}})}}for(const sid of ids(p,'spouses')){if(String(p.id)>=String(sid)||!byId(sid))continue;out.push({data:{id:'sp-'+p.id+'-'+sid,source:p.id,target:sid,type:'spouse',gen:getGen(p)}})}}return out}
function nodes(){return (people||[]).map(p=>({data:{id:p.id,label:p.name||'Unknown',gen:getGen(p),gender:(p.gender||'').toLowerCase(),note:p.note||p.details||''}}))}
function removeGenerationChrome(){
  document.querySelectorAll('.fullGenLabel,.generationLabel,.generation-label,.genLabel,.gen-label,.generationBadge,.generation-badge').forEach(el=>el.style.display='none');
  document.querySelectorAll('.fullGenRow').forEach(el=>{el.style.background='transparent';el.style.border='0';el.style.boxShadow='none';});
}
async function render(){const old=document.querySelector('.fullTreeCanvas');if(!old||!window.people)return;await load();if(document.querySelector('#cyFamilyTree'))return;removeGenerationChrome();
const host=document.createElement('div');host.id='cyFamilyTree';host.style.cssText='width:max(100%,1200px);height:calc(100vh - 180px);min-height:720px;background:#fff;border-radius:18px;';old.parentNode.insertBefore(host,old);old.style.display='none';
const cy=cytoscape({container:host,elements:[...nodes(),...edges()],style:[
{selector:'node',style:{'label':'data(label)','text-wrap':'wrap','text-max-width':'170px','text-valign':'center','text-halign':'center','font-size':'17px','font-weight':'650','color':'#1f2937','width':'210px','height':'76px','shape':'round-rectangle','background-color':e=>colors[e.data('gen')%colors.length]+'33','border-color':e=>colors[e.data('gen')%colors.length],'border-width':'3px','padding':'10px'}},
{selector:'edge[type="child"]',style:{'curve-style':'taxi','taxi-direction':'downward','taxi-turn':'50%','line-color':e=>colors[e.data('gen')%colors.length],'width':'4px','target-arrow-shape':'none','source-arrow-shape':'none','opacity':.95}},
{selector:'edge[type="spouse"]',style:{'curve-style':'straight','line-style':'dashed','line-color':'#B65D7C','width':'3px','opacity':.9}},
{selector:'node:selected',style:{'border-width':'6px','border-color':'#A97918','background-color':'#FFF1B8'}},
{selector:'node[gender="female"]',style:{'border-style':'double'}}
],layout:{name:'breadthfirst',directed:true,roots:(people||[]).filter(p=>getGen(p)===0).map(p=>p.id),circle:false,grid:false,spacingFactor:1.55,padding:90,animate:true,animationDuration:450},wheelSensitivity:.18,minZoom:.2,maxZoom:2.4});
window.familyCy=cy;cy.on('tap','node',e=>{const id=e.target.id();if(window.selectPerson)selectPerson(id);});
function fit(){cy.fit(undefined,70)};setTimeout(fit,500);
const bar=document.createElement('div');bar.className='cyZoom';bar.innerHTML='<button data-z="in">＋</button><button data-z="out">−</button><button data-z="fit">Fit</button><button data-z="one">100%</button>';host.parentNode.insertBefore(bar,host);bar.addEventListener('click',e=>{const z=e.target.dataset.z;if(!z)return;if(z==='in')cy.zoom({level:Math.min(2.4,cy.zoom()*1.2),renderedPosition:{x:host.clientWidth/2,y:host.clientHeight/2}});if(z==='out')cy.zoom({level:Math.max(.2,cy.zoom()/1.2),renderedPosition:{x:host.clientWidth/2,y:host.clientHeight/2}});if(z==='fit')fit();if(z==='one'){cy.zoom(1);cy.center()}});
const st=document.createElement('style');st.textContent='#cyFamilyTree{touch-action:none}.cyZoom{position:sticky;top:82px;z-index:30;display:flex;gap:8px;justify-content:flex-end;padding:8px 14px}.cyZoom button{min-width:52px;min-height:48px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#243244;font-size:18px;font-weight:700;box-shadow:0 3px 12px #0001}.fullGenLabel,.generationLabel,.generation-label,.genLabel,.gen-label,.generationBadge,.generation-badge{display:none!important}.fullGenRow{background:transparent!important;border:0!important;box-shadow:none!important}@media(max-width:680px){#cyFamilyTree{height:calc(100vh - 150px);min-height:620px}.cyZoom{top:68px}.cyZoom button{min-width:48px}}';document.head.appendChild(st)
}
const mo=new MutationObserver(()=>{removeGenerationChrome();if(document.querySelector('.fullTreeCanvas')&&!document.querySelector('#cyFamilyTree'))render().catch(console.error)});mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>render().catch(console.error),700);
})();