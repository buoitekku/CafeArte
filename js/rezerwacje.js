/* Rezerwacja stolika (strona statyczna - bez backendu).
   Gość wybiera stolik na planie sali (lub z listy) oraz termin (data, godzina).
   Wysłanie formularza otwiera klienta poczty z gotową wiadomością (mailto:),
   a treść wiadomości pokazuje się też na stronie jako fallback do skopiowania.
   Dostępność stolików w danym terminie potwierdza obsługa - tu nic nie jest
   oznaczane jako zajęte. */

const BOOKING_EMAIL = "rezerwacje@wypijwymaluj.pl";

/* Plan sali: cztery stoliki kawiarniane, stół warsztatowy i miejsca przy barze.
   id - krótka etykieta na planie; name/desc - pełny opis (lista, aria, wiadomość). */
const TABLES = [
  { id: "1", name: "Stolik 1", desc: "przy oknie, do 2 osób", x: 250, y: 150 },
  { id: "2", name: "Stolik 2", desc: "przy oknie, do 2 osób", x: 430, y: 150 },
  { id: "3", name: "Stolik 3", desc: "do 4 osób", x: 250, y: 300 },
  { id: "4", name: "Stolik 4", desc: "do 4 osób", x: 430, y: 300 },
  { id: "W", name: "Stół warsztatowy", desc: "do 8 osób", x: 350, y: 460 },
  { id: "B", name: "Bar", desc: "4 miejsca przy barze", x: 622, y: 235 },
];

function tableById(id) {
  return TABLES.find((t) => t.id === id);
}

const state = { selected: new Set() };

const seatmapEl = document.getElementById("seatmap");
const summaryEl = document.getElementById("booking-summary");
const formEl = document.getElementById("booking-form");
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

/* ---------- Plan sali (renderowany raz; stan aktualizowany w miejscu) ---------- */

function renderSeatmap() {
  const markers = TABLES.map((t) => `
      <g class="seat-group" data-seat-group="${t.id}">
        <circle class="seat" data-seat="${t.id}" cx="${t.x}" cy="${t.y}" r="24"
          role="button" tabindex="0" aria-pressed="false"
          aria-label="${t.name}, ${t.desc}"></circle>
        <text class="seat-label" x="${t.x}" y="${t.y + 5}">${t.id}</text>
      </g>`
  ).join("");

  seatmapEl.innerHTML = `
    <svg viewBox="0 0 700 560">
      <!-- okno -->
      <line x1="60" y1="24" x2="470" y2="24" stroke="#9fb6c6" stroke-width="5" stroke-dasharray="14 8"/>
      <text class="room-label" x="265" y="16">okno</text>

      <!-- bar przy prawej ścianie -->
      <rect x="592" y="110" width="56" height="300" rx="16" fill="#ece0cd" stroke="#ddcdb2" stroke-width="2"/>
      <text class="room-label" x="620" y="135">bar</text>

      <!-- stoliki kawiarniane -->
      <circle cx="250" cy="150" r="40" fill="#efe4d2" stroke="#ddcdb2" stroke-width="2"/>
      <circle cx="430" cy="150" r="40" fill="#efe4d2" stroke="#ddcdb2" stroke-width="2"/>
      <circle cx="250" cy="300" r="40" fill="#efe4d2" stroke="#ddcdb2" stroke-width="2"/>
      <circle cx="430" cy="300" r="40" fill="#efe4d2" stroke="#ddcdb2" stroke-width="2"/>

      <!-- stół warsztatowy -->
      <rect x="180" y="424" width="340" height="72" rx="16" fill="#efe4d2" stroke="#ddcdb2" stroke-width="2"/>
      <text class="room-label" x="350" y="412">stół warsztatowy</text>

      <!-- półki i piec -->
      <rect x="585" y="430" width="80" height="22" rx="8" fill="#e2d4bd"/>
      <text class="room-label" x="625" y="446">półki</text>
      <rect x="585" y="468" width="80" height="46" rx="10" fill="#e2d4bd"/>
      <text class="room-label" x="625" y="496">piec</text>

      <!-- wejście -->
      <line x1="60" y1="540" x2="150" y2="540" stroke="#c0894f" stroke-width="6" stroke-linecap="round"/>
      <text class="room-label" x="105" y="526">wejście</text>

      ${markers}
    </svg>`;

  seatmapEl.querySelectorAll(".seat").forEach((el) => {
    el.addEventListener("click", () => toggleTable(el.dataset.seat));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleTable(el.dataset.seat);
      }
    });
  });
}

/* ---------- Lista stolików (alternatywa dla mapy, zsynchronizowana) ---------- */

function renderSeatList() {
  /* Zwinięta na szerokich ekranach, rozwinięta na wąskich (wygodniejsza niż mapa). */
  seatListEl.open = window.matchMedia("(max-width: 719.98px)").matches;

  const pills = TABLES.map((t) => `
      <label class="seat-pill" for="seat-cb-${t.id}" data-seat-pill="${t.id}">
        <input type="checkbox" id="seat-cb-${t.id}" value="${t.id}"
          aria-label="${t.name}, ${t.desc}">
        <span class="seat-pill__text">${t.name}</span>
      </label>`
  ).join("");

  seatListGridEl.innerHTML = `
    <fieldset class="seat-list__group">
      <legend>Stoliki</legend>
      <div class="seat-list__pills">${pills}</div>
    </fieldset>`;

  seatListGridEl.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", () => toggleTable(cb.value));
  });
}

/* ---------- Aktualizacja stanu (bez przebudowy DOM - fokus zostaje) ---------- */

function updateUI() {
  TABLES.forEach((t) => {
    const isSelected = state.selected.has(t.id);

    const group = seatmapEl.querySelector(`[data-seat-group="${t.id}"]`);
    const seat = group.querySelector(".seat");
    group.classList.toggle("seat-group--selected", isSelected);
    seat.classList.toggle("seat--selected", isSelected);
    seat.setAttribute("aria-pressed", String(isSelected));

    const cb = document.getElementById(`seat-cb-${t.id}`);
    cb.checked = isSelected;

    const pill = seatListGridEl.querySelector(`[data-seat-pill="${t.id}"]`);
    pill.classList.toggle("seat-pill--selected", isSelected);
  });
}

/* ---------- Wybór stolików i podsumowanie ---------- */

function toggleTable(id) {
  state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
  updateUI();
  renderSummary();
}

function selectedNames() {
  return TABLES.filter((t) => state.selected.has(t.id)).map((t) => t.name);
}

function renderSummary(extraMessage) {
  const names = selectedNames();
  const prefix = extraMessage ? `${extraMessage}<br>` : "";
  summaryEl.innerHTML = names.length
    ? `${prefix}Wybrane stoliki: <strong>${names.join(", ")}</strong>`
    : `${prefix}Nie wybrano jeszcze żadnego stolika.`;
}

/* ---------- Wysyłka (mailto + fallback do skopiowania) ---------- */

function buildMessage() {
  const names = selectedNames();
  const date = document.getElementById("booking-date").value;
  const time = document.getElementById("booking-time").value;
  const people = document.getElementById("booking-people").value.trim();
  const name = document.getElementById("booking-name").value.trim();
  const contact = document.getElementById("booking-phone").value.trim();

  const subject = `Rezerwacja stolika: ${names.join(", ")} (${date} ${time})`;
  const body = [
    "Dzień dobry,",
    "",
    "chcę zarezerwować stolik w Art Café „Wypij wymaluj”.",
    `Stolik(i): ${names.join(", ")}`,
    `Data: ${date}`,
    `Godzina: ${time}`,
    `Liczba osób: ${people || "-"}`,
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
    renderSummary("Najpierw zaznacz przynajmniej jeden stolik na planie sali lub liście.");
    return;
  }

  const { subject, body } = buildMessage();

  fallbackTextEl.textContent = `Do: ${BOOKING_EMAIL}\nTemat: ${subject}\n\n${body}`;
  copyStatusEl.textContent = "";
  fallbackEl.hidden = false;
  fallbackEl.focus({ preventScroll: true });
  scrollToEl(fallbackEl);

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

renderSeatmap();
renderSeatList();
updateUI();
renderSummary();
