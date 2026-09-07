(function(){
  'use strict';

  function key(d){return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();}
  function getMinutes(date){
    if(typeof pomo==='undefined'||!pomo.dayHistory)return 0;
    const r=pomo.dayHistory[key(date)];
    if(!r)return 0;
    const now=Date.now();
    const dayStart=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
    const dayEnd=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime();
    const end=Math.min(dayEnd,r.endedAt==null?now:Number(r.endedAt));
    return Math.floor((r.studyIntervals||[]).reduce((sum,i)=>sum+Math.max(0,(Math.min(end,i.end==null?now:Number(i.end))-Math.max(dayStart,Number(i.start)||0))/60000),0));
  }
  function ensureDropdown(){
    const anchor=document.getElementById('focusDayTimeline');
    if(!anchor)return null;
    let dropdown=document.getElementById('studyHistoryDropdown');
    if(!dropdown){
      dropdown=document.createElement('details');
      dropdown.id='studyHistoryDropdown';
      dropdown.className='study-history-dropdown';
      anchor.insertAdjacentElement('afterend',dropdown);
    }
    if(!document.getElementById('studyHistoryMonthlyCSS')){
      const link=document.createElement('link');
      link.id='studyHistoryMonthlyCSS';
      link.rel='stylesheet';
      link.href='scripts/study-history-monthly.css';
      document.head.appendChild(link);
    }
    return dropdown;
  }
  function boot(){
    const dropdown=ensureDropdown();
    if(!dropdown||dropdown.dataset.monthlyReady==='1')return;
    dropdown.dataset.monthlyReady='1';
    let cursor=new Date();cursor.setDate(1);
    function draw(){
      const y=cursor.getFullYear(),m=cursor.getMonth();
      const daysInMonth=new Date(y,m+1,0).getDate();
      const vals=Array.from({length:daysInMonth},(_,i)=>{const d=new Date(y,m,i+1);return{d,minutes:getMinutes(d)};});
      const max=Math.max(1,...vals.map(x=>x.minutes));
      const total=vals.reduce((s,x)=>s+x.minutes,0);
      const label=new Date(y,m,1).toLocaleDateString('en-SG',{month:'long',year:'numeric'});
      const wasOpen=dropdown.open;
      dropdown.innerHTML='<summary><span>Study History</span><span class="study-history-meta">'+label+' · '+Math.floor(total/60)+'h '+total%60+'m</span></summary><div class="study-history-content"><div class="study-history-month-nav"><button type="button" data-month="prev">← Prev Month</button><div class="study-history-month">'+label+'</div><button type="button" data-month="next">Next Month →</button></div><div class="study-history-bars">'+vals.map(x=>'<div class="study-history-day"><div class="study-history-value">'+(x.minutes?x.minutes+'m':'')+'</div><div class="study-history-bar-wrap"><div class="study-history-bar" style="height:'+Math.max(2,Math.round(x.minutes/max*160))+'px" title="'+x.d.toLocaleDateString('en-SG')+' · '+x.minutes+' minutes studied"></div></div><div class="study-history-date">'+x.d.getDate()+'</div></div>').join('')+'</div></div>';
      dropdown.querySelector('[data-month="prev"]').onclick=function(e){e.preventDefault();cursor.setMonth(cursor.getMonth()-1);draw();};
      dropdown.querySelector('[data-month="next"]').onclick=function(e){e.preventDefault();cursor.setMonth(cursor.getMonth()+1);draw();};
      dropdown.open=wasOpen;
    }
    draw();
    setInterval(draw,10000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50),{once:true});
  else setTimeout(boot,50);
})();