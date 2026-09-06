(function(){
  'use strict';

  function boot(){
    const dropdown=document.getElementById('studyHistoryDropdown');
    if(!dropdown || dropdown.dataset.monthlyReady==='1') return;
    dropdown.dataset.monthlyReady='1';

    const originalRender=window.renderStudyHistory;
    let cursor=new Date();
    cursor.setDate(1);

    function history(){
      if(typeof pomo==='undefined') return [];
      const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
      const days=new Map();
      if(pomo.dayHistory) Object.keys(pomo.dayHistory).forEach(k=>{const p=k.split('-').map(Number); if(p.length===3) days.set(k,new Date(p[0],p[1],p[2]));});
      if(Array.isArray(pomo.completedFocus)) pomo.completedFocus.forEach(e=>{const ts=Number(e.ts||e.timestamp||0); if(ts){const d=new Date(ts),k=key(d); if(!days.has(k)) days.set(k,new Date(d.getFullYear(),d.getMonth(),d.getDate()));}});
      return [...days.values()];
    }

    function minutes(date){
      const k=key(date);
      const r=pomo.dayHistory&&pomo.dayHistory[k];
      if(!r) return 0;
      const end=r.endedAt==null?Date.now():Number(r.endedAt);
      return Math.floor((r.studyIntervals||[]).reduce((s,i)=>s+Math.max(0,(Math.min(end,Number(i.end)||Date.now())-Math.max(Number(i.start)||0, date.getTime()))/60000),0));
    }
    function key(d){return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();}
    function draw(){
      const all=history();
      const y=cursor.getFullYear(),m=cursor.getMonth();
      const daysInMonth=new Date(y,m+1,0).getDate();
      const max=Math.max(1,...all.filter(d=>d.getFullYear()===y&&d.getMonth()===m).map(minutes));
      const vals=Array.from({length:daysInMonth},(_,i)=>{const d=new Date(y,m,i+1); return {d,minutes:all.some(x=>key(x)===key(d))?minutes(d):0};});
      const total=vals.reduce((s,x)=>s+x.minutes,0);
      dropdown.innerHTML='<summary><span>Study History</span><span class="study-history-meta">'+new Date(y,m,1).toLocaleDateString('en-SG',{month:'long',year:'numeric'})+' · '+Math.round(total/60)+'h '+total%60+'m</span></summary><div class="study-history-content"><div class="study-history-month-nav"><button type="button" data-month="prev">← Prev</button><div class="study-history-month">'+new Date(y,m,1).toLocaleDateString('en-SG',{month:'long',year:'numeric'})+'</div><button type="button" data-month="next">Next →</button></div><div class="study-history-bars">'+vals.map(x=>'<div class="study-history-day"><div class="study-history-value">'+(x.minutes?x.minutes+'m':'')+'</div><div class="study-history-bar-wrap"><div class="study-history-bar" style="height:'+Math.max(2,Math.round(x.minutes/max*160))+'px" title="'+x.d.toLocaleDateString('en-SG')+' · '+x.minutes+' minutes studied"></div></div><div class="study-history-date">'+x.d.getDate()+'</div></div>').join('')+'</div></div>';
      dropdown.querySelector('[data-month="prev"]').onclick=function(e){e.preventDefault();cursor.setMonth(cursor.getMonth()-1);draw();};
      dropdown.querySelector('[data-month="next"]').onclick=function(e){e.preventDefault();cursor.setMonth(cursor.getMonth()+1);draw();};
    }
    draw();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50),{once:true}); else setTimeout(boot,50);
})();