# HOW AI WORKS IN GOVINTEL - EXACT STEP-BY-STEP BREAKDOWN

## 🎯 THE COMPLETE AI PIPELINE

When a citizen submits a grievance, here's EXACTLY what happens:

---

## STEP 1: GRIEVANCE SUBMISSION
```
User fills form:
├── Title: "Potholes on Main Street"
├── Description: "There are dangerous potholes on main street. Very urgent as children are injured!"
├── Category: "infrastructure"
└── Location: { address: "Main Street, City", coordinates: {lat, lng} }
```

---

## STEP 2: AI ANALYSIS ENGINE KICKS IN
**File:** `backend/utils/aiAnalysis.js`

### A. SENTIMENT ANALYSIS
```javascript
Input: "There are dangerous potholes on main street. Very urgent as children are injured!"

Using: sentiment npm package

Process:
1. Analyzes emotional tone of text
2. Counts positive & negative words
3. Returns sentiment score (-1 to +1)

Output:
{
  sentiment: "negative",           // ← Detected as negative
  score: -0.8,                     // ← Strong negative score
  intensity: "high",               // ← Strong emotional content
  positiveWords: [],
  negativeWords: ["dangerous", "injured"] // ← Words identified
}

Why matters: Negative sentiment = more urgent issue
```

---

### B. URGENCY SCORING (0-100)
```javascript
Input: Same description

Process:
1. Search for URGENT KEYWORDS
   ├── "urgent" found (+20 points)
   ├── "dangerous" NOT in list (0 points)
   └── "children are injured" contains "danger"? Check custom list

2. Check TIME-SENSITIVE PHRASES
   ├── "immediately" - NOT present (0)
   ├── "now" - NOT present (0)
   ├── "today" - NOT present (0)
   └── No time keywords found (0 points)

3. SENTIMENT-BASED ADJUSTMENT
   ├── Sentiment score: -0.8 (very negative)
   ├── Rule: if sentiment < -3, add 15 points
   └── Added: 15 points (negative = more urgent)

4. FINAL CALCULATION
   ├── Base score: 50
   ├── Urgent keywords: +20 (1 match × 20)
   ├── Sentiment adjustment: +15 (negative)
   ├── Time sensitivity: +0
   └── TOTAL: 85

Result:
{
  score: 85,           // ← Out of 100
  level: "urgent",     // ← Auto-classified as URGENT (>= 80)
  hasUrgentKeywords: true
}
```

---

### C. CATEGORY CLASSIFICATION
```javascript
Input: "potholes on main street"

Process:
1. Engine has 8 PREDEFINED CATEGORIES with keywords:

   infrastructure: [
     'road', 'bridge', 'building', 'construction', 'repair',
     'pothole', 'street', 'sidewalk', 'pavement', ...
   ]
   
   sanitation: [
     'garbage', 'waste', 'trash', 'cleaning', 'dirty', ...
   ]
   
   ... (6 other categories)

2. TEXT MATCHING:
   ├── Check if "pothole" in infrastructure? YES ✓
   ├── Check if "street" in infrastructure? YES ✓
   ├── Check if "garbage" in sanitation? NO ✗
   ├── Check if "water" in water_supply? NO ✗
   └── Continue for all categories...

3. SCORE CALCULATION:
   ├── Infrastructure: 2 matches / 11 keywords = 0.18 confidence
   ├── Sanitation: 0 matches / 10 keywords = 0.0 confidence
   ├── Water_supply: 0 matches / 8 keywords = 0.0 confidence
   └── ... (all others = 0)

4. PICK BEST MATCH:
   └── Infrastructure wins with highest score

Result:
{
  category: "infrastructure",
  confidence: 0.36,  // ← TF-IDF normalized: 0.18 * 2
  method: "keyword_matching"
}
```

---

### D. KEYWORD EXTRACTION
```javascript
Input: Full text

Using: TF-IDF (Term Frequency - Inverse Document Frequency)

Process:
1. Remove stop words ("the", "is", "a", "and", etc.)
2. Calculate importance of remaining words
3. Pick TOP 10 most important

Output:
{
  keywords: [
    "potholes",      // ← Most important
    "main",
    "street",
    "dangerous",
    "children",
    "injured",
    "urgent",
    ...
  ]
}
```

---

### E. CONFIDENCE SCORING (0-1)
```javascript
How confident is the AI in its analysis?

Calculation:
1. START: confidence = 0.5 (baseline)

2. TEXT LENGTH BONUS:
   ├── +0.1 if word count > 10 words ✓
   ├── +0.1 if word count > 50 words ✓
   ├── +0.1 if word count > 100 words ✗ (only 20 words)
   └── Total added: 0.2

3. CATEGORY MATCH BONUS:
   ├── Infrastructure has 11 keywords
   ├── Text matched 2 of them (18%)
   ├── (2/11) × 0.3 = 0.054
   └── Total added: 0.054

4. SENTIMENT CLARITY BONUS:
   ├── Sentiment score: -0.8 (very clear - negative)
   ├── Rule: if |score| > 0.5, +0.1
   └── Total added: 0.1

5. FINAL:
   0.5 + 0.2 + 0.054 + 0.1 = 0.854

Result:
{
  confidence: 0.85  // ← 85% confidence in analysis
}
```

---

## STEP 3: DEPARTMENT AUTO-ASSIGNMENT
```
From category "infrastructure" → automatically assign DEPARTMENT = "MUNICIPAL"

Mapping:
├── infrastructure → MUNICIPAL
├── sanitation → MUNICIPAL
├── water_supply → MUNICIPAL
├── electricity → MUNICIPAL
├── healthcare → HEALTH
├── education → EDUCATION
├── transportation → TRANSPORT
├── police → POLICE
└── other → MUNICIPAL

Result: grievance.department = "MUNICIPAL"
```

---

## STEP 4: PRIORITY AUTO-ESCALATION
```
Before AI: priority = "medium" (default)

After AI Analysis:
├── Urgency score: 85
├── Rule: if urgencyScore >= 80 → escalate to "urgent"
├── Rule: if urgencyScore >= 65 → escalate to "high"
└── Rule: if urgencyScore >= 35 → keep as "medium"

Result: grievance.priority = "urgent"  ← AUTO-ESCALATED!
```

---

## STEP 5: SMART OFFICER ASSIGNMENT
**File:** `backend/utils/smartRouting.js`

```
Now find BEST OFFICER in MUNICIPAL department

All MUNICIPAL officers:
├── Officer A: John
├── Officer B: Sarah
├── Officer C: Mike
└── Officer D: Lisa

For EACH officer, calculate SCORE based on 5 FACTORS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICER A - JOHN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Factor 1: WORKLOAD (40% weight)
├── John has 5 active cases
├── Formula: (10 - 5) / 10 = 0.5
├── Score: 0.5 × 40 = 20 points
└── Reasoning: "Workload: 5 active cases"

Factor 2: EXPERIENCE (20% weight)
├── John has resolved 12 cases
├── Formula: min(12/50, 1) = 0.24
├── Score: 0.24 × 20 = 4.8 points
└── Reasoning: "Experience: 12 resolved cases"

Factor 3: PERFORMANCE (25% weight)
├── John's avg feedback rating: 4.2 / 5.0
├── Formula: 4.2 / 5 = 0.84
├── Score: 0.84 × 25 = 21 points
└── Reasoning: "Performance: 84% avg rating"

Factor 4: AVAILABILITY (5% weight)
├── John works 9AM-5PM, currently available? YES
├── Score: 1 × 5 = 5 points
└── Reasoning: "Available: Yes"

Factor 5: SPECIALIZATION (10% weight)
├── John specialized in infrastructure? 80%
├── Formula: 0.80 × 10 = 8 points
└── Reasoning: "Category expertise: 80%"

TOTAL SCORE FOR JOHN = 20 + 4.8 + 21 + 5 + 8 = 58.8 points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICER B - SARAH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Factor 1: WORKLOAD
├── Sarah has 2 active cases
├── (10 - 2) / 10 = 0.8
├── Score: 0.8 × 40 = 32 points

Factor 2: EXPERIENCE
├── Sarah has 25 resolved cases
├── min(25/50, 1) = 0.5
├── Score: 0.5 × 20 = 10 points

Factor 3: PERFORMANCE
├── Sarah's rating: 4.5 / 5.0
├── Score: (4.5/5) × 25 = 22.5 points

Factor 4: AVAILABILITY
├── YES = 5 points

Factor 5: SPECIALIZATION
├── Score: 0.75 × 10 = 7.5 points

TOTAL SCORE FOR SARAH = 32 + 10 + 22.5 + 5 + 7.5 = 77 points ← HIGHEST!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICER C - MIKE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE = 45 points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OFFICER D - LISA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL SCORE = 52 points

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL RANKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SARAH (77 points)   ← SELECTED ✓
2. JOHN  (58.8 points)
3. LISA  (52 points)
4. MIKE  (45 points)

Result: grievance.assignedOfficer = Sarah
```

---

## FINAL RESULT - WHAT GETS SAVED TO DATABASE

```javascript
{
  _id: "507f1f77bcf86cd799439011",
  title: "Potholes on Main Street",
  description: "There are dangerous potholes on main street...",
  category: "infrastructure",
  priority: "urgent",              // ← AUTO-ESCALATED by AI
  status: "assigned",
  department: "MUNICIPAL",         // ← AUTO-ASSIGNED by AI
  citizen: "userid123",
  assignedOfficer: "sarahid456",  // ← SMART-ROUTED by AI
  
  analysisData: {
    sentiment: "negative",        // ← AI RESULT
    urgencyScore: 85,            // ← AI RESULT
    urgencyLevel: "urgent",      // ← AI RESULT
    keywords: ["potholes", "main", "street", ...],  // ← AI RESULT
    suggestedDepartment: "MUNICIPAL",               // ← AI RESULT
    confidence: 0.85             // ← AI RESULT
  },
  
  location: { address: "Main Street", coordinates: {...} },
  createdAt: "2025-11-26T10:30:00Z",
  
  updates: [{
    message: "Auto-assigned to Sarah (smart routing)",
    status: "assigned",
    updatedBy: "sarahid456"
  }]
}
```

---

## 🔄 HOW THIS ALL HAPPENS - CODE FLOW

```javascript
// In backend/routes/grievances.js, POST / endpoint:

1. Form validation (title, description, category, location)
2. Save to MongoDB:
   const grievance = new Grievance({...})
   await grievance.save()

3. TRIGGER AI ANALYSIS (non-blocking):
   const analysisResult = await AIAnalysisEngine.analyzeGrievance(
     grievance.title,
     grievance.description,
     grievance.category
   )
   // Returns: sentiment, urgencyScore, keywords, confidence, etc.

4. UPDATE GRIEVANCE WITH ANALYSIS:
   grievance.analysisData = analysisResult
   
5. AUTO-ESCALATE PRIORITY:
   if (analysisResult.urgencyLevel === 'urgent') {
     grievance.priority = 'urgent'  // Was 'medium', now 'urgent'
   }

6. SMART ROUTING:
   const routingResult = await SmartRoutingEngine.autoAssignGrievance(
     grievance._id
   )
   // Calculates scores, picks best officer, assigns them
   grievance.assignedOfficer = routingResult.bestOfficer._id

7. SAVE EVERYTHING:
   await grievance.save()

8. RETURN TO FRONTEND:
   res.status(201).json({
     success: true,
     data: grievance  // With all AI data populated
   })
```

---

## 📊 REAL-WORLD EXAMPLE WALKTHROUGH

### Input:
```
Title: "No water in Sector 5"
Description: "We haven't had water for 3 days! This is an emergency. 
Children are suffering. Please fix immediately."
Category: "water_supply"
```

### AI ANALYSIS:

**1. SENTIMENT:**
```
Negative words: "no", "haven't", "emergency", "suffering"
Positive words: none
Result: sentiment = "negative", score = -0.9
```

**2. URGENCY:**
```
"emergency" found → +20
"immediately" found → +8
Negative sentiment (-0.9) → +15
time-sensitive "3 days" → +8
Base 50 + 20 + 8 + 15 + 8 = 101 → capped at 100

Result: urgencyScore = 100, level = "URGENT"
```

**3. CATEGORY:**
```
Matched keywords: "water", "supply"
Result: category = "water_supply" (provided anyway)
```

**4. DEPARTMENT:**
```
water_supply → MUNICIPAL
```

**5. CONFIDENCE:**
```
Text length: 15 words → +0.1
Sentiment clarity: very strong → +0.1
Keywords match: 2/8 → +0.075
Result: 0.5 + 0.1 + 0.1 + 0.075 = 0.775 (77.5%)
```

**6. AUTO-ESCALATION:**
```
Original priority: "medium"
Urgency: 100 (>= 80)
New priority: "URGENT"
```

**7. SMART ROUTING:**
```
MUNICIPAL officers scored:
- Officer A: 55 points
- Officer B: 68 points (SELECTED)
- Officer C: 42 points
- Officer D: 61 points
```

### OUTPUT:
```
Grievance saved with:
✓ Status: "assigned" (auto-assigned)
✓ Priority: "urgent" (escalated by AI)
✓ Department: "MUNICIPAL" (auto-determined)
✓ assignedOfficer: Officer B (smart routing)
✓ analysisData.sentiment: "negative"
✓ analysisData.urgencyScore: 100
✓ analysisData.keywords: ["water", "supply", "emergency", ...]
✓ analysisData.confidence: 0.775
```

---

## ⚠️ WHAT'S NOT AI (Common Misconception)

The Flask app (`aiml/app.py`) is a PLACEHOLDER - it's not actually used!

```python
# This Flask app does NOTHING:
@app.route('/')
def home():
    return jsonify({'message': 'ML API running '})
```

Real AI happens in `backend/utils/aiAnalysis.js` using:
- ✅ `sentiment` npm package (sentiment analysis)
- ✅ `natural` npm package (TF-IDF, keyword extraction)
- ✅ Custom algorithm (urgency scoring)
- ✅ Custom algorithm (smart routing with multi-factor scoring)

---

## 🎯 SUMMARY

| Component | What It Does | How It Works |
|-----------|-------------|------------|
| **Sentiment Analysis** | Detects emotional tone | Counts positive/negative words (sentiment pkg) |
| **Urgency Scoring** | Calculates urgency 0-100 | Keyword matching + time phrases + sentiment |
| **Category Classification** | Determines grievance type | TF-IDF + keyword matching against 8 categories |
| **Keyword Extraction** | Extracts important words | TF-IDF algorithm (natural pkg) |
| **Confidence Scoring** | How sure is the AI? | Weighted: text length + category match + sentiment |
| **Auto-Priority Escalation** | Bumps up urgent cases | If urgency > 80, priority = "urgent" |
| **Smart Routing** | Assigns to best officer | 5-factor scoring: workload, experience, performance, availability, specialization |

---

Generated: November 26, 2025
