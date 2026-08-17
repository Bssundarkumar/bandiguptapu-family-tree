(()=>{
 const ROOT='hist-venkatrayudu-1';
 const PAL=['#B58A2A','#4A76B7','#3D896E','#B75F78','#7562A7','#B47142','#478496','#718746','#60769A','#3E867E'];
 const bg=['#FFF4CE','#E3EEFF','#E3F4EC','#FBE6EA','#ECE7FA','#FCEBDD','#E5F1F5','#ECF2DE','#E8EDF6','#E2F1EE'];
 const by=id=>window.byId?byId(id):(window.people||[]).find(p=>p.id===id);
 const ids=(p,k)=>{try{return window.relationshipIds?relationshipIds(p,k):(p?.[k]||[])}catch(e){return p?.[k]||[]}};
 function edges(){const m=new Map();for(const p of people||[]){for(const c of ids(p,'children'))if(by(c))m.set(p.id+'>'+c,[p.id,c]);for(const par of ids(p,'parents'))if(by(par))m.set(par+'>'+p.id,[par,p.id]);}return [...m.values()];}
 function reachable(){const es=edges(),ch=new Map();for(const [a,b] of es){if(!ch.has(a))ch.set(a,[]);ch.get(a).push(b)}const seen=new Set(),q=[ROOT];while(q.length){const x=q.shift();if(seen.has(x))continue;seen.add(x);for(const y of ch.get(x)||[])q.push(y)}return seen;}
 function renderD3(){
  if(!window.d3||!window.people)return;
  const old=document.querySelector('.fullTreeCanvas');if(!old)return;
  const host=old.parentElement;if(!host)return;
  old.style.display='none';let wrap=host.querySelector('.d3FamilyTree');if(wrap)wrap.remove();
  wrap=document.createElement('div');wrap.className='d3FamilyTree';wrap.innerHTML='<svg class="d3TreeSvg"></svg>';host.appendChild(wrap);
  const connected=reachable(),data=[...connected].map(id=>by(id)).filter(Boolean);const es=edges().filter(([a,b])=>connected.has(a)&&connected.has(b));
  const parent=new Map(es.map(([a,b])=>[b,a]));
  const strat=d3.stratify().id(d=>d.id).parentId(d=>d.id===ROOT?null:parent.get(d.id));let root;try{root=strat(data)}catch(e){console.error('D3 genealogy hierarchy',e);return}
  const maxDepth=Math.max(...root.descendants().map(d=>d.depth));const width=Math.max(1200,root.leaves().length*260),height=Math.max(700,(maxDepth+1)*230);
  d3.tree().nodeSize([250,210]).separation((a,b)=>a.parent===b.parent?1.05:1.35)(root);
  let minX=d3.min(root.descendants(),d=>d.x),maxX=d3.max(root.descendants(),d=>d.x);const vbW=Math.max(width,maxX-minX+420),vbH=(maxDepth+1)*230+180;
  const svg=d3.select(wrap).select('svg').attr('viewBox',`0 0 ${vbW} ${vbH}`).attr('width','100%').attr('height',Math.min(900,window.innerHeight*.78));const g=svg.append('g').attr('transform',`translate(${190-minX},90)`);
  g.selectAll('.link').data(root.links()).join('path').attr('class','d3link').attr('d',d=>`M${d.source.x},${d.source.y+72} V${(d.source.y+d.target.y)/2} H${d.target.x} V${d.target.y-72}`).attr('stroke',d=>PAL[d.target.depth%PAL.length]);
  const n=g.selectAll('.d3node').data(root.descendants()).join('g').attr('class','d3node').attr('transform',d=>`translate(${d.x},${d.y})`).on('click',(e,d)=>{try{window.selectedId=d.data.id;window.render?.()}catch(_){} });
  n.append('rect').attr('x',-105).attr('y',-66).attr('width',210).attr('height',132).attr('rx',20).attr('fill',d=>bg[d.depth%bg.length]).attr('stroke',d=>PAL[d.depth%PAL.length]).attr('stroke-width',3);
  n.append('circle').attr('cx',-76).attr('cy',-28).attr('r',19).attr('fill','#fff').attr('stroke','#cbd2da');n.append('text').attr('x',-76).attr('y',-21).attr('text-anchor','middle').attr('font-weight',800).text(d=>(d.data.fullName||'?').trim()[0]||'?');
  n.append('text').attr('class','d3name').attr('x',-48).attr('y',-31).each(function(d){const words=(d.data.fullName||'Unknown').split(/\s+/);let line='',lines=[];for(const w of words){if((line+' '+w).length>20){lines.push(line);line=w}else line=(line+' '+w).trim()}if(line)lines.push(line);lines.slice(0,3).forEach((t,i)=>d3.select(this).append('tspan').attr('x',-48).attr('dy',i?22:0).text(t))});
  n.append('text').attr('x',-92).attr('y',48).attr('font-size',13).attr('fill','#5b6673').text(d=>`Generation ${d.depth+1}`);
  const zoom=d3.zoom().scaleExtent([.25,2.5]).on('zoom',e=>g.attr('transform',e.transform));svg.call(zoom);window.d3FamilyZoom={svg,zoom,g};
  setTimeout(()=>{const box=g.node().getBBox(),W=wrap.clientWidth||1000,H=Math.min(900,window.innerHeight*.78),s=Math.min(.95,W/(box.width+100),H/(box.height+100));svg.call(zoom.transform,d3.zoomIdentity.translate(W/2-(box.x+box.width/2)*s,H/2-(box.y+box.height/2)*s).scale(s));},80);
 }
 const st=document.createElement('style');st.textContent=`.d3FamilyTree{width:100%;min-height:650px;background:#fff;border-radius:18px;overflow:hidden}.d3TreeSvg{display:block;touch-action:none;cursor:grab}.d3TreeSvg:active{cursor:grabbing}.d3link{fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.d3node{cursor:pointer}.d3node rect{filter:drop-shadow(0 5px 8px rgba(30,45,60,.10))}.d3name{font:800 17px system-ui,-apple-system,sans-serif;fill:#202833}@media(max-width:680px){.d3FamilyTree{min-height:560px}.d3name{font-size:16px}}`;document.head.appendChild(st);
 window.renderD3FamilyTree=renderD3;setTimeout(renderD3,700);setTimeout(renderD3,1600);
})();