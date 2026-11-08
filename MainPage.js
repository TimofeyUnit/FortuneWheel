
function getIconForChore(text) {
  const t = text.toLowerCase();



  if (t.includes('отдых')) return '⭐';
  if (t.includes('посуд')) return '🍽️';
  if (t.includes('мусор')) return '🗑️';
  if (t.includes('пыл')) return '🧹';
  if (t.includes('пол')) return '🪣';
  if (t.includes('глад')) return '👔';
  if (t.includes('вещи') || t.includes('стир')) return '👕';
  if (t.includes('готов') || t.includes('еда')) return '🍕';
  if (t.includes('окн') || t.includes('стекл')) return '🪟';

  return '✨';
}

const SVG_TRASH = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zM6 9h12l-1 12H7L6 9z"/></svg>';
const SVG_PENCIL = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';


const PERSON_COLORS = ['#ffc94d', '#62dcd8', '#c58bff', '#ff8fb8'];
let personColorIndex = 0;
function personSvg() {
  return `<svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="14" r="6.5" fill="#fff" stroke="#302d70" stroke-width="2"/>
    <path d="M8 35c0-7 5-11.5 12-11.5S32 28 32 35z" fill="#fff" stroke="#302d70" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;
}


const homePage = document.getElementById('main');
const wheelPage = document.getElementById('wheel-page');
const wheel = document.getElementById('main-wheel');
const spinButton = document.getElementById('spin-button');
const resultText = document.getElementById('wheel-result-text');

let rotation = 0;
let spinTimer;
let peopleQueue = [];
let previousPeople = '';

function setActiveTab(el) {
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('is-active');
    l.removeAttribute('aria-current');
  });
  el.classList.add('is-active');
}

function showHome() {
  wheelPage.classList.add('hidden');
  homePage.classList.remove('hidden');
  document.body.classList.remove('wheel-active');
}

function showWheel() {
  homePage.classList.add('hidden');
  wheelPage.classList.remove('hidden');
  document.body.classList.add('wheel-active');
  window.scrollTo(0, 0);
  updateCounts();
}

document.querySelectorAll('[data-open-wheel]').forEach(button => {
  button.addEventListener('click', () => {
    showWheel();
    setActiveTab(document.querySelector('.nav-link[data-open-wheel]'));
  });
});

document.querySelectorAll('.main-link').forEach(link => {
  link.addEventListener('click', e => {
    showHome();
    setActiveTab(e.currentTarget);
  });
});


const homeTab = document.querySelector('.nav-link[href="#home"]');
document.querySelector('.brand').addEventListener('click', e => {
  e.preventDefault();
  showHome();
  setActiveTab(homeTab);
  window.scrollTo(0, 0);
});


const pList = document.getElementById('participants-list');
const cList = document.getElementById('chores-list');
const pCount = document.getElementById('participants-count');
const cCount = document.getElementById('chores-count');
const MAX_PEOPLE = 8;
const MAX_CHORES = 12;

function getParticipants() {
  return Array.from(pList.querySelectorAll('input')).map(i => i.value.trim()).filter(Boolean);
}
function getChores() {
  return Array.from(cList.querySelectorAll('input')).map(i => i.value.trim()).filter(Boolean);
}


function updateCounts() {
  pCount.textContent = `${pList.children.length}/${MAX_PEOPLE}`;
  cCount.textContent = `${cList.children.length}/${MAX_CHORES}`;
  pCount.classList.toggle('is-full', pList.children.length >= MAX_PEOPLE);
  cCount.classList.toggle('is-full', cList.children.length >= MAX_CHORES);
  renderWheel(getChores());
}

function makeRoundButton(svg, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'round-btn';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = svg;
  return btn;
}


function createListItem(value, type, listElement) {
  const li = document.createElement('li');
  li.className = 'list-item';

  const icon = document.createElement('span');
  icon.className = 'row-icon';
  if (type === 'person') {
    const color = PERSON_COLORS[personColorIndex++ % PERSON_COLORS.length];
    li.dataset.accent = color;
    li.style.setProperty('--accent', color);
    icon.classList.add('is-person');
    icon.innerHTML = personSvg();
  } else {
    icon.textContent = getIconForChore(value);
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 40;
  input.value = value;
  input.placeholder = type === 'person' ? 'Имя' : 'Название дела';
  input.setAttribute('aria-label', type === 'person' ? 'Имя участника' : 'Название дела');

  li.append(icon, input);


  if (type === 'chore') {
    const editBtn = makeRoundButton(SVG_PENCIL, 'Изменить название');
    editBtn.addEventListener('click', () => { input.focus(); input.select(); });
    li.append(editBtn);
  }


  if (type === 'person') {
    const badge = document.createElement('span');
    badge.className = 'row-badge';
    li.append(badge);
  }

  const delBtn = makeRoundButton(SVG_TRASH, 'Удалить');
  delBtn.addEventListener('click', () => {
    li.remove();
    updateCounts();
  });
  li.append(delBtn);


  input.addEventListener('input', () => {
    if (type === 'chore') icon.textContent = getIconForChore(input.value);
    updateCounts();
  });

  listElement.appendChild(li);
  updateCounts();
  return input;
}


document.getElementById('add-participant-btn').addEventListener('click', () => {
  if (pList.children.length < MAX_PEOPLE) createListItem('', 'person', pList).focus();
});
document.getElementById('add-chore-btn').addEventListener('click', () => {
  if (cList.children.length < MAX_CHORES) createListItem('', 'chore', cList).focus();
});
document.getElementById('clear-participants-btn').addEventListener('click', () => {
  pList.innerHTML = '';
  personColorIndex = 0;
  updateCounts();
});


['Глеб', 'Кира', 'Матвей'].forEach(name => createListItem(name, 'person', pList));
['Помыть посуду', 'Вынести мусор', 'Пропылесосить', 'Помыть пол', 'Вытереть пыль', 'Постирать вещи']
  .forEach(chore => createListItem(chore, 'chore', cList));


function findPersonRow(name) {
  return Array.from(pList.querySelectorAll('.list-item')).find(li => li.querySelector('input').value.trim() === name);
}
function highlightPerson(name, badgeText, rolling) {
  pList.querySelectorAll('.list-item').forEach(li => li.classList.remove('is-picked', 'is-rolling'));
  if (!name) return null;
  const li = findPersonRow(name);
  if (!li) return null;
  li.classList.add('is-picked');
  li.classList.toggle('is-rolling', !!rolling);
  li.querySelector('.row-badge').textContent = badgeText || '';
  li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return li;
}


function randomIndex(length) {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(4294967296 / length) * length;
  do { crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % length;
}

function renderWheel(chores) {
  wheel.innerHTML = '';
  if (!chores.length) {
    wheel.style.background = 'transparent';
    return;
  }

  const n = chores.length;
  const step = 360 / n;
  const palette = ['#8ce6e7', '#ffd36d'];


  const colors = chores.map((chore, i) => {
    if (/отдых/i.test(chore)) return '#2b2a6e';
    if (n > 1 && n % 2 === 1 && i === n - 1) return '#c590fa';
    return palette[i % 2];
  });

  wheel.style.background = `conic-gradient(${colors.map((c, i) => `${c} ${i * step}deg ${(i + 1) * step}deg`).join(', ')})`;


  if (n > 1) {
    for (let i = 0; i < n; i++) {
      const line = document.createElement('div');
      line.className = 'wheel-divider';
      line.style.transform = `rotate(${i * step}deg)`;
      wheel.appendChild(line);
    }
  }


  chores.forEach((chore, i) => {
    const label = document.createElement('div');
    const angle = (i + 0.5) * step;
    label.className = 'wheel-label' + (n > 8 ? ' is-small' : '');
    label.dataset.i = i;
    label.innerHTML = getIconForChore(chore);
    label.style.transform = `rotate(${angle}deg) translateY(calc(var(--wheel-size) * -0.3)) rotate(${-angle}deg)`;
    wheel.appendChild(label);
  });
}

const wheelWrap = document.querySelector('.interactive-wheel-wrap');
const pointer = document.querySelector('.wheel-pointer');
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let tickFrame;

function flickPointer() {
  pointer.classList.remove('tick');
  void pointer.offsetWidth;
  pointer.classList.add('tick');
}
function trackTicks(n) {
  const step = 360 / n;
  let last = -1;
  const loop = () => {
    const t = getComputedStyle(wheel).transform;
    const m = t === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(t);
    let angle = Math.atan2(m.b, m.a) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    const idx = Math.floor(((360 - angle) % 360) / step);
    if (idx !== last) {
      if (last !== -1) flickPointer();
      last = idx;
    }
    tickFrame = requestAnimationFrame(loop);
  };
  loop();
}


function setResult({ accent, name, text, icon, mode }) {
  resultText.classList.remove('is-rolling', 'is-result');
  void resultText.offsetWidth;
  resultText.style.setProperty('--accent', accent);
  resultText.replaceChildren();

  const avatar = document.createElement('span');
  avatar.className = 'winner-avatar';
  avatar.innerHTML = personSvg();
  const label = document.createElement('span');
  const b = document.createElement('b');
  b.textContent = name;
  label.append(b);
  if (mode === 'rolling') {
    label.append(' крутит колесо…');
  } else {
    const ic = document.createElement('span');
    ic.className = 'task-icon';
    ic.textContent = icon;
    label.append(' — ', ic, text + '!');
  }
  resultText.append(avatar, label);
  resultText.classList.add(mode === 'rolling' ? 'is-rolling' : 'is-result');
}

function confettiBurst() {
  if (reducedMotion()) return;
  const colors = ['#8ce6e7', '#ffd36d', '#c590fa', '#ffffff', '#ff8fb8'];
  const size = wheelWrap.offsetWidth;
  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = size * (0.45 + Math.random() * 0.35);
    piece.className = 'confetti';
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    wheelWrap.appendChild(piece);
    setTimeout(() => piece.remove(), 1300);
  }
}

function clearWinner() {
  wheel.querySelectorAll('.wheel-glow').forEach(el => el.remove());
  wheel.querySelectorAll('.wheel-label.is-winner').forEach(el => el.classList.remove('is-winner'));
}

spinButton.addEventListener('click', () => {
  if (spinButton.disabled) return;
  const people = getParticipants();
  const chores = getChores();

  // Валидация
  if (!people.length) return alert('Добавь хотя бы одного участника.');
  if (!chores.length || chores.length > MAX_CHORES) return alert(chores.length > MAX_CHORES ? 'Не больше 12 дел!' : 'Добавь хотя бы одно дело.');


  const peopleKey = JSON.stringify(people);
  if (peopleKey !== previousPeople || !peopleQueue.length) {
    peopleQueue = [...people];
    for (let index = peopleQueue.length - 1; index > 0; index--) {
      const swap = randomIndex(index + 1);
      [peopleQueue[index], peopleQueue[swap]] = [peopleQueue[swap], peopleQueue[index]];
    }
    previousPeople = peopleKey;
  }


  const person = peopleQueue.shift();
  const selected = randomIndex(chores.length);
  const chore = chores[selected];
  const step = 360 / chores.length;
  const target = 360 - (selected + 0.5) * step;
  rotation += 1800 + ((target - rotation % 360 + 360) % 360);


  const row = highlightPerson(person, '🎲', true);
  const accent = (row && row.dataset.accent) || '#bc74ff';
  clearWinner();
  setResult({ accent, name: person, mode: 'rolling' });


  wheel.style.transform = `rotate(${rotation}deg)`;
  wheelWrap.classList.add('is-spinning');
  spinButton.disabled = true;
  spinButton.textContent = 'Крутится…';
  if (!reducedMotion()) trackTicks(chores.length);

  const duration = reducedMotion() ? 0 : 3250;
  spinTimer = setTimeout(() => {
    cancelAnimationFrame(tickFrame);
    wheelWrap.classList.remove('is-spinning');


    const glow = document.createElement('div');
    glow.className = 'wheel-glow';
    glow.style.background = `conic-gradient(transparent 0deg ${selected * step}deg, #ffffff8c ${selected * step}deg ${(selected + 1) * step}deg, transparent ${(selected + 1) * step}deg)`;
    wheel.appendChild(glow);
    const winnerLabel = wheel.querySelector(`.wheel-label[data-i="${selected}"]`);
    if (winnerLabel) winnerLabel.classList.add('is-winner');

    const taskText = chore.charAt(0).toLocaleLowerCase('ru') + chore.slice(1);
    highlightPerson(person, getIconForChore(chore), false);
    setResult({ accent, name: person, text: taskText, icon: getIconForChore(chore), mode: 'result' });
    confettiBurst();

    spinButton.disabled = false;
    spinButton.textContent = 'Крутить';
    spinTimer = undefined;
  }, duration);
});


const homeLink = document.querySelector('.nav-link[href="#home"]');
const aboutLink = document.querySelector('.nav-link[href="#about"]');
const aboutSection = document.querySelector('#about');

if (homeLink && aboutLink && aboutSection) {
  const aboutObserver = new IntersectionObserver(entries => {

    if (!wheelPage.classList.contains('hidden')) return;
    const active = entries[0].isIntersecting ? aboutLink : homeLink;
    [homeLink, aboutLink].forEach(link => {
      link.classList.toggle('is-active', link === active);
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { threshold: 0.25 });
  aboutObserver.observe(aboutSection);
}
