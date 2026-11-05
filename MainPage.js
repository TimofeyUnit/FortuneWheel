const dialog = document.querySelector('.wheel-dialog');
const form = document.querySelector('#wheel-form');
const participantsInput = document.querySelector('#participants');
const choresInput = document.querySelector('#chores');
const wheel = document.querySelector('.interactive-wheel');
const labels = document.querySelector('.wheel-labels');
const spinButton = document.querySelector('.dialog-spin');
const result = document.querySelector('.wheel-result');
let rotation = 0;
let spinTimer;
let peopleQueue = [];
let previousPeople = '';

function parseList(value) {
  return [...new Set(value.split(/[,;\n]+/).map(item => item.trim()).filter(Boolean))];
}

function randomIndex(length) {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(4294967296 / length) * length;
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % length;
}

function renderWheel(chores) {
  labels.replaceChildren();
  if (!chores.length) return;
  const step = 360 / chores.length;
  const radius = wheel.clientWidth * .34;
  const colors = ['#8ce6e7', '#ffd36d', '#c590fa'];
  wheel.style.background = `conic-gradient(${chores.map((_, index) => `${colors[index % colors.length]} ${index * step}deg ${(index + 1) * step}deg`).join(', ')})`;
  chores.forEach((chore, index) => {
    const label = document.createElement('span');
    const angle = (index + .5) * step;
    label.className = 'wheel-label';
    label.textContent = chore;
    label.style.transform = `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle - rotation}deg)`;
    if (chores.length > 8) label.style.fontSize = '9px';
    labels.append(label);
  });
}

document.querySelectorAll('[data-open-wheel]').forEach(button => {
  button.addEventListener('click', () => {
    dialog.showModal();
    renderWheel(parseList(choresInput.value).slice(0, 12));
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});

dialog.addEventListener('close', () => {
  if (spinTimer) {
    clearTimeout(spinTimer);
    spinTimer = undefined;
    result.textContent = 'Кому достанется следующее дело?';
  }
  spinButton.disabled = false;
  participantsInput.disabled = false;
  choresInput.disabled = false;
  spinButton.textContent = 'Крутить!';
});

choresInput.addEventListener('input', () => {
  choresInput.setCustomValidity('');
  renderWheel(parseList(choresInput.value).slice(0, 12));
});
participantsInput.addEventListener('input', () => participantsInput.setCustomValidity(''));

form.addEventListener('submit', event => {
  event.preventDefault();
  if (spinButton.disabled) return;
  const people = parseList(participantsInput.value);
  const chores = parseList(choresInput.value);
  if (!people.length) {
    participantsInput.setCustomValidity('Добавь хотя бы одного участника.');
    participantsInput.reportValidity();
    return;
  }
  if (!chores.length || chores.length > 12) {
    choresInput.setCustomValidity(chores.length > 12 ? 'Оставь не больше 12 дел для одного колеса.' : 'Добавь хотя бы одно дело.');
    choresInput.reportValidity();
    return;
  }
  renderWheel(chores);
  const peopleKey = JSON.stringify(people);
  if (peopleKey !== previousPeople || !peopleQueue.length) {
    peopleQueue = [...people];
    for (let index = peopleQueue.length - 1; index > 0; index--) {
      const swap = randomIndex(index + 1);
      [peopleQueue[index], peopleQueue[swap]] = [peopleQueue[swap], peopleQueue[index]];
    }
    previousPeople = peopleKey;
  }
  const selected = randomIndex(chores.length);
  const target = 360 - (selected + .5) * (360 / chores.length);
  rotation += 1800 + ((target - rotation % 360 + 360) % 360);
  wheel.style.transform = `rotate(${rotation}deg)`;
  result.textContent = 'Судьба делает свой выбор…';
  spinButton.disabled = true;
  participantsInput.disabled = true;
  choresInput.disabled = true;
  spinButton.textContent = 'Крутится…';
  const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3250;
  spinTimer = setTimeout(() => {
    renderWheel(chores);
    result.textContent = `${peopleQueue.shift()} — ${chores[selected].charAt(0).toLocaleLowerCase('ru')}${chores[selected].slice(1)}!`;
    spinButton.disabled = false;
    participantsInput.disabled = false;
    choresInput.disabled = false;
    spinButton.textContent = 'Крутить ещё!';
    spinTimer = undefined;
  }, duration);
});

const homeLink = document.querySelector('.nav-link[href="#home"]');
const aboutLink = document.querySelector('.nav-link[href="#about"]');
const aboutObserver = new IntersectionObserver(entries => {
  const active = entries[0].isIntersecting ? aboutLink : homeLink;
  [homeLink, aboutLink].forEach(link => {
    link.classList.toggle('is-active', link === active);
    if (link === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { threshold: .25 });
aboutObserver.observe(document.querySelector('#about'));
