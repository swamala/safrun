# 🏃‍♂️ SAFRUN — Social Running & Safety App

## **Product Requirements Document (PRD)**

Version 1.1 — Updated December 2024

> **New in v1.1**: Added Business Model, Revenue Projections, Market Positioning, Investor Talking Points (Sections 14-20)

---

# **1. Product Overview**

A mobile application that enables users to run or walk socially while staying completely secure. The platform combines:

* Real-time group running
* Community engagement
* AI-driven safety features
* Emergency SOS broadcasting to guardians, group members, and nearby runners
* Privacy-first design

This app creates **the world’s first secure social running network**.

---

# **2. Core Value Proposition**

The app makes running and walking:

### **Safer** — with AI danger detection, SOS broadcasting, guardian protection, anti-stalker systems

### **More Social** — real-time group map, nearby runner discovery, interactive chat/voice/cheers

### **More Motivating** — live challenges, leaderboards, community meet-ups

No existing app combines **social + safety + real-time location transparency** in one ecosystem.

---

# **3. Key User Personas**

### **Runner (Primary User)**

* Wants company, safety, and motivation during runs
* Wants privacy and control over who sees their location

### **Responder (Nearby Runner / Community Member)**

* App user within a certain radius
* Receives SOS alerts and can assist

### **Guardian (Trusted Contact)**

* Family member, partner, or friend
* Receives emergency updates

### **Group Admin / Organizer**

* Creates groups
* Schedules sessions

---

# **4. Product Features**

# 4.1 **Live Social Running Features**

## **4.1.1 Real-Time Group Map**

* All participants visible on a shared map
* Shows: avatar, speed, distance, direction, route
* Auto-zoom to group
* Route history update every 3–5 seconds

## **4.1.2 Live Stats & Pace Sync**

* Real-time pace comparison
* Indicators for:

  * Ahead / behind
  * Pace-matching
  * Falling off pace

## **4.1.3 Group Live Chat**

* Quick text chat
* Motivational emojis
* Voice notes
* Option for group leader audio broadcast

## **4.1.4 Nearby Runner Discovery**

* Detects runners within X meters
* Allows joining open sessions
* Shows anonymous profiles if privacy mode active

## **4.1.5 Live Group Challenges**

* First to 1km
* Maintain group pace
* Catch the leader
* “Stay within 50m” mode

---

# 4.2 **Safety & Security Features (Flagship)**

## **4.2.1 SOS Multi-Layer Activation (Manual + AI)**

Triggered by:

* Manual long press
* Fall detection
* Heart-rate anomaly
* Abduction-speed event
* No movement for defined time
* Device snatching indicators

Verification steps:

1. Silent “Are you safe?” popup
2. 10-second countdown
3. Automatic escalation if unanswered

## **4.2.2 Broadcast to Guardians**

* Exact location
* Live video/audio (optional)
* Movement direction
* Battery, connectivity
* Last-known GPS if offline

## **4.2.3 Broadcast to Group Members**

* Live exact location
* Chat emergency channel
* Alerts with severity level

## **4.2.4 Broadcast to Nearby Runners (Unique Feature)**

* Within radius (300m–1km)
* Receives approximate (fuzzed) location
* Prompts: **Assist** / **Ignore**
* Renders safe route to incident
* Only closest 3–5 responders get upgraded precision

## **4.2.5 Guardian Triangulation System**

* Guardian A sees region A
* Guardian B sees region B
* Guardian C sees region C
* Only combined gives full location
* Prevents single person from tracking exact routes

## **4.2.6 Anti-Stalker Detection**

App detects:

* Someone following user too long
* Suspicious repeated patterns
* Nearby unknown devices pacing user

Triggers guidance: reroute, alerts, or guardian notice.

## **4.2.7 Private Session Cloaking**

* Start/end points hidden
* GPS “shifts” 200m to protect home
* Session location deleted after X hours

## **4.2.8 Danger Zone Detection**

Uses environmental + community signals:

* Low lighting
* High crime reports
* Low activity areas
* Recent incidents
* Auto reroute when entering danger zone

## **4.2.9 Dead-Man Trigger**

Auto-activates SOS if:

* No user input
* No motion + unsafe activity detected
* High-impact fall

## **4.2.10 Phantom Mode**

Displays virtual runners around a lone runner to reduce targeting.

---

# 4.3 **User & Group Features**

## **4.3.1 Group Creation & Membership**

* Create private/public groups
* Invite via link/QR
* Role permissions: admin, moderator, member

## **4.3.2 Group Sessions**

* Admin starts session
* Members get push notifications
* Join/Leave at any time

## **4.3.3 Route Sharing**

* Post-run route summary
* Share to social

---

# **5. Non-Functional Requirements**

## **5.1 Performance**

* Location updates: 2–5 second intervals
* Real-time map update: < 300ms latency via WebSockets
* Video stream latency: < 500ms via WebRTC

## **5.2 Security**

* Data encrypted (AES-256 at rest, TLS 1.3 in transit)
* Location sharing only during session
* SOS data stored encrypted
* Ecosystem cannot reveal home or frequent locations
* Automatic detection of:

  * GPS spoofing
  * Rooted devices
  * Emulator environments

## **5.3 Privacy**

* No default public location
* Anonymous & fuzzed modes
* Delete-my-data compliance (GDPR/CCPA)

---

# **6. System Architecture (High-Level)**

## **6.1 Mobile App (Client)**

Modules:

* GPS/Location service
* Accelerometer & gyroscope service
* Heart rate (optional wearable)
* SOS Trigger module
* SOS Verification module
* Real-time Runner Map module
* Chat + Voice Note module
* Responder Mode UI
* Guardian Mode UI
* Background tracking

## **6.2 Backend Services**

### **A. Realtime Engine**

* WebSockets or Firebase RTDB for continuous location streams

### **B. SOS Orchestrator**

* Handles trigger → verification → escalation
* Routes alerts to all recipients
* Connects with WebRTC media server

### **C. Proximity Engine**

* Geospatial queries for nearby runners
* Matching responders based on radius + trust levels

### **D. Safety AI Engine**

* Fall detection logic
* Danger zone scoring
* Suspicious behavior modeling
* Dead-man triggers

### **E. Map/Geo Engine**

* Route rendering
* Distance calculations
* Pace analysis

### **F. Notification Engine**

* Push
* SMS fallback
* Email

---

# **7. Data Model (Simplified)**

### **Users**

* id, email, name, avatar
* privacy settings
* trust score
* last_location (encrypted)

### **Groups**

* id
* name
* members[]
* privacy type

### **Sessions**

* id
* group_id
* start_time
* is_live
* participants[]

### **Location Stream**

* user_id
* session_id
* timestamp
* latitude, longitude
* speed, heading

### **SOS_Events**

* id
* user_id
* exact_location (encrypted)
* approx_location
* trigger_type
* status

### **Responders**

* responder_id
* sos_event_id
* accepted_at
* reached_at

### **Guardians**

* guardian_id
* sos_event_id
* alerts_sent

---

# **8. User Flows**

## **8.1 Start Run**

1. User opens app
2. Choose group
3. Tap “Start Session”
4. Location sharing begins
5. Others join

## **8.2 SOS Flow**

1. Long press panic button
2. User selects Safe/Not Safe
3. If no response → escalate
4. Broadcast to guardians + group + nearby runners
5. Responder mode activates
6. User marked safe or incident logged

## **8.3 Nearby Runner Responds**

1. Receives SOS
2. Chooses "Assist"
3. Provided safe route
4. Guardians notified “Responder #1 is en route”
5. Reaches scene

---

# **9. Constraints & Assumptions**

* Requires background GPS permission
* Requires location precision turned on
* Battery optimization must be managed (smart sampling)
* Legal compliance for emergency data handling
* Guardian must accept consent to view user location

---

# **10. Success Metrics**

### User Safety

* SOS false alarm < 5%
* Average responder arrival time < 3 minutes
* Guardian alert success > 98%

### Social Engagement

* % of solo runners joining group sessions
* Average session length
* Monthly retention rate

### Growth

* Viral growth: user → runner → responder loops
* Local clustering density

---

# **11. Release Plan (MVP → V2 → V3)**

## **MVP**

* Manual SOS
* Guardian alerts
* Nearby runners broadcast
* Live group map
* Basic chat
* Anonymous mode
* Simple tracking metrics

## **V2**

* AI safety detection
* Anti-stalker engine
* Danger zone mapping
* Video streaming
* Dead-man triggers

## **V3**

* Phantom mode
* Route prediction
* Advanced gamification
* Wearable integration
* Community events
* Public meet-ups

---

# **12. Open Questions**

* Should responders see each other?
* Should guardians be allowed to join chat with responders?
* Should we integrate with local emergency services?
* Should the app have insurance coverage features?

---

# **13. Appendix**

* UI sketches (to be added)
* Data retention policy
* Country-specific safety compliance

---

# **14. Market Innovation & Unique Value**

## **14.1 What We're Inventing**

SAFRUN creates the **world's first community-powered emergency response network for fitness**. This is fundamentally new.

### **The Core Innovation: Human Safety Mesh Network**

| What Exists Today | What SAFRUN Does Differently |
|-------------------|------------------------------|
| **bSafe/Noonlight**: Alert goes to police/guardians | Alert goes to **nearby SAFRUN users** who can respond in 1-3 minutes |
| **Strava Beacon**: Family can track you passively | Family + Group + **Strangers who opted in** become active responders |
| **Apple Fall Detection**: Calls 911, waits 20+ min | Calls **the runner 200m away** who arrives in 90 seconds |

### **Privacy-Preserving Emergency Escalation**

No other app does this:

1. **Fuzzy location first** — Responders see approximate location (100-300m offset)
2. **Precise when committed** — Only accepted responders get exact coordinates
3. **Layered privacy** — Guardians, group, and nearby runners get different precision levels

### **The Responder Economy**

We create a reputation system for helpers:
* Track response history and arrival times
* Build trust scores for reliable responders
* Gamify being a good Samaritan

## **14.2 Defensible Claims**

| Claim | Defensibility |
|-------|---------------|
| "The world's first community-powered runner safety network" | ✅ True, unique |
| "Help arrives in minutes, not 20+ minutes" | ✅ Provable with data |
| "Your location is never shared until you need help" | ✅ Privacy architecture |
| "Turn every SAFRUN user into a potential guardian angel" | ✅ Unique value prop |

## **14.3 What's NOT Our Innovation**

| Feature | Existing Competitors |
|---------|---------------------|
| Live location sharing | Strava Beacon, Apple Find My |
| Fall detection | Apple Watch, Garmin |
| SOS button | Every safety app |
| Group running | Strava, Nike Run Club |

**Strategy**: Lead with what's novel. Treat common features as table stakes.

---

# **15. Business Model & Monetization**

## **15.1 Primary Revenue: Freemium SaaS**

### Subscription Tiers

| Tier | Price | Features | Target |
|------|-------|----------|--------|
| **Free** | $0 | 1 SOS/month, 1 guardian, public sessions only, ads | Casual runners |
| **Safety+** | $5.99/mo | Unlimited SOS, 5 guardians, fall detection, no ads, priority responder queue | Solo runners, women |
| **Family** | $12.99/mo | 5 accounts, family dashboard, 24/7 location sharing, kid mode | Parents, families |
| **Pro** | $9.99/mo | All Safety+ features + advanced stats, Strava sync, wearable integration | Serious runners |

### Unit Economics

| Metric | Conservative | Optimistic |
|--------|-------------|------------|
| Free users | 100,000 | 500,000 |
| Conversion to paid | 3% | 7% |
| Paid users | 3,000 | 35,000 |
| ARPU (average) | $7/mo | $8/mo |
| **Monthly Recurring Revenue** | **$21,000** | **$280,000** |

## **15.2 B2B Corporate Wellness**

### Value Proposition
> "Your employees run before/after work. 67% of women feel unsafe running alone. SAFRUN protects your workforce and reduces liability."

### Pricing Tiers

| Package | Price | Includes |
|---------|-------|----------|
| **Starter** (≤100 employees) | $500/mo | Admin dashboard, company groups, HR emergency contact |
| **Business** (100-500) | $2,000/mo | + Analytics, custom branding, SSO |
| **Enterprise** (500+) | $5,000+/mo | + API access, dedicated support, SLA |

### Target Customers

* Tech companies with wellness programs
* Insurance companies (reduced claims = they pay us)
* Gyms and running clubs (white-label option)
* Universities (student safety programs)

## **15.3 Insurance Partnerships**

### Business Case

Insurance companies pay for **prevention** because claims are expensive:

| Scenario | Insurance Cost | Our Value |
|----------|---------------|-----------|
| Runner assaulted, hospitalized | $50,000+ claim | Prevention via SOS network |
| Runner has heart attack alone | $100,000+ claim | Early detection, faster response |
| Runner hit by car (no witness) | Liability nightmare | Location history, incident proof |

### Partnership Models

| Model | Structure |
|-------|-----------|
| **Subsidy Model** | Insurer pays $3/user/month, user pays $2.99 → we get $5.99 |
| **Claims Reduction Bonus** | Insurer pays % of claims reduction in their runner cohort |
| **Data Licensing** | Anonymized safety data (danger zones, patterns) licensed to insurers |

### Target Partners

* Health insurers: Aetna, United, Cigna
* Life insurers: Reduced risk = reduced premiums for SAFRUN users
* Travel insurers: International runner safety

## **15.4 Premium Features (À La Carte)**

| Feature | Pricing | Type |
|---------|---------|------|
| Guardian Triangulation | $2.99/mo | Add-on |
| Audio/Video SOS Recording | $1.99/mo | Add-on |
| Danger Zone Alerts | $1.49/mo | Add-on |
| Unlimited Route History | $9.99 | One-time |
| Custom Safety Phrases | $4.99 | One-time |

## **15.5 Affiliate & Partnerships**

| Partner Type | Revenue Model |
|--------------|---------------|
| **Wearables** (Garmin, Whoop, Apple) | Referral fees for device sales |
| **Running Gear** (Nike, Brooks) | Affiliate commissions |
| **Safety Products** (pepper spray, lights) | In-app store, 15-30% margin |
| **Running Events** (marathons, races) | Event partnerships, group safety contracts |

## **15.6 Data Monetization (Ethical, Anonymized)**

| Data Product | Buyer | Price Model |
|--------------|-------|-------------|
| Danger Zone Maps | City planners, police | $10-50K/city/year |
| Running Pattern Analytics | Urban planners | Custom licensing |
| Safety Incident Trends | Insurance actuaries | Data licensing |
| Peak Running Times by Area | Retail, restaurants | Location intelligence |

⚠️ **Critical**: Only anonymized, aggregated data. Never individual location data.

---

# **16. Revenue Projections**

## **16.1 Consumer Revenue (3-Year)**

| Year | Users | Paid % | MRR | ARR | Notes |
|------|-------|--------|-----|-----|-------|
| **Y1** | 50K | 3% | $9K | $108K | MVP launch, organic growth |
| **Y2** | 250K | 5% | $75K | $900K | Marketing push, B2B starts |
| **Y3** | 1M | 7% | $420K | $5M | Insurance partnerships, international |

## **16.2 B2B Revenue (3-Year)**

| Source | Y1 | Y2 | Y3 |
|--------|----|----|---|
| Corporate Wellness | $10K | $100K | $500K |
| Insurance Partnerships | — | $50K | $300K |
| Data Licensing | — | $25K | $150K |
| **Total B2B** | **$10K** | **$175K** | **$950K** |

## **16.3 Combined Revenue**

| Year | Consumer | B2B | **Total** |
|------|----------|-----|-----------|
| **Y1** | $108K | $10K | **$118K** |
| **Y2** | $900K | $175K | **$1.075M** |
| **Y3** | $5M | $950K | **$5.95M** |

---

# **17. Target Markets & Positioning**

## **17.1 Primary Target Segments**

| Segment | Priority | Rationale |
|---------|----------|-----------|
| **Women who run alone** | 🔴 Primary | Highest safety concern, most likely to pay |
| **Early morning/night runners** | 🔴 Primary | Elevated risk, needs community safety |
| **Running clubs** | 🟡 Secondary | Group features, viral growth |
| **Fitness influencers** | 🟡 Secondary | Marketing amplification |
| **Corporate wellness programs** | 🟢 Growth | B2B revenue stream |

## **17.2 Brand Positioning**

### Primary Message
> "SAFRUN is the world's first **community-powered safety network for runners**. When you run alone, you're never really alone — every SAFRUN user within 1km becomes your potential safety responder."

### Three-Pillar Strategy

| Pillar | Message | Proof Point |
|--------|---------|-------------|
| **Community Safety** | "1000+ eyes watching your back" | Nearby responder network |
| **Instant Response** | "Help arrives in under 3 minutes" | SOS broadcast + ETA tracking |
| **Privacy-First** | "Your data, your control" | Anonymous mode, location fuzzing |

## **17.3 Competitive Differentiation**

| Competitor | Their Focus | Our Advantage |
|------------|-------------|---------------|
| **Strava** | Social fitness, achievements | We add real safety layer |
| **Nike Run Club** | Training, coaching | We add community emergency response |
| **bSafe** | Personal safety | We have active runner community |
| **Apple Watch** | Fall detection → 911 | We have human responders in 1-3 min |

---

# **18. Key Success Metrics (Business)**

## **18.1 Product Metrics**

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| SOS False Alarm Rate | <5% | Trust in system |
| Average Responder Arrival | <3 min | Core value prop |
| Guardian Alert Delivery | >98% | Safety reliability |
| D7 Retention | >40% | Product-market fit |
| Group Session Usage | >20% of users | Social stickiness |

## **18.2 Network Effect Metrics**

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Nearby Responder Density | >3 per km² | Safety network coverage |
| Responder Acceptance Rate | >50% | Community willingness |
| Average Responders per SOS | >2 | Redundancy |

## **18.3 Business Metrics**

| Metric | Y1 Target | Y2 Target |
|--------|-----------|-----------|
| Monthly Active Users | 20,000 | 100,000 |
| Paid Conversion Rate | 3% | 5% |
| Monthly Recurring Revenue | $9,000 | $75,000 |
| Customer Acquisition Cost | <$5 | <$8 |
| Lifetime Value (LTV) | $50 | $80 |
| LTV:CAC Ratio | 10:1 | 10:1 |

---

# **19. Investor Talking Points**

## **19.1 The Problem**

* 67% of women feel unsafe running alone
* 911 response time averages 7-10 minutes in urban areas, 20+ minutes rural
* Existing safety apps alert family — but family is usually far away
* Running is inherently solo, but humans nearby are ignored as potential helpers

## **19.2 The Solution**

SAFRUN creates a **decentralized emergency response network** where every app user becomes a potential first responder.

## **19.3 Why Now?**

* Smartphone GPS is now accurate to 3 meters
* Push notifications are instant and reliable
* WebSocket technology enables sub-second real-time updates
* Post-COVID running boom: 50M+ regular runners in US alone
* Women's safety is a mainstream conversation

## **19.4 Unique Selling Points**

1. **"We turn every runner into a first responder"** — Community safety mesh
2. **"Help in minutes, not hours"** — Faster than 911 for non-critical emergencies
3. **"Privacy-first emergency response"** — Fuzzy location → precise only when help commits
4. **"The Uber of emergency response for runners"** — Crowd-sourced, real-time, local

## **19.5 Defensibility**

* **Network effects**: More users = more responders = more safety = more users
* **Data moat**: Safety incident data, danger zone mapping
* **Trust barrier**: Competitors can't replicate trust built with users
* **B2B relationships**: Corporate and insurance partnerships are sticky

---

# **20. Answers to Open Questions (Section 12)**

| Question | Recommendation | Rationale |
|----------|----------------|-----------|
| Should responders see each other? | **Yes, in V2** | Coordination prevents duplication, builds community |
| Should guardians join responder chat? | **Yes, optional** | Gives guardians peace of mind, useful context |
| Integrate with local emergency services? | **V3+** | Regulatory complexity, but high value long-term |
| Insurance coverage features? | **Yes, as partnership** | Subsidy model, not us providing insurance |

---

*PRD Version 1.1 — Updated December 2024*
*Added: Business Model, Revenue Projections, Market Positioning*
