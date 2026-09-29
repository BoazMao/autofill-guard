# Autofill Guard

A small Chrome Manifest V3 extension that blocks autofill on websites you choose.

## Install it locally

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Choose this `autofill-guard` folder.
5. Visit a normal `http` or `https` webpage, click the extension, and enable **Block autofill**.
6. Reload the page.

## What it does

- Injects code only on exact hostnames you enable.
- Uses one persistent dynamic content-script registration for the enabled sites.
- Sets forms and fields to opt out of browser autocomplete.
- Clears values when Chrome applies its `:-webkit-autofill` state.
- Watches dynamic pages for forms added after initial load.

## Scope and limitations

The toggle applies to the exact hostname shown in the popup. For example, blocking `accounts.example.com` does not automatically block `www.example.com`.

Browsers and password managers may ignore autocomplete hints, which is why the extension also detects and clears Chromium autofill. Chrome-owned pages such as `chrome://settings` do not allow extensions to run. A website that implements its own saved-value behavior in JavaScript is outside the browser autofill mechanism and may need site-specific handling.

Because this is intended as a private unpacked extension, Chrome grants it HTTP/HTTPS site access at installation. That permission is used only to support dynamic registration: the extension does not inject or run code on unselected sites. It also does not use a background worker, transmit data, log form values, or retain references to removed form fields. Its dynamic registration is the block list, so it needs no storage database.

