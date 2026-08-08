# Access & Workflow Reference — ಶ್ರೀ ಬಸವ ವಿದ್ಯಾಭಿವೃದ್ಧಿ ಸಂಘ

Who sees what on **sribvs.org**, and how they get there. Covers the five access levels —
Non-member, Member, Finance, Scholarship, Admin — plus the two places where the app checks
identity server-side instead of trusting the browser.

Source of truth: `src/app/app.routes.ts`, `src/app/core/auth.guard.ts`, `src/app/core/auth.service.ts`,
`src/app/shell/shell.component.html`.

## Screenshots

Not included yet. Each role section below has a `Screenshots to add` list naming the exact file
it expects, e.g. `screenshots/admin-updates-menu.png`. Capture each, save it under
`docs/screenshots/` with that name, and it'll match up with this doc.

---

## How a Google sign-in becomes a role

The browser never holds the member list. Signing in only proves who you are — a server-side
lookup decides what you get.

```
Browser                AuthService                member-verify-api         S3 (private)
Google Sign-In   --->   verifyMembership()  --->   Lambda              --->  private/userInfo.json
  (ID token)             GET /auth/verify?email=…                            (never sent to browser)

Lambda reads one matching record and responds:
  match found  ---> { member: true, role }  ---> role set client-side, menu renders
  no match     ---> 404                     ---> Google session revoked, "not a Member" toast
```

The whitelist (name, email, role) lives only in a private S3 key. The Lambda reads it
server-side and hands back a single match — the browser's Network tab never sees anyone else's
record, including on a failed login.

---

## Quick reference: page access by role

Every row is a page; every guard is enforced twice — the menu hides what a role can't use, and
the route itself refuses to load it even by direct link.

| Page | Route | Guard | Non-member | Member | Finance | Scholarship | Admin |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | `/dashboard` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Member List | `/community/member-list` | — | ✓ † | ✓ | ✓ | ✓ | ✓ |
| Donor List | `/community/donor-list` | — | ✓ † | ✓ | ✓ | ✓ | ✓ |
| Scholarship List | `/community/scholarship-list` | — | ✓ † | ✓ | ✓ | ✓ | ✓ |
| Donate | `/community/donate` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scholarship Apply | `/community/scholarship-apply` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gallery | `/gallery` | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scholarship Applied | `/updates/scholarship-applied` | `scholarshipGuard` | – | – | – | ✓ | ✓ |
| Donation List | `/updates/donation-list` | `financeGuard` | – | – | ✓ | – | ✓ |
| Upcoming Events | `/updates/upcoming-events` | `upcomingEventsGuard` | – | – | ✓ | ✓ | ✓ |
| Members Registered (+ Add) | `/updates/members-registered` | `financeGuard` | – | – | ✓ | – | ✓ |
| Manage Gallery | `/updates/gallery-manage` | `adminGuard` | – | – | – | – | ✓ |
| Add/Remove User | `/updates/manage-users` | `adminGuard` + Google re-verify | – | – | – | – | ✓ |

† Address and Phone columns are withheld until signed in — any of the four signed-in roles
unlocks them, not just Admin. **Download PDF** (on Member List, Donor List, Scholarship List) is
Admin-only and isn't shown as a separate row above.

---

## The five access levels

Each tier is additive — Finance and Scholarship both start from what a Member sees, then add
their own corner of the Updates menu. Admin removes every ceiling.

### Non-member — anyone with the link

Starting tier — not signed in. The public face of the site.

- Dashboard
- Our Community — Member List, Donor List, Scholarship List (Address & Phone withheld)
- Donate, Scholarship Apply
- Gallery
- No Updates menu at all

**Menu:** `Dashboard · Our Community ▾ · Gallery`
**Sign-in attempt:** Members Login → Google → not on the whitelist → session revoked, stays logged out

**Screenshots to add**
- `screenshots/nonmember-dashboard.png` — top nav, "Members Login" visible, no Updates menu
- `screenshots/nonmember-community-list.png` — a Community list with Address/Phone columns absent

### Member — signed in, role "Member"

Everything **Non-member** sees, plus:

- Address & Phone columns unlocked on Member/Donor/Scholarship lists
- User menu — name, email, "MEMBER" badge, Logout
- Still no Updates menu — Member alone doesn't grant a staff view

**Menu:** `Dashboard · Our Community ▾ · Gallery` — same as Non-member, columns unlocked

**Screenshots to add**
- `screenshots/member-topnav.png` — signed-in top nav with the MEMBER badge
- `screenshots/member-community-list.png` — same list, now with Address/Phone visible

### Finance — signed in, role "Finance"

Everything **Member** sees, plus:

- Updates ▾ menu appears
- Donation List
- Members Registered (+ Add)
- Upcoming Events

**Menu:** `Dashboard · Our Community ▾ · Updates ▾ (Donation List, Members Registered, Upcoming Events) · Gallery`

**Screenshots to add**
- `screenshots/finance-updates-menu.png` — Updates ▾ open, only the Finance items
- `screenshots/finance-donation-list.png` — Donation List page

### Scholarship — signed in, role "Scholarship"

Everything **Member** sees, plus:

- Updates ▾ menu appears
- Scholarship Applied
- Upcoming Events
- No Donation List, Members Registered, Manage Gallery, or Add/Remove User

**Menu:** `Dashboard · Our Community ▾ · Updates ▾ (Scholarship Applied, Upcoming Events) · Gallery`

**Screenshots to add**
- `screenshots/scholarship-updates-menu.png` — Updates ▾ open, only the Scholarship items
- `screenshots/scholarship-applied-list.png` — Scholarship Applied page

### Admin — signed in, role "Admin"

Everything above, unrestricted, plus:

- Full Updates ▾ menu — all six items
- Download PDF on Member/Donor/Scholarship lists
- Manage Gallery
- Add/Remove User — with its own re-verification, see below

**Menu:** `Dashboard · Our Community ▾ · Updates ▾ (all six) · Gallery`

**Screenshots to add**
- `screenshots/admin-updates-menu.png` — Updates ▾ open, all six items
- `screenshots/admin-manage-users.png` — Add/Remove User, after confirming identity

---

## Why Add/Remove User asks you to sign in twice

Every other Admin page trusts the role stored client-side after login. This one page can't —
it's the page that decides who gets to be Admin — so it re-checks independently on every call.

```
Admin's browser (already signed into the app, role = Admin, client-side)
   |  opens Add/Remove User
   v
Manage Users page — shows a second "Confirm identity" Google button
   |  fresh Google sign-in
   v
Fresh ID token — attached to every list / add / remove call
   v
user-manage-api (Lambda)
   |  1. verify token with Google
   v
oauth2.googleapis.com/tokeninfo — valid & not expired?
   |  invalid/expired -----------------------------> 401 Rejected
   |  valid
   v
Is this email an Admin? — looked up in the live whitelist, not the client's copy
   |  not Admin ------------------------------------> 403 Rejected
   |  role = Admin
   v
Allowed — read / write private/userInfo.json
```

Two independent gates, both re-checked on every single request — not just at page load. The
Lambda also blocks removing your own account or the last remaining Admin, so this page can't be
used to accidentally lock everyone out.

---

*Internal reference, not for public distribution. Screenshot convention: `screenshots/<role>-<view>.png`, saved under `docs/screenshots/`.*
