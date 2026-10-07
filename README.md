# BarYam website

The website for BarYam: beer on tap, cocktails and a chef's kitchen. Guests can browse the menu, book a table and request a private event. Bookings are sent to the bar's WhatsApp, so the site needs no server or database.

Hebrew by default, with an English switch (`?lang=en` also works).

## Editing the content

Everything you'd normally change is in **`content.js`**:

- `contact.whatsapp` is the number that receives bookings, digits only in international format (`9725XXXXXXXX`)
- phone, address, Instagram link and the Google Maps search
- opening hours, booking times and the largest table size
- menu sections, dishes and prices
- private event options
- every piece of text, in Hebrew (`he`) and English (`en`)

Commit the change to `main` and GitHub Pages republishes the site in about a minute.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page structure |
| `styles.css` | Look and layout |
| `content.js` | All editable content |
| `app.js` | Language switch, rendering, booking forms |

## Deploying

The site is plain HTML, CSS and JavaScript served by GitHub Pages from the `main` branch. No build step.

To preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
