# 🏃‍♂️ SAFRUN — Social Running & Safety App

## **Product Requirements Document (PRD)**

Version 1.2 — Updated December 2024

> **New in v1.2**: Added Lean Moat Engine (Section 21) — the defensibility layer that competitors cannot replicate
> 
> **v1.1**: Business Model, Revenue Projections, Market Positioning, Investor Talking Points (Sections 14-20)

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

# **11. Release Plan (MVP → V1.5 → V2 → V3)**

## **MVP (✅ Complete)**

* Manual SOS with countdown verification
* Guardian alerts with real-time tracking
* Nearby runners broadcast (configurable radius)
* Live group map with participants
* Session chat
* Anonymous mode
* Run statistics
* Location fuzzing (basic)

## **V1.5 — Lean Moat Engine (🔄 Next: 2-3 weeks)**

*The defensibility layer — see Section 21 for details*

* Safety Memory Graph (event intelligence)
* Responder Trust Score (behavioral ranking)
* Location Fuzz → Converge (privacy-preserved routing)
* Micro-Safety ML (fall detection, no-movement, snatch detection)
* Risk Grid Tiles (danger zone intelligence)
* SDK safety methods
* Mobile sensor integration

## **V2**

* AI-enhanced safety detection
* Anti-stalker engine
* Danger zone heatmap UI
* Video streaming (WebRTC)
* Advanced dead-man triggers
* Wearable integration (Apple Watch, Garmin)
* Community danger reporting

## **V3**

* Phantom mode (virtual runners)
* Route prediction & safety recommendations
* Advanced gamification
* Community events & challenges
* Insurance partnerships
* Public meet-ups
* Enterprise API

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

## **19.5 Defensibility (Lean Moat Engine)**

* **Network effects**: More users = more responders = more safety = more users
* **Safety Memory Graph**: Years of real-world safety events competitors can't replicate
* **Responder Trust Scores**: Per-city behavioral reliability data unique to us
* **Tuned Algorithms**: Fuzz → Converge and Micro-ML thresholds take months to calibrate
* **Risk Intelligence**: Geohash-based danger mapping improves daily with usage
* **Trust barrier**: Competitors can't replicate trust built with users
* **B2B relationships**: Corporate and insurance partnerships are sticky

> **Key Insight**: Every day SAFRUN operates, the moat gets wider. Competitors starting fresh need 6-12 months just to match our data density.

---

# **20. Answers to Open Questions (Section 12)**

| Question | Recommendation | Rationale |
|----------|----------------|-----------|
| Should responders see each other? | **Yes, in V2** | Coordination prevents duplication, builds community |
| Should guardians join responder chat? | **Yes, optional** | Gives guardians peace of mind, useful context |
| Integrate with local emergency services? | **V3+** | Regulatory complexity, but high value long-term |
| Insurance coverage features? | **Yes, as partnership** | Subsidy model, not us providing insurance |

---

---

# **21. Lean Moat Engine — Defensibility Layer**

*The intelligence layer that competitors cannot replicate.*

## **21.1 Strategic Purpose**

Create a lightweight intelligence engine that:
- Strengthens user safety through learned patterns
- Increases responder reliability via behavioral scoring
- Privately maps risk over time (danger zones)
- Automatically improves as more runners join
- **Cannot be copied** by cloning frontend/backend alone

> **CEO Insight**: This moat uses **behavior**, **history**, and **heuristics** — not heavy AI. Every day of operation makes SAFRUN harder to compete with.

## **21.2 Moat Components Overview**

| Component | Description | Build Time | Defensive Value | Status |
|-----------|-------------|------------|-----------------|--------|
| **Safety Memory Graph** | Append-only safety event intelligence | 3-5 days | 🔥🔥🔥🔥 | 🆕 New |
| **Responder Trust Score** | Behavior-based reliability ranking | 1-2 days | 🔥🔥🔥 | 🔄 Enhance existing |
| **Location Fuzz → Converge** | Privacy-preserved responder routing | 2 days | 🔥🔥🔥🔥 | 🔄 Enhance existing |
| **Micro-Safety ML** | 3 tiny sensor-based anomaly detectors | 2-3 days | 🔥🔥🔥 | 🆕 New |
| **Risk Grid Tiles** | Geohash-based danger heatmaps | 2 days | 🔥🔥🔥 | 🆕 New |

**Total Build Time: 10-14 days**

---

## **21.3 Component 1: Safety Memory Graph**

### What It Is
A lightweight, append-only event log that turns user activity into **safety intelligence**.

### Integration with Existing Code
- **Hooks into**: Existing SOS flow, escalation service, responder service
- **No duplication**: Extends current `AuditLog` pattern
- **Storage**: New `SafetyEvent` table (~100 bytes per event)

### Data Stored Per Event
```
event_id          UUID
runner_id_hash    String (privacy: hashed, not raw ID)
timestamp         DateTime
location_grid     String (geohash, ~100m precision)
event_type        Enum (SOS_TRIGGERED, FALL_DETECTED, NO_MOVEMENT, 
                        RESPONDER_ACCEPTED, RESPONDER_ARRIVED, SOS_RESOLVED)
response_time_ms  Int (null until resolved)
risk_level        Int (1-3)
metadata          JSONB (flexible)
```

### Intelligence Generated
- "This road has 3 SOS events during early mornings"
- "This area has slow responder times (avg 4.2 min)"
- "Typical response time here is 2.1 minutes"
- "Risk score for this geohash: 7/10"

### Why It's a Moat
A competitor copying our UI will have **zero**:
- Safety event density
- Timing patterns
- Historical behavioral data
- Risk heatmaps

**This is our unreplicable intelligence graph.**

---

## **21.4 Component 2: Responder Trust Score**

### What It Is
A computed reliability score for responders based on real behavior.

### Integration with Existing Code
- **Hooks into**: Existing `SOSResponder` model (already tracks responses)
- **Enhancement**: Add computed `trustScore` field
- **No new table**: Extend existing `Profile` with responder metrics

### Scoring Formula
```
trustScore = 
  (total_responses × 3) +
  (avg_response_speed_bonus × 2) +      // faster = higher
  (positive_feedback × 2) +
  (arrivals × 5) +                       // actually showed up
  (false_alarm_penalty × -3) +
  (declined_penalty × -1)
```

### Usage
- Order responders by reliability (highest score first)
- "Trusted Responder" badge for score > 50
- Priority dispatch to top responders
- Reduce false alarm noise

### Why It's a Moat
Our dataset of **human reliability is unique per city**.
No competitor can replicate 90 days of behavioral data.

---

## **21.5 Component 3: Location Fuzz → Converge**

### What It Is
Enhanced privacy algorithm where fuzzed location **converges to precise** as responder approaches.

### Integration with Existing Code
- **Enhances**: Existing `fuzzLocation()` in `sos.service.ts`
- **No duplication**: Same function, smarter algorithm
- **WebSocket integration**: Already have `sos:precise-location` event

### Algorithm
```
Phase 1 (Broadcast): 
  - Fuzz by 100-200m random offset
  - All notified responders see approximate location

Phase 2 (Accepted):
  - Responder accepts → fuzz reduced to 50m
  - Direction vector maintained

Phase 3 (En Route, <200m away):
  - Fuzz reduced to 20m

Phase 4 (Arrival, <50m away):
  - Precise location revealed
```

### Why It's a Moat
- Strong privacy posture (women's safety market)
- Requires GPS math + privacy models + real-world tuning
- Competitors underestimate the debugging time
- **Months of tuning** to get right

---

## **21.6 Component 4: Micro-Safety ML**

### What It Is
Three minimal anomaly detectors using phone sensors. No AI/ML infrastructure needed.

### Integration with Existing Code
- **Mobile only**: Expo Sensors (accelerometer, location)
- **Feeds into**: New `SafetyEvent` table
- **Triggers**: Existing SOS flow via SDK

### Heuristic 1: Fall Detection
```javascript
if (accelerometerSpike > FALL_THRESHOLD && 
    speedDropsToZero && 
    noMovementFor3Seconds) {
  → FALL_DETECTED event
  → Auto-trigger SOS countdown
}
```

### Heuristic 2: No Movement Timeout
```javascript
if (distanceMoved < 5m && 
    timeElapsed > userTimeout &&  // default 5 min
    sessionActive) {
  → NO_MOVEMENT_DETECTED event
  → "Are you okay?" prompt
}
```

### Heuristic 3: Snatch Speed Spike
```javascript
if (suddenSpeedSpike > 25km/h &&    // impossible running speed
    previousSpeed < 15km/h &&
    directionChangeAbrupt) {
  → POSSIBLE_SNATCH event
  → Auto-trigger SOS countdown
}
```

### Why It's a Moat
- Events feed Safety Memory → intelligence improves
- Competitors start with zero calibrated thresholds
- Real-world data tunes these over time

---

## **21.7 Component 5: Risk Grid Tiles**

### What It Is
Geohash-based risk scoring for map areas.

### Integration with Existing Code
- **Uses**: Existing Redis geo-indexing infrastructure
- **Feeds from**: Safety Memory Graph
- **Exposes**: New `/safety/grid/:geohash` endpoint

### Risk Score Calculation
```
riskScore = (
  (sos_events_count × 3) +
  (slow_response_events × 2) +
  (unresolved_events × 5) +
  (time_of_day_factor) +           // night = higher
  (recency_decay)                   // older events matter less
) / normalization_factor
```

### Usage
- Danger zone warnings in route planning
- "This area has elevated risk" notifications
- Heatmap overlay on map (V2)
- Insurance data product (anonymized)

---

## **21.8 Data Schema Additions**

### New Table: `SafetyEvent`
```prisma
model SafetyEvent {
  id              String   @id @default(uuid())
  runnerIdHash    String   // Hashed for privacy
  eventType       SafetyEventType
  timestamp       DateTime @default(now())
  locationGrid    String   // Geohash (100m precision)
  responseTimeMs  Int?
  riskLevel       Int      @default(1) // 1-3
  metadata        Json?
  
  @@index([locationGrid])
  @@index([eventType])
  @@index([timestamp])
}

enum SafetyEventType {
  SOS_TRIGGERED
  SOS_RESOLVED
  SOS_CANCELLED
  FALL_DETECTED
  NO_MOVEMENT
  SNATCH_DETECTED
  RESPONDER_NOTIFIED
  RESPONDER_ACCEPTED
  RESPONDER_ARRIVED
  RESPONDER_DECLINED
}
```

### Extended: `Profile` (add responder metrics)
```prisma
// Add to existing Profile model:
responderScore      Int      @default(0)
totalResponses      Int      @default(0)
totalArrivals       Int      @default(0)
avgResponseTimeSec  Int?
lastRespondedAt     DateTime?
```

### New Table: `RiskTile`
```prisma
model RiskTile {
  id            String   @id @default(uuid())
  geohash       String   @unique  // ~100m precision
  riskScore     Float    @default(0)
  eventCount    Int      @default(0)
  avgResponseMs Int?
  lastUpdated   DateTime @default(now())
  
  @@index([geohash])
  @@index([riskScore])
}
```

---

## **21.9 SDK Additions**

```typescript
// New SDK methods (packages/sdk/src/safety.ts)
class SafetyApi {
  // Log safety event (called from mobile)
  logEvent(event: SafetyEventInput): Promise<void>
  
  // Get risk score for a location
  getRiskGrid(geohash: string): Promise<RiskTile>
  
  // Get risk tiles in radius
  getRiskTilesNearby(lat: number, lng: number, radiusM: number): Promise<RiskTile[]>
  
  // Get responder score
  getResponderScore(userId: string): Promise<ResponderScore>
  
  // Calculate fuzzed location (client-side preview)
  fuzzLocation(lat: number, lng: number, phase: FuzzPhase): { lat: number, lng: number }
}
```

---

## **21.10 Backend Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/safety/event` | POST | Log safety event (internal/mobile) |
| `/safety/grid/:geohash` | GET | Get risk score for tile |
| `/safety/grid/nearby` | GET | Get risk tiles in radius |
| `/safety/responder/:userId` | GET | Get responder metrics |
| `/safety/responder/leaderboard` | GET | Top responders (optional) |

---

## **21.11 Mobile Integration**

### New: Fall Detection Listener
```typescript
// hooks/useFallDetection.ts
- Subscribe to Accelerometer
- Detect spike + sudden stop pattern
- Trigger SOS countdown if detected
- Log SafetyEvent
```

### New: Movement Heartbeat
```typescript
// hooks/useMovementHeartbeat.ts
- Track distance during session
- Prompt if no movement > timeout
- Auto-escalate if no response
```

### New: Snatch Detection
```typescript
// hooks/useSnatchDetection.ts
- Monitor speed anomalies
- Detect impossible acceleration
- Trigger SOS countdown
```

### Settings UI Addition
```
Settings → Safety → Advanced
  ├── Fall Detection: [ON/OFF]
  ├── No Movement Timeout: [3/5/10 min]
  ├── Snatch Detection: [ON/OFF]
  └── Location Privacy Level: [Standard/Enhanced]
```

---

## **21.12 Self-Reinforcing Moat Loop**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  (trigger) → Micro-ML detects anomaly                   │
│       ↓                                                 │
│  (SOS) → Location fuzz applied, broadcast sent          │
│       ↓                                                 │
│  (response) → Responders ranked by Trust Score          │
│       ↓                                                 │
│  (converge) → Location precision increases              │
│       ↓                                                 │
│  (resolution) → Safety Event logged to Memory Graph     │
│       ↓                                                 │
│  (learning) → Risk Grid updated, scores recalculated    │
│       ↓                                                 │
│  (improvement) → Better routing, faster response        │
│       ↓                                                 │
│  MOAT STRENGTHENS → Competitors fall further behind     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Every user improves the system. Every day widens the moat.**

---

## **21.13 What Competitors Can vs Cannot Copy**

### ✅ They CAN Copy (Low Moat)
- UI design
- Map components
- SOS button
- Session management
- Basic chat

### ❌ They CANNOT Copy (High Moat)
- Our **real-world safety events** (years of data)
- Our **responder behavioral patterns** (per-city reliability)
- Our **tuned fuzz → converge algorithm** (months of debugging)
- Our **calibrated micro-ML thresholds** (real-world tuning)
- Our **risk grid intelligence** (density + time patterns)
- Our **incremental learning layer** (improves daily)

---

## **21.14 Implementation Priority**

### Phase 1: Foundation (Week 1)
1. ✅ SafetyEvent schema + migration
2. ✅ Safety event logging from existing SOS flow
3. ✅ Responder score calculation (extend Profile)
4. ✅ `/safety/event` and `/safety/responder` endpoints

### Phase 2: Intelligence (Week 2)
1. ✅ Risk Grid tile calculation
2. ✅ Fuzz → Converge algorithm enhancement
3. ✅ Risk tile API endpoints
4. ✅ SDK safety methods

### Phase 3: Mobile Sensors (Week 2-3)
1. ✅ Fall detection hook
2. ✅ Movement heartbeat hook
3. ✅ Snatch detection hook
4. ✅ Settings UI for safety features

---

## **21.15 Success Metrics**

| Metric | Target | Moat Effect |
|--------|--------|-------------|
| Safety events logged/day | 100+ | Data density |
| Responder score accuracy | >80% correlation with actual arrivals | Trust reliability |
| Risk tile coverage | >50% of active geohashes | Intelligence breadth |
| False positive rate (ML) | <10% | User trust |
| Avg time to converge | <2 min | Privacy + speed balance |

---

*PRD Version 1.2 — Updated December 2024*
*Added: Lean Moat Engine (Section 21), Business Model, Revenue Projections, Market Positioning*
