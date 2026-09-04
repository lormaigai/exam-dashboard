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
  function localKey(date){
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
  }
  function todayRecord(){
    if(typeof pomo === 'undefined' || !pomo.dayHistory) return null;
    return pomo.dayHistory[localKey(new Date())] || null;
  }
  function clamp(value,min,max){ return Math.max(min, Math.min(max, value)); }
  function formatTime(timestamp){
    return new Date(timestamp).toLocaleTimeString('en-SG', {hour:'numeric', minute:'2-digit'});
  }
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
      .focus-day-timeline-track{position:relative;display:grid;grid-template-rows:repeat(${SLOT_COUNT},30px);min-width:0;}
      .focus-day-slot{position:relative;height:30px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--paper2);overflow:hidden;}
      .focus-day-slot:nth-child(2n){background:var(--paper);}
      .focus-day-slot-fill{position:absolute;left:0;top:4px;bottom:4px;background:var(--red);min-width:0;opacity:.9;}
      .focus-day-slot-fill.current{background:var(--theme-mid);}
      .focus-day-slot-label{position:absolute;left:6px;top:8px;font-family:var(--font-mono);font-size:7.5px;opacity:.36;pointer-events:none;}
      .focus-day-marker{position:absolute;left:-48px;right:0;height:0;border-top:2px solid var(--ink);z-index:4;pointer-events:none;}
      .focus-day-marker span{position:absolute;left:0;top:-12px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;letter-spacing:.5px;background:var(--ink);color:var(--on-dark);padding:2px 5px;white-space:nowrap;}
      .focus-day-marker.end{border-top-color:var(--red);}
      .focus-day-marker.end span{background:var(--red);}
      .focus-day-empty{padding:14px 0 2px;font-family:var(--font-mono);font-size:10px;opacity:.5;}
      .focus-day-legend{display:flex;gap:14px;margin-top:10px;font-family:var(--font-mono);font-size:8px;text-transform:uppercase;opacity:.6;}
      .focus-day-legend span{display:flex;align-items:center;gap:5px;}
      .focus-day-legend i{width:10px;height:8px;display:block;background:var(--red);}
      .focus-day-legend .tracked{background:var(--paper2);border:1px solid var(--line);}
      .brain-dump{border:2px solid var(--ink);background:var(--paper);padding:18px;margin-top:14px;}
      .brain-dump-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:10px;}
      .brain-dump-title{font-family:var(--font-display);font-weight:700;font-size:15px;text-transform:uppercase;letter-spacing:.4px;}
      .brain-dump-note{font-family:var(--font-mono);font-size:9px;opacity:.55;text-transform:uppercase;letter-spacing:.6px;}
      .brain-dump-input{display:block;width:100%;min-height:110px;resize:none;overflow:hidden;border:1px solid var(--ink);background:var(--paper);color:var(--ink);padding:12px;font-family:var(--font-body);font-size:13.5px;line-height:1.55;outline:none;}
      .brain-dump-input:focus{border:2px solid var(--ink);padding:11px;}
      .brain-dump-input::placeholder{color:var(--ink);opacity:.38;}
      @media(max-width:600px){
        .focus-day-timeline{padding:12px;}
        .focus-day-timeline-grid{grid-template-columns:42px minmax(0,1fr);}
        .focus-day-timeline-hour{padding-right:5px;font-size:7px;}
        .focus-day-marker{left:-42px;}
        .brain-dump{padding:12px;}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureContainer(){
    const panel = document.getElementById('panel-focus');
    const anchor = panel && panel.querySelector('.focus-wrap');
    if(!anchor) return null;
    let container = document.getElementById('focusDayTimeline');
    if(!container){
      container = document.createElement('section');
      container.id = 'focusDayTimeline';
      container.className = 'focus-day-timeline';
      anchor.insertAdjacentElement('afterend', container);
    }
    return container;
  }

  function ensureBrainDump(){
    const todoList = document.getElementById('todoList');
    if(!todoList) return;
    let dump = document.getElementById('todoBrainDump');
    if(!dump){
      dump = document.createElement('section');
      dump.id = 'todoBrainDump';
      dump.className = 'brain-dump';
      dump.innerHTML = `
        <div class="brain-dump-head">
          <div class="brain-dump-title">Brain Dump</div>
          <div class="brain-dump-note">Ideas, thoughts, reminders · not everything needs to become a task</div>
        </div>
        <textarea class="brain-dump-input" id="brainDumpInput" rows="4" aria-label="Brain dump" placeholder="Write anything here... ideas, things to remember, random thoughts, questions, plans..."></textarea>
      `;
      todoList.insertAdjacentElement('afterend', dump);
      const input = dump.querySelector('#brainDumpInput');
      input.value = localStorage.getItem(BRAIN_DUMP_KEY) || '';
      const resize = ()=>{
        input.style.height = 'auto';
        input.style.height = Math.max(110, input.scrollHeight) + 'px';
      };
      input.addEventListener('input', ()=>{
        localStorage.setItem(BRAIN_DUMP_KEY, input.value);
        resize();
      });
      resize();
    }
  }

  function intervalEnd(interval, now){
    return interval.end == null ? now : interval.end;
  }

  function overlapMinutes(interval, start, end, now){
    const from = Math.max(start, Number(interval.start) || 0);
    const to = Math.min(end, intervalEnd(interval, now));
    return Math.max(0, (to - from) / 60000);
  }

  function render(){
    ensureBrainDump();
    const container = ensureContainer();
    if(!container) return;

    const record = todayRecord();
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(START_HOUR, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(END_HOUR, 0, 0, 0);
    const timelineStart = dayStart.getTime();
    const timelineEnd = dayEnd.getTime();
    const intervals = record && Array.isArray(record.studyIntervals) ? record.studyIntervals : [];
    const trackedStart = record ? Math.max(timelineStart, Number(record.startedAt) || timelineStart) : null;
    const trackedEnd = record ? Math.min(timelineEnd, record.endedAt == null ? now : Number(record.endedAt)) : null;

    if(!record){
      container.innerHTML = `
        <div class="focus-day-timeline-head">
          <div>
            <div class="focus-day-timeline-title">Today's time allocation</div>
            <div class="focus-day-timeline-note">07:00 → 22:00 · start the day to begin tracking</div>
          </div>
        </div>
        <div class="focus-day-empty">Your timeline will fill in here as you study. Begin Day records the start of your tracked day, and End Day closes it.</div>
        <div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day / break</span></div>
      `;
      return;
    }

    const studyMinutes = intervals.reduce((sum, interval)=>sum + overlapMinutes(interval, timelineStart, timelineEnd, now), 0);
    const totalTracked = trackedStart != null && trackedEnd != null ? Math.max(0, (trackedEnd - trackedStart) / 60000) : 0;
    const breakMinutes = Math.max(0, totalTracked - studyMinutes);
    const hours = Array.from({length: END_HOUR - START_HOUR}, (_,i)=>{
      const hour = START_HOUR + i;
      return `<div class="focus-day-timeline-hour">${hour}:00</div>`;
    }).join('');

    const slots = Array.from({length:SLOT_COUNT}, (_,index)=>{
      const slotStart = timelineStart + index * SLOT_MINUTES * 60000;
      const slotEnd = slotStart + SLOT_MINUTES * 60000;
      const study = intervals.reduce((sum, interval)=>sum + overlapMinutes(interval, slotStart, slotEnd, now), 0);
      const pct = clamp(study / SLOT_MINUTES * 100, 0, 100);
      const trackedPct = trackedStart == null ? 0 : clamp((Math.min(slotEnd,trackedEnd) - Math.max(slotStart,trackedStart)) / (SLOT_MINUTES*60000) * 100, 0, 100);
      const current = intervals.some(interval=>interval.end==null && slotStart <= now && now <= slotEnd);
      const label = index % 2 === 0 ? new Date(slotStart).toLocaleTimeString('en-SG',{hour:'numeric',minute:'2-digit'}) : '';
      return `
        <div class="focus-day-slot" title="${formatTime(slotStart)} · ${Math.round(study)} min studied">
          ${trackedPct > 0 ? `<div class="focus-day-slot-fill" style="width:${trackedPct}%;background:var(--ink);opacity:.07"></div>` : ''}
          ${pct > 0 ? `<div class="focus-day-slot-fill${current?' current':''}" style="width:${pct}%"></div>` : ''}
          <span class="focus-day-slot-label">${label}</span>
        </div>
      `;
    }).join('');

    let markers = '';
    if(trackedStart != null){
      const startPct = clamp((trackedStart - timelineStart) / (timelineEnd - timelineStart) * 100, 0, 100);
      markers += `<div class="focus-day-marker" style="top:${startPct}%"><span>Start of day · ${formatTime(record.startedAt)}</span></div>`;
    }
    if(record.endedAt != null){
      const endPct = clamp((trackedEnd - timelineStart) / (timelineEnd - timelineStart) * 100, 0, 100);
      markers += `<div class="focus-day-marker end" style="top:${endPct}%"><span>End of day · ${formatTime(record.endedAt)}</span></div>`;
    }

    container.innerHTML = `
      <div class="focus-day-timeline-head">
        <div>
          <div class="focus-day-timeline-title">Today's time allocation</div>
          <div class="focus-day-timeline-note">07:00 → 22:00 · 30-minute blocks · updates live</div>
        </div>
        <div class="focus-day-timeline-note">${record.endedAt == null ? 'DAY IN PROGRESS' : 'DAY COMPLETE'}</div>
      </div>
      <div class="focus-day-timeline-summary">
        <span>Started <strong>${formatTime(record.startedAt)}</strong></span>
        ${record.endedAt != null ? `<span>Ended <strong>${formatTime(record.endedAt)}</strong></span>` : '<span>Now <strong>' + formatTime(now) + '</strong></span>'}
        <span>Studied <strong>${formatDuration(studyMinutes)}</strong></span>
        <span>Break / other <strong>${formatDuration(breakMinutes)}</strong></span>
      </div>
      <div class="focus-day-timeline-grid">
        <div class="focus-day-timeline-hours">${hours}</div>
        <div class="focus-day-timeline-track">${slots}${markers}</div>
      </div>
      <div class="focus-day-legend"><span><i></i>Study time</span><span><i class="tracked"></i>Tracked day</span></div>
    `;
  }

  function boot(){
    ensureStyles();
    render();
    clearInterval(refreshTimer);
    refreshTimer = setInterval(render, timelineRefresh);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
