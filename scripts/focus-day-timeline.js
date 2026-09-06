/* Focus Day Timeline + Brain Dump + Study Pattern */
(function(){
  'use strict';
  const START_HOUR=7, END_HOUR=22, SLOT_MINUTES=30;
  const SLOT_COUNT=((END_HOUR-START_HOUR)*60)/SLOT_MINUTES;
  const BRAIN_DUMP_KEY='examcontrol-brain-dump';
  let timer=null;

  const pad=v=>String(v).padStart(2,'0');
  function keyForDate(d){return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();}
  function todayRecord(){return typeof pomo==='undefined'||!pomo.dayHistory?null:pomo.dayHistory[keyForDate(new Date())]||null;}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function time(ts){return new Date(ts).toLocaleTimeString('en-SG',{hour:'numeric',minute:'2-digit'});}
  function duration(min){min=Math.max(0,Math.round(min));const h=Math.floor(min/60),m=min%60;return h&&m?`${h}h ${m}m`:h?`${h}h`:`${m}m`;}

  function ensureStyles(){
    if(document.getElementById('focusTimelineStyles'))return;
    const s=document.createElement('style');s.id='focusTimelineStyles';s.textContent=`
      .focus-day-timeline{border:2px solid var(--ink);background:var(--paper);padding:16px;margin-top:20px}
      .focus-day-timeline-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:10px}
      .focus-day-timeline-title{font-family:var(--font-display);font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
      .focus-day-timeline-note,.brain-dump-note,.study-history-note{font-family:var(--font-mono);font-size:9px;opacity:.55;text-transform:uppercase;letter-spacing:.6px}
      .focus-day-timeline-summary{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-family:var(--font-mono);font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;opacity:.7}
      .focus-day-timeline-summary strong{color:var(--ink);opacity:1}
      .focus-day-timeline-grid{display:grid;grid-template-columns:48px minmax(0,1fr);margin-top:14px;border-top:1px solid var(--line);border-left:1px solid var(--line)}
      .focus-day-timeline-hours{display:grid;grid-template-rows:repeat(15,1fr)}
      .focus-day-timeline-hour{height:30px;display:flex;align-items:flex-start;justify-content:flex-end;padding:4px 7px 0 0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font-family:var(--font-mono);font-size:8px;opacity:.55}
      .focus-day-timeline-track{position:relative;display:grid;grid-template-rows:repeat(30,30px);min-width:0}
      .focus-day-slot{position:relative;height:30px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--paper2);overflow:hidden}
      .focus-day-slot:nth-child(2n){background:var(--paper)}
      .focus-day-slot-fill{position:absolute;left:0;top:4px;bottom:4px;background:var(--red);min-width:0;opacity:.9}
      .focus-day-slot-fill.current{background:var(--theme-mid)}
      .focus-day-slot-label{position:absolute;left:6px;top:8px;font-family:var(--font-mono);font-size:7.5px;opacity:.36;pointer-events:none}
      .focus-day-marker{position:absolute;left:-48px;right:0;height:0;border-top:2px solid var(--ink);z-index:4;pointer-events:none}
      .focus-day-marker span{position:absolute;left:0;top:-12px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;letter-spacing:.5px;background:var(--ink);color:var(--on-dark);padding:2px 5px;white-space:nowrap}
      .focus-day-marker.end{border-top-color:var(--red)}.focus-day-marker.end span{background:var(--red)}
      .focus-day-empty{padding:14px 0 2px;font-family:var(--font-mono);font-size:10px;opacity:.5}
      .focus-day-legend,.study-legend{display:flex;gap:14px;margin-top:10px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;opacity:.6}
      .focus-day-legend span,.study-legend span{display:flex;align-items:center;gap:5px}
      .focus-day-legend i,.study-legend i{width:10px;height:8px;display:block;background:var(--red)}
      .focus-day-legend .tracked,.study-legend .break-key{background:var(--paper2);border:1px solid var(--line)}
      .brain-dump{border:2px solid var(--ink);background:var(--paper);padding:18px;margin-top:14px}
      .brain-dump-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px}
      .brain-dump-title{font-family:var(--font-display);font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:.4px}
      .brain-dump-input{display:block;width:100%;min-height:110px;resize:none;overflow:hidden;border:1px solid var(--ink);background:var(--paper);color:var(--ink);padding:12px;font-family:var(--font-body);font-size:13.5px;line-height:1.55;outline:none}
      .brain-dump-input:focus{border:2px solid var(--ink);padding:11px}
      .brain-dump-input::placeholder{color:var(--ink);opacity:.38}
      .study-pattern-widget{border:2px solid var(--ink);background:var(--paper);padding:16px;cursor:pointer;min-height:180px}
      .study-pattern-widget:hover{background:var(--paper2)}
      .study-pattern-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-bottom:1px solid var(--line);padding-bottom:8px}
      .study-pattern-title{font-family:var(--font-display);font-size:14px;font-weight:700;text-transform:uppercase}
      .study-pattern-hint{font-family:var(--font-mono);font-size:8px;text-transform:uppercase;opacity:.5}
      .study-pattern-total{font-family:var(--font-mono);font-size:10px;margin-top:8px;opacity:.65}
      .study-pattern-bars{display:grid;grid-template-columns:repeat(7,1fr);gap:7px;height:95px;align-items:end;margin-top:12px}
      .study-pattern-day{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;min-width:0}
      .study-pattern-bar-wrap{width:100%;height:72px;display:flex;align-items:flex-end;justify-content:center}
      .study-pattern-bar{width:min(28px,70%);min-height:2px;background:var(--red);border:1px solid var(--ink)}
      .study-pattern-value{font-family:var(--font-mono);font-size:8px;margin-top:4px;white-space:nowrap}
      .study-pattern-label{font-family:var(--font-mono);font-size:8px;margin-top:5px;opacity:.55}
      .study-history-overlay{position:fixed;inset:0;background:#1A233288;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px}
      .study-history-modal{width:min(760px,100%);max-height:min(720px,90vh);overflow:auto;background:var(--paper);border:2px solid var(--ink);box-shadow:0 10px 30px #0003}
      .study-history-head{position:sticky;top:0;background:var(--paper);padding:18px;border-bottom:2px solid var(--ink);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .study-history-title{font-family:var(--font-display);font-size:18px;font-weight:800;text-transform:uppercase}
      .study-history-close{border:2px solid var(--ink);padding:5px 10px;font-family:var(--font-mono);font-size:10px;background:var(--paper)}
      .study-history-list{padding:8px 18px 18px}
      .study-history-row{display:grid;grid-template-columns:120px 1fr 80px;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
      .study-history-date{font-family:var(--font-mono);font-size:10px}.study-history-bar{height:14px;background:var(--paper2);border:1px solid var(--line)}
      .study-history-fill{height:100%;background:var(--red)}.study-history-hours{font-family:var(--font-mono);font-size:10px;text-align:right}
      .study-history-empty{padding:20px;font-family:var(--font-mono);font-size:11px;opacity:.55}
      @media(max-width:600px){.focus-day-timeline{padding:12px}.focus-day-timeline-grid{grid-template-columns:42px minmax(0,1fr)}.focus-day-timeline-hour{padding-right:5px;font-size:7px}.focus-day-marker{left:-42px}.brain-dump{padding:12px}.study-history-row{grid-template-columns:90px 1fr 65px;gap:8px}}
    `;document.head.appendChild(s);
  }

  function ensureBrainDump(){
    const todo=document.getElementById('todoList');if(!todo)return;
    let box=document.getElementById('todoBrainDump');
    if(box)return;
    box=document.createElement('section');box.id='todoBrainDump';box.className='brain-dump';
    box.innerHTML='<div class="brain-dump-head"><div class="brain-dump-title">Brain Dump</div><div class="brain-dump-note">Ideas, thoughts, reminders · not everything needs to become a task</div></div><textarea class="brain-dump-input" id="brainDumpInput" rows="4" aria-label="Brain dump" placeholder="Write anything here... ideas, things to remember, random thoughts, questions, plans..."></textarea>';
    todo.insertAdjacentElement('afterend',box);
    const input=box.querySelector('#brainDumpInput');input.value=localStorage.getItem(BRAIN_DUMP_KEY)||'';
    const resize=()=>{input.style.height='auto';input.style.height=Math.max(110,input.scrollHeight)+'px';};
    input.addEventListener('input',()=>{localStorage.setItem(BRAIN_DUMP_KEY,input.value);resize();});resize();
  }

  function intervalEnd(i,now){return i.end==null?now:i.end;}
  function overlapMinutes(i,start,end,now){const from=Math.max(start,Number(i.start)||0),to=Math.min(end,intervalEnd(i,now));return Math.max(0,(to-from)/60000);}
  function metricsForDate(date,now=Date.now()){
    if(typeof pomo==='undefined'||!pomo.dayHistory)return null;
    const r=pomo.dayHistory[keyForDate(date)];if(!r||!r.startedAt)return null;
    const dayStart=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
    const dayEnd=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime();
    const start=Math.max(dayStart,Number(r.startedAt));
    const end=Math.min(dayEnd,r.endedAt==null?now:Number(r.endedAt));
    const total=Math.max(0,Math.floor((end-start)/60000));
    const study=Math.min(total,Math.max(0,Math.floor((r.studyIntervals||[]).reduce((sum,i)=>sum+Math.max(0,(Math.min(end,intervalEnd(i,now))-Math.max(start,Number(i.start)||0))/60000),0))));
    return {studyMinutes:study,breakMinutes:Math.max(0,total-study),totalMinutes:total};
  }
  function studyMinutesFromLegacy(date){
    if(typeof pomo==='undefined')return 0;
    const k=keyForDate(date);
    const list=Array.isArray(pomo.completedFocus)?pomo.completedFocus:[];
    return list.reduce((sum,e)=>{
      if(e.key===k)return sum+(Number(e.minutes)||0);
      const ts=Number(e.ts||e.timestamp||0);return ts&&keyForDate(new Date(ts))===k?sum+(Number(e.minutes)||0):sum;
    },0);
  }
  function historyDays(){
    const map=new Map();
    if(typeof pomo!=='undefined'&&pomo.dayHistory){
      Object.keys(pomo.dayHistory).forEach(k=>{
        const r=pomo.dayHistory[k];const parts=k.split('-').map(Number);
        if(parts.length===3&&r)map.set(k,{key:k,date:new Date(parts[0],parts[1],parts[2]),metrics:null});
      });
    }
    const focus=typeof pomo!=='undefined'&&Array.isArray(pomo.completedFocus)?pomo.completedFocus:[];
    focus.forEach(e=>{const ts=Number(e.ts||e.timestamp||0);if(!ts)return;const d=new Date(ts);const k=keyForDate(d);if(!map.has(k))map.set(k,{key:k,date:new Date(d.getFullYear(),d.getMonth(),d.getDate()),metrics:null});});
    return [...map.values()].sort((a,b)=>a.date-b.date).map(x=>{const m=metricsForDate(x.date);x.minutes=m?m.studyMinutes:studyMinutesFromLegacy(x.date);return x;});
  }
  function last7(){
    const out=[];for(let i=6;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);const m=metricsForDate(d);out.push({date:d,minutes:m?m.studyMinutes:studyMinutesFromLegacy(d)});}return out;
  }

  function openHistory(){
    if(document.getElementById('studyHistoryOverlay'))return;
    const days=historyDays();
    const max=Math.max(1,...days.map(d=>d.minutes));
    const overlay=document.createElement('div');overlay.id='studyHistoryOverlay';overlay.className='study-history-overlay';
    overlay.innerHTML='<div class="study-history-modal" role="dialog" aria-modal="true" aria-label="Full study history"><div class="study-history-head"><div><div class="study-history-title">Full Study History</div><div class="study-history-note">Every recorded day · click outside to close</div></div><button class="study-history-close" type="button">Close</button></div><div class="study-history-list">'+(days.length?days.map(d=>`<div class="study-history-row"><div class="study-history-date">${d.date.toLocaleDateString('en-SG',{day:'2-digit',month:'short',year:'numeric'})}</div><div class="study-history-bar"><div class="study-history-fill" style="width:${Math.max(0,Math.round(d.minutes/max*100))}%"></div></div><div class="study-history-hours">${duration(d.minutes)}</div></div>`).join(''):'<div class="study-history-empty">No study sessions have been recorded yet.</div>')+'</div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('.study-history-close').onclick=()=>overlay.remove();
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
    document.addEventListener('keydown',function esc(e){if(e.key==='Escape'){overlay.remove();document.removeEventListener('keydown',esc);}});
  }

  function ensureStudyPatternWidget(){
    const grid=document.getElementById('dashboardWidgets');
    if(!grid)return;
    let widget=document.getElementById('studyPatternWidget');
    if(!widget){
      widget=document.createElement('section');widget.id='studyPatternWidget';widget.className='study-pattern-widget';widget.setAttribute('role','button');widget.setAttribute('tabindex','0');
      grid.prepend(widget);
      widget.addEventListener('click',openHistory);widget.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')openHistory();});
    }
    const days=last7(),max=Math.max(1,...days.map(d=>d.minutes)),total=days.reduce((s,d)=>s+d.minutes,0);
    widget.innerHTML='<div class="study-pattern-head"><div class="study-pattern-title">Study Pattern</div><div class="study-pattern-hint">click for full history</div></div><div class="study-pattern-total">Last 7 days · '+duration(total)+' studied</div><div class="study-pattern-bars">'+days.map(d=>{const h=d.minutes?Math.max(3,Math.round(d.minutes/max*72)):2;return '<div class="study-pattern-day"><div class="study-pattern-bar-wrap"><div class="study-pattern-bar" style="height:'+h+'px" title="'+d.minutes+' minutes"></div></div><div class="study-pattern-value">'+duration(d.minutes)+'</div><div class="study-pattern-label">'+d.date.toLocaleDateString('en-GB',{weekday:'short'}).slice(0,2)+'</div></div>';}).join('')+'</div>';
  }

  function renderTimeline(){
    const panel=document.getElementById('panel-focus'),anchor=panel&&panel.querySelector('.focus-wrap');if(!anchor)return;
    let c=document.getElementById('focusDayTimeline');if(!c){c=document.createElement('section');c.id='focusDayTimeline';c.className='focus-day-timeline';anchor.insertAdjacentElement('afterend',c);}
    const r=todayRecord(),now=Date.now(),ds=new Date();ds.setHours(START_HOUR,0,0,0);const de=new Date();de.setHours(END_HOUR,0,0,0),start=ds.getTime(),end=de.getTime();
    if(!r){c.innerHTML='<div class="focus-day-timeline-head"><div><div class="focus-day-timeline-title">Today\'s time allocation</div><div class="focus-day-timeline-note">07:00 → 22:00 · start the day to begin tracking</div></div></div><div class="focus-day-empty">Your timeline will fill in here as you study. Begin Day records the start of your tracked day.</div>';return;}
    const ints=Array.isArray(r.studyIntervals)?r.studyIntervals:[],trackedStart=Math.max(start,Number(r.startedAt)||start),trackedEnd=Math.min(end,r.endedAt==null?now:Number(r.endedAt));
    const study=ints.reduce((s,i)=>s+overlapMinutes(i,start,end,now),0),tracked=Math.max(0,(trackedEnd-trackedStart)/60000),breakM=Math.max(0,tracked-study);
    const hours=Array.from({length:15},(_,i)=>'<div class="focus-day-timeline-hour">'+(START_HOUR+i)+':00</div>').join('');
    const slots=Array.from({length:SLOT_COUNT},(_,i)=>{const a=start+i*SLOT_MINUTES*60000,b=a+SLOT_MINUTES*60000,m=ints.reduce((s,x)=>s+overlapMinutes(x,a,b,now),0),pct=clamp(m/SLOT_MINUTES*100,0,100),label=i%2===0?new Date(a).toLocaleTimeString('en-SG',{hour:'numeric',minute:'2-digit'}):'',cur=ints.some(x=>x.end==null&&a<=now&&now<=b);return '<div class="focus-day-slot"><span class="focus-day-slot-label">'+label+'</span>'+(pct?'<div class="focus-day-slot-fill'+(cur?' current':'')+'" style="width:'+pct+'%"></div>':'')+'</div>';}).join('');
    c.innerHTML='<div class="focus-day-timeline-head"><div><div class="focus-day-timeline-title">Today\'s time allocation</div><div class="focus-day-timeline-note">07:00 → 22:00 · 30-minute blocks · updates live</div></div><div class="focus-day-timeline-note">'+(r.endedAt==null?'DAY IN PROGRESS':'DAY COMPLETE')+'</div></div><div class="focus-day-timeline-summary"><span>Started <strong>'+time(r.startedAt)+'</strong></span><span>Studied <strong>'+duration(study)+'</strong></span><span>Break / other <strong>'+duration(breakM)+'</strong></span></div><div class="focus-day-timeline-grid"><div class="focus-day-timeline-hours">'+hours+'</div><div class="focus-day-timeline-track">'+slots+'</div></div><div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day</span></div>';
  }

  function render(){ensureStyles();ensureBrainDump();ensureStudyPatternWidget();renderTimeline();}
  function boot(){render();clearInterval(timer);timer=setInterval(render,10000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();