/* Focus day timeline, 07:00-22:00 */
(function(){
  'use strict';
  const START=7, END=22, SLOT=30, KEY='exam-control-focus-day-v2';
  let timer=null;
  const pad=n=>String(n).padStart(2,'0');
  const dayKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const now=()=>Date.now();
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}}
  function record(){const all=load(), k=dayKey(new Date()); return all[k]||null}
  function updateRecord(fn){const all=load(), k=dayKey(new Date()); const r=all[k]||{startedAt:null,endedAt:null,studyIntervals:[]}; fn(r); all[k]=r; save(all)}
  function fmt(ts){return ts?new Date(ts).toLocaleTimeString('en-SG',{hour:'numeric',minute:'2-digit'}):'--'}
  function mins(n){n=Math.max(0,Math.round(n)); const h=Math.floor(n/60),m=n%60; return h?(m?h+'h '+m+'m':h+'h'):m+'m'}
  function overlap(a,b,c){return Math.max(0,(Math.min(b,c)-Math.max(a,0))/60000)}

  function styles(){
    if(document.getElementById('focusTimelineStyles')) return;
    const s=document.createElement('style'); s.id='focusTimelineStyles'; s.textContent=`
      .focus-day-timeline{border:2px solid var(--ink);background:var(--paper);padding:16px;margin-top:20px;position:relative;z-index:2}
      .focus-day-timeline-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:10px}
      .focus-day-timeline-title{font-family:var(--font-display);font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
      .focus-day-timeline-note,.focus-day-timeline-summary,.focus-day-legend{font-family:var(--font-mono);font-size:9px;text-transform:uppercase;letter-spacing:.5px}
      .focus-day-timeline-note{opacity:.55}.focus-day-timeline-summary{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;opacity:.7}.focus-day-timeline-summary strong{color:var(--ink);opacity:1}
      .focus-day-timeline-grid{display:grid;grid-template-columns:52px minmax(0,1fr);margin-top:14px;border-top:1px solid var(--line);border-left:1px solid var(--line)}
      .focus-day-timeline-hours{display:grid;grid-template-rows:repeat(15,30px)}
      .focus-day-timeline-hour{height:30px;display:flex;justify-content:flex-end;padding:4px 7px 0 0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font-family:var(--font-mono);font-size:8px;opacity:.55}
      .focus-day-timeline-track{position:relative;display:grid;grid-template-rows:repeat(30,30px);min-width:0}
      .focus-day-slot{position:relative;height:30px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--paper2);overflow:hidden}.focus-day-slot:nth-child(2n){background:var(--paper)}
      .focus-day-slot-fill{position:absolute;left:0;top:5px;bottom:5px;background:var(--red);opacity:.9}.focus-day-slot-fill.current{background:var(--theme-mid)}
      .focus-day-slot-label{position:absolute;left:6px;top:8px;font-family:var(--font-mono);font-size:7.5px;opacity:.35;pointer-events:none}
      .focus-day-marker{position:absolute;left:-52px;right:0;height:0;border-top:2px solid var(--ink);z-index:4;pointer-events:none}.focus-day-marker.end{border-top-color:var(--red)}
      .focus-day-marker span{position:absolute;left:0;top:-12px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;background:var(--ink);color:var(--on-dark);padding:2px 5px;white-space:nowrap}.focus-day-marker.end span{background:var(--red)}
      .focus-day-empty{padding:14px 0 2px;font-family:var(--font-mono);font-size:10px;opacity:.5}.focus-day-legend{display:flex;gap:14px;margin-top:10px;opacity:.6}.focus-day-legend span{display:flex;align-items:center;gap:5px}.focus-day-legend i{width:10px;height:8px;display:block;background:var(--red)}.focus-day-legend .tracked{background:var(--paper2);border:1px solid var(--line)}
      @media(max-width:600px){.focus-day-timeline{padding:12px}.focus-day-timeline-grid{grid-template-columns:42px minmax(0,1fr)}.focus-day-marker{left:-42px}}
    `; document.head.appendChild(s);
  }

  function findAnchor(){
    const direct=document.querySelector('#panel-focus .focus-wrap,#panel-focus,.focus-wrap,[data-panel="focus"]');
    if(direct) return direct;
    const buttons=[...document.querySelectorAll('button')];
    const dayButton=buttons.find(b=>/begin\s*day|start\s*day/i.test((b.textContent||'').trim()));
    if(dayButton){let n=dayButton; for(let i=0;i<7&&n.parentElement;i++,n=n.parentElement){if(n.querySelectorAll('button').length>=2)return n}}
    const heading=[...document.querySelectorAll('h1,h2,h3,h4,h5,div,span')].find(e=>/focus\s*timer/i.test((e.textContent||'').trim()) && e.children.length<8);
    if(heading){let n=heading; for(let i=0;i<6&&n.parentElement;i++,n=n.parentElement){if(n.querySelectorAll('button').length>=2)return n}}
    return document.querySelector('main')||document.body;
  }
  function ensureContainer(){
    let c=document.getElementById('focusDayTimeline'); if(c)return c;
    const anchor=findAnchor(); c=document.createElement('section'); c.id='focusDayTimeline'; c.className='focus-day-timeline';
    anchor.insertAdjacentElement('afterend',c); return c;
  }

  function hookTracking(){
    if(window.__focusTimelineHooked)return; window.__focusTimelineHooked=true;
    document.addEventListener('click',()=>setTimeout(()=>{
      const bs=[...document.querySelectorAll('button')];
      const texts=bs.map(b=>(b.textContent||'').trim()).join(' | ');
      if(/end\s*day/i.test(texts)){
        const r=record(); if(r&&r.startedAt&&!r.endedAt&&/end\s*day/i.test(texts)){/* button still available, no action */}
      }
      render();
    },50),true);
    const observer=new MutationObserver(()=>{
      const all=load(),k=dayKey(new Date()),r=all[k]; if(!r)return;
      const bs=[...document.querySelectorAll('button')];
      const active=bs.some(b=>/pause|stop/i.test((b.textContent||'').trim()));
      const last=r.studyIntervals[r.studyIntervals.length-1];
      if(active&&!last?.end){if(!last)r.studyIntervals.push({start:now(),end:null});}
      if(!active&&last&&!last.end)last.end=now();
      save(all); render();
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true});
    document.addEventListener('click',e=>{
      const b=e.target.closest&&e.target.closest('button'); if(!b)return; const t=(b.textContent||'').trim();
      if(/begin\s*day|start\s*day/i.test(t)) updateRecord(r=>{if(!r.startedAt)r.startedAt=now()});
      if(/end\s*day/i.test(t)) updateRecord(r=>{if(r.startedAt&&!r.endedAt){r.endedAt=now(); const x=r.studyIntervals.at(-1); if(x&&!x.end)x.end=now()}});
      setTimeout(render,100);
    },true);
  }

  function render(){
    const c=document.getElementById('focusDayTimeline')||ensureContainer(); if(!c)return;
    const r=record(), n=now(), ds=new Date(); ds.setHours(START,0,0,0); const de=new Date(); de.setHours(END,0,0,0); const a=ds.getTime(),b=de.getTime();
    if(!r){c.innerHTML='<div class="focus-day-timeline-head"><div><div class="focus-day-timeline-title">Today’s time allocation</div><div class="focus-day-timeline-note">07:00 → 22:00 · begin your day to start tracking</div></div></div><div class="focus-day-empty">Start your study day and this timeline will show where your time went.</div><div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day</span></div>';return}
    const intervals=r.studyIntervals||[]; const trackedEnd=Math.min(b,r.endedAt||n); const trackedStart=Math.max(a,r.startedAt||a);
    const study=intervals.reduce((s,x)=>s+overlap(x.start,Math.min(x.end||n,b),b),0); const tracked=Math.max(0,(trackedEnd-trackedStart)/60000); const br=Math.max(0,tracked-study);
    const hours=Array.from({length:15},(_,i)=>`<div class="focus-day-timeline-hour">${START+i}:00</div>`).join('');
    const slots=Array.from({length:30},(_,i)=>{const sa=a+i*SLOT*60000,se=sa+SLOT*60000;let sm=0;intervals.forEach(x=>sm+=overlap(Math.max(x.start,sa),Math.min(x.end||n,se),se));const pct=Math.max(0,Math.min(100,sm/SLOT*100));const tp=Math.max(0,Math.min(100,(Math.min(se,trackedEnd)-Math.max(sa,trackedStart))/(SLOT*60000)*100));const cur=intervals.some(x=>!x.end&&sa<=n&&n<=se);return `<div class="focus-day-slot" title="${fmt(sa)} · ${Math.round(sm)} min studied">${tp>0?`<div class="focus-day-slot-fill" style="width:${tp}%;background:var(--ink);opacity:.07"></div>`:''}${pct>0?`<div class="focus-day-slot-fill${cur?' current':''}" style="width:${pct}%"></div>`:''}<span class="focus-day-slot-label">${i%2===0?fmt(sa):''}</span></div>`}).join('');
    const sp=Math.max(0,Math.min(100,(trackedStart-a)/(b-a)*100)); const ep=Math.max(0,Math.min(100,(trackedEnd-a)/(b-a)*100));
    c.innerHTML=`<div class="focus-day-timeline-head"><div><div class="focus-day-timeline-title">Today’s time allocation</div><div class="focus-day-timeline-note">07:00 → 22:00 · 30-minute blocks · updates live</div></div><div class="focus-day-timeline-note">${r.endedAt?'DAY COMPLETE':'DAY IN PROGRESS'}</div></div><div class="focus-day-timeline-summary"><span>Started <strong>${fmt(r.startedAt)}</strong></span>${r.endedAt?`<span>Ended <strong>${fmt(r.endedAt)}</strong></span>`:`<span>Now <strong>${fmt(n)}</strong></span>`}<span>Studied <strong>${mins(study)}</strong></span><span>Break / other <strong>${mins(br)}</strong></span></div><div class="focus-day-timeline-grid"><div class="focus-day-timeline-hours">${hours}</div><div class="focus-day-timeline-track">${slots}<div class="focus-day-marker" style="top:${sp}%"><span>Start of day · ${fmt(r.startedAt)}</span></div>${r.endedAt?`<div class="focus-day-marker end" style="top:${ep}%"><span>End of day · ${fmt(r.endedAt)}</span></div>`:''}</div></div><div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day / break</span></div>`;
  }
  function boot(){styles();hookTracking();render();clearInterval(timer);timer=setInterval(render,5000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();