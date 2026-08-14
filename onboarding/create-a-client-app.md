---
sidebarTitle: "7. Create a Client App"
title: "Create a Client App"
description: "Put your agent on any website with one script tag"
---

Your universe serves an embeddable client at `/embed.js`. Any website can load it with one
script tag. The tag draws a launcher button. Clicking it opens a drawer, and your agent
streams in.

```html
<script async src="https://api.your-domain.com/embed.js"
        data-app="your-org/your-app"></script>
```

Nothing is configured on the page. The script works out where your universe is from its own
`src`. It takes the app from `data-app`. Everything else it asks your universe at runtime.

## Before you begin

The platform is running (`unoverse start`). You have an app: a template published from
**Studio**, bound to a workflow, as built in
[Components and Templates](/onboarding/components-and-templates). Its id is `org/name`.

## Start from the client starter

The starter is a small fake website with the tag already in place.

```bash
npm create unoverse@latest      # choose Client
cd your-folder
npm install
cp .env.example .env            # your universe URL, and which app to load
npm run dev
```

The page it serves is a placeholder for the website you already have. Delete it and keep
the two script tags at the bottom.

## What happens, and when

On page load the script draws a button and stops. No request reaches your universe. A
visitor who never clicks costs you nothing.

On the first click the script asks your universe whether the app needs a login. It then
reads the app over MCP and renders it in the drawer. The app decides its own width, and
the drawer follows.

## Public or signed-in

You choose the audience on the **Canvas**, not on the page. Open your workflow's
<span className="node-chip">Input Trigger</span> and set the Public Entry toggle.

| Public Entry | What a visitor gets |
|---|---|
| On | A guest identity, minted once and kept in their browser. No login. |
| Off | A sign-in requirement. The page supplies the token. |

Each trigger decides its own audience. A public trigger on the same workflow opens nothing
for a signed-in one.

## Signed-in sites

The embed never signs anyone in. Your website already has a login, and the embed forwards
its token. Declare a getter before the tag:

```html
<script>
  window.unoverseConfig = { token: () => myApp.getAccessToken() }
</script>
<script async src="https://api.your-domain.com/embed.js"
        data-app="your-org/your-app"
        data-login-url="/login?return={url}"></script>
```

The getter is called before every request, so a refreshed token is picked up on its own.
It may return a promise. Null means anonymous.

`data-login-url` names your sign-in page. When the app needs a login and the visitor has
no session, the drawer shows a sign-in button pointing there. `{url}` becomes the page the
visitor was on, encoded, so your login can return them to it.

Your universe verifies tokens against the issuer and audience it was deployed with, so
they must match the ones your site signs in with.

## Script tag attributes

Only `data-app` is required.

| Attribute | Default | What it does |
|---|---|---|
| `data-app` | required | Which app to load, always `org/app` |
| `data-icon` | a neutral chat glyph | A URL for the launcher icon, served from your own domain |
| `data-label` | "Open the assistant" | The launcher's accessible name and tooltip |
| `data-color` | `#111827` | The launcher's background, any CSS colour |
| `data-panel` | `#fff` | The drawer's background while the app loads. Match your app's theme. |
| `data-side` | `right` | Which edge the drawer opens from: `left` or `right` |
| `data-chrome` | drawn | `none` draws no launcher, and your page calls `unoverse.open()` |
| `data-login-url` | none | Your sign-in page, offered when the app needs a login |

The drawer's width is not an attribute. The app decides how wide it is, so the same app is
the right size on every site that embeds it.

## Use your own buttons

`window.unoverse` exists once the script has run.

| Call | What it does |
|---|---|
| `unoverse.open()` | Opens the drawer, and mounts the app on the first call |
| `unoverse.close()` | Closes the drawer and ends the stream |
| `unoverse.newConversation()` | Closes the drawer and starts a fresh thread next time |

With `data-chrome="none"` these are the only way in. Your site keeps its own buttons, and
the assistant opens from any of them.

## Identity in the browser

The embed keeps two values in `localStorage`, and neither is a cookie.

| Key | Lifetime | Purpose |
|---|---|---|
| `unoverse:guestId` | indefinite | A returning anonymous visitor is recognised |

The conversation itself is never stored: it lives exactly as long as the page that opened
it. A reload starts a fresh conversation; the agent still recognises the visitor through
the guest id and user memory. `window.unoverse.newConversation()` starts one deliberately
mid-page.

---

Next: [Challenge 8: Deployment](/onboarding/deployment)
