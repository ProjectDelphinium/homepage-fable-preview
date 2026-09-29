# Bookings modal

Schedule opens `https://jared-delphi-me.zohobookings.com/portal-embed#/4937208000000036014` in `#dl-book-modal`. The iframe is cross-origin. This pack cannot restyle the steps inside it.

## SC tile is a Bookings setting

The SC tile, the `jared_delphi-me` username, and the "1 hr" line are Zoho Bookings chrome. They come from the booking page in Zoho Bookings settings (CRM Migration), not from homepage CSS.

There is no portal-embed URL parameter that removes that card. Do not hide it with a negative `top` or `left`, a scale, or `overflow: hidden` / `clip` on `#dl-book-frame`. That crop cut off the details-step header (calendar icon and selected time) after "Book another appointment", and it left a tall empty region under the short confirmation page.

## Height

Zoho Bookings V9 (`static.zohocdn.com` web-app, the bundle portal-embed loads) does not post a content-height message. The only `postMessage` in that bundle is `zb_payment_result`. `zb-chatbot-resize` belongs to the `isAiBot` embed, not this URL. The pack does not invent a resize listener.

The modal box is a flex column capped at `calc(100dvh - 2rem)`. The frame scrolls (`overflow: auto`) and does not clip Zoho's top edge. The iframe is 820px tall, which is what the calendar step needs, instead of a fixed `min(1020px, 100vh - 6rem)`. Shorter viewports scroll the frame. Closing the modal reloads the iframe back to the portal-embed URL so the next visit starts on the calendar. The idle preload still runs, and the reload happens on close, not on every open. Links still point at the plain Bookings URL when JavaScript is off. The unused `window.dlBookingsFallback` assignment was removed so Footer Code stays under the 44,900 character cap.
