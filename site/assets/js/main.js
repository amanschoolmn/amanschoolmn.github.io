
/* ==== script block 0, 31185 chars ==== */





// ── NAVIGATION ───────────────────────────────────
// Real multi-page site now: every "page" is its own URL, the browser
// handles navigation natively. Only the mobile hamburger menu and
// same-page anchor scrolling need JS.
function scrollSec(id) {
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
}
function toggleNav() { document.getElementById('navLinks').classList.toggle('open'); }
function closeNav()  { document.getElementById('navLinks').classList.remove('open'); }
// Close the mobile menu after tapping a real link
document.addEventListener('click', (e) => {
  if(e.target.closest('.nav-links a')) closeNav();
});

// ── REVEAL ANIMATION ──────────────────────
const obs = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if(e.isIntersecting) {
      e.target.classList.add('on');
      obs.unobserve(e.target);
    }
  });
}, {threshold:0.06, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.rv').forEach(el => obs.observe(el));
// Initial above-the-fold stagger for whatever page just loaded
setTimeout(() => {
  document.querySelectorAll('.rv').forEach((e,i) => {
    const r = e.getBoundingClientRect();
    if(r.top < window.innerHeight){
      setTimeout(() => e.classList.add('on'), Math.min(i*80, 600));
    }
  });
}, 150);

// ── FAQ ──────────────────────────────────
function switchProgram(which) {
  const brothers = document.getElementById('prog-brothers');
  const sisters  = document.getElementById('prog-sisters');
  const btnB = document.getElementById('btn-brothers');
  const btnS = document.getElementById('btn-sisters');
  if (which === 'brothers') {
    brothers.style.display = 'block';
    sisters.style.display  = 'none';
    btnB.style.background       = 'rgba(184,135,42,0.12)';
    btnB.style.borderBottomColor = 'var(--gold)';
    btnB.style.color             = 'var(--gold-bright)';
    btnS.style.background        = 'transparent';
    btnS.style.borderBottomColor = 'transparent';
    btnS.style.color             = 'rgba(255,255,255,0.45)';
  } else {
    brothers.style.display = 'none';
    sisters.style.display  = 'block';
    btnS.style.background       = 'rgba(184,135,42,0.10)';
    btnS.style.borderBottomColor = '#e8c068';
    btnS.style.color             = '#e8c068';
    btnB.style.background        = 'transparent';
    btnB.style.borderBottomColor = 'transparent';
    btnB.style.color             = 'rgba(255,255,255,0.45)';
    // Trigger reveal animations for sisters content
    setTimeout(() => {
      document.querySelectorAll('#prog-sisters .rv:not(.on)').forEach((e,i) => {
        setTimeout(() => e.classList.add('on'), Math.min(i*70, 500));
      });
    }, 50);
  }
}

function toggleFaq(q) {
  const item = q.parentElement;
  item.classList.toggle('open');
  const isOpen = item.classList.contains('open');
  q.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// ── RADIO / CHECKBOX STYLING ─────────────
document.addEventListener('change', function(e) {
  if(e.target.type==='radio') {
    const g = e.target.closest('.radio-grp');
    if(g) g.querySelectorAll('.ropt').forEach(o =>
      o.classList.toggle('sel', o.querySelector('input').checked));
  }
  if(e.target.type==='checkbox' && e.target.closest('.check-grp')) {
    e.target.closest('.copt').classList.toggle('sel', e.target.checked);
  }
});

// ── TOTALS CALCULATOR ────────────────────
function updateTotals() {
  const panels = document.querySelectorAll('.student-block');
  let count = 0;
  panels.forEach((panel, idx) => {
    const n = idx + 1;
    const r = document.querySelector('input[name="s'+n+'_status"]:checked');
    if(r) count++;
  });
  const regFee  = count * 50;
  const tuition = count * 90;
  const grandTotal = regFee + tuition;
  const fmt = (n) => '$' + n.toLocaleString();
  const set = (id, val) => { const e = document.getElementById(id); if(e) e.textContent = val; };
  set('totalStudents', count);
  set('totalRegFee',   count > 0 ? fmt(regFee)   : '$0');
  set('totalTuition',  count > 0 ? fmt(tuition) + '/mo' : '$0/mo');
  set('grandTotal',    count > 0 ? fmt(grandTotal) : '$0');
  const gt = document.getElementById('grandTotal');
  if(gt) gt.style.color = count > 0 ? 'var(--forest)' : 'var(--warm-gray)';
}

// ── AUTO-CALCULATE AGE FROM DOB ──────────
function calcAge(dobId, ageId, ageErrId, dobErrId) {
  const dobEl  = document.getElementById(dobId);
  const ageEl  = document.getElementById(ageId);
  const ageErr = document.getElementById(ageErrId);
  const dobErr = document.getElementById(dobErrId);
  if(!dobEl || !ageEl) return;
  const dob   = new Date(dobEl.value);
  const today = new Date();
  if(isNaN(dob.getTime())) { ageEl.value = ''; return; }
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  ageEl.value = age >= 0 ? age : '';
  if(age < 6) {
    ageEl.style.color = 'var(--red)';
    if(ageErr) ageErr.classList.add('show');
  } else {
    ageEl.style.color = 'var(--forest)';
    if(ageErr) ageErr.classList.remove('show');
  }
  if(dobErr) dobErr.classList.remove('show');
  dobEl.classList.remove('err');
}

// ── DYNAMIC UNLIMITED STUDENTS ───────────
let numStudents = 0;
const GRADES   = ['Kindergarten','1st Grade','2nd Grade','3rd Grade','4th Grade','5th Grade',
  '6th Grade','7th Grade','8th Grade','9th Grade','10th Grade','11th Grade','12th Grade'];
const PROGRAMS = ["Qur'an & Islamic Studies (Full Program)"];

function buildStudentHTML(n) {
  const go = GRADES.map(g=>`<option>${g}</option>`).join('');
  const po = PROGRAMS.map(p=>`<option>${p}</option>`).join('');
  const removeBtn = n > 1
    ? `<div class="remove-student" onclick="removeStudent(${n})">✕ Remove</div>` : '';
  return `<div class="student-block" id="spanel${n}">
    <div class="field-sec student-header">
      <span>Student ${n} Information</span>${removeBtn}
    </div>
    <div class="frow">
      <div class="field"><label>New or Returning? <span class="req">*</span></label>
        <div class="radio-grp" id="rg_s${n}_status">
          <label class="ropt"><input type="radio" name="s${n}_status" value="New" onchange="onStatusSelect(${n})"> New Student</label>
          <label class="ropt"><input type="radio" name="s${n}_status" value="Returning" onchange="onStatusSelect(${n})"> Returning Student</label>
        </div>
        <div class="ferr" id="e_s${n}_status">Please select one</div>
      </div>
      <div class="field"><label>Program Selection <span class="req">*</span></label>
        <select id="s${n}_program"><option value="">Please Select...</option>${po}</select>
        <div class="ferr" id="e_s${n}_program">Required</div>
      </div>
    </div>
    <div class="student-details" id="sdetails${n}" style="display:none;animation:slideDown 0.32s ease">
      <div class="frow three">
        <div class="field"><label>First Name <span class="req">*</span></label>
          <input type="text" id="s${n}_fname" placeholder="First name">
          <div class="ferr" id="e_s${n}_fname">Required</div></div>
        <div class="field"><label>Middle Name</label>
          <input type="text" id="s${n}_mname" placeholder="Middle name"></div>
        <div class="field"><label>Last Name <span class="req">*</span></label>
          <input type="text" id="s${n}_lname" placeholder="Last name">
          <div class="ferr" id="e_s${n}_lname">Required</div></div>
      </div>
      <div class="frow dob-frow">
        <div class="field">
          <label>Date of Birth <span class="req">*</span></label>
          <input type="date" id="s${n}_dob" min="2005-01-01" max="${new Date().toISOString().split('T')[0]}"
            onchange="calcAge('s${n}_dob','s${n}_age','e_s${n}_age','e_s${n}_dob')">
          <div class="ferr" id="e_s${n}_dob">Required</div>
        </div>
        <div class="field">
          <label>Age</label>
          <input type="text" id="s${n}_age" placeholder="Auto-calculated" readonly
            style="background:#f0ece0;color:var(--forest);font-weight:700;font-size:1.05rem;cursor:default;">
          <div class="ferr" id="e_s${n}_age">Student must be at least 6 years old</div>
        </div>
      </div>
      <div class="frow">
        <div class="field"><label>Gender <span class="req">*</span></label>
          <select id="s${n}_gender"><option value="">Please Select...</option><option>Male</option><option>Female</option></select>
          <div class="ferr" id="e_s${n}_gender">Required</div></div>
        <div class="field"><label>Student Cell Phone</label>
          <input type="tel" id="s${n}_phone" placeholder="(000) 000-0000"></div>
      </div>
      <div class="frow">
        <div class="field"><label>Grade</label>
          <select id="s${n}_grade"><option value="">Select grade...</option>${go}</select></div>
        <div class="field"><label>Monthly Program Cost</label>
          <input type="text" id="s${n}_cost" value="$90/month" readonly style="background:#f0ece0;color:var(--warm-gray)"></div>
      </div>

      <div class="field-sec" style="margin-top:1.4rem">Islamic Background</div>
      <div class="frow full">
        <div class="field">
          <label>Qur'an Reading Ability <span class="req">*</span></label>
          <select id="s${n}_quran">
            <option value="">Select level...</option>
            <option>Cannot read yet (Beginner)</option>
            <option>Learning letters / Qaida</option>
            <option>Can read slowly</option>
            <option>Reads fluently</option>
            <option>Memorizing Qur'an (H&#257;fi&#7827; in progress)</option>
          </select>
          <div class="ferr" id="e_s${n}_quran">Required</div>
        </div>
      </div>
      <div class="frow full">
        <div class="field">
          <label>Juz' / Surahs Memorized</label>
          <input type="text" id="s${n}_hifz" placeholder="e.g. Juz' Amma, Surat Al-Fatiha..."/>
        </div>
      </div>
      <div class="frow">
        <div class="field">
          <label>Arabic Language Level</label>
          <select id="s${n}_arabic">
            <option value="">Select...</option>
            <option>No Arabic knowledge</option>
            <option>Recognizes letters</option>
            <option>Can read basic words</option>
            <option>Intermediate</option>
            <option>Advanced / fluent</option>
          </select>
        </div>
        <div class="field">
          <label>Previous Islamic School</label>
          <input type="text" id="s${n}_prev_school" placeholder="School name or None"/>
        </div>
      </div>

    </div>
    <hr class="hdivider">
  </div>`;
}

function onStatusSelect(n) {
  const details = document.getElementById('sdetails' + n);
  const grp     = document.getElementById('rg_s' + n + '_status');
  const checked = document.querySelector('input[name="s' + n + '_status"]:checked');

  // Update checkmark visuals
  if(grp) grp.querySelectorAll('.ropt').forEach(o =>
    o.classList.toggle('sel', o.querySelector('input').checked));

  if(checked && details) {
    details.style.display = 'block';
    details.style.animation = 'slideDown 0.32s ease';
  }
  updateTotals();
}

// Deselect: use mousedown to record pre-click state, then handle in click
let _preClickChecked = false;
let _preClickInput   = null;

document.addEventListener('mousedown', function(e) {
  const ropt = e.target.closest('.ropt');
  if(!ropt) { _preClickChecked = false; _preClickInput = null; return; }
  const inp = ropt.querySelector('input[type=radio]');
  if(!inp) return;
  _preClickChecked = inp.checked;
  _preClickInput   = inp;
}, true);

document.addEventListener('click', function(e) {
  if(!_preClickChecked || !_preClickInput) return;
  const inp = _preClickInput;
  if(!inp.name || !inp.name.endsWith('_status')) return;
  const n = parseInt(inp.name.slice(1, inp.name.indexOf('_status')));
  if(isNaN(n)) return;

  // It was checked before the click — uncheck it now
  inp.checked = false;

  // Clear all checkmarks in this group
  const grp = document.getElementById('rg_s' + n + '_status');
  if(grp) grp.querySelectorAll('.ropt').forEach(o => o.classList.remove('sel'));

  // Slide up and clear details
  const details = document.getElementById('sdetails' + n);
  if(details && details.style.display !== 'none') {
    details.style.animation = 'slideUp 0.24s ease forwards';
    setTimeout(() => {
      details.style.display = 'none';
      details.style.animation = '';
      details.querySelectorAll('input:not([readonly]), select, textarea').forEach(el => {
        el.value = ''; el.classList.remove('err');
      });
      details.querySelectorAll('.ferr').forEach(el => el.classList.remove('show'));
    }, 230);
  }
  updateTotals();
  _preClickChecked = false;
  _preClickInput   = null;
}, true);

function addStudent() {
  const container = document.getElementById('studentsContainer');
  if(!container) return; // this page doesn't have the enrollment form
  numStudents++;
  const wrapper   = document.createElement('div');
  wrapper.innerHTML = buildStudentHTML(numStudents);
  container.appendChild(wrapper.firstElementChild);
  if(numStudents > 1) {
    setTimeout(() => document.getElementById('spanel'+numStudents)
      .scrollIntoView({behavior:'smooth', block:'start'}), 80);
  }
}

function removeStudent(n) {
  const panel = document.getElementById('spanel'+n);
  if(!panel) return;
  panel.style.animation = 'slideUp 0.24s ease forwards';
  setTimeout(() => { panel.remove(); renumber(); updateTotals(); }, 230);
}

function renumber() {
  const panels = document.querySelectorAll('.student-block');
  numStudents   = panels.length;
  panels.forEach((panel, idx) => {
    const newN = idx + 1;
    const oldN = parseInt(panel.id.replace('spanel',''));
    if(oldN === newN) return;
    panel.id = 'spanel' + newN;
    const hdSpan = panel.querySelector('.student-header > span');
    if(hdSpan) hdSpan.textContent = 'Student ' + newN + ' Information';
    const rb = panel.querySelector('.remove-student');
    if(rb) {
      if(newN === 1) rb.remove();
      else { rb.textContent='✕ Remove'; rb.setAttribute('onclick','removeStudent('+newN+')'); }
    }
    const swap = (attr) => panel.querySelectorAll('['+attr+']').forEach(el => {
      const val = el.getAttribute(attr);
      if(val && (val.includes('s'+oldN+'_') || val.includes('rg_s'+oldN) || val.includes('e_s'+oldN) || val.includes('sdetails'+oldN))) {
        el.setAttribute(attr, val
          .replace(new RegExp('s'+oldN+'_','g'),'s'+newN+'_')
          .replace('rg_s'+oldN,'rg_s'+newN)
          .replace('e_s'+oldN+'_','e_s'+newN+'_')
          .replace('sdetails'+oldN,'sdetails'+newN));
      }
    });
    swap('id'); swap('name'); swap('for'); swap('onchange'); swap('onclick');
  });
}

// ── PROGRESS BAR ─────────────────────────
let curStep = 1;
const totalSteps = 4;
function updateProg(step) {
  for(let i=1;i<=totalSteps;i++) {
    const pc = document.getElementById('pc'+i);
    const pl = document.getElementById('pl'+i);
    if(i<step) { pc.className='prog-circle done'; pc.textContent='✓'; pl.className='prog-label done'; }
    else if(i===step) { pc.className='prog-circle active'; pc.textContent=i; pl.className='prog-label active'; }
    else { pc.className='prog-circle'; pc.textContent=i; pl.className='prog-label'; }
  }
  const pct = ((step-1)/(totalSteps-1))*80;
  document.getElementById('progFill').style.width = pct+'%';
}
function showStep(n) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step'+n).classList.add('active');
  curStep=n; updateProg(n);
  document.getElementById('formCard').scrollIntoView({behavior:'smooth',block:'start'});
}
function goStep(n) { showStep(n); }

// ── VALIDATION ────────────────────────────
function v(id, eid) {
  const el = document.getElementById(id);
  const er = document.getElementById(eid);
  if(!el||!er) return true;
  const ok = el.value.trim()!=='';
  el.classList.toggle('err',!ok);
  er.classList.toggle('show',!ok);
  return ok;
}
function validateStep(step) {
  let ok = true;
  if(step===1) {
    document.querySelectorAll('.student-block').forEach((panel,idx) => {
      const n = idx+1;
      const sr = document.querySelector('input[name="s'+n+'_status"]:checked');
      const se = document.getElementById('e_s'+n+'_status');
      if(se){ se.classList.toggle('show',!sr); if(!sr) ok=false; }
      // Only validate details fields if details are visible
      const details = document.getElementById('sdetails'+n);
      if(details && details.style.display !== 'none') {
        if(!v('s'+n+'_fname','e_s'+n+'_fname')) ok=false;
        if(!v('s'+n+'_lname','e_s'+n+'_lname')) ok=false;
        const dobEl = document.getElementById('s'+n+'_dob');
        const dobEr = document.getElementById('e_s'+n+'_dob');
        if(dobEl&&dobEr){ if(!dobEl.value){dobEl.classList.add('err');dobEr.classList.add('show');ok=false;}else{dobEl.classList.remove('err');dobEr.classList.remove('show');} }
        const ageEl = document.getElementById('s'+n+'_age');
        const ageEr = document.getElementById('e_s'+n+'_age');
        if(ageEl&&ageEr){ const age=parseInt(ageEl.value); if(isNaN(age)||age<6){ageEr.classList.add('show');ok=false;}else{ageEr.classList.remove('show');} }
        if(!v('s'+n+'_gender','e_s'+n+'_gender')) ok=false;
      }
    });
  }
  if(step===2) {
    if(!v('p_fname','e_p_fname')) ok=false;
    if(!v('p_lname','e_p_lname')) ok=false;
    const em=document.getElementById('p_email').value.trim();
    const em2=document.getElementById('p_email2').value.trim();
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    document.getElementById('p_email').classList.toggle('err',!emailOk);
    document.getElementById('e_p_email').classList.toggle('show',!emailOk);
    if(!emailOk) ok=false;
    const matchOk=em===em2&&em2!=='';
    document.getElementById('p_email2').classList.toggle('err',!matchOk);
    document.getElementById('e_p_email2').classList.toggle('show',!matchOk);
    if(!matchOk) ok=false;
    if(!v('p_phone','e_p_phone')) ok=false;
    if(!v('p_street','e_p_street')) ok=false;
    if(!v('ec_fname','e_ec_fname')) ok=false;
    if(!v('ec_lname','e_ec_lname')) ok=false;
    if(!v('ec_relation','e_ec_relation')) ok=false;
    if(!v('ec_phone','e_ec_phone')) ok=false;
  }
  if(step===3) {
    // Qur'an reading now per-student in step 1
    if(!v('h_conditions','e_h_conditions')) ok=false;
  }
  if(step===4) {
    // ag5 = liability/medical waiver, ag6 = media & photo/video consent —
    // kept as two distinct, independently-required checkboxes rather than
    // one checkbox silently bundling both agreements together.
    const ags=['ag1','ag2','ag3','ag4','ag5','ag6'];
    const allChk=ags.every(id=>document.getElementById(id).checked);
    document.getElementById('e_agreements').classList.toggle('show',!allChk);
    if(!allChk) ok=false;
    if(!v('sig_fname','e_sig_fname')) ok=false;
    if(!v('sig_lname','e_sig_lname')) ok=false;
    if(sigEmpty()){ document.getElementById('e_sig').classList.add('show'); ok=false; }
    else { document.getElementById('e_sig').classList.remove('show'); }
  }
  return ok;
}
function nextStep(s) { if(!validateStep(s)) return; if(s===3) buildReview(); showStep(s+1); }
function prevStep(s) { showStep(s-1); }

// ── REVIEW ───────────────────────────────
function g(id) { const el=document.getElementById(id); return el?el.value||'—':'—'; }
function buildReview() {
  const allPanels = document.querySelectorAll('.student-block');
  let shtml = '';
  allPanels.forEach((panel,idx) => {
    const n = idx+1;
    const sr = document.querySelector('input[name="s'+n+'_status"]:checked');
    shtml += '<div style="margin-bottom:1rem;padding-bottom:0.8rem;border-bottom:1px solid rgba(184,135,42,0.1)">'
      + '<strong style="color:var(--forest);font-family:Playfair Display,serif">Student '+n+'</strong>'
      + '<div class="rev-grid" style="margin-top:0.4rem">'
      + '<div class="rev-field">Name: <span>'+g('s'+n+'_fname')+' '+g('s'+n+'_mname')+' '+g('s'+n+'_lname')+'</span></div>'
      + '<div class="rev-field">DOB: <span>'+g('s'+n+'_dob')+'</span></div>'
      + '<div class="rev-field">Age: <span>'+g('s'+n+'_age')+'</span></div>'
      + '<div class="rev-field">Gender: <span>'+g('s'+n+'_gender')+'</span></div>'
      + '<div class="rev-field">Grade: <span>'+g('s'+n+'_grade')+'</span></div>'
      + '<div class="rev-field">Program: <span>'+g('s'+n+'_program')+'</span></div>'
      + '<div class="rev-field">Status: <span>'+(sr?sr.value:'—')+'</span></div>'
      + '<div class="rev-field">Phone: <span>'+g('s'+n+'_phone')+'</span></div>'
      + '</div></div>';
  });
  document.getElementById('rev_students').innerHTML = shtml||'<p style="color:var(--warm-gray);font-size:0.88rem">No students added</p>';

  const interests=[...document.querySelectorAll('#interests input:checked')].map(c=>c.value).join(', ')||'—';
  const allergy=document.querySelector('input[name="allergy"]:checked');
  document.getElementById('rev_parent').innerHTML=`
    <div class="rev-field">Parent: <span>${g('p_fname')} ${g('p_mname')} ${g('p_lname')}</span></div>
    <div class="rev-field">Email: <span>${g('p_email')}</span></div>
    <div class="rev-field">Phone: <span>${g('p_phone')}</span></div>
    <div class="rev-field">Address: <span>${g('p_street')}, ${g('p_city')}, ${g('p_state')} ${g('p_zip')}</span></div>
    <div class="rev-field">Emergency: <span>${g('ec_fname')} ${g('ec_lname')}</span></div>
    <div class="rev-field">EC Phone: <span>${g('ec_phone')}</span></div>
    <div class="rev-field">EC Relation: <span>${g('ec_relation')}</span></div>
    <div class="rev-field">Heard About: <span>${g('p_source')}</span></div>`;
  document.getElementById('rev_academic').innerHTML=`
    <div class="rev-field">Qur'an Level: <span>${g('a_quran')}</span></div>
    <div class="rev-field">Memorization: <span>${g('a_hifz')}</span></div>
    <div class="rev-field">Arabic Level: <span>${g('a_arabic')}</span></div>
    <div class="rev-field">Prior School: <span>${g('a_prev')}</span></div>
    <div class="rev-field">Allergies: <span>${allergy?allergy.value:'—'}</span></div>
    <div class="rev-field">Medications: <span>${g('h_meds')}</span></div>
    <div class="rev-field" style="grid-column:1/-1">Interests: <span>${interests}</span></div>
    <div class="rev-field" style="grid-column:1/-1">Health: <span>${g('h_conditions')}</span></div>`;
}

// ── SIGNATURE PAD (only runs on pages that actually have #sigCanvas) ──
const canvas = document.getElementById('sigCanvas');
let ctx, drawing=false, sigDrawn=false;
function resizeCanvas() { if(!canvas) return; const r=canvas.parentElement.getBoundingClientRect(); canvas.width=r.width; canvas.height=130; }
function getPos(e) { const r=canvas.getBoundingClientRect(); const src=e.touches?e.touches[0]:e; return {x:src.clientX-r.left,y:src.clientY-r.top}; }
function clearSig(){ if(!ctx) return; ctx.clearRect(0,0,canvas.width,canvas.height);sigDrawn=false;}
function sigEmpty(){return !sigDrawn;}
if (canvas) {
  ctx = canvas.getContext('2d');
  resizeCanvas(); window.addEventListener('resize',resizeCanvas);
  canvas.addEventListener('mousedown',e=>{drawing=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);});
  canvas.addEventListener('mousemove',e=>{if(!drawing)return;const p=getPos(e);ctx.lineWidth=1.8;ctx.lineCap='round';ctx.strokeStyle='#1a4a35';ctx.lineTo(p.x,p.y);ctx.stroke();sigDrawn=true;});
  canvas.addEventListener('mouseup',()=>drawing=false);
  canvas.addEventListener('mouseleave',()=>drawing=false);
  canvas.addEventListener('touchstart',e=>{e.preventDefault();drawing=true;const p=getPos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);},{passive:false});
  canvas.addEventListener('touchmove',e=>{e.preventDefault();if(!drawing)return;const p=getPos(e);ctx.lineWidth=1.8;ctx.lineCap='round';ctx.strokeStyle='#1a4a35';ctx.lineTo(p.x,p.y);ctx.stroke();sigDrawn=true;},{passive:false});
  canvas.addEventListener('touchend',()=>drawing=false);
}

// ── AGREEMENTS ───────────────────────────
function toggleAgr(el) {
  const cb=el.querySelector('input[type=checkbox]');
  cb.checked=!cb.checked;
  el.classList.toggle('checked',cb.checked);
}

// Two separate, independently-required consents (liability waiver and
// media/photo release) instead of one bundled paragraph + single checkbox.
function consentStatus() {
  const waiver = document.getElementById('consent_waiver');
  const media  = document.getElementById('consent_media');
  return {
    waiverChecked: !!(waiver && waiver.checked),
    mediaChecked:  !!(media && media.checked) // media consent is optional, not required
  };
}

// ── TODAY'S DATE ─────────────────────────
(function(){
  const d=new Date();
  const ds=(d.getMonth()+1).toString().padStart(2,'0')+'/'+d.getDate().toString().padStart(2,'0')+'/'+d.getFullYear();
  const el=document.getElementById('sig_date');
  if(el) el.value=ds;
})();

// ── SUBMIT ───────────────────────────────
function submitForm() {
  if(!validateStep(4)) return;

  const ref = 'AMAN-' + Date.now().toString().slice(-6);
  const btn = document.querySelector('.btn-submit');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  // Collect all student data
  const panels = document.querySelectorAll('.student-block');
  let studentsText = '';
  panels.forEach((panel, idx) => {
    const n = idx + 1;
    const sr = document.querySelector('input[name="s'+n+'_status"]:checked');
    const g  = (id) => { const e = document.getElementById(id); return e ? e.value || '—' : '—'; };
    studentsText += '\n--- Student ' + n + ' ---\n';
    studentsText += 'Status: '   + (sr ? sr.value : '—') + '\n';
    studentsText += 'Program: '  + g('s'+n+'_program')   + '\n';
    studentsText += 'Name: '     + g('s'+n+'_fname') + ' ' + g('s'+n+'_mname') + ' ' + g('s'+n+'_lname') + '\n';
    studentsText += 'DOB: '      + g('s'+n+'_dob')       + '\n';
    studentsText += 'Age: '      + g('s'+n+'_age')        + '\n';
    studentsText += 'Gender: '   + g('s'+n+'_gender')     + '\n';
    studentsText += 'Grade: '    + g('s'+n+'_grade')      + '\n';
    studentsText += 'Phone: '    + g('s'+n+'_phone')      + '\n';
    studentsText += 'Quran Level: ' + g('s'+n+'_quran')   + '\n';
    studentsText += 'Memorized: '   + g('s'+n+'_hifz')    + '\n';
    studentsText += 'Arabic: '      + g('s'+n+'_arabic')  + '\n';
    studentsText += 'Prev School: ' + g('s'+n+'_prev_school') + '\n';
  });

  const g = (id) => { const e = document.getElementById(id); return e ? e.value || '—' : '—'; };
  const allergy = document.querySelector('input[name="allergy"]:checked');
  const interests = [...document.querySelectorAll('#interests input:checked')].map(c=>c.value).join(', ') || '—';

  // Build form data for Formspree
  const data = new FormData();
  data.append('_subject', 'New AMAN Application — Ref: ' + ref);
  data.append('Reference', ref);
  data.append('_replyto', g('p_email'));

  // Students
  data.append('STUDENTS', studentsText);

  // Parent info
  data.append('Parent Name',    g('p_fname') + ' ' + g('p_mname') + ' ' + g('p_lname'));
  data.append('Email',          g('p_email'));
  data.append('Phone',          g('p_phone'));
  data.append('Address',        g('p_street') + ', ' + g('p_city') + ', ' + g('p_state') + ' ' + g('p_zip'));
  data.append('Contact Pref',   g('p_contact_pref'));
  data.append('Emergency Contact', g('ec_fname') + ' ' + g('ec_lname') + ' — ' + g('ec_relation') + ' — ' + g('ec_phone'));
  data.append('Authorized Pickup', g('p_pickup'));
  data.append('Heard About Us', g('p_source'));

  // Academic & Health
  data.append('Subject Interests', interests);
  data.append('Goals',          g('a_goals'));
  data.append('Learning Needs', g('a_learning'));
  data.append('Health Conditions', g('h_conditions'));
  data.append('Allergies',      allergy ? allergy.value : '—');
  data.append('Allergy Details', g('h_allergy'));
  data.append('Medications',    g('h_meds'));

  // Consents (recorded distinctly for a clear paper trail)
  data.append('Liability Waiver Agreed', document.getElementById('ag5').checked ? 'Yes' : 'No');
  data.append('Media/Photo Consent Agreed', document.getElementById('ag6').checked ? 'Yes' : 'No');

  // Signature
  data.append('Signed By',      g('sig_fname') + ' ' + g('sig_lname'));
  data.append('Date Signed',    g('sig_date'));

  // Send to Formspree
  fetch('https://formspree.io/f/xaqkjdkq', {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if(response.ok) {
      // Success
      document.getElementById('suc-ref').textContent = 'Reference #: ' + ref;
      document.getElementById('formCard').style.display  = 'none';
      document.getElementById('progBar').style.display   = 'none';
      document.getElementById('successWrap').classList.add('show');
      window.scrollTo({top:0, behavior:'smooth'});
    } else {
      // Formspree error — still show success but warn
      btn.textContent = '✓ Submit Application';
      btn.disabled = false;
      alert('There was an issue submitting your application. Please try again or contact us directly at amanschool.mn@gmail.com');
    }
  })
  .catch(() => {
    btn.textContent = '✓ Submit Application';
    btn.disabled = false;
    alert('Connection error. Please check your internet and try again, or contact us at amanschool.mn@gmail.com');
  });
}

// ── INIT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => addStudent());


// ── PROGRAM SWITCHER ─────────────────────────────────────────────────
function showProgram(prog) {
  const bro    = document.getElementById('prog-brothers');
  const sis    = document.getElementById('prog-sisters');
  const btnBro = document.getElementById('btn-brothers');
  const btnSis = document.getElementById('btn-sisters');
  const isOpen = (prog === 'brothers') ? bro && bro.style.display !== 'none'
                                       : sis && sis.style.display !== 'none';
  if(bro) bro.style.display = 'none';
  if(sis) sis.style.display = 'none';
  if(btnBro) btnBro.style.borderColor = 'rgba(184,135,42,0.4)';
  if(btnSis) btnSis.style.borderColor = 'rgba(150,90,180,0.4)';
  if(!isOpen) {
    const target = prog === 'brothers' ? bro : sis;
    const btn    = prog === 'brothers' ? btnBro : btnSis;
    const col    = prog === 'brothers' ? '#b8872a' : 'rgba(150,90,180,0.8)';
    if(target) target.style.display = 'block';
    if(btn)    btn.style.borderColor = col;
    setTimeout(() => {
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }, 50);
  }
}


// ── PILLARS MODAL ─────────────────────────────────────────────
function openPillarsModal() {
  const m = document.getElementById('pillarsModal');
  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closePillarsModal() {
  const m = document.getElementById('pillarsModal');
  m.style.display = 'none';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if(e.key === 'Escape') closePillarsModal();
});


/* ==== script block 1, 13710 chars ==== */
const _cy = document.getElementById("copy-year"); if(_cy) _cy.textContent = new Date().getFullYear();
// ══ SUMMER PROGRAM FORM ══

let participantCount = 0;
let currentTheme = 'brothers';

function selectProgram(prog){
  document.querySelectorAll('.prog-opt').forEach(o => o.classList.remove('selected'));
  document.getElementById('opt-' + prog).classList.add('selected');
  const schoolWrap = document.getElementById('schoolFormWrap');
  const summerWrap = document.getElementById('summerFormWrap');
  const progBar = document.getElementById('progBar');
  const schoolIntro = document.getElementById('schoolIntro');
  if(prog === 'school'){
    if(schoolWrap) schoolWrap.style.display = 'block';
    if(progBar) progBar.style.display = '';
    if(summerWrap) summerWrap.style.display = 'none';
    if(schoolIntro) schoolIntro.style.display = 'block';
    return;
  }
  if(schoolIntro) schoolIntro.style.display = 'none';
  // Summer program selected
  if(schoolWrap) schoolWrap.style.display = 'none';
  if(progBar) progBar.style.display = 'none';
  if(summerWrap) summerWrap.style.display = 'block';
  currentTheme = prog;
  const isBro = prog === 'brothers';
  const summer = document.getElementById('fields-summer');
  if(summer){
    summer.classList.remove('fp-brothers','fp-sisters');
    summer.classList.add(isBro ? 'fp-brothers' : 'fp-sisters');
  }
  const st = document.getElementById('summer-title');
  const ss = document.getElementById('summer-sub');
  if(st) st.textContent = isBro ? '🛡️ The Amaanah — Brothers Summer Program' : '🌸 The Amaanah — Sisters Summer Program';
  if(ss) ss.textContent = isBro ? '3-month summer mentorship & brotherhood program · Ages 12 and up' : '3-month summer sisterhood & mentorship program · Ages 12 and up';
  const themeClass = isBro ? 'theme-brothers' : 'theme-sisters';
  const otherClass = isBro ? 'theme-sisters' : 'theme-brothers';
  ['addBtn','feeBox','regByBox','waiverBox','agreeCheck'].forEach(id => {
    const el = document.getElementById(id);
    if(el){ el.classList.remove(otherClass); el.classList.add(themeClass); }
  });
  const txtClass = isBro ? 'theme-brothers-text' : 'theme-sisters-text';
  const otherTxt = isBro ? 'theme-sisters-text' : 'theme-brothers-text';
  ['emergLabel','hearLabel','waiverLabel','sigLabel'].forEach(id => {
    const el = document.getElementById(id);
    if(el){ el.classList.remove(otherTxt); el.classList.add(txtClass); }
  });
  document.getElementById('summerParticipants').innerHTML = '';
  participantCount = 0;
  addParticipant();
  selectRegBy('parent');
  setTimeout(() => { spInitSig(); spSetSigDate(); }, 60);
}

function addParticipant(){
  participantCount++;
  const n = participantCount;
  const themeClass = currentTheme === 'brothers' ? 'theme-brothers' : 'theme-sisters';
  const container = document.getElementById('summerParticipants');
  const div = document.createElement('div');
  div.className = 'sp-block ' + themeClass;
  div.id = 'pblock' + n;
  div.innerHTML = `
    <div class="sp-header">
      <span>Participant ${n}</span>
      ${n > 1 ? `<span class="sp-remove" onclick="removeParticipant(${n})">✕ Remove</span>` : ''}
    </div>
    <div class="fld-row three">
      <div class="fld"><label>First Name <span class="req">*</span></label><input type="text" placeholder="First"/></div>
      <div class="fld"><label>Last Name <span class="req">*</span></label><input type="text" placeholder="Last"/></div>
      <div class="fld"><label>T-Shirt Size <span class="req">*</span></label><select><option>Youth M</option><option>Youth L</option><option>Adult S</option><option>Adult M</option><option>Adult L</option><option>Adult XL</option></select></div>
    </div>
    <div class="fld-row dob-row">
      <div class="fld">
        <label>Date of Birth <span class="req">*</span></label>
        <input type="date" id="dob${n}" onchange="checkAge(${n})"/>
      </div>
      <div class="fld">
        <label>Age</label>
        <input type="text" id="age${n}" placeholder="Auto" readonly/>
        <div class="age-warn" id="warn${n}">Must be at least 12 years old.</div>
      </div>
    </div>
    <div class="fld"><label>Health conditions / allergies</label><input type="text" placeholder="Optional — e.g. asthma, nut allergy"/></div>
  `;
  container.appendChild(div);
  updateFeeTotal();
}

function removeParticipant(n){
  const el = document.getElementById('pblock' + n);
  if(el) el.remove();
  renumberParticipants();
  updateFeeTotal();
}

function renumberParticipants(){
  const blocks = document.querySelectorAll('.sp-block');
  participantCount = blocks.length;
  blocks.forEach((b, i) => {
    const newN = i + 1;
    b.id = 'pblock' + newN;
    const hdr = b.querySelector('.sp-header > span');
    if(hdr) hdr.textContent = 'Participant ' + newN;
    const rm = b.querySelector('.sp-remove');
    if(rm){ if(newN === 1) rm.remove(); else rm.setAttribute('onclick','removeParticipant('+newN+')'); }
  });
}

function checkAge(n){
  const dob = document.getElementById('dob'+n);
  const ageEl = document.getElementById('age'+n);
  const warn = document.getElementById('warn'+n);
  const d = new Date(dob.value);
  if(isNaN(d.getTime())){ ageEl.value=''; return; }
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if(m < 0 || (m===0 && t.getDate() < d.getDate())) age--;
  ageEl.value = age >= 0 ? age : '';
  if(age < 12){ ageEl.style.color='var(--red)'; warn.classList.add('show'); }
  else { ageEl.style.color = currentTheme==='brothers'?'#0f1e2d':'#7b4d8a'; warn.classList.remove('show'); }
}

function updateFeeTotal(){
  const count = document.querySelectorAll('.sp-block').length || 1;
  document.getElementById('feeTotalLabel').textContent = `Total Due (${count} participant${count>1?'s':''})`;
  document.getElementById('feeTotal').textContent = '$' + (count * 160);
}

function toggleRegBy(){
  const val = document.querySelector('input[name="regby"]:checked').value;
  document.getElementById('parentInfo').style.display = (val === 'self') ? 'none' : 'block';
}

// ── WAIVER & MEDIA CONSENT CHECKBOXES (two distinct, independent boxes) ──
function toggleAgreeBox(boxId, wrapId){
  const box = document.getElementById(boxId);
  const wrap = document.getElementById(wrapId);
  box.checked = !box.checked;
  wrap.classList.toggle('checked', box.checked);
}

// ── SIGNATURE PAD ──
let spSigCanvas, spSigCtx, spSigDrawing=false, spSigDrawn=false;
function spInitSig(){
  spSigCanvas = document.getElementById('spSigCanvas');
  if(!spSigCanvas) return;
  spSigCtx = spSigCanvas.getContext('2d');
  spResizeSig();
  window.addEventListener('resize', spResizeSig);
  spSigCanvas.addEventListener('mousedown', spSigStart);
  spSigCanvas.addEventListener('mousemove', spSigMove);
  spSigCanvas.addEventListener('mouseup', spSigEnd);
  spSigCanvas.addEventListener('mouseleave', spSigEnd);
  spSigCanvas.addEventListener('touchstart', spSigStart, {passive:false});
  spSigCanvas.addEventListener('touchmove', spSigMove, {passive:false});
  spSigCanvas.addEventListener('touchend', spSigEnd, {passive:false});
}
function spResizeSig(){
  if(!spSigCanvas) return;
  const r = spSigCanvas.getBoundingClientRect();
  spSigCanvas.width = r.width; spSigCanvas.height = r.height;
  spSigCtx.lineWidth=2; spSigCtx.lineCap='round'; spSigCtx.lineJoin='round'; spSigCtx.strokeStyle='#1a4a35';
}
function spSigPos(e){
  const r = spSigCanvas.getBoundingClientRect();
  const s = e.touches ? e.touches[0] : e;
  return {x:(s.clientX-r.left)*(spSigCanvas.width/r.width), y:(s.clientY-r.top)*(spSigCanvas.height/r.height)};
}
function spSigStart(e){ e.preventDefault(); spSigDrawing=true; const p=spSigPos(e); spSigCtx.beginPath(); spSigCtx.moveTo(p.x,p.y); }
function spSigMove(e){ e.preventDefault(); if(!spSigDrawing) return; const p=spSigPos(e); spSigCtx.lineWidth=2; spSigCtx.lineCap='round'; spSigCtx.lineJoin='round'; spSigCtx.strokeStyle='#1a4a35'; spSigCtx.lineTo(p.x,p.y); spSigCtx.stroke(); spSigDrawn=true; }
function spSigEnd(){ spSigDrawing=false; }
function spClearSig(){ if(spSigCtx) spSigCtx.clearRect(0,0,spSigCanvas.width,spSigCanvas.height); spSigDrawn=false; }

// Auto-fill today's date
function spSetSigDate(){
  const el = document.getElementById('spSigDate');
  if(el){ const t=new Date(); el.value = (t.getMonth()+1)+'/'+t.getDate()+'/'+t.getFullYear(); }
}



// ══ SUMMER FORM SUBMIT ══
function submitSummerForm(){
  const err = document.getElementById('summerError');
  err.style.display = 'none';
  const prog = document.querySelector('.prog-opt.selected')?.id === 'opt-brothers' ? 'Brothers' : 'Sisters';

  // Validate: at least one participant with valid DOB (12+), waiver checked
  const blocks = document.querySelectorAll('#summerParticipants .sp-block');
  if(blocks.length === 0){ showSummerErr('Please add at least one participant.'); return; }

  // Check ages
  let okAge = true;
  blocks.forEach((b,i) => {
    const ageEl = b.querySelector('input[id^="age"]');
    const age = parseInt(ageEl?.value);
    if(isNaN(age) || age < 12) okAge = false;
  });
  if(!okAge){ showSummerErr('All participants must be at least 12 years old.'); return; }

  // Waiver + media consent — two distinct, independently-required checkboxes
  if(!document.getElementById('agreeBoxWaiver')?.checked){ showSummerErr('Please agree to the Liability Waiver.'); return; }
  if(!document.getElementById('agreeBoxMedia')?.checked){ showSummerErr('Please agree to the Photo & Video Consent.'); return; }

  // Signature
  if(!spSigDrawn){ showSummerErr('Please provide a signature.'); return; }

  const btn = document.getElementById('summerSubmitBtn');
  btn.textContent = 'Submitting...'; btn.disabled = true;
  const ref = 'AMAANAH-' + Date.now().toString().slice(-6);

  const data = new FormData();
  data.append('_subject', 'The Amaanah ' + prog + ' Summer Program Application');
  data.append('Program', 'The Amaanah — ' + prog + ' Summer Program');
  data.append('Program Inbox', 'theamaanah@gmail.com');
  data.append('Reference', ref);

  // Registered by
  const regBy = document.querySelector('input[name="regby"]:checked')?.value || 'parent';
  data.append('Registered By', regBy === 'self' ? 'Participant (18+)' : 'Parent/Guardian');
  if(regBy !== 'self'){
    const pi = document.getElementById('parentInfo');
    const inputs = pi.querySelectorAll('input');
    data.append('Parent/Guardian Name', inputs[0]?.value || '');
    data.append('Relationship', inputs[1]?.value || '');
    data.append('Parent Phone', inputs[2]?.value || '');
    data.append('Parent Email', inputs[3]?.value || '');
  }

  // Participants
  blocks.forEach((b,i) => {
    const ins = b.querySelectorAll('input, select');
    const n = i+1;
    data.append('Participant '+n+' First Name', ins[0]?.value || '');
    data.append('Participant '+n+' Last Name', ins[1]?.value || '');
    data.append('Participant '+n+' T-Shirt', b.querySelector('select')?.value || '');
    data.append('Participant '+n+' DOB', b.querySelector('input[type=date]')?.value || '');
    data.append('Participant '+n+' Age', b.querySelector('input[id^="age"]')?.value || '');
    const health = b.querySelector('input[placeholder^="Optional"]');
    data.append('Participant '+n+' Health Notes', health?.value || '');
  });

  // Emergency + referral
  const emergInputs = document.querySelectorAll('#emergLabel ~ .fld-row input');
  // grab by proximity
  const allFlds = document.querySelectorAll('#summerFormWrap input, #summerFormWrap select');
  data.append('How They Heard', document.getElementById('hearAbout')?.value || '');
  data.append('Liability Waiver Agreed', document.getElementById('agreeBoxWaiver')?.checked ? 'Yes' : 'No');
  data.append('Media/Photo Consent Agreed', document.getElementById('agreeBoxMedia')?.checked ? 'Yes' : 'No');

  // Signature as image
  try { data.append('Signature', document.getElementById('spSigCanvas').toDataURL()); } catch(e){}
  data.append('Total Participants', blocks.length);
  data.append('Total Due', '$' + (blocks.length * 160));

  fetch('https://formspree.io/f/xqejjwpr', {
    method:'POST', body:data, headers:{'Accept':'application/json'}
  }).then(r => {
    if(r.ok){
      document.getElementById('summerFormWrap').innerHTML =
        '<div style="text-align:center;padding:3rem 1rem">'+
        '<div style="font-size:2.5rem;margin-bottom:1rem">🌟</div>'+
        '<div style="font-family:\'Amiri\',serif;font-size:1.6rem;color:var(--forest);margin-bottom:0.5rem">جَزَاكُمُ اللهُ خَيْرًا</div>'+
        '<h2 style="font-family:\'Playfair Display\',serif;color:var(--forest);margin-bottom:0.5rem">Application Submitted!</h2>'+
        '<p style="color:var(--ink-soft);margin-bottom:0.5rem">Reference #: '+ref+'</p>'+
        '<p style="color:var(--ink-soft);font-style:italic;max-width:440px;margin:0 auto 1rem">We have received your Amaanah '+prog+' application. We will contact you soon with next steps, insha\'Allah.</p>'+'<p style="color:var(--ink-soft);font-size:0.9rem;margin:0 auto 1.5rem">Questions? ✉️ theamaanah@gmail.com</p>'+
        '<a class="btn btn-gold" href="/">← Return to Home</a></div>';
    } else { showSummerErr('Something went wrong. Please try again or email us at theamaanah@gmail.com'); btn.textContent='📋 Submit Application'; btn.disabled=false; }
  }).catch(() => { showSummerErr('Network error. Please check your connection and try again.'); btn.textContent='📋 Submit Application'; btn.disabled=false; });
}
function showSummerErr(msg){
  const err = document.getElementById('summerError');
  err.textContent = msg; err.style.display = 'block';
  err.scrollIntoView({behavior:'smooth', block:'center'});
}


function selectRegBy(val){
  document.getElementById('regbyParent').classList.toggle('selected', val === 'parent');
  document.getElementById('regbySelf').classList.toggle('selected', val === 'self');
  document.querySelector('input[name="regby"][value="parent"]').checked = (val === 'parent');
  document.querySelector('input[name="regby"][value="self"]').checked = (val === 'self');
  document.getElementById('parentInfo').style.display = (val === 'self') ? 'none' : 'block';
}


/* ==== script block 2, 1955 chars ==== */

/* A11y: make non-native clickable elements keyboard-accessible */
(function(){

  /* A11y: associate labels with controls + ensure inputs have accessible names */
  function labelControls(){
    document.querySelectorAll('label').forEach(function(lbl){
      if(lbl.htmlFor || lbl.querySelector('input,select,textarea')) return;
      // find the next form control sibling/descendant after this label
      var ctrl=null, n=lbl.nextElementSibling;
      while(n && !ctrl){
        if(/^(INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) ctrl=n;
        else { var f=n.querySelector && n.querySelector('input,select,textarea'); if(f) ctrl=f; }
        n=n.nextElementSibling;
      }
      if(!ctrl) return;
      var txt=(lbl.textContent||'').replace(/\*/g,'').trim();
      if(!ctrl.id){ ctrl.id='fld_'+Math.random().toString(36).slice(2,9); }
      lbl.setAttribute('for', ctrl.id);
      if(txt && !ctrl.getAttribute('aria-label')) ctrl.setAttribute('aria-label', txt);
    });
    // any control still without a name: use placeholder
    document.querySelectorAll('input,select,textarea').forEach(function(c){
      if(!c.getAttribute('aria-label') && !c.labels?.length && c.placeholder)
        c.setAttribute('aria-label', c.placeholder);
    });
  }

  function upgrade(){
    labelControls();
    document.querySelectorAll('[onclick]').forEach(function(el){
      var tag=el.tagName;
      if(tag==='A'||tag==='BUTTON'||tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA') return;
      if(!el.hasAttribute('role')) el.setAttribute('role','button');
      if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
      if(!el.dataset.kbd){
        el.dataset.kbd='1';
        el.addEventListener('keydown', function(e){
          if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); }
        });
      }
    });
  }
  if(document.readyState!=='loading') upgrade();
  else document.addEventListener('DOMContentLoaded', upgrade);
})();
