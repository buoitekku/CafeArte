/* Wydarzenia + wizualna rezerwacja miejsc (strona statyczna — bez backendu).
   Zajętość miejsc dla każdego wydarzenia aktualizuje się ręcznie w polu `taken`.
   Wysłanie formularza otwiera klienta poczty z gotową wiadomością (mailto:). */

const BOOKING_EMAIL = "rezerwacje@wypijwymaluj.pl";

const EVENTS = [
  {
    id: "kubki",
    title: "Wieczór malowania kubków",
    date: "pt 26.06.2026, 18:00–20:30",
    price: "95 zł / os.",
    desc: "Klasyk na początek: kubek, ciepłe kolory i prowadząca, która pokaże trzy proste techniki zdobienia.",
    taken: ["T2-1", "T2-2", "W3", "B2"],
  },
  {
    id: "talerze",
    title: "Talerze w stylu botanicznym",
    date: "sob 04.07.2026, 11:00–13:30",
    price: "120 zł / os.",
    desc: "Liście, zioła i kwiaty na dużych talerzach. Pracujemy z szablonami i farbami podszkliwnymi.",
    taken: ["W1", "W2", "W4", "T3-2"],
  },
  {
    id: "rodzinna",
    title: "Rodzinna sobota z ceramiką",
    date: "sob 11.07.2026, 10:00–12:00",
    price: "70 zł / os. (dziecko 50 zł)",
    desc: "Malujemy figurki zwierząt całą rodziną. Fartuszki, zmywalne farby i kakao dla młodszych artystów.",
    taken: ["T1-1", "T1-2", "T4-1"],
  },
  {
    id: "panienski",
    title: "Wieczór panieński: wazon i prosecco bezalkoholowe",
    date: "pt 17.07.2026, 19:00–22:00",
    price: "150 zł / os.",
    desc: "Sala tylko dla Was po 19:00, duże wazony, złote akcenty i playlist do wyboru przez Pannę Młodą.",
    taken: ["B1", "B2", "B3", "B4"],
  },
];

/* Plan sali: bar przy oknie, trzy stoliki kawiarniane i duży stół warsztatowy. */
const SEATS = [
  { id: "B1", x: 130, y: 105 }, { id: "B2", x: 210, y: 105 },
  { id: "B3", x: 290, y: 105 }, { id: "B4", x: 370, y: 105 },

  { id: "T1-1", x: 600, y: 70 },  { id: "T1-2", x: 600, y: 170 },

  { id: "T2-1", x: 110, y: 250 }, { id: "T2-2", x: 210, y: 250 },
  { id: "T2-3", x: 110, y: 330 }, { id: "T2-4", x: 210, y: 330 },

  { id: "T3-1", x: 350, y: 250 }, { id: "T3-2", x: 450, y: 250 },
  { id: "T3-3", x: 350, y: 330 }, { id: "T3-4", x: 450, y: 330 },

  { id: "T4-1", x: 588, y: 345 }, { id: "T4-2", x: 692, y: 345 },

  { id: "W1", x: 180, y: 420 }, { id: "W2", x: 300, y: 420 }, { id: "W3", x: 420, y: 420 },
  { id: "W4", x: 180, y: 545 }, { id: "W5", x: 300, y: 545 }, { id: "W6", x: 420, y: 545 },
];

const state = { eventId: EVENTS[0].id, selected: new Set() };

const seatmapEl = document.getElementById("seatmap");
const selectEl = document.getElementById("event-select");
const summaryEl = document.getElementById("booking-summary");
const formEl = document.getElementById("booking-form");
const eventListEl = document.getElementById("event-list");

function currentEvent() {
  return EVENTS.find((e) => e.id === state.eventId);
}

/* ---------- Karty wydarzeń ---------- */

function renderEventList() {
  eventListEl.innerHTML = EVENTS.map(
    (ev) => `
    <article class="card event-card reveal">
      <span class="event-card__date">${ev.date}</span>
      <h3>${ev.title}</h3>
      <p>${ev.desc}</p>
      <div class="event-card__meta"><span>💰 ${ev.price}</span><span>🪑 wolnych miejsc: ${SEATS.length - ev.taken.length}</span></div>
      <button class="btn" type="button" data-event="${ev.id}">Wybierz miejsca</button>
    </article>`
  ).join("");

  eventListEl.querySelectorAll("button[data-event]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setEvent(btn.dataset.event);
      document.getElementById("rezerwacja").scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ---------- Plan sali ---------- */

function renderSeatmap() {
  const taken = new Set(currentEvent().taken);

  const seatCircles = SEATS.map((s) => {
    const isTaken = taken.has(s.id);
    const isSelected = state.selected.has(s.id);
    const cls = ["seat", isTaken && "seat--taken", isSelected && "seat--selected"].filter(Boolean).join(" ");
    return `
      <circle class="${cls}" data-seat="${s.id}" cx="${s.x}" cy="${s.y}" r="17"
        role="button" tabindex="${isTaken ? -1 : 0}"
        aria-label="Miejsce ${s.id}${isTaken ? " — zajęte" : ""}"></circle>
      <text class="seat-label" x="${s.x}" y="${s.y + 4}">${s.id}</text>`;
  }).join("");

  seatmapEl.innerHTML = `
    <svg viewBox="0 0 760 640">
      <!-- okno i bar -->
      <line x1="80" y1="22" x2="420" y2="22" stroke="#5b7b8c" stroke-width="5" stroke-dasharray="14 8"/>
      <text class="room-label" x="250" y="14">okno</text>
      <rect x="90" y="40" width="320" height="26" rx="10" fill="#5c4a3a"/>
      <text class="room-label" x="250" y="59" fill="#faf5ec" style="fill:#faf5ec">bar</text>

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

      ${seatCircles}
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

function toggleSeat(id) {
  if (currentEvent().taken.includes(id)) return;
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
  renderSeatmap();
  renderSummary();
}

/* ---------- Podsumowanie i formularz ---------- */

function renderSummary() {
  const ev = currentEvent();
  const seats = [...state.selected].sort();
  summaryEl.innerHTML = seats.length
    ? `<strong>${ev.title}</strong> · ${ev.date}<br>Wybrane miejsca: <strong>${seats.join(", ")}</strong> (${seats.length} os. × ${ev.price})`
    : "Nie wybrano jeszcze żadnego miejsca.";
}

function setEvent(id) {
  state.eventId = id;
  state.selected.clear();
  selectEl.value = id;
  renderSeatmap();
  renderSummary();
}

function renderEventSelect() {
  selectEl.innerHTML = EVENTS.map(
    (ev) => `<option value="${ev.id}">${ev.title} — ${ev.date}</option>`
  ).join("");
  selectEl.addEventListener("change", () => setEvent(selectEl.value));
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const seats = [...state.selected].sort();
  if (!seats.length) {
    summaryEl.innerHTML = "⚠️ Najpierw zaznacz przynajmniej jedno miejsce na planie sali.";
    return;
  }
  const ev = currentEvent();
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

  window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

renderEventList();
renderEventSelect();
renderSeatmap();
renderSummary();
