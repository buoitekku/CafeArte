/* Wydarzenia + wizualna rezerwacja miejsc (strona statyczna - bez backendu).
   Zajętość miejsc dla każdego wydarzenia aktualizuje się ręcznie w polu `taken`.
   Wysłanie formularza otwiera klienta poczty z gotową wiadomością (mailto:),
   a treść wiadomości pokazuje się też na stronie jako fallback do skopiowania. */

const BOOKING_EMAIL = "rezerwacje@wypijwymaluj.pl";

const EVENTS = [
  {
    id: "kubki",
    title: "Wieczór malowania kubków",
    date: "pt 26.06.2026, 18:00-20:30",
    iso: "2026-06-26T18:00",
    price: "95 zł / os.",
    desc: "Klasyk na początek: kubek, ciepłe kolory i prowadząca, która pokaże trzy proste techniki zdobienia.",
    taken: ["T2-1", "T2-2", "W3", "B2"],
  },
  {
    id: "talerze",
    title: "Talerze w stylu botanicznym",
    date: "sob 04.07.2026, 11:00-13:30",
    iso: "2026-07-04T11:00",
    price: "120 zł / os.",
    desc: "Liście, zioła i kwiaty na dużych talerzach. Pracujemy z szablonami i farbami podszkliwnymi.",
    taken: ["W1", "W2", "W4", "T3-2"],
  },
  {
    id: "rodzinna",
    title: "Rodzinna sobota z ceramiką",
    date: "sob 11.07.2026, 10:00-12:00",
    iso: "2026-07-11T10:00",
    price: "70 zł / os. (dziecko 50 zł)",
    desc: "Malujemy figurki zwierząt całą rodziną. Fartuszki, zmywalne farby i kakao dla młodszych artystów.",
    taken: ["T1-1", "T1-2", "T4-1"],
  },
  {
    id: "panienski",
    title: "Wieczór panieński: wazon i prosecco bezalkoholowe",
    date: "pt 17.07.2026, 19:00-22:00",
    iso: "2026-07-17T19:00",
    price: "150 zł / os.",
    desc: "Sala tylko dla Was po 19:00, duże wazony, złote akcenty i playlista do wyboru przez Pannę Młodą.",
    taken: ["B1", "B2", "B3", "B4"],
  },
];

/* Plan sali: bar przy oknie, cztery stoliki kawiarniane i duży stół warsztatowy. */
const SEAT_GROUPS = [
  { id: "bar", label: "Bar" },
  { id: "t1", label: "Stolik 1" },
  { id: "t2", label: "Stolik 2" },
  { id: "t3", label: "Stolik 3" },
  { id: "t4", label: "Stolik 4" },
  { id: "w", label: "Stół warsztatowy" },
];

const SEATS = [
  { id: "B1", group: "bar", x: 130, y: 105 }, { id: "B2", group: "bar", x: 210, y: 105 },
  { id: "B3", group: "bar", x: 290, y: 105 }, { id: "B4", group: "bar", x: 370, y: 105 },

  { id: "T1-1", group: "t1", x: 600, y: 70 },  { id: "T1-2", group: "t1", x: 600, y: 170 },

  { id: "T2-1", group: "t2", x: 110, y: 250 }, { id: "T2-2", group: "t2", x: 210, y: 250 },
  { id: "T2-3", group: "t2", x: 110, y: 330 }, { id: "T2-4", group: "t2", x: 210, y: 330 },

  { id: "T3-1", group: "t3", x: 350, y: 250 }, { id: "T3-2", group: "t3", x: 450, y: 250 },
  { id: "T3-3", group: "t3", x: 350, y: 330 }, { id: "T3-4", group: "t3", x: 450, y: 330 },

  { id: "T4-1", group: "t4", x: 588, y: 345 }, { id: "T4-2", group: "t4", x: 692, y: 345 },

  { id: "W1", group: "w", x: 180, y: 420 }, { id: "W2", group: "w", x: 300, y: 420 }, { id: "W3", group: "w", x: 420, y: 420 },
  { id: "W4", group: "w", x: 180, y: 545 }, { id: "W5", group: "w", x: 300, y: 545 }, { id: "W6", group: "w", x: 420, y: 545 },
];

function seatArea(seat) {
  return SEAT_GROUPS.find((g) => g.id === seat.group).label.toLowerCase();
}

const state = { eventId: EVENTS[0].id, selected: new Set() };

const seatmapEl = document.getElementById("seatmap");
const selectEl = document.getElementById("event-select");
const summaryEl = document.getElementById("booking-summary");
const formEl = document.getElementById("booking-form");
const eventListEl = document.getElementById("event-list");
const seatListEl = document.getElementById("seat-list");
const seatListGridEl = document.getElementById("seat-list-grid");
const fallbackEl = document.getElementById("mail-fallback");
const fallbackTextEl = document.getElementById("mail-fallback-text");
const copyBtnEl = document.getElementById("copy-mail");
const copyStatusEl = document.getElementById("copy-status");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function scrollToEl(el) {
  el.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
}

function currentEvent() {
  return EVENTS.find((e) => e.id === state.eventId);
}

/* ---------- Karty wydarzeń ---------- */

function renderEventList() {
  eventListEl.innerHTML = EVENTS.map(
    (ev) => `
    <article class="card event-card reveal">
      <span class="event-card__date"><time datetime="${ev.iso}">${ev.date}</time></span>
      <h3>${ev.title}</h3>
      <p>${ev.desc}</p>
      <div class="event-card__meta"><span>Cena: ${ev.price}</span><span>Wolnych miejsc: ${SEATS.length - ev.taken.length}</span></div>
      <button class="btn" type="button" data-event="${ev.id}">Wybierz miejsca</button>
    </article>`
  ).join("");

  eventListEl.querySelectorAll("button[data-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setEvent(btn.dataset.event);
      scrollToEl(document.getElementById("rezerwacja"));
    });
  });
}

/* ---------- Plan sali (renderowany raz; stan aktualizowany w miejscu) ---------- */

function renderSeatmap() {
  const seatGroups = SEATS.map((s) => `
      <g class="seat-group" data-seat-group="${s.id}">
        <circle class="seat" data-seat="${s.id}" cx="${s.x}" cy="${s.y}" r="17"
          role="button" tabindex="0" aria-pressed="false" aria-label="Miejsce ${s.id}, ${seatArea(s)}"></circle>
        <path class="seat-x" aria-hidden="true"
          d="M ${s.x - 10} ${s.y - 10} L ${s.x + 10} ${s.y + 10} M ${s.x + 10} ${s.y - 10} L ${s.x - 10} ${s.y + 10}"></path>
        <text class="seat-label" x="${s.x}" y="${s.y + 5}">${s.id}</text>
      </g>`
  ).join("");

  seatmapEl.innerHTML = `
    <svg viewBox="0 0 760 640">
      <!-- okno i bar -->
      <line x1="80" y1="22" x2="420" y2="22" stroke="#5b7b8c" stroke-width="5" stroke-dasharray="14 8"/>
      <text class="room-label" x="250" y="14">okno</text>
      <rect x="90" y="40" width="320" height="26" rx="10" fill="#5c4a3a"/>
      <text class="room-label" x="250" y="59" style="fill:#faf5ec">bar</text>

      <!-- stoliki kawiarniane -->
      <circle cx="600" cy="120" r="32" fill="#e7d9c2" stroke="#c9b894" stroke-width="2"/>
      <circle cx="160" cy="290" r="36" fill="#e7d9c2" stroke="#c9b894" stroke-width="2"/>
      <circle cx="400" cy="290" r="36" fill="#e7d9c2" stroke="#c9b894" stroke-width="2"/>
      <circle cx="640" cy="345" r="30" fill="#e7d9c2" stroke="#c9b894" stroke-width="2"/>

      <!-- stół warsztatowy -->
      <rect x="120" y="448" width="360" height="70" rx="16" fill="#e7d9c2" stroke="#c9b894" stroke-width="2"/>
      <text class="room-label" x="300" y="488">stół warsztatowy</text>

      <!-- półki z ceramiką i piec -->
      <rect x="560" y="430" width="120" height="26" rx="8" fill="#cdbfa6"/>
      <text class="room-label" x="620" y="448">półki</text>
      <rect x="560" y="490" width="120" height="60" rx="10" fill="#cdbfa6"/>
      <text class="room-label" x="620" y="525">piec</text>

      <!-- wejście -->
      <line x1="80" y1="615" x2="170" y2="615" stroke="#c0653f" stroke-width="6" stroke-linecap="round"/>
      <text class="room-label" x="125" y="600">wejście</text>

      ${seatGroups}
    </svg>`;

  seatmapEl.querySelectorAll(".seat").forEach((el) => {
    el.addEventListener("click", () => toggleSeat(el.dataset.seat));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleSeat(el.dataset.seat);
      }
    });
  });
}

/* ---------- Lista miejsc (alternatywa dla mapy, zsynchronizowana) ---------- */

function renderSeatList() {
  /* Zwinięta na szerokich ekranach, rozwinięta na wąskich (wygodniejsza niż mapa). */
  seatListEl.open = window.matchMedia("(max-width: 719.98px)").matches;

  seatListGridEl.innerHTML = SEAT_GROUPS.map((group) => {
    const pills = SEATS.filter((s) => s.group === group.id).map((s) => `
      <label class="seat-pill" for="seat-cb-${s.id}" data-seat-pill="${s.id}">
        <input type="checkbox" id="seat-cb-${s.id}" value="${s.id}"
          aria-label="Miejsce ${s.id}, ${group.label.toLowerCase()}">
        <span class="seat-pill__text">${s.id}</span>
        <span class="seat-pill__taken-note">zajęte</span>
      </label>`
    ).join("");

    return `
    <fieldset class="seat-list__group">
      <legend>${group.label}</legend>
      <div class="seat-list__pills">${pills}</div>
    </fieldset>`;
  }).join("");

  seatListGridEl.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", () => toggleSeat(cb.value));
  });
}

/* ---------- Aktualizacja stanu (bez przebudowy DOM - fokus zostaje) ---------- */

function updateUI() {
  const taken = new Set(currentEvent().taken);

  SEATS.forEach((s) => {
    const isTaken = taken.has(s.id);
    const isSelected = state.selected.has(s.id);

    const group = seatmapEl.querySelector(`[data-seat-group="${s.id}"]`);
    const seat = group.querySelector(".seat");
    group.classList.toggle("seat-group--taken", isTaken);
    group.classList.toggle("seat-group--selected", isSelected);
    seat.classList.toggle("seat--taken", isTaken);
    seat.classList.toggle("seat--selected", isSelected);
    seat.setAttribute("aria-pressed", String(isSelected));
    if (isTaken) {
      seat.setAttribute("aria-disabled", "true");
      seat.setAttribute("aria-label", `Miejsce ${s.id}, ${seatArea(s)} - zajęte`);
    } else {
      seat.removeAttribute("aria-disabled");
      seat.setAttribute("aria-label", `Miejsce ${s.id}, ${seatArea(s)}`);
    }

    const cb = document.getElementById(`seat-cb-${s.id}`);
    cb.checked = isSelected;
    cb.disabled = isTaken;

    const pill = seatListGridEl.querySelector(`[data-seat-pill="${s.id}"]`);
    pill.classList.toggle("seat-pill--selected", isSelected);
    pill.classList.toggle("seat-pill--taken", isTaken);
  });
}

/* ---------- Wybór miejsc i podsumowanie ---------- */

function toggleSeat(id) {
  if (currentEvent().taken.includes(id)) return;
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
  updateUI();
  renderSummary();
}

function renderSummary(extraMessage) {
  const ev = currentEvent();
  const seats = [...state.selected].sort();
  const prefix = extraMessage ? `${extraMessage}<br>` : "";
  summaryEl.innerHTML = seats.length
    ? `${prefix}<strong>${ev.title}</strong> · ${ev.date}<br>Wybrane miejsca: <strong>${seats.join(", ")}</strong> (${seats.length} os. × ${ev.price})`
    : `${prefix}Nie wybrano jeszcze żadnego miejsca.`;
}

function setEvent(id) {
  if (id === state.eventId) return;
  const hadSelection = state.selected.size > 0;
  state.eventId = id;
  state.selected.clear();
  selectEl.value = id;
  updateUI();
  renderSummary(hadSelection ? "Zmieniono wydarzenie - poprzedni wybór miejsc został wyczyszczony." : undefined);
}

function renderEventSelect() {
  selectEl.innerHTML = EVENTS.map(
    (ev) => `<option value="${ev.id}">${ev.title} - ${ev.date}</option>`
  ).join("");
  selectEl.addEventListener("change", () => setEvent(selectEl.value));
}

/* ---------- Wysyłka (mailto + fallback do skopiowania) ---------- */

function buildMessage() {
  const ev = currentEvent();
  const seats = [...state.selected].sort();
  const name = document.getElementById("booking-name").value.trim();
  const contact = document.getElementById("booking-phone").value.trim();

  const subject = `Rezerwacja: ${ev.title} (${seats.join(", ")})`;
  const body = [
    "Dzień dobry,",
    "",
    `chcę zarezerwować miejsca na wydarzenie „${ev.title}” (${ev.date}).`,
    `Miejsca: ${seats.join(", ")} (liczba osób: ${seats.length})`,
    `Imię i nazwisko: ${name}`,
    `Kontakt: ${contact}`,
    "",
    "Proszę o potwierdzenie rezerwacji.",
  ].join("\n");

  return { subject, body };
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.selected.size) {
    renderSummary("Najpierw zaznacz przynajmniej jedno miejsce na planie sali lub liście.");
    return;
  }

  const { subject, body } = buildMessage();

  fallbackTextEl.textContent = `Do: ${BOOKING_EMAIL}\nTemat: ${subject}\n\n${body}`;
  copyStatusEl.textContent = "";
  fallbackEl.hidden = false;

  window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

copyBtnEl.addEventListener("click", () => {
  const text = fallbackTextEl.textContent;
  const done = () => { copyStatusEl.textContent = "Skopiowano do schowka."; };
  const fail = () => { copyStatusEl.textContent = "Nie udało się skopiować - zaznacz tekst ręcznie."; };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fail);
  } else {
    const range = document.createRange();
    range.selectNodeContents(fallbackTextEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    try {
      document.execCommand("copy") ? done() : fail();
    } catch (err) {
      fail();
    }
    sel.removeAllRanges();
  }
});

renderEventList();
renderEventSelect();
renderSeatmap();
renderSeatList();
updateUI();
renderSummary();
