const mongoose = require("mongoose");
const User = require("../models/User");
const Grievance = require("../models/Grievance");
const Department = require("../models/Department");
const AIAnalysisEngine = require("../utils/aiAnalysis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Enhanced grievance templates with realistic scenarios
const ENHANCED_GRIEVANCE_TEMPLATES = {
  infrastructure: [
    {
      title: "Major water pipe burst flooding residential area",
      description: "A major water pipeline has burst on Sector 12 main road, causing severe flooding in the residential area. Water has entered several ground floor homes and shops. The road is completely waterlogged making it impossible for vehicles to pass. Emergency repair is needed as residents are facing water shortage and property damage. The leak started 6 hours ago and is getting worse.",
      keywords: ["water", "pipe", "burst", "flooding", "emergency", "repair", "urgent"],
      sentiment: "negative",
      urgencyScore: 95,
      priority: "urgent"
    },
    {
      title: "Dangerous cracks appearing in overhead bridge",
      description: "Visible cracks have appeared on the overhead bridge connecting Sector 8 to Sector 9. The cracks seem to be widening and there are concerns about the structural integrity of the bridge. Thousands of commuters use this bridge daily including school buses. We request immediate inspection by structural engineers and necessary safety measures.",
      keywords: ["bridge", "cracks", "dangerous", "structural", "safety", "inspection"],
      sentiment: "negative",
      urgencyScore: 90,
      priority: "urgent"
    },
    {
      title: "Street renovation project causing business losses",
      description: "The ongoing street renovation project has been going on for 3 months without completion. Local businesses are suffering huge losses due to restricted access and dust pollution. While we appreciate infrastructure development, the project timeline needs to be expedited and better coordination with business owners is required.",
      keywords: ["street", "renovation", "business", "losses", "timeline", "coordination"],
      sentiment: "neutral",
      urgencyScore: 55,
      priority: "medium"
    },
    {
      title: "Newly constructed park needs maintenance",
      description: "The newly constructed community park in Sector 5 is a great addition to our area. However, some of the playground equipment needs minor adjustments and the walking track has a few uneven patches. Overall, residents are very happy with the new facility and just need these small issues addressed.",
      keywords: ["park", "maintenance", "playground", "walking", "track", "community"],
      sentiment: "positive",
      urgencyScore: 30,
      priority: "low"
    },
    {
      title: "Potholes on main highway causing vehicle damage",
      description: "The main highway connecting our area to the city center has developed numerous large potholes over the past month. These potholes are causing significant damage to vehicles, with many residents reporting tire punctures and suspension problems. The road is heavily used by commuters and commercial vehicles. Immediate road repair is essential.",
      keywords: ["potholes", "highway", "vehicle", "damage", "repair", "commuters"],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high"
    }
  ],
  sanitation: [
    {
      title: "Sewage overflow creating health emergency",
      description: "There is a major sewage overflow near the school area that has been going on for 2 days. The sewage water is flowing on the streets and creating a terrible smell. Children are falling sick and parents are worried about health risks. This is a health emergency that needs immediate attention from the sanitation department.",
      keywords: ["sewage", "overflow", "health", "emergency", "smell", "children", "sick"],
      sentiment: "negative",
      urgencyScore: 92,
      priority: "urgent"
    },
    {
      title: "Irregular garbage collection affecting entire neighborhood",
      description: "Garbage collection in our neighborhood has become very irregular over the past month. Sometimes garbage is collected after 4-5 days, leading to overflowing bins and stray animals scattering waste. The irregular schedule is making it difficult for residents to plan waste disposal. We need a fixed collection schedule.",
      keywords: ["garbage", "collection", "irregular", "overflowing", "schedule", "waste"],
      sentiment: "negative",
      urgencyScore: 70,
      priority: "high"
    },
    {
      title: "Public toilet facility completely unusable",
      description: "The public toilet facility at the bus stand is in terrible condition. The doors are broken, there's no water supply, no electricity, and it hasn't been cleaned in weeks. The facility is completely unusable and people are forced to use nearby areas inappropriately. Immediate renovation and regular maintenance is required.",
      keywords: ["toilet", "facility", "unusable", "broken", "renovation", "maintenance"],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high"
    },
    {
      title: "Appreciation for improved cleanliness drive",
      description: "I want to appreciate the sanitation department for the recent cleanliness drive in our area. The streets are much cleaner now and the regular sweeping has made a significant difference. The new dustbins installed are also very helpful. Thank you for the excellent work and please continue this good service.",
      keywords: ["appreciation", "cleanliness", "drive", "streets", "sweeping", "dustbins"],
      sentiment: "positive",
      urgencyScore: 20,
      priority: "low"
    },
    {
      title: "Overflowing drainage system during monsoon",
      description: "The drainage system in our area overflows every time there's heavy rain during monsoon season. This causes waterlogging on roads and water entering ground floor houses. The drains haven't been cleaned properly and are clogged with plastic waste and debris. Regular maintenance and cleaning of drains is urgently needed.",
      keywords: ["drainage", "overflow", "monsoon", "waterlogging", "clogged", "maintenance"],
      sentiment: "negative",
      urgencyScore: 80,
      priority: "high"
    }
  ],
  water_supply: [
    {
      title: "Complete water shortage for 5 days - emergency situation",
      description: "Our entire area has been without water supply for 5 consecutive days. Residents are buying water from private tankers at very high costs. Children, elderly, and sick people are suffering the most. Local shops have run out of bottled water. This is an emergency situation requiring immediate intervention and restoration of water supply.",
      keywords: ["water", "shortage", "emergency", "tankers", "suffering", "restoration"],
      sentiment: "negative",
      urgencyScore: 98,
      priority: "urgent"
    },
    {
      title: "Contaminated water supply causing illness",
      description: "The water supplied to our area appears to be contaminated. Several residents have fallen ill with stomach problems and diarrhea after consuming the water. We suspect the water source or distribution system is compromised. Immediate water quality testing and treatment is required to prevent a health crisis.",
      keywords: ["contaminated", "water", "illness", "stomach", "diarrhea", "testing"],
      sentiment: "negative",
      urgencyScore: 88,
      priority: "urgent"
    },
    {
      title: "Water pressure too low during peak hours",
      description: "Water pressure in our building drops to almost zero during peak morning hours (7-9 AM) and evening hours (6-8 PM). This makes it impossible to fill water tanks or use water for daily activities. The pressure is normal during off-peak hours. We need pressure regulation to ensure consistent supply.",
      keywords: ["water", "pressure", "low", "peak", "hours", "regulation"],
      sentiment: "neutral",
      urgencyScore: 60,
      priority: "medium"
    },
    {
      title: "New water connection working perfectly",
      description: "I recently got a new water connection installed and I'm very satisfied with the service. The installation was done professionally and on time. The water quality is good and pressure is adequate. Thank you to the water department for the efficient service. I would recommend this to other residents.",
      keywords: ["water", "connection", "satisfied", "installation", "quality", "efficient"],
      sentiment: "positive",
      urgencyScore: 15,
      priority: "low"
    },
    {
      title: "Water meter showing incorrect readings",
      description: "My water meter has been showing unusually high readings for the past 2 months despite normal usage. The bill has increased by 300% without any change in consumption patterns. I suspect the meter is faulty and needs calibration or replacement. Please send a technician to inspect and rectify the issue.",
      keywords: ["water", "meter", "incorrect", "readings", "faulty", "calibration"],
      sentiment: "neutral",
      urgencyScore: 50,
      priority: "medium"
    }
  ],
  electricity: [
    {
      title: "Power transformer explosion - area without electricity",
      description: "The main power transformer in our area exploded last night around 11 PM. The entire neighborhood of 200+ houses has been without electricity for over 12 hours. Food is getting spoiled, medical equipment is not working, and students can't study. This is an emergency requiring immediate transformer replacement.",
      keywords: ["transformer", "explosion", "electricity", "emergency", "replacement", "urgent"],
      sentiment: "negative",
      urgencyScore: 95,
      priority: "urgent"
    },
    {
      title: "Frequent power cuts damaging electronic appliances",
      description: "Our area experiences sudden power cuts 8-10 times daily without any warning. These frequent fluctuations are damaging electronic appliances including computers, refrigerators, and air conditioners. Many residents have suffered financial losses due to damaged equipment. We need stable power supply and voltage regulation.",
      keywords: ["power", "cuts", "frequent", "appliances", "damage", "voltage"],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high"
    },
    {
      title: "Electricity bill showing incorrect readings",
      description: "My electricity bill for this month shows consumption of 800 units which is impossible as I was out of town for 20 days. The meter reading seems incorrect or there might be a billing error. I request verification of the meter reading and correction of the bill. My average monthly consumption is usually around 200 units.",
      keywords: ["electricity", "bill", "incorrect", "meter", "reading", "verification"],
      sentiment: "neutral",
      urgencyScore: 45,
      priority: "medium"
    },
    {
      title: "Excellent response to power outage complaint",
      description: "I want to thank the electricity department for their quick response to yesterday's power outage complaint. The technical team arrived within 2 hours and restored power efficiently. The staff was professional and explained the issue clearly. This kind of prompt service is highly appreciated by all residents.",
      keywords: ["excellent", "response", "power", "outage", "quick", "professional"],
      sentiment: "positive",
      urgencyScore: 10,
      priority: "low"
    },
    {
      title: "Street light installation request for new colony",
      description: "Our newly developed colony has been allocated plots but there are no street lights installed yet. The area becomes completely dark after sunset, creating safety concerns for residents, especially women and children. We request installation of adequate street lighting to ensure safety and security of the residents.",
      keywords: ["street", "light", "installation", "colony", "safety", "security"],
      sentiment: "neutral",
      urgencyScore: 65,
      priority: "medium"
    }
  ],
  transportation: [
    {
      title: "Bus accident due to poor road conditions",
      description: "A city bus met with an accident yesterday due to poor road conditions on Highway 24. Fortunately, no one was seriously injured, but several passengers sustained minor injuries. The road has multiple potholes and uneven surfaces that make it dangerous for public transport. Immediate road repair is essential to prevent future accidents.",
      keywords: ["bus", "accident", "road", "conditions", "potholes", "dangerous", "repair"],
      sentiment: "negative",
      urgencyScore: 85,
      priority: "urgent"
    },
    {
      title: "Traffic signal malfunction causing chaos at intersection",
      description: "The traffic signal at the busy intersection of Mall Road and Station Road has been malfunctioning for 3 days. All lights are blinking yellow causing confusion among drivers. Traffic police are trying to manage manually but it's insufficient during rush hours. Multiple minor accidents have occurred due to this issue.",
      keywords: ["traffic", "signal", "malfunction", "intersection", "chaos", "accidents"],
      sentiment: "negative",
      urgencyScore: 80,
      priority: "high"
    },
    {
      title: "Request for bus route extension to new housing society",
      description: "The new housing society in Sector 18 has over 500 families but no direct bus connectivity. Residents have to walk 1.5 km to reach the nearest bus stop. We request extension of Route 42 or introduction of a new route to serve this area. This will greatly benefit working professionals and students living here.",
      keywords: ["bus", "route", "extension", "housing", "society", "connectivity"],
      sentiment: "neutral",
      urgencyScore: 50,
      priority: "medium"
    },
    {
      title: "New metro station has improved connectivity significantly",
      description: "The newly opened metro station in our area has significantly improved connectivity to the city center. Travel time has reduced from 2 hours to 45 minutes. The station is well-maintained and staff is helpful. This infrastructure development has positively impacted property values and quality of life in our area.",
      keywords: ["metro", "station", "connectivity", "improved", "infrastructure", "positive"],
      sentiment: "positive",
      urgencyScore: 15,
      priority: "low"
    },
    {
      title: "Parking shortage at railway station",
      description: "The railway station parking area is insufficient for the number of commuters. People are forced to park on nearby roads, causing traffic congestion and safety issues. During peak hours, finding parking becomes nearly impossible. We request expansion of parking facilities or construction of a multi-level parking structure.",
      keywords: ["parking", "shortage", "railway", "station", "congestion", "expansion"],
      sentiment: "neutral",
      urgencyScore: 55,
      priority: "medium"
    }
  ],
  healthcare: [
    {
      title: "Ambulance service failed to respond during heart attack emergency",
      description: "During a heart attack emergency at 2 AM last night, we called the ambulance service multiple times but no ambulance arrived for over 1 hour. We had to arrange private transport to rush the patient to hospital. Fortunately, the patient survived, but this delay could have been fatal. Emergency services must be more responsive.",
      keywords: ["ambulance", "emergency", "heart", "attack", "delay", "fatal", "responsive"],
      sentiment: "negative",
      urgencyScore: 98,
      priority: "urgent"
    },
    {
      title: "Government hospital lacks basic medicines and equipment",
      description: "The government hospital in our area is facing severe shortage of basic medicines like paracetamol, antibiotics, and blood pressure medications. Even basic equipment like thermometers and blood pressure monitors are not available. Poor families who depend on government healthcare are suffering. Immediate restocking is required.",
      keywords: ["hospital", "shortage", "medicines", "equipment", "healthcare", "families"],
      sentiment: "negative",
      urgencyScore: 85,
      priority: "urgent"
    },
    {
      title: "Vaccination drive needs better organization",
      description: "The recent vaccination drive at the community center was poorly organized with long queues and no proper crowd management. Elderly people had to wait for hours in the sun. While we appreciate the vaccination initiative, better planning and organization is needed for future drives to ensure smooth operations.",
      keywords: ["vaccination", "drive", "organization", "queues", "elderly", "planning"],
      sentiment: "neutral",
      urgencyScore: 40,
      priority: "medium"
    },
    {
      title: "Excellent treatment received at government clinic",
      description: "I received excellent treatment at the government health clinic for my diabetes checkup. The doctor was knowledgeable and spent adequate time explaining the condition and treatment. The medicines were available and the staff was courteous. I'm very satisfied with the quality of healthcare provided.",
      keywords: ["excellent", "treatment", "clinic", "doctor", "satisfied", "healthcare"],
      sentiment: "positive",
      urgencyScore: 10,
      priority: "low"
    },
    {
      title: "Mental health support services needed in community",
      description: "Our community lacks proper mental health support services. With increasing stress and depression cases, especially among youth and elderly, we need qualified counselors and mental health awareness programs. The nearest mental health facility is 50 km away, making it inaccessible for many residents.",
      keywords: ["mental", "health", "support", "counselors", "depression", "awareness"],
      sentiment: "neutral",
      urgencyScore: 60,
      priority: "medium"
    }
  ],
  education: [
    {
      title: "School building collapse risk - children's safety at stake",
      description: "The government primary school building in our area is showing signs of structural damage with visible cracks in walls and ceiling. During recent rains, water leaked into classrooms. We are extremely concerned about children's safety and request immediate structural assessment and necessary repairs before any accident occurs.",
      keywords: ["school", "building", "collapse", "safety", "children", "structural", "urgent"],
      sentiment: "negative",
      urgencyScore: 92,
      priority: "urgent"
    },
    {
      title: "Severe teacher shortage affecting education quality",
      description: "Our government high school has only 6 teachers for 15 classes and 450 students. Many subjects like science and mathematics don't have dedicated teachers. Students are suffering academically and parents are considering private schools. Urgent recruitment of qualified teachers is needed to maintain education standards.",
      keywords: ["teacher", "shortage", "education", "quality", "students", "recruitment"],
      sentiment: "negative",
      urgencyScore: 78,
      priority: "high"
    },
    {
      title: "School lacks basic facilities like clean toilets and drinking water",
      description: "The government school in our village lacks basic facilities. There are no clean toilets for girls, no proper drinking water facility, and classrooms don't have adequate furniture. These conditions are affecting school attendance, especially of girl students. Basic infrastructure development is urgently needed.",
      keywords: ["school", "facilities", "toilets", "water", "furniture", "attendance"],
      sentiment: "negative",
      urgencyScore: 70,
      priority: "high"
    },
    {
      title: "Appreciation for new computer lab installation",
      description: "We want to thank the education department for installing a new computer lab in our government school. The 25 new computers with internet connectivity have opened up new learning opportunities for our children. The teachers have also been trained well. This initiative will help bridge the digital divide.",
      keywords: ["appreciation", "computer", "lab", "installation", "learning", "digital"],
      sentiment: "positive",
      urgencyScore: 20,
      priority: "low"
    },
    {
      title: "School bus service discontinued without notice",
      description: "The school bus service for our area was suddenly discontinued without any prior notice to parents. Children now have to walk 3 km to school or parents have to arrange private transport. This is causing hardship for working parents and safety concerns for children. We request immediate restoration of bus service.",
      keywords: ["school", "bus", "service", "discontinued", "children", "hardship", "restoration"],
      sentiment: "negative",
      urgencyScore: 70,
      priority: "high"
    }
  ],
  police: [
    {
      title: "Gang violence incident requires immediate police action",
      description: "There was a violent clash between two groups in our area last night resulting in injuries to 3 people. The situation is still tense and residents are afraid to come out of their homes. We need immediate police deployment and patrolling to maintain law and order. The injured have been hospitalized but the perpetrators are still at large.",
      keywords: ["gang", "violence", "clash", "injuries", "police", "deployment", "urgent"],
      sentiment: "negative",
      urgencyScore: 95,
      priority: "urgent"
    },
    {
      title: "Chain snatching incidents increasing in evening hours",
      description: "There have been 5 chain snatching incidents in our area in the past 2 weeks, all occurring between 7-9 PM. Women are afraid to go out during evening hours. The incidents are happening near the market area and bus stops. We request increased police patrolling during these hours and installation of CCTV cameras.",
      keywords: ["chain", "snatching", "incidents", "evening", "women", "patrolling", "CCTV"],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high"
    },
    {
      title: "Noise pollution from illegal bars disturbing residents",
      description: "Several illegal bars in our residential area operate till late night with loud music and create noise pollution. Despite multiple complaints, no action has been taken. Residents including children and elderly are unable to sleep properly. We request strict action against these illegal establishments.",
      keywords: ["noise", "pollution", "illegal", "bars", "music", "residents", "action"],
      sentiment: "negative",
      urgencyScore: 65,
      priority: "medium"
    },
    {
      title: "Quick police response prevented major incident",
      description: "I want to appreciate the quick response of the local police station yesterday. When I called about suspicious activity near my house, a patrol team arrived within 10 minutes and handled the situation professionally. Their prompt action prevented what could have been a serious incident. Excellent work by the police team.",
      keywords: ["police", "response", "quick", "suspicious", "professional", "excellent"],
      sentiment: "positive",
      urgencyScore: 15,
      priority: "low"
    },
    {
      title: "Theft case investigation progressing slowly",
      description: "I reported a theft case 3 weeks ago where my motorcycle was stolen from outside my office. While the police have registered the FIR and started investigation, there has been no significant progress. I have provided CCTV footage and witness details but haven't received any updates. Regular communication about case progress is needed.",
      keywords: ["theft", "investigation", "motorcycle", "stolen", "progress", "communication"],
      sentiment: "neutral",
      urgencyScore: 55,
      priority: "medium"
    }
  ]
};

const SAMPLE_CITIZENS = [
  { name: "Rajesh Kumar", email: "rajesh.kumar@email.com", phone: "+919876543210" },
  { name: "Priya Sharma", email: "priya.sharma@email.com", phone: "+919876543211" },
  { name: "Amit Singh", email: "amit.singh@email.com", phone: "+919876543212" },
  { name: "Sunita Gupta", email: "sunita.gupta@email.com", phone: "+919876543213" },
  { name: "Vikram Patel", email: "vikram.patel@email.com", phone: "+919876543214" },
  { name: "Meera Reddy", email: "meera.reddy@email.com", phone: "+919876543215" },
  { name: "Arjun Verma", email: "arjun.verma@email.com", phone: "+919876543216" },
  { name: "Kavita Joshi", email: "kavita.joshi@email.com", phone: "+919876543217" },
  { name: "Rohit Agarwal", email: "rohit.agarwal@email.com", phone: "+919876543218" },
  { name: "Deepika Nair", email: "deepika.nair@email.com", phone: "+919876543219" },
  { name: "Sanjay Mishra", email: "sanjay.mishra@email.com", phone: "+919876543220" },
  { name: "Anita Rao", email: "anita.rao@email.com", phone: "+919876543221" },
  { name: "Manoj Tiwari", email: "manoj.tiwari@email.com", phone: "+919876543222" },
  { name: "Pooja Bansal", email: "pooja.bansal@email.com", phone: "+919876543223" },
  { name: "Ravi Chopra", email: "ravi.chopra@email.com", phone: "+919876543224" }
];

const SAMPLE_ADDRESSES = [
  { street: "A-123, Sector 12", city: "New Delhi", state: "Delhi", zipCode: "110012" },
  { street: "B-456, Malviya Nagar", city: "New Delhi", state: "Delhi", zipCode: "110017" },
  { street: "C-789, Lajpat Nagar", city: "New Delhi", state: "Delhi", zipCode: "110024" },
  { street: "D-321, Karol Bagh", city: "New Delhi", state: "Delhi", zipCode: "110005" },
  { street: "E-654, Rohini", city: "New Delhi", state: "Delhi", zipCode: "110085" },
  { street: "F-987, Dwarka", city: "New Delhi", state: "Delhi", zipCode: "110075" },
  { street: "G-147, Vasant Kunj", city: "New Delhi", state: "Delhi", zipCode: "110070" },
  { street: "H-258, Janakpuri", city: "New Delhi", state: "Delhi", zipCode: "110058" },
  { street: "I-369, Pitampura", city: "New Delhi", state: "Delhi", zipCode: "110034" },
  { street: "J-741, Saket", city: "New Delhi", state: "Delhi", zipCode: "110017" },
  { street: "K-852, Greater Kailash", city: "New Delhi", state: "Delhi", zipCode: "110048" },
  { street: "L-963, Nehru Place", city: "New Delhi", state: "Delhi", zipCode: "110019" },
  { street: "M-159, Connaught Place", city: "New Delhi", state: "Delhi", zipCode: "110001" },
  { street: "N-357, Rajouri Garden", city: "New Delhi", state: "Delhi", zipCode: "110027" },
  { street: "O-468, Tilak Nagar", city: "New Delhi", state: "Delhi", zipCode: "110018" }
];

const DEPARTMENTS_DATA = [
  {
    name: "Municipal Corporation",
    code: "MUNICIPAL",
    description: "Handles infrastructure, sanitation, water supply, and general municipal services",
    categories: ["infrastructure", "sanitation", "water_supply", "electricity", "other"],
    contactInfo: {
      email: "municipal@delhi.gov.in",
      phone: "+911123456789",
      address: {
        street: "City Hall, Civic Centre",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110001"
      }
    },
    workingHours: {
      start: "09:00",
      end: "17:00",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  },
  {
    name: "Health Department",
    code: "HEALTH",
    description: "Manages healthcare services, hospitals, and public health initiatives",
    categories: ["healthcare"],
    contactInfo: {
      email: "health@delhi.gov.in",
      phone: "+911123456790",
      address: {
        street: "Health Secretariat, I.P. Estate",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110002"
      }
    },
    workingHours: {
      start: "08:00",
      end: "20:00",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    }
  },
  {
    name: "Education Department",
    code: "EDUCATION",
    description: "Oversees schools, educational institutions, and academic programs",
    categories: ["education"],
    contactInfo: {
      email: "education@delhi.gov.in",
      phone: "+911123456791",
      address: {
        street: "Directorate of Education, Old Secretariat",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110054"
      }
    },
    workingHours: {
      start: "09:00",
      end: "17:00",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  },
  {
    name: "Transport Department",
    code: "TRANSPORT",
    description: "Manages public transportation, traffic, and transport infrastructure",
    categories: ["transportation"],
    contactInfo: {
      email: "transport@delhi.gov.in",
      phone: "+911123456792",
      address: {
        street: "Transport Bhawan, Bridge Road",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110001"
      }
    },
    workingHours: {
      start: "08:00",
      end: "18:00",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    }
  },
  {
    name: "Police Department",
    code: "POLICE",
    description: "Handles law enforcement, public safety, and security matters",
    categories: ["police"],
    contactInfo: {
      email: "police@delhi.gov.in",
      phone: "+911123456793",
      address: {
        street: "Delhi Police Headquarters, I.P. Estate",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110002"
      }
    },
    workingHours: {
      start: "00:00",
      end: "23:59",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    }
  }
];

class ComprehensiveSeeder {
  constructor() {
    this.createdUsers = [];
    this.createdOfficers = [];
    this.createdGrievances = [];
    this.createdDepartments = [];
    this.demoLogins = {
      admins: [],
      officers: [],
      citizens: []
    };
  }

  async seedAll() {
    try {
      console.log("🌱 Starting comprehensive data seeding...");
      console.log("=" * 60);
      
      // Connect to MongoDB
      await this.connectDB();
      
      // Clear existing data
      await this.clearExistingData();
      
      // Seed departments first
      await this.seedDepartments();
      
      // Seed users (citizens and officers)
      await this.seedUsers();
      
      // Seed grievances with AI analysis
      await this.seedGrievances();
      
      // Generate department statistics
      await this.generateDepartmentStats();
      
      // Create demo logins file
      await this.createDemoLoginsFile();
      
      // Display summary
      this.displaySummary();
      
      console.log("✅ Comprehensive seeding completed successfully!");
      
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      throw error;
    }
  }

  async connectDB() {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("📡 Connected to MongoDB");
  }

  async clearExistingData() {
    console.log("🧹 Clearing existing data...");
    
    // Clear in order to avoid foreign key constraints
    await Grievance.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});
    
    console.log("✅ Existing data cleared");
  }

  async seedDepartments() {
    console.log("🏢 Creating departments...");
    
    for (const deptData of DEPARTMENTS_DATA) {
      const department = new Department(deptData);
      await department.save();
      this.createdDepartments.push(department);
    }
    
    console.log(`✅ Created ${this.createdDepartments.length} departments`);
  }

  async seedUsers() {
    console.log("👥 Creating users...");
    
    // Create admin user
    const admin = new User({
      name: "System Administrator",
      email: "admin@govintel.gov",
      password: "admin123", // Will be hashed by the model
      role: "admin",
      phone: "+919999999999",
      isActive: true,
      address: SAMPLE_ADDRESSES[0]
    });
    await admin.save();
    
    this.demoLogins.admins.push({
      name: admin.name,
      email: admin.email,
      password: "admin123",
      role: "admin"
    });

    // Create officers for each department (3 per department)
    for (const department of this.createdDepartments) {
      const officerTitles = ["Senior Officer", "Assistant Officer", "Field Officer"];
      
      for (let i = 0; i < 3; i++) {
        const officer = new User({
          name: `${department.name.split(' ')[0]} ${officerTitles[i]}`,
          email: `${department.code.toLowerCase()}.officer${i + 1}@govintel.gov`,
          password: "officer123", // Will be hashed by the model
          role: "officer",
          phone: `+9198765432${String(this.createdDepartments.indexOf(department) * 3 + i).padStart(2, '0')}`,
          department: department.code,
          isActive: true,
          address: SAMPLE_ADDRESSES[(this.createdDepartments.indexOf(department) * 3 + i) % SAMPLE_ADDRESSES.length]
        });
        
        await officer.save();
        this.createdOfficers.push(officer);
        
        // Add to department's officers array
        department.officers.push(officer._id);
        if (i === 0) department.head = officer._id; // First officer as head
        
        this.demoLogins.officers.push({
          name: officer.name,
          email: officer.email,
          password: "officer123",
          role: "officer",
          department: department.code
        });
      }
      
      await department.save();
    }

    // Create citizen users
    for (let i = 0; i < SAMPLE_CITIZENS.length; i++) {
      const citizenData = SAMPLE_CITIZENS[i];
      const citizen = new User({
        name: citizenData.name,
        email: citizenData.email,
        password: "citizen123", // Will be hashed by the model
        role: "citizen",
        phone: citizenData.phone,
        isActive: true,
        address: SAMPLE_ADDRESSES[i % SAMPLE_ADDRESSES.length]
      });
      
      await citizen.save();
      this.createdUsers.push(citizen);
      
      this.demoLogins.citizens.push({
        name: citizen.name,
        email: citizen.email,
        password: "citizen123",
        role: "citizen"
      });
    }

    console.log(`✅ Created 1 admin, ${this.createdOfficers.length} officers, ${this.createdUsers.length} citizens`);
  }

  async seedGrievances() {
    console.log("📋 Creating grievances with AI analysis...");
    
    const statuses = ["pending", "in-progress", "resolved", "closed"];
    let totalCreated = 0;
    
    // Create grievances for each category and template
    for (const [category, templates] of Object.entries(ENHANCED_GRIEVANCE_TEMPLATES)) {
      console.log(`  Creating grievances for category: ${category}`);
      
      for (const template of templates) {
        // Create 3-5 grievances per template with different statuses and citizens
        const grievancesToCreate = Math.floor(Math.random() * 3) + 3; // 3-5 grievances
        
        for (let i = 0; i < grievancesToCreate; i++) {
          const citizen = this.createdUsers[Math.floor(Math.random() * this.createdUsers.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Create date in the past (last 6 months)
          const createdDate = new Date();
          createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180));
          
          // Add some variation to the title and description
          const titleVariations = [
            template.title,
            template.title.replace("our area", "my locality"),
            template.title.replace("request", "urgent request"),
            template.title + " - needs immediate attention"
          ];
          
          const grievanceData = {
            title: titleVariations[i % titleVariations.length],
            description: template.description,
            category: category,
            priority: template.priority,
            status: status,
            citizen: citizen._id,
            department: this.getDepartmentByCategory(category).toUpperCase(),
            location: {
              address: SAMPLE_ADDRESSES[totalCreated % SAMPLE_ADDRESSES.length].street + ", " + 
                       SAMPLE_ADDRESSES[totalCreated % SAMPLE_ADDRESSES.length].city,
              coordinates: {
                latitude: 28.6139 + (Math.random() - 0.5) * 0.1, // Delhi area coordinates
                longitude: 77.2090 + (Math.random() - 0.5) * 0.1
              },
              landmark: this.getRandomLandmark()
            },
            createdAt: createdDate,
            updatedAt: createdDate,
            aiAnalysis: {
              sentiment: template.sentiment,
              urgencyScore: Math.max(0, Math.min(100, template.urgencyScore + Math.floor(Math.random() * 10 - 5))),
              keywords: template.keywords,
              suggestedDepartment: this.getDepartmentByCategory(category),
              confidence: 0.7 + Math.random() * 0.3 // 0.7 to 1.0
            },
            isAnonymous: Math.random() > 0.85 // 15% anonymous
          };

          // Assign officer if not pending
          if (status !== "pending") {
            const departmentOfficers = this.createdOfficers.filter(o => 
              o.department === this.getDepartmentByCategory(category).toUpperCase()
            );
            if (departmentOfficers.length > 0) {
              grievanceData.assignedOfficer = departmentOfficers[
                Math.floor(Math.random() * departmentOfficers.length)
              ]._id;
            }
          }

          // Add resolution data if resolved/closed
          if (status === "resolved" || status === "closed") {
            const resolutionDate = new Date(createdDate);
            const resolutionHours = this.calculateRealisticResolutionTime(template.urgencyScore, template.priority);
            resolutionDate.setHours(resolutionDate.getHours() + resolutionHours);
            
            grievanceData.actualResolutionDate = resolutionDate;
            grievanceData.resolutionTime = resolutionHours;
            grievanceData.updatedAt = resolutionDate;
            
            // Add feedback for resolved cases (75% chance)
            if (status === "resolved" && Math.random() > 0.25) {
              grievanceData.feedback = {
                rating: this.generateRealisticRating(template.sentiment),
                comment: this.generateFeedbackComment(template.sentiment),
                submittedAt: new Date(resolutionDate.getTime() + (Math.random() * 7 + 1) * 24 * 60 * 60 * 1000) // 1-7 days later
              };
            }
          }

          // Generate status updates
          grievanceData.updates = this.generateStatusUpdates(
            status, 
            createdDate, 
            grievanceData.assignedOfficer
          );

          const grievance = new Grievance(grievanceData);
          await grievance.save();
          this.createdGrievances.push(grievance);
          totalCreated++;
        }
      }
    }

    console.log(`✅ Created ${totalCreated} realistic grievances with AI analysis`);
  }

  getDepartmentByCategory(category) {
    const categoryDepartmentMap = {
      infrastructure: "municipal",
      sanitation: "municipal",
      water_supply: "municipal",
      electricity: "municipal",
      transportation: "transport",
      healthcare: "health",
      education: "education",
      police: "police",
      other: "municipal"
    };
    return categoryDepartmentMap[category] || "municipal";
  }

  getRandomLandmark() {
    const landmarks = [
      "Near Metro Station", "Opposite Shopping Mall", "Behind Government Hospital",
      "Near Bus Stand", "Close to School", "Next to Bank", "Near Police Station",
      "Opposite Park", "Behind Market", "Near Temple", "Close to Post Office",
      "Next to Petrol Pump", "Near Community Center", "Opposite Library"
    ];
    return landmarks[Math.floor(Math.random() * landmarks.length)];
  }

  calculateRealisticResolutionTime(urgencyScore, priority) {
    // Base resolution time based on priority
    let baseHours = {
      urgent: 8,
      high: 24,
      medium: 72,
      low: 168
    }[priority] || 72;

    // Adjust based on urgency score
    if (urgencyScore > 90) baseHours = Math.min(baseHours, 6);
    else if (urgencyScore > 80) baseHours = Math.min(baseHours, 12);
    else if (urgencyScore > 70) baseHours = Math.min(baseHours, 24);

    // Add some randomness (±50%)
    const variation = baseHours * 0.5;
    return Math.max(2, baseHours + (Math.random() - 0.5) * variation);
  }

  generateRealisticRating(sentiment) {
    // Generate ratings based on sentiment
    if (sentiment === "positive") {
      return Math.floor(Math.random() * 2) + 4; // 4-5 stars
    } else if (sentiment === "negative") {
      return Math.floor(Math.random() * 2) + 2; // 2-3 stars
    } else {
      return Math.floor(Math.random() * 3) + 3; // 3-5 stars
    }
  }

  generateStatusUpdates(finalStatus, createdDate, assignedOfficer) {
    const updates = [];
    const statusFlow = {
      pending: [],
      in_progress: ["in-progress"],
      resolved: ["in-progress", "resolved"],
      closed: ["in-progress", "resolved", "closed"]
    };

    const flow = statusFlow[finalStatus] || [];
    let currentDate = new Date(createdDate);

    const updateMessages = {
      "in-progress": "Officer has started working on the issue. Investigation and resolution in progress",
      resolved: "The reported issue has been successfully resolved. Please verify and provide feedback",
      closed: "Case has been closed after successful resolution and citizen confirmation"
    };

    flow.forEach((status) => {
      // Add realistic time gaps between status updates
      const hoursToAdd = status === "in-progress" ? Math.random() * 24 + 2 : // 2-26 hours
                        status === "resolved" ? Math.random() * 72 + 24 : // 24-96 hours
                        Math.random() * 24 + 6; // 6-30 hours for closed
      
      currentDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);
      
      updates.push({
        message: updateMessages[status] || `Status updated to ${status}`,
        status: status,
        updatedBy: assignedOfficer,
        timestamp: currentDate
      });
    });

    return updates;
  }

  generateFeedbackComment(sentiment) {
    const positiveComments = [
      "Excellent service! The issue was resolved quickly and professionally.",
      "Very satisfied with the response time and quality of work.",
      "Outstanding effort by the officer. Highly recommend this department.",
      "Perfect resolution! Thank you for the prompt and effective service.",
      "Great job by the team. The problem was fixed better than expected."
    ];

    const neutralComments = [
      "The issue was resolved satisfactorily. Good work overall.",
      "Decent service, though it took longer than expected.",
      "Problem solved adequately. Communication could be improved.",
      "Fair resolution. The process was smooth but slow.",
      "Acceptable service quality. Met basic expectations."
    ];

    const negativeComments = [
      "Issue resolved but took too long and required multiple follow-ups.",
      "Resolution was okay but the process was frustrating.",
      "Problem fixed eventually but communication was poor throughout.",
      "Satisfied with final outcome but disappointed with the delays.",
      "Issue resolved but service quality needs significant improvement."
    ];

    const comments = sentiment === "positive" ? positiveComments :
                    sentiment === "negative" ? negativeComments : neutralComments;
    
    return comments[Math.floor(Math.random() * comments.length)];
  }

  async generateDepartmentStats() {
    console.log("📊 Generating department statistics...");
    
    for (const department of this.createdDepartments) {
      await department.updateStatistics();
    }
    
    console.log("✅ Department statistics generated");
  }

  async createDemoLoginsFile() {
    console.log("📝 Creating demo logins file...");
    
    const demoData = {
      info: {
        title: "GovIntel Demo Login Credentials",
        description: "Use these credentials to test different user roles and features",
        created: new Date().toISOString(),
        note: "All passwords are for demo purposes only. In production, use secure passwords.",
        totalUsers: this.demoLogins.admins.length + this.demoLogins.officers.length + this.demoLogins.citizens.length,
        totalGrievances: this.createdGrievances.length
      },
      quickAccess: {
        admin: {
          email: "admin@govintel.gov",
          password: "admin123",
          role: "admin",
          features: ["User Management", "Analytics", "System Overview", "Delete Grievances", "Reassign Cases"]
        },
        sampleOfficer: {
          email: this.demoLogins.officers[0]?.email || "municipal.officer1@govintel.gov",
          password: "officer123",
          role: "officer",
          department: this.demoLogins.officers[0]?.department || "MUNICIPAL",
          features: ["Assigned Cases", "Status Updates", "AI Insights", "Case Management"]
        },
        sampleCitizen: {
          email: this.demoLogins.citizens[0]?.email || "rajesh.kumar@email.com",
          password: "citizen123",
          role: "citizen",
          features: ["Submit Complaints", "Track Grievances", "Provide Feedback", "View Status"]
        }
      },
      allLogins: {
        admins: this.demoLogins.admins,
        officers: this.demoLogins.officers,
        citizens: this.demoLogins.citizens
      },
      departments: this.createdDepartments.map(dept => ({
        name: dept.name,
        code: dept.code,
        description: dept.description,
        categories: dept.categories,
        officers: this.demoLogins.officers.filter(o => o.department === dept.code),
        contactInfo: dept.contactInfo
      })),
      statistics: {
        totalDepartments: this.createdDepartments.length,
        totalOfficers: this.createdOfficers.length,
        totalCitizens: this.createdUsers.length,
        totalGrievances: this.createdGrievances.length,
        grievancesByStatus: this.getGrievancesByStatus(),
        grievancesByCategory: this.getGrievancesByCategory(),
        grievancesByPriority: this.getGrievancesByPriority()
      }
    };

    const filePath = path.join(__dirname, "../demo-logins.json");
    fs.writeFileSync(filePath, JSON.stringify(demoData, null, 2));
    
    console.log(`✅ Demo logins file created at: ${filePath}`);
  }

  getGrievancesByStatus() {
    return this.createdGrievances.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {});
  }

  getGrievancesByCategory() {
    return this.createdGrievances.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {});
  }

  getGrievancesByPriority() {
    return this.createdGrievances.reduce((acc, g) => {
      acc[g.priority] = (acc[g.priority] || 0) + 1;
      return acc;
    }, {});
  }

  displaySummary() {
    console.log("\n" + "=".repeat(70));
    console.log("📊 COMPREHENSIVE SEEDING SUMMARY");
    console.log("=".repeat(70));
    
    console.log(`\n🏢 DEPARTMENTS (${this.createdDepartments.length}):`);
    this.createdDepartments.forEach(dept => {
      const deptOfficers = this.demoLogins.officers.filter(o => o.department === dept.code);
      console.log(`   • ${dept.name} (${dept.code}): ${deptOfficers.length} officers`);
    });
    
    console.log(`\n👥 USERS CREATED:`);
    console.log(`   • Admins: ${this.demoLogins.admins.length}`);
    console.log(`   • Officers: ${this.demoLogins.officers.length}`);
    console.log(`   • Citizens: ${this.demoLogins.citizens.length}`);
    console.log(`   • Total: ${this.demoLogins.admins.length + this.demoLogins.officers.length + this.demoLogins.citizens.length}`);
    
    console.log(`\n📋 GRIEVANCES CREATED: ${this.createdGrievances.length}`);
    
    // Status breakdown
    const statusCounts = this.getGrievancesByStatus();
    console.log(`\n   📊 Status Distribution:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = Math.round((count / this.createdGrievances.length) * 100);
      console.log(`   • ${status.padEnd(12)}: ${String(count).padStart(3)} (${percentage}%)`);
    });
    
    // Category breakdown
    const categoryCounts = this.getGrievancesByCategory();
    console.log(`\n   🏷️  Category Distribution:`);
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const percentage = Math.round((count / this.createdGrievances.length) * 100);
      console.log(`   • ${category.padEnd(15)}: ${String(count).padStart(3)} (${percentage}%)`);
    });

    // Priority breakdown
    const priorityCounts = this.getGrievancesByPriority();
    console.log(`\n   ⚡ Priority Distribution:`);
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      const percentage = Math.round((count / this.createdGrievances.length) * 100);
      console.log(`   • ${priority.padEnd(8)}: ${String(count).padStart(3)} (${percentage}%)`);
    });
    
    console.log(`\n🔑 DEMO LOGIN CREDENTIALS:`);
    console.log(`   🔴 Admin:    admin@govintel.gov / admin123`);
    console.log(`   🔵 Officer:  ${this.demoLogins.officers[0]?.email} / officer123`);
    console.log(`   🟢 Citizen:  ${this.demoLogins.citizens[0]?.email} / citizen123`);
    
    console.log(`\n📁 FILES CREATED:`);
    console.log(`   • Demo logins: backend/demo-logins.json`);
    console.log(`   • Contains all ${this.demoLogins.admins.length + this.demoLogins.officers.length + this.demoLogins.citizens.length} user credentials for testing`);
    
    console.log(`\n🎯 TESTING COVERAGE:`);
    console.log(`   ✅ Dashboard Analytics (all roles)`);
    console.log(`   ✅ Filtering & Search (status, category, priority)`);
    console.log(`   ✅ Status Tracking (all possible states)`);
    console.log(`   ✅ Officer Assignment & Workload`);
    console.log(`   ✅ AI Analysis & Sentiment Scoring`);
    console.log(`   ✅ Feedback & Rating System`);
    console.log(`   ✅ Department Statistics`);
    console.log(`   ✅ User Management (all roles)`);
    
    console.log("\n" + "=".repeat(70));
    console.log("🚀 Ready for comprehensive testing!");
    console.log("=".repeat(70));
  }
}

// Main seeding function
const seedComprehensiveData = async () => {
  const seeder = new ComprehensiveSeeder();
  
  try {
    await seeder.seedAll();
  } catch (error) {
    console.error("❌ Comprehensive seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedComprehensiveData();
}

module.exports = seedComprehensiveData;