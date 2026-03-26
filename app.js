// ═══════════════════════════════════════════
// amplif.AI Block Party Tool — app.js
// Sign-up form, blueprint canvas, AI schedule
// ═══════════════════════════════════════════

/* ─── MOBILE NAV ─── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
});
function closeMobileMenu() { mobileMenu.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); }

/* ─── SIGN-UP FORM ─── */
const ROLE_AVATARS = { attendee:'🙋', volunteer:'🙌', vendor:'👩‍🍳', performer:'🎧', organizer:'📋' };
let attendeeCount = 4;

document.getElementById('role').addEventListener('change', (e) => {
  const vg = document.getElementById('vendor-group');
  vg.style.display = (e.target.value === 'vendor' || e.target.value === 'performer') ? 'block' : 'none';
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateSignup()) return;
  const first = document.getElementById('first-name').value.trim();
  const last  = document.getElementById('last-name').value.trim();
  const role  = document.getElementById('role').value;
  addAttendee(first, last, role);
  document.getElementById('signup-form').style.display = 'none';
  const msg = document.getElementById('success-msg');
  msg.textContent = `We'll send event updates to ${document.getElementById('email').value}. See you at the party!`;
  document.getElementById('signup-success').style.display = 'block';
});

function validateSignup() {
  let ok = true;
  const fields = [
    { id: 'first-name', errId: 'first-name-error', msg: 'Please enter your first name.' },
    { id: 'last-name',  errId: 'last-name-error',  msg: 'Please enter your last name.' },
    { id: 'email',      errId: 'email-error',       msg: 'Please enter a valid email.',   pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: 'address',    errId: 'address-error',     msg: 'Please enter your street address.' },
    { id: 'role',       errId: 'role-error',        msg: 'Please select your role.' },
  ];
  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    const val = el.value.trim();
    let invalid = !val;
    if (!invalid && f.pattern) invalid = !f.pattern.test(val);
    err.textContent = invalid ? f.msg : '';
    el.style.borderColor = invalid ? '#ff6b6b' : '';
    if (invalid) ok = false;
  });
  const consent = document.getElementById('consent');
  const consentErr = document.getElementById('consent-error');
  if (!consent.checked) {
    consentErr.textContent = 'Please agree to receive updates.';
    ok = false;
  } else { consentErr.textContent = ''; }
  return ok;
}

function addAttendee(first, last, role) {
  attendeeCount++;
  document.getElementById('attendee-count').textContent = attendeeCount;
  const li = document.createElement('li');
  li.className = 'attendee-item';
  li.innerHTML = `<span class="avatar">${ROLE_AVATARS[role] || '👤'}</span><div><strong>${first} ${last[0]}.</strong><small>${capitalize(role)}</small></div>`;
  const list = document.getElementById('attendee-list');
  list.insertBefore(li, list.firstChild);
  li.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}], {duration:400,easing:'ease'});
}

function capitalize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

function resetSignup() {
  document.getElementById('signup-form').reset();
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('signup-success').style.display = 'none';
  document.getElementById('vendor-group').style.display = 'none';
}

/* ─── BLUEPRINT ─── */
const PALETTE_ITEMS = [
  { emoji:'🍔', label:'Food Truck' },
  { emoji:'🌮', label:'Taco Stand' },
  { emoji:'🍦', label:'Ice Cream' },
  { emoji:'🎧', label:'DJ Booth' },
  { emoji:'🎤', label:'Stage' },
  { emoji:'🪑', label:'Seating' },
  { emoji:'⛱️', label:'Tent/Shade' },
  { emoji:'🗑️', label:'Trash Bin' },
  { emoji:'🚻', label:'Restroom' },
  { emoji:'🅿️', label:'Parking' },
];
const ACCESSIBLE_ITEMS = [
  { emoji:'♿', label:'Accessible Zone' },
  { emoji:'⛑️', label:'First Aid' },
  { emoji:'🦽', label:'Wheelchair Spot' },
];
const KIDS_ITEMS = [
  { emoji:'🎠', label:'Play Area' },
  { emoji:'🎨', label:'Face Paint' },
  { emoji:'🎈', label:'Bounce House' },
];

function buildPalette(items, containerId) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'palette-item';
    el.draggable = true;
    el.dataset.emoji = item.emoji;
    el.dataset.label = item.label;
    el.innerHTML = `<span class="item-emoji">${item.emoji}</span>${item.label}`;
    el.addEventListener('dragstart', onDragStart);
    container.appendChild(el);
  });
}
buildPalette(PALETTE_ITEMS, 'palette-items');
buildPalette(ACCESSIBLE_ITEMS, 'accessible-items');
buildPalette(KIDS_ITEMS, 'kids-items');

let draggingData = null;
let deleteMode = false;

function onDragStart(e) {
  draggingData = { emoji: e.currentTarget.dataset.emoji, label: e.currentTarget.dataset.label };
  e.dataTransfer.effectAllowed = 'copy';
}

const canvas = document.getElementById('blueprint-canvas');
canvas.addEventListener('dragover', (e) => { e.preventDefault(); canvas.classList.add('drag-over'); });
canvas.addEventListener('dragleave', () => canvas.classList.remove('drag-over'));
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  canvas.classList.remove('drag-over');
  if (!draggingData || deleteMode) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - 32;
  const y = e.clientY - rect.top - 32;
  placeItem(draggingData.emoji, draggingData.label, Math.max(0, x), Math.max(0, y));
  draggingData = null;
});

function placeItem(emoji, label, x, y) {
  const el = document.createElement('div');
  el.className = 'placed-item';
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.innerHTML = `<span class="item-emoji">${emoji}</span>${label}`;
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', label + ' placed on map');
  makeDraggable(el);
  el.addEventListener('click', () => { if (deleteMode) el.remove(); });
  el.addEventListener('mouseenter', () => { if (deleteMode) el.classList.add('delete-hover'); });
  el.addEventListener('mouseleave', () => el.classList.remove('delete-hover'));
  canvas.appendChild(el);
  el.animate([{opacity:0,transform:'scale(0.5)'},{opacity:1,transform:'scale(1)'}],{duration:250,easing:'ease'});
}

function makeDraggable(el) {
  let startX, startY, startLeft, startTop;
  el.addEventListener('mousedown', (e) => {
    if (deleteMode) return;
    e.preventDefault();
    startX = e.clientX; startY = e.clientY;
    startLeft = parseInt(el.style.left) || 0;
    startTop  = parseInt(el.style.top)  || 0;
    const onMove = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const newLeft = Math.max(0, Math.min(rect.width - el.offsetWidth,  startLeft + ev.clientX - startX));
      const newTop  = Math.max(0, Math.min(rect.height - el.offsetHeight, startTop  + ev.clientY - startY));
      el.style.left = newLeft + 'px';
      el.style.top  = newTop  + 'px';
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

document.getElementById('mode-place').addEventListener('click', () => {
  deleteMode = false;
  canvas.classList.remove('delete-mode');
  document.getElementById('mode-place').classList.add('active');
  document.getElementById('mode-delete').classList.remove('active');
});
document.getElementById('mode-delete').addEventListener('click', () => {
  deleteMode = true;
  canvas.classList.add('delete-mode');
  document.getElementById('mode-delete').classList.add('active');
  document.getElementById('mode-place').classList.remove('active');
});
document.getElementById('clear-map-btn').addEventListener('click', () => {
  canvas.querySelectorAll('.placed-item').forEach(el => el.remove());
});
document.getElementById('export-btn').addEventListener('click', () => {
  alert('📥 In production this would export your blueprint as a PNG or PDF.\nAll placed items would be captured at full resolution!');
});

/* ─── AI SCHEDULE ─── */
const SCHEDULE_TEMPLATES = {
  family: [
    { time:'12:00', title:'🎉 Welcome & Opening Ceremony', desc:'Gather neighbors, introductions from the organizer, safety briefing.', cat:'general' },
    { time:'12:15', title:'⛑️ Safety Announcement', desc:'Review exits, first aid station location, emergency contacts.', cat:'safety', tag:'Safety' },
    { time:'12:30', title:'👶 Kids Scavenger Hunt', desc:'Organized hunt around the block with prizes. Ages 3–12 welcome!', cat:'kids', tag:'Kids Zone' },
    { time:'1:00',  title:'🍔 Lunch Service Opens', desc:'Food vendors open. All dietary needs marked at each booth.', cat:'food' },
    { time:'1:30',  title:'🎨 Face Painting & Crafts', desc:'Kids activities zone — face painting, balloon animals, crafts table.', cat:'kids', tag:'Kids Zone' },
    { time:'2:00',  title:'🎵 Live Music Set 1', desc:'Opening performer takes the stage.', cat:'music' },
    { time:'2:45',  title:'👴 Senior Social & Quiet Break', desc:'Shaded seating, refreshments, and gentle conversation time.', cat:'senior', tag:'Senior Friendly' },
    { time:'3:00',  title:'🎧 DJ Set Begins', desc:'Main DJ takes over — high-energy music for all ages.', cat:'music' },
    { time:'4:00',  title:'🍦 Dessert & Snack Hour', desc:'Ice cream, snow cones, and sweet vendors open up.', cat:'food' },
    { time:'4:30',  title:'⚽ Block Games & Relay Races', desc:'Street games — relay races, hopscotch, tug-of-war.', cat:'kids' },
    { time:'5:30',  title:'🎵 Live Music Set 2', desc:'Second performance — crowd-interactive music.', cat:'music' },
    { time:'6:15',  title:'⛑️ Safety & Hydration Check', desc:'Hydration reminder, first aid check-in, lighting check.', cat:'safety', tag:'Safety' },
    { time:'6:30',  title:'🍔 Dinner Service', desc:'Full dinner from all food vendors. Accessible lanes open.', cat:'food' },
    { time:'7:00',  title:'🎧 Evening DJ Set', desc:'Wind-down music, slower groove for the evening crowd.', cat:'music' },
    { time:'7:45',  title:'📸 Group Photo', desc:'Everyone gather on the block for the annual neighborhood photo!', cat:'general' },
    { time:'8:00',  title:'🌙 Closing & Clean-Up', desc:'Thank-you remarks, volunteer clean-up begins. Safe travels home!', cat:'general' },
  ],
  music: [
    { time:'12:00', title:'🎉 Gates Open', desc:'Sound check complete, vendors ready, welcome music playing.', cat:'general' },
    { time:'12:30', title:'⛑️ Safety Briefing', desc:'Emergency exits, first aid, rain plan announced.', cat:'safety', tag:'Safety' },
    { time:'1:00',  title:'🎵 Opening Act', desc:'Local emerging artist kicks off the music festival.', cat:'music' },
    { time:'2:00',  title:'🍔 Food Break', desc:'One-hour food intermission. All vendors fully open.', cat:'food' },
    { time:'3:00',  title:'🎧 DJ Set — Main Stage', desc:'High-energy DJ set, crowd interactions and dance zone open.', cat:'music' },
    { time:'4:30',  title:'👶 Kids Dance Zone', desc:'Kid-friendly DJ mix, supervised dance floor for little ones.', cat:'kids', tag:'Kids Zone' },
    { time:'5:00',  title:'🎵 Headliner Performance', desc:'Main act takes the stage — the highlight of the block party!', cat:'music' },
    { time:'6:30',  title:'👴 Quiet Lounge Interlude', desc:'Acoustic set in the quiet zone, shaded seating for seniors.', cat:'senior', tag:'Senior Friendly' },
    { time:'7:00',  title:'🎉 Encore & Audience Request Set', desc:'Crowd picks the songs — open mic moment for the neighborhood.', cat:'music' },
    { time:'7:45',  title:'🌙 Closing Ceremony', desc:'Final thanks, group photo, volunteers begin clean-up.', cat:'general' },
  ],
  foodie: [
    { time:'12:00', title:'🍽️ Vendors Open — Soft Launch', desc:'Select vendors open early. Sample the menus!', cat:'food' },
    { time:'12:30', title:'⛑️ Safety & Allergy Briefing', desc:'Review allergy accommodation spots, accessible food lanes.', cat:'safety', tag:'Safety' },
    { time:'1:00',  title:'🍔 All Vendors Open', desc:'Full lunch service — tacos, BBQ, vegan options, desserts.', cat:'food' },
    { time:'2:00',  title:'🧑‍🍳 Live Cooking Demo', desc:'Guest cook does a live demo. Samples shared with crowd.', cat:'food' },
    { time:'2:45',  title:'👶 Kids Food Craft', desc:'Kids make their own mini-pizzas and decorate cupcakes.', cat:'kids', tag:'Kids Zone' },
    { time:'3:30',  title:'🎵 Background Music Set', desc:'Easy-listening live music accompanies the afternoon food hour.', cat:'music' },
    { time:'4:00',  title:'🍦 Dessert Festival Hour', desc:'Ice cream, fudge, crepes, and specialty desserts take center stage.', cat:'food' },
    { time:'5:00',  title:'👴 Senior Tasting Social', desc:'Reserved shaded area for a curated tasting menu for seniors.', cat:'senior', tag:'Senior Friendly' },
    { time:'6:00',  title:'🍔 Dinner Rush', desc:'All vendors fully operational for the evening dinner crowd.', cat:'food' },
    { time:'7:00',  title:'🏆 Best Dish Vote', desc:'Neighbors vote for their favorite vendor dish — winner announced!', cat:'awards', tag:'Awards' },
    { time:'7:45',  title:'🌙 Thank You & Close', desc:'Organizer remarks, final group photo, clean-up begins.', cat:'general' },
  ],
};
// Default cultural and sports to family template variations
SCHEDULE_TEMPLATES.cultural = SCHEDULE_TEMPLATES.family;
SCHEDULE_TEMPLATES.sports = SCHEDULE_TEMPLATES.family;

document.getElementById('generate-btn').addEventListener('click', generateSchedule);

function generateSchedule() {
  const placeholder = document.getElementById('schedule-placeholder');
  const loading     = document.getElementById('schedule-loading');
  const result      = document.getElementById('schedule-result');
  const timeline    = document.getElementById('schedule-timeline');

  const vibe       = document.getElementById('ai-vibe').value;
  const performers = document.getElementById('ai-performers').value.trim();
  const incKids    = document.getElementById('inc-kids').checked;
  const incSeniors = document.getElementById('inc-seniors').checked;
  const incMeals   = document.getElementById('inc-meals').checked;
  const incSafety  = document.getElementById('inc-safety').checked;
  const incAwards  = document.getElementById('inc-awards').checked;
  const startTime  = document.getElementById('ai-start').value || '12:00';
  const endTime    = document.getElementById('ai-end').value   || '20:00';

  placeholder.style.display = 'none';
  result.style.display      = 'none';
  loading.style.display     = 'flex';

  setTimeout(() => {
    loading.style.display = 'none';
    result.style.display  = 'block';
    timeline.innerHTML    = '';

    let items = JSON.parse(JSON.stringify(SCHEDULE_TEMPLATES[vibe] || SCHEDULE_TEMPLATES.family));

    // Filter by selections
    if (!incKids)    items = items.filter(i => i.cat !== 'kids');
    if (!incSeniors) items = items.filter(i => i.cat !== 'senior');
    if (!incMeals)   items = items.filter(i => i.cat !== 'food');
    if (!incSafety)  items = items.filter(i => i.cat !== 'safety');
    if (!incAwards)  items = items.filter(i => i.cat !== 'awards');

    // Inject performer name if provided
    if (performers) {
      items.forEach(item => {
        if (item.cat === 'music') {
          item.title = item.title.replace('Live Music Set 1', `${performers.split(',')[0].trim()} — Live`)
                                 .replace('Opening Act', `${performers.split(',')[0].trim()} — Opening`)
                                 .replace('Headliner Performance', `${performers.split(',')[0].trim()} — Headliner`);
        }
      });
    }

    // Shift times based on start time
    const [sh, sm] = startTime.split(':').map(Number);
    const baseHour = 12;
    const offset   = sh - baseHour;
    items.forEach(item => {
      const [h, m] = item.time.split(':').map(Number);
      const newH = Math.min(h + offset, 23);
      item.time = `${String(newH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    });

    // Render timeline items with staggered animation
    items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'timeline-item';
      row.style.animationDelay = `${i * 0.06}s`;
      const [h24, m] = item.time.split(':').map(Number);
      const ampm = h24 >= 12 ? 'PM' : 'AM';
      const h12  = h24 > 12 ? h24 - 12 : (h24 === 0 ? 12 : h24);
      const displayTime = `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
      row.innerHTML = `
        <div class="timeline-time">${displayTime}</div>
        <div class="timeline-body cat-${item.cat}">
          ${item.tag ? `<span class="timeline-tag">${item.tag}</span>` : ''}
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>`;
      timeline.appendChild(row);
    });

    // Download button
    document.getElementById('download-btn').onclick = () => {
      const text = items.map(i => `${i.time}  ${i.title}\n       ${i.desc}`).join('\n\n');
      const blob  = new Blob([`amplif.AI Block Party Tool — Event Schedule\n${'─'.repeat(40)}\n\n${text}`], {type:'text/plain'});
      const a     = document.createElement('a');
      a.href      = URL.createObjectURL(blob);
      a.download  = 'amplif-ai-block-party-schedule.txt';
      a.click();
    };
  }, 2200);
}

/* ─── SKIP TO MAIN CONTENT (accessibility) ─── */
const skip = document.createElement('a');
skip.href = '#signup';
skip.textContent = 'Skip to main content';
skip.style.cssText = 'position:fixed;top:-60px;left:1rem;z-index:9999;background:var(--orange);color:#fff;padding:.5rem 1rem;border-radius:8px;font-weight:700;transition:top .2s';
skip.addEventListener('focus', () => { skip.style.top = '1rem'; });
skip.addEventListener('blur',  () => { skip.style.top = '-60px'; });
document.body.prepend(skip);
