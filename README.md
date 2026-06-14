# Art Café „Wypij wymaluj” - strona kawiarni

Statyczna, minimalistyczna strona kawiarni połączonej z pracownią malowania
ceramiki. Bez backendu i bez procesu budowania - czysty HTML, CSS i odrobina
JavaScriptu.

## Podgląd lokalny

Wystarczy otworzyć `index.html` w przeglądarce albo uruchomić prosty serwer:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Struktura

| Plik | Zakładka |
|---|---|
| `index.html` | Strona główna - hero z konceptem i hasłem Wypij/Wymaluj/Odetchnij |
| `jak-to-dziala.html` | Jak to działa - zasady krok po kroku |
| `rezerwacja.html` | Rezerwacja stolika - plan sali + termin (data, godzina) |
| `menu.html` | Menu (bez cen) w 3 sekcjach sezonowych, z ikonami line-art |
| `oferta.html` | Wydarzenia grupowe (urodziny, wieczory panieńskie, firmowe, baby shower, rodzinne) |
| `faq.html` | Najczęstsze pytania |
| `kontakt.html` | Dane teleadresowe, sociale, godziny otwarcia, mapa (OpenStreetMap) |

Wspólne zasoby: `css/styles.css`, `js/main.js` (nawigacja mobilna, animacje),
`js/rezerwacje.js` (plan sali i rezerwacja stolika), `assets/logo.png`,
`assets/favicon.png`.

## Edycja treści

- **Stoliki na planie sali** - tablica `TABLES` na górze `js/rezerwacje.js`
  (id, nazwa, opis, pozycja x/y). Mapa nie oznacza zajętości - dostępność
  w danym terminie potwierdza obsługa.
- **Adres e-mail rezerwacji** - stała `BOOKING_EMAIL` w `js/rezerwacje.js`.
  Formularz nie ma backendu: otwiera klienta poczty gościa z gotową
  wiadomością (`mailto:`) i pokazuje ją też na stronie do skopiowania.
- **Menu** - pozycje i sekcje sezonowe edytuje się bezpośrednio w `menu.html`.
  Ikony to grafiki SVG w stylu logo; w miejsce `.menu-card__img` można wstawić
  prawdziwe zdjęcia.
- **Dane kontaktowe, telefony, sociale, godziny** - `kontakt.html` oraz stopki
  na wszystkich podstronach (adres `ul. Ceramiczna 7, Kraków` jest przykładowy -
  podmień na prawdziwy, w tym współrzędne mapy w `kontakt.html`).
- **Logo** - `assets/logo.png` (nagłówek) i `assets/favicon.png`.
- **Kolory i typografia** - zmienne CSS na górze `css/styles.css`
  (paleta: krem #FDF6EC, beż #F3E9DD, błękit #B7CADB, piaskowy #DAB88B).

## Wdrożenie

Dowolny hosting plików statycznych: GitHub Pages, Netlify, Cloudflare Pages.
Repo jest gotowe do publikacji bez kroku build.
