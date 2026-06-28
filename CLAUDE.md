# Project Overview

I want to create a rent-a-car application - a multi-tenant marketplace similar to Uber, Grab, or Amazon, but specifically for car rentals. The platform consolidates multiple car rental companies into a single application. 

Rental companies can post their available fleets, and the system tracks each vehicle's schedule to prevent double-booking or conflicts. The platform provides comprehensive dashboards so rental companies can track their fleets individually or grouped, offering Business Intelligence (BI) insights on utilization rates, revenue, and renter demographics. 

**Business Model:** The application deducts a default 5% commission fee from all transactions. This commission rate is configurable at the global or tenant (renter) level.

---

# Tech Stack

**Web**
* **Frontend:** NextJS (ReactJS) - Latest version (App Router)
* **Styling:** Tailwind CSS - Latest version
* **State Management:** Zustand or Redux Toolkit

**Mobile (iOS and Android)**
* **Frontend:** React Native (with Expo) using Tailwind CSS for styling consistency with web. *(Note: NextJS is for web; React Native is the standard React equivalent for mobile).*
* **Backend:** Shared with the Web application.

**Backend & API**
* **Runtime/Framework:** NodeJS - Latest version (Express or NestJS)
* **Architecture:** RESTful APIs or GraphQL

**Database**
* **Development:** SQLite
* **Production:** PostgreSQL

**Infrastructure & Deployment**
* **Cloud Provider:** Azure App Service 
* **Web Server:** Nginx (configured as a reverse proxy)
* **Version Control & CI/CD:** GitHub repositories with GitHub Actions for automated testing and deployment pipelines.

---

# Project Structure

## 1. Home Page
* **Hero Section:** Dynamic search widget (Location, Pick-up Date/Time, Drop-off Date/Time).
* **Featured Vehicles:** Highlighted cars based on algorithms (e.g., highest rated, promotional).
* **Top Partners:** Carousel of verified rental companies with their trust badges.
* **How It Works:** Simple 3-step guide for users.

## 2. Registration & Authentication
* **SSO Integration:** Quick login/signup using Google, Microsoft, Apple, and Meta via NextAuth.js.
* **User Groups & KYC (Know Your Customer) Requirements:**
    * **Admin:** Manages the application (Platform owners). Pre-configured accounts, no self-registration.
    * **Renter (Car Company):** Businesses renting out their fleets. 
        * *Requirements:* Business Permit upload, Company Registration, Tax Identification, and Corporate Bank Details.
    * **Drivers:** Chauffeurs registered *by* the Renter (for chauffeured options).
        * *Requirements:* Submission of Professional Driver's License (e.g., LTO or regional equivalent) and background check clearance.
    * **User (Customer):** The individual renting the car.
        * *Requirements:* Non-Professional or Professional Driver's License upload and a secondary Government ID (e.g., Passport) for identity verification.

## 3. User Group Profiles
* **Admin Dashboard:** Master view. Can access, suspend, or modify all user profiles. Views hidden system data and raw transaction logs.
* **Renter Profile:** * *Public View:* Company contact details, fleet list, average ratings/reviews, and a Trust Badge (Verified, Undergoing Validation, Not Verified).
    * *Private View:* Transaction volume (MTD/YTD), active rentals, dispute management, and revenue analytics.
* **Driver Profile:**
    * *Public View:* Driver name, photo, number of completed trips, average ratings, and reviews.
    * *Private View:* Schedule, assigned vehicle, and earnings (if applicable).
* **User Profile:** * Visible only to Renters (when a booking is requested), assigned Drivers, and Admins. Contains rental history, verified ID status, and user ratings.

## 4. Booking Flow (Cars)
* **Search Page:** Users input parameters (dates, locations).
* **Result Page:** Grid/List view of available cars. Includes filters (Price, Transmission, Fuel Type - EV/Hybrid/Gas, Seating Capacity, Renter Rating).
* **Selection Page:** Deep dive into the chosen car. Shows high-res images, rental terms, mileage limits, insurance coverage, and optional add-ons (e.g., child seat, chauffeur).
* **Review Page:** Complete price breakdown. Shows base rate, add-ons, taxes, and the platform fee (5% configurable).
* **Payment Page:** Secure checkout integration. Supports Credit/Debit cards, and local e-wallets/digital payment gateways (e.g., GCash, Maya, BPI/Metrobank Online integrations via PayMongo/Stripe).
* **Booked Page:** Confirmation ticket with QR code, booking reference number, exact pickup location (with map), and Renter/Driver contact details.

## 5. History / Transaction Management
* **Booking Statuses:** Pending, Confirmed, Active, Completed, Cancelled.
* **Post-Trip:** Two-way review system (User reviews Car/Driver/Renter; Renter reviews User).
* **Cancellation/Refund:** Automated logic based on SLA (e.g., 100% refund if cancelled 48 hrs prior, 50% if 24 hrs). Automated routing of funds back to the original payment method.

## 6. Feedback & Dispute Resolution
* Dedicated module for users to report issues (e.g., car condition not matching description, late delivery).
* Ticket system for Admins to mediate between Users and Renters.

## 7. Reports & BI (For Admins and Renters)
* **Renter BI:** Fleet utilization rate (%), most profitable vehicles, maintenance schedule forecasting, user demographic breakdowns.
* **Admin BI:** Gross Merchandise Value (GMV), platform commission revenue, total active users, Renter acquisition metrics, and platform health monitoring.

## 8. AI Chatbot
* **Architecture:** Implement a Retrieval-Augmented Generation (RAG) pipeline utilizing the Model Context Protocol (MCP).
* **Functionality:** * Securely query the database to provide users with live booking statuses, car availability, and specific rental policies without human intervention.
    * Assist users with technical support and guide them through the KYC verification process.

## 9. Legal, T&C, and Contact Us
* Dynamic pages managed via Admin CMS. Includes localized insurance liabilities, data privacy compliance, and user agreements.

---

# Development Loop Architecture

This project follows an autonomous, self-pacing development loop. Each iteration moves through four phases: **Gather → Plan → Execute → Evaluate**. Observations from each cycle feed directly into the next iteration's action items.

## Loop Phases

### 1. Gather
Before any work begins in a session, read the current state:
- Read `docs/loop/observations.md` for findings from prior iterations.
- Read `docs/loop/backlog.md` for pending action items.
- Run `git status` and `git log --oneline -10` to understand what was last completed.
- Check file structure to confirm what has already been scaffolded.

### 2. Plan
Break the highest-priority backlog item into concrete, ordered steps before touching any code:
- Pull the top item from `docs/loop/backlog.md`.
- Decompose it into numbered sub-tasks (no sub-task should take more than one context window).
- Write the plan to `docs/loop/current-plan.md`, including the goal, steps, and acceptance criteria.
- If the plan exceeds what a single session can complete, note the cutpoint explicitly.

### 3. Execute
Work through the plan steps in order:
- Use TodoWrite to track sub-task progress within the session.
- Commit after each logical unit of work (`git commit`) with a descriptive message.
- If a Claude Pro rate limit is hit mid-execution (4-hour window or weekly cap), write current progress to `docs/loop/session-state.md` (last completed step, next step, any blockers) and schedule a wakeup using `ScheduleWakeup` with a delay of `14400` seconds (4 hours) so the loop resumes automatically when the limit refreshes.
- On wakeup, re-read `docs/loop/session-state.md` and continue from where the session left off.

### 4. Evaluate
After execution is complete (or at a natural stopping point):
- Test the implemented feature manually or via automated tests.
- Document findings in `docs/loop/observations.md`: what worked, what broke, what is incomplete, and any architectural surprises.
- Update `docs/loop/backlog.md`: mark completed items, add newly discovered tasks, and re-prioritize.
- Clear `docs/loop/current-plan.md` and `docs/loop/session-state.md` once the cycle is fully closed.

## Loop State Files

| File | Purpose |
|---|---|
| `docs/loop/backlog.md` | Prioritized list of all pending work items |
| `docs/loop/current-plan.md` | Active plan for the current iteration (cleared after evaluate) |
| `docs/loop/session-state.md` | Resume point written before a rate-limit pause; read on wakeup |
| `docs/loop/observations.md` | Cumulative log of findings, issues, and decisions across iterations |

## GitHub Repository

- **Repo:** https://github.com/cenon4dno/rent-a-car
- **Default branch:** `main`
- **Token:** stored in `.env` as `GITHUB_TOKEN` (never committed)
- **Credential helper:** `gh auth setup-git` — run once per machine to wire the token to git

### Milestone Commit & Push Convention

After every major milestone, commit and push immediately:

```powershell
# Authenticate (once per session)
$env:GH_TOKEN = $env:GITHUB_TOKEN
gh auth setup-git

# Stage specific files (never use git add -A or git add . blindly)
git add <files>

# Commit with milestone tag
git commit -m "feat(<scope>): <description>`n`nMilestone: <milestone-name>`nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# Push
git push origin main
```

**Milestone tags to use in commit messages:**

| Tag | When to use |
|---|---|
| `Milestone: monorepo-scaffold` | After initial project structure is created |
| `Milestone: db-schema` | After Prisma schema is finalized |
| `Milestone: auth` | After authentication and KYC flows work |
| `Milestone: booking-flow` | After end-to-end booking flow is functional |
| `Milestone: payments` | After payment integration is live |
| `Milestone: dashboards` | After admin and renter dashboards are complete |
| `Milestone: mobile-app` | After React Native app matches web booking flow |
| `Milestone: ai-chatbot` | After RAG/MCP chatbot is integrated |
| `Milestone: deployment` | After Azure/Nginx/CI-CD pipeline is live |

---

## Rate Limit Handling

Claude Pro enforces a usage cap that resets on a 4-hour rolling window and a weekly aggregate. When a limit is detected or anticipated mid-session:

1. Finish the current atomic step — never leave code in a broken state.
2. Commit all changes made so far.
3. Write `docs/loop/session-state.md` with:
   - Last completed step number and description.
   - Next step to execute.
   - Any open questions or blockers.
   - Timestamp of the pause.
4. Call `ScheduleWakeup` with `delaySeconds: 14400` (4 hours) and pass the current `/loop` prompt as the `prompt` argument so the session resumes automatically.
5. On the weekly cap, use `delaySeconds: 3600` and keep rescheduling until the weekly window clears.

The computer can be left running. The loop will wake itself, re-read state, and continue without manual intervention.

## Backlog Format (`docs/loop/backlog.md`)

```markdown
## Active
- [ ] [P1] Short description — acceptance criteria

## In Progress
- [ ] [P1] Description — started YYYY-MM-DD

## Completed
- [x] Description — completed YYYY-MM-DD
```

## Observations Format (`docs/loop/observations.md`)

```markdown
## YYYY-MM-DD — Iteration N
**Goal:** What this iteration targeted
**Outcome:** Done / Partial / Blocked
**Findings:**
- Observation 1
- Observation 2
**Next Actions:** (copied to backlog)
- Action 1
```

---

# Coding Standards

1.  **Version Control:** Git Flow or GitHub Flow. Main, Staging, and Feature branches. PR reviews mandatory before merging.
2.  **Component Architecture:** Atomic design principles for React/NextJS components. Highly modular and reusable.
3.  **Linting & Formatting:** ESLint and Prettier integrated into pre-commit hooks (Husky).
4.  **API Design:** Standardized JSON responses for REST. Consistent error handling (standardized HTTP status codes and error messages).
5.  **Security:** JWT for API authentication. Environment variables for all secrets (never hardcoded). Data sanitization to prevent SQL injection (handled via ORM like Prisma or Sequelize).
6.  **Documentation:** Swagger/OpenAPI for backend endpoints. JSDoc for complex utility functions.

---

# Behavior and Edge Cases

1.  **Concurrency / Overbooking:** * *Issue:* Two users try to book the same car for overlapping dates simultaneously.
    * *Solution:* Implement database-level row locking or optimistic concurrency control during the checkout process. Hold the reservation temporarily (e.g., 10 minutes) during payment.
2.  **Late Returns:** * *Issue:* User does not return the car on time, overlapping with the next booking.
    * *Solution:* Automated penalty charges to the user's card. The system instantly alerts the Renter and suggests an alternative car from their fleet for the next affected user.
3.  **Vehicle Breakdown / Damage:**
    * *Issue:* Car breaks down during the rental period.
    * *Solution:* SOS button in the app. Triggers an immediate notification to the Renter for replacement and Admin for tracking. Pauses the rental timer.
4.  **Payment Failures (Extensions):**
    * *Issue:* User extends the booking in-app, but the card on file fails.
    * *Solution:* Extension is denied immediately. App notifies User to update payment method within 1 hour; otherwise, immediate return is mandated.
5.  **Driver No-Show:**
    * *Issue:* Assigned driver does not arrive.
    * *Solution:* User reports via app. Automated full refund and high-severity penalty/flag applied to the Renter's profile.
6.  **Unverified ID Edge Case:**
    * *Issue:* User uploads an expired or fake ID.
    * *Solution:* Integration with a third-party KYC API (e.g., Onfido, Veriff) for automated document verification before allowing a booking to proceed.