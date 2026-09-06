/* ============================================================
   FOCUS DAY TIMELINE
   Adds a 07:00–22:00 visual accounting strip to the Focus Timer.
   It reads the existing Pomodoro dayHistory, so the timer remains
   the source of truth and no second tracking system is introduced.
   ============================================================ */
(function(){
  'use strict';

  const START_HOUR = 7;
  const END_HOUR = 22;
  const SLOT_MINUTES = 30;
  const SLOT_COUNT = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;
  const timelineRefresh = 10000;
  const BRAIN_DUMP_KEY = 'examcontrol-brain-dump';
  let refreshTimer = null;

  function pad(value){ return String(value).padStart(2, '0'); }
  function localKey(date){ return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(); }
  function todayRecord(){
    if(typeof pomo === 'undefined' || !pomo.dayHistory) return null;
    return pomo.dayHistory[localKey(new Date())] || null;
  }
  function clamp(value,min,max){ return Math.max(min, Math.min(max, value)); }
  function formatTime(timestamp){ return new Date(timestamp).toLocaleTimeString('en-SG', {hour:'numeric', minute:'2-digit'}); }
  function formatDuration(minutes){
    const rounded = Math.max(0, Math.round(minutes));
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    if(hours && mins) return hours + 'h ' + mins + 'm';
    if(hours) return hours + 'h';
    return mins + 'm';
  }

  function ensureStyles(){
    if(document.getElementById('focusTimelineStyles')) return;
    const style = document.createElement('style');
    style.id = 'focusTimelineStyles';
    style.textContent = `
      .focus-day-timeline{border:2px solid var(--ink);background:var(--paper);padding:16px;margin-top:20px;}
      .focus-day-timeline-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:10px;}
      .focus-day-timeline-title{font-family:var(--font-display);font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
      .focus-day-timeline-note{font-family:var(--font-mono);font-size:9px;opacity:.55;text-transform:uppercase;letter-spacing:.6px;}
      .focus-day-timeline-summary{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-family:var(--font-mono);font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;opacity:.7;}
      .focus-day-timeline-summary strong{color:var(--ink);opacity:1;}
      .focus-day-timeline-grid{display:grid;grid-template-columns:48px minmax(0,1fr);margin-top:14px;border-top:1px solid var(--line);border-left:1px solid var(--line);}
      .focus-day-timeline-hours{display:grid;grid-template-rows:repeat(15,1fr);}
      .focus-day-timeline-hour{height:30px;display:flex;align-items:flex-start;justify-content:flex-end;padding:4px 7px 0 0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font-family:var(--font-mono);font-size:8px;opacity:.55;}
      .focus-day-timeline-track{position:relative;display:grid;grid-template-rows:repeat(30,30px);min-width:0;}
      .focus-day-slot{position:relative;height:30px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--paper2);overflow:hidden;}
      .focus-day-slot:nth-child(2n){background:var(--paper);}
      .focus-day-slot-fill{position:absolute;left:0;top:4px;bottom:4px;background:var(--red);min-width:0;opacity:.9;}
      .focus-day-slot-fill.current{background:var(--theme-mid);}
      .focus-day-slot-label{position:absolute;left:6px;top:8px;font-family:var(--font-mono);font-size:7.5px;opacity:.36;pointer-events:none;}
      .focus-day-marker{position:absolute;left:-48px;right:0;height:0;border-top:2px solid var(--ink);z-index:4;pointer-events:none;}
      .focus-day-marker span{position:absolute;left:0;top:-12px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;letter-spacing:.5px;background:var(--ink);color:var(--on-dark);padding:2px 5px;white-space:nowrap;}
      .focus-day-marker.end{border-top-color:var(--red);}.focus-day-marker.end span{background:var(--red);}
      .focus-day-empty{padding:14px 0 2px;font-family:var(--font-mono);font-size:10px;opacity:.5;}
      .focus-day-legend{display:flex;gap:14px;margin-top:10px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;opacity:.6;}
      .focus-day-legend span{display:flex;align-items:center;gap:5px;}.focus-day-legend i{width:10px;height:8px;display:block;background:var(--red);}.focus-day-legend .tracked{background:var(--paper2);border:1px solid var(--line);}
      .brain-dump{border:2px solid var(--ink);background:var(--paper);padding:18px;margin-top:14px;}
      .brain-dump-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px;}
      .brain-dump-title{font-family:var(--font-display);font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:.4px;}
      .brain-dump-note{font-family:var(--font-mono);font-size:9px;opacity:.55;text-transform:uppercase;letter-spacing:.6px;}
      .brain-dump-input{display:block;width:100%;min-height:110px;resize:none;overflow:hidden;border:1px solid var(--ink);background:var(--paper);color:var(--ink);padding:12px;font-family:var(--font-body);font-size:13.5px;line-height:1.55;outline:none;}
      .brain-dump-input:focus{border:2px solid var(--ink);padding:11px;}.brain-dump-input::placeholder{color:var(--ink);opacity:.38;}
      .study-pattern-widget{border:2px solid var(--ink);background:var(--paper);padding:16px;margin-top:20px;cursor:pointer;}
      .study-pattern-widget:hover{background:var(--paper2);}.study-pattern-head{display:flex;justify-content:space-between;gap:12px;align-items:baseline;border-bottom:1px solid var(--line);padding-bottom:8px;}
      .study-pattern-title{font-family:var(--font-display);font-size:15px;font-weight:800;text-transform:uppercase;}.study-pattern-hint,.study-pattern-total{font-family:var(--font-mono);font-size:9px;text-transform:uppercase;opacity:.6;}
      .study-pattern-bars{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;height:110px;align-items:end;margin-top:14px;}
      .study-pattern-day{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;}.study-pattern-bar-wrap{height:76px;width:100%;display:flex;align-items:flex-end;justify-content:center;}
      .study-pattern-bar{width:min(30px,65%);min-height:2px;background:var(--red);border:1px solid var(--ink);}.study-pattern-value,.study-pattern-label{font-family:var(--font-mono);font-size:8px;white-space:nowrap;}.study-pattern-value{margin-top:4px;}.study-pattern-label{margin-top:5px;opacity:.55;}
      .study-history-overlay{position:fixed;inset:0;background:#1A233288;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;}.study-history-modal{width:min(760px,100%);max-height:90vh;overflow:auto;background:var(--paper);border:2px solid var(--ink);}
      .study-history-head{position:sticky;top:0;background:var(--paper);padding:18px;border-bottom:2px solid var(--ink);display:flex;justify-content:space-between;gap:12px;align-items:flex-start;}.study-history-title{font-family:var(--font-display);font-size:18px;font-weight:800;text-transform:uppercase;}.study-history-close{border:2px solid var(--ink);padding:5px 10px;font-family:var(--font-mono);font-size:10px;background:var(--paper);cursor:pointer;}
      .study-history-list{padding:8px 18px 18px;}.study-history-row{display:grid;grid-template-columns:120px 1fr 80px;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line);}.study-history-date,.study-history-hours{font-family:var(--font-mono);font-size:10px;}.study-history-bar{height:14px;background:var(--paper2);border:1px solid var(--line);}.study-history-fill{height:100%;background:var(--red);}.study-history-hours{text-align:right;}.study-history-empty{padding:20px;font-family:var(--font-mono);font-size:11px;opacity:.55;}
      @media(max-width:600px){.focus-day-timeline{padding:12px}.focus-day-timeline-grid{grid-template-columns:42px minmax(0,1fr)}.focus-day-timeline-hour{padding-right:5px;font-size:7px}.focus-day-marker{left:-42px}.brain-dump{padding:12px}.study-history-row{grid-template-columns:90px 1fr 65px;gap:8px}}
    `;
    document.head.appendChild(style);
  }

  function ensureContainer(){
    const panel = document.getElementById('panel-focus');
    const anchor = panel && panel.querySelector('.focus-wrap');
    if(!anchor) return null;
    let container = document.getElementById('focusDayTimeline');
    if(!container){ container=document.createElement('section');container.id='focusDayTimeline';container.className='focus-day-timeline';anchor.insertAdjacentElement('afterend',container); }
    return container;
  }

  function ensureBrainDump(){
    const todoList=document.getElementById('todoList'); if(!todoList)return;
    let dump=document.getElementById('todoBrainDump'); if(dump)return;
    dump=document.createElement('section');dump.id='todoBrainDump';dump.className='brain-dump';
    dump.innerHTML=`<div class="brain-dump-head"><div class="brain-dump-title">Brain Dump</div><div class="brain-dump-note">Ideas, thoughts, reminders · not everything needs to become a task</div></div><textarea class="brain-dump-input" id="brainDumpInput" rows="4" aria-label="Brain dump" placeholder="Write anything here... ideas, things to remember, random thoughts, questions, plans..."></textarea>`;
    todoList.insertAdjacentElement('afterend',dump);
    const input=dump.querySelector('#brainDumpInput');input.value=localStorage.getItem(BRAIN_DUMP_KEY)||'';
    const resize=()=>{input.style.height='auto';input.style.height=Math.max(110,input.scrollHeight)+'px';};
    input.addEventListener('input',()=>{localStorage.setItem(BRAIN_DUMP_KEY,input.value);resize();});resize();
  }

  function intervalEnd(interval,now){return interval.end==null?now:interval.end;}
  function overlapMinutes(interval,start,end,now){const from=Math.max(start,Number(interval.start)||0),to=Math.min(end,intervalEnd(interval,now));return Math.max(0,(to-from)/60000);}

  function render(){
    ensureBrainDump();
    const container=ensureContainer();if(!container)return;
    const record=todayRecord(),now=Date.now();
    const dayStart=new Date();dayStart.setHours(START_HOUR,0,0,0);const dayEnd=new Date();dayEnd.setHours(END_HOUR,0,0,0);
    const timelineStart=dayStart.getTime(),timelineEnd=dayEnd.getTime();
    const intervals=record&&Array.isArray(record.studyIntervals)?record.studyIntervals:[];
    const trackedStart=record?Math.max(timelineStart,Number(record.startedAt)||timelineStart):null;
    const trackedEnd=record?Math.min(timelineEnd,record.endedAt==null?now:Number(record.endedAt)):null;
    if(!record){container.innerHTML=`<div class="focus-day-timeline-head"><div><div class="focus-day-timeline-title">Today's time allocation</div><div class="focus-day-timeline-note">07:00 → 22:00 · start the day to begin tracking</div></div></div><div class="focus-day-empty">Your timeline will fill in here as you study. Begin Day records the start of your tracked day, and End Day closes it.</div><div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day / break</span></div>`;return;}
    const studyMinutes=intervals.reduce((sum,i)=>sum+overlapMinutes(i,timelineStart,timelineEnd,now),0);
    const totalTracked=trackedStart!=null&&trackedEnd!=null?Math.max(0,(trackedEnd-trackedStart)/60000):0;
    const breakMinutes=Math.max(0,totalTracked-studyMinutes);
    const hours=Array.from({length:END_HOUR-START_HOUR},(_,i)=>`<div class="focus-day-timeline-hour">${START_HOUR+i}:00</div>`).join('');
    const slots=Array.from({length:SLOT_COUNT},(_,index)=>{
      const slotStart=timelineStart+index*SLOT_MINUTES*60000,slotEnd=slotStart+SLOT_MINUTES*60000;
      const study=intervals.reduce((sum,i)=>sum+overlapMinutes(i,slotStart,slotEnd,now),0),pct=clamp(study/SLOT_MINUTES*100,0,100);
      const trackedPct=trackedStart==null?0:clamp((Math.min(slotEnd,trackedEnd)-Math.max(slotStart,trackedStart))/(SLOT_MINUTES*60000)*100,0,100);
      const current=intervals.some(i=>i.end==null&&slotStart<=now&&now<=slotEnd);const label=index%2===0?new Date(slotStart).toLocaleTimeString('en-SG',{hour:'numeric',minute:'2-digit'}):'';
      return `<div class="focus-day-slot" title="${formatTime(slotStart)} · ${Math.round(study)} min studied">${trackedPct>0?`<div class="focus-day-slot-fill" style="width:${trackedPct}%;background:var(--ink);opacity:.07"></div>`:''}${pct>0?`<div class="focus-day-slot-fill${current?' current':''}" style="width:${pct}%"></div>`:''}<span class="focus-day-slot-label">${label}</span></div>`;
    }).join('');
    let markers='';if(trackedStart!=null){const p=clamp((trackedStart-timelineStart)/(timelineEnd-timelineStart)*100,0,100);markers+=`<div class="focus-day-marker" style="top:${p}%"><span>Start of day · ${formatTime(record.startedAt)}</span></div>`;}if(record.endedAt!=null){const p=clamp((trackedEnd-timelineStart)/(timelineEnd-timelineStart)*100,0,100);markers+=`<div class="focus-day-marker end" style="top:${p}%"><span>End of day · ${formatTime(record.endedAt)}</span></div>`;}
    container.innerHTML=`<div class="focus-day-timeline-head"><div><div class="focus-day-timeline-title">Today's time allocation</div><div class="focus-day-timeline-note">07:00 → 22:00 · 30-minute blocks · updates live</div></div><div class="focus-day-timeline-note">${record.endedAt==null?'DAY IN PROGRESS':'DAY COMPLETE'}</div></div><div class="focus-day-timeline-summary"><span>Started <strong>${formatTime(record.startedAt)}</strong></span>${record.endedAt!=null?`<span>Ended <strong>${formatTime(record.endedAt)}</strong></span>`:`<span>Now <strong>${formatTime(now)}</strong></span>`}<span>Studied <strong>${formatDuration(studyMinutes)}</strong></span><span>Break / other <strong>${formatDuration(breakMinutes)}</strong></span></div><div class="focus-day-timeline-grid"><div class="focus-day-timeline-hours">${hours}</div><div class="focus-day-timeline-track">${slots}${markers}</div></div><div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day</span></div>`;
  }

  function studyLegacyMinutes(date){
    if(typeof pomo==='undefined'||!Array.isArray(pomo.completedFocus))return 0;const k=localKey(date);
    return pomo.completedFocus.reduce((sum,e)=>{const ts=Number(e.ts||e.timestamp||0);return (e.key===k||ts&&localKey(new Date(ts))===k)?sum+(Number(e.minutes)||0):sum;},0);
  }
  function studyMinutesForDate(date){const r=typeof pomo!=='undefined'&&pomo.dayHistory?pomo.dayHistory[localKey(date)]:null;if(!r)return studyLegacyMinutes(date);const now=Date.now(),start=Math.max(new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime(),Number(r.startedAt)||0),end=Math.min(new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime(),r.endedAt==null?now:Number(r.endedAt));return Math.max(0,Math.floor((r.studyIntervals||[]).reduce((sum,i)=>sum+Math.max(0,(Math.min(end,intervalEnd(i,now))-Math.max(start,Number(i.start)||0))/60000),0)));}
  function getLast7(){const a=[];for(let i=6;i>=0;i--){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);a.push({date:d,minutes:studyMinutesForDate(d)});}return a;}
  function getAllHistory(){
    const map=new Map();
    if(typeof pomo!=='undefined'&&pomo.dayHistory)Object.keys(pomo.dayHistory).forEach(k=>{const p=k.split('-').map(Number);if(p.length===3)map.set(k,new Date(p[0],p[1],p[2]));});
    if(typeof pomo!=='undefined'&&Array.isArray(pomo.completedFocus))pomo.completedFocus.forEach(e=>{const ts=Number(e.ts||e.timestamp||0);if(ts){const d=new Date(ts),k=localKey(d);if(!map.has(k))map.set(k,new Date(d.getFullYear(),d.getMonth(),d.getDate()));}});
    return [...map.values()].sort((a,b)=>a-b).map(date=>({date,minutes:studyMinutesForDate(date)}));
  }
  function openStudyHistory(){
    if(document.getElementById('studyHistoryOverlay'))return;const days=getAllHistory(),max=Math.max(1,...days.map(d=>d.minutes));
    const overlay=document.createElement('div');overlay.id='studyHistoryOverlay';overlay.className='study-history-overlay';
    overlay.innerHTML=`<div class="study-history-modal" role="dialog" aria-modal="true"><div class="study-history-head"><div><div class="study-history-title">Full Study History</div><div class="study-pattern-hint">Every recorded day</div></div><button class="study-history-close" type="button">Close</button></div><div class="study-history-list">${days.length?days.map(d=>`<div class="study-history-row"><div class="study-history-date">${d.date.toLocaleDateString('en-SG',{day:'2-digit',month:'short',year:'numeric'})}</div><div class="study-history-bar"><div class="study-history-fill" style="width:${Math.max(0,Math.round(d.minutes/max*100))}%"></div></div><div class="study-history-hours">${formatDuration(d.minutes)}</div></div>`).join(''):'<div class="study-history-empty">No study sessions have been recorded yet.</div>'}</div></div>`;
    document.body.appendChild(overlay);overlay.querySelector('.study-history-close').onclick=()=>overlay.remove();overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
  }
  function ensureStudyPattern(){
    const anchor=document.querySelector('.stats');if(!anchor)return;let widget=document.getElementById('studyPatternWidget');
    if(!widget){widget=document.createElement('section');widget.id='studyPatternWidget';widget.className='study-pattern-widget';widget.setAttribute('role','button');widget.setAttribute('tabindex','0');anchor.insertAdjacentElement('afterend',widget);widget.addEventListener('click',openStudyHistory);widget.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openStudyHistory();}});}
    const days=getLast7(),max=Math.max(1,...days.map(d=>d.minutes)),total=days.reduce((s,d)=>s+d.minutes,0);
    widget.innerHTML=`<div class="study-pattern-head"><div class="study-pattern-title">Study Pattern</div><div class="study-pattern-hint">Click for full history</div></div><div class="study-pattern-total">Previous 7 days · ${formatDuration(total)} studied</div><div class="study-pattern-bars">${days.map(d=>{const h=d.minutes?Math.max(3,Math.round(d.minutes/max*76)):2;return `<div class="study-pattern-day"><div class="study-pattern-bar-wrap"><div class="study-pattern-bar" style="height:${h}px" title="${d.minutes} minutes"></div></div><div class="study-pattern-value">${formatDuration(d.minutes)}</div><div class="study-pattern-label">${d.date.toLocaleDateString('en-SG',{weekday:'short'}).slice(0,2)}</div></div>`;}).join('')}</div>`;
  }
  function boot(){ensureStyles();render();ensureStudyPattern();clearInterval(refreshTimer);refreshTimer=setInterval(()=>{render();ensureStudyPattern();},10000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
