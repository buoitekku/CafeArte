# Art Café „Wypij wymaluj” — strona kawiarni

Statyczna, minimalistyczna strona kawiarni połączonej z pracownią malowania
ceramiki (inspiracja: Create Café). Bez backendu i bez procesu budowania —
czysty HTML, CSS i odrobina JavaScriptu.

## Podgląd lokalny

Wystarczy otworzyć `index.html` w przeglądarce albo uruchomić prosty serwer:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Struktura

| Plik | Zakładka |
|---|---|
| `index.html` | Główna — duże hero z przedstawieniem konceptu |
| `menu.html` | Menu z obrazkami (kawy, napoje, słodkości) |
| `ceramika.html` | Opis konceptu i zasady działania krok po kroku |
| `wydarzenia.html` | Wydarzenia + wizualna rezerwacja konkretnych miejsc na planie sali |
| `faq.html` | Najczęstsze pytania |
| `kontakt.html` | Dane teleadresowe, sociale, godziny otwarcia, mapa (OpenStreetMap) |

Wspólne zasoby: `css/styles.css`, `js/main.js` (nawigacja mobilna, animacje),
`js/rezerwacje.js` (wydarzenia i mapa miejsc), `assets/favicon.svg`.

## Edycja treści

- **Wydarzenia i zajętość miejsc** — tablica `EVENTS` na górze
  `js/rezerwacje.js`. Pole `taken` zawiera identyfikatory zajętych miejsc
  (np. `"T2-1"`, `"W3"`). Układ sali definiuje tablica `SEATS` tamże.
- **Adres e-mail rezerwacji** — stała `BOOKING_EMAIL` w `js/rezerwacje.js`.
  Formularz nie ma backendu: otwiera klienta poczty gościa z gotową
  wiadomością (`mailto:`).
- **Dane kontaktowe, telefony, sociale** — `kontakt.html` oraz stopki na
  wszystkich podstronach (adres `ul. Ceramiczna 7, Kraków` jest przykładowy —
  podmień na prawdziwy, w tym współrzędne mapy w `kontakt.html`).
- **Zdjęcie hero** — na stronie głównej jest ilustracja SVG; można ją
  podmienić na prawdziwe zdjęcie, wstawiając `<img>` w sekcji
  `.hero__art` w `index.html`.
- **Kolory i typografia** — zmienne CSS na górze `css/styles.css`.

## Wdrożenie

Dowolny hosting plików statycznych: GitHub Pages, Netlify, Cloudflare Pages.
Repo jest gotowe do publikacji bez kroku build.
