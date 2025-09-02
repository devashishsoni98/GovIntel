const mongoose = require("mongoose");
const User = require("../models/User");
const Grievance = require("../models/Grievance");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Enhanced grievance templates with realistic scenarios and AI analysis
const ENHANCED_GRIEVANCE_TEMPLATES = {
  infrastructure: [
    {
      title: "Major water pipe burst flooding residential area",
      description:
        "A major water pipeline has burst on Sector 12 main road, causing severe flooding in the residential area. Water has entered several ground floor homes and shops. The road is completely waterlogged making it impossible for vehicles to pass. Emergency repair is needed as residents are facing water shortage and property damage. The leak started 6 hours ago and is getting worse.",
      keywords: [
        "water",
        "pipe",
        "burst",
        "flooding",
        "emergency",
        "repair",
        "urgent",
      ],
      sentiment: "negative",
      urgencyScore: 95,
      priority: "urgent",
      suggestedDepartment: "municipal",
    },
    {
      title: "Dangerous cracks appearing in overhead bridge",
      description:
        "Visible cracks have appeared on the overhead bridge connecting Sector 8 to Sector 9. The cracks seem to be widening and there are concerns about the structural integrity of the bridge. Thousands of commuters use this bridge daily including school buses. We request immediate inspection by structural engineers and necessary safety measures.",
      keywords: [
        "bridge",
        "cracks",
        "dangerous",
        "structural",
        "safety",
        "inspection",
      ],
      sentiment: "negative",
      urgencyScore: 90,
      priority: "urgent",
      suggestedDepartment: "municipal",
    },
    {
      title: "Street renovation project causing business losses",
      description:
        "The ongoing street renovation project has been going on for 3 months without completion. Local businesses are suffering huge losses due to restricted access and dust pollution. While we appreciate infrastructure development, the project timeline needs to be expedited and better coordination with business owners is required.",
      keywords: [
        "street",
        "renovation",
        "business",
        "losses",
        "timeline",
        "coordination",
      ],
      sentiment: "neutral",
      urgencyScore: 55,
      priority: "medium",
      suggestedDepartment: "municipal",
    },
    {
      title: "Newly constructed park needs maintenance",
      description:
        "The newly constructed community park in Sector 5 is a great addition to our area. However, some of the playground equipment needs minor adjustments and the walking track has a few uneven patches. Overall, residents are very happy with the new facility and just need these small issues addressed.",
      keywords: [
        "park",
        "maintenance",
        "playground",
        "walking",
        "track",
        "community",
      ],
      sentiment: "positive",
      urgencyScore: 30,
      priority: "low",
      suggestedDepartment: "municipal",
    },
  ],
  sanitation: [
    {
      title: "Sewage overflow creating health emergency",
      description:
        "There is a major sewage overflow near the school area that has been going on for 2 days. The sewage water is flowing on the streets and creating a terrible smell. Children are falling sick and parents are worried about health risks. This is a health emergency that needs immediate attention from the sanitation department.",
      keywords: [
        "sewage",
        "overflow",
        "health",
        "emergency",
        "smell",
        "children",
        "sick",
      ],
      sentiment: "negative",
      urgencyScore: 92,
      priority: "urgent",
      suggestedDepartment: "municipal",
    },
    {
      title: "Irregular garbage collection affecting entire neighborhood",
      description:
        "Garbage collection in our neighborhood has become very irregular over the past month. Sometimes garbage is collected after 4-5 days, leading to overflowing bins and stray animals scattering waste. The irregular schedule is making it difficult for residents to plan waste disposal. We need a fixed collection schedule.",
      keywords: [
        "garbage",
        "collection",
        "irregular",
        "overflowing",
        "schedule",
        "waste",
      ],
      sentiment: "negative",
      urgencyScore: 70,
      priority: "high",
      suggestedDepartment: "municipal",
    },
    {
      title: "Public toilet facility completely unusable",
      description:
        "The public toilet facility at the bus stand is in terrible condition. The doors are broken, there's no water supply, no electricity, and it hasn't been cleaned in weeks. The facility is completely unusable and people are forced to use nearby areas inappropriately. Immediate renovation and regular maintenance is required.",
      keywords: [
        "toilet",
        "facility",
        "unusable",
        "broken",
        "renovation",
        "maintenance",
      ],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high",
      suggestedDepartment: "municipal",
    },
    {
      title: "Appreciation for improved cleanliness drive",
      description:
        "I want to appreciate the sanitation department for the recent cleanliness drive in our area. The streets are much cleaner now and the regular sweeping has made a significant difference. The new dustbins installed are also very helpful. Thank you for the excellent work and please continue this good service.",
      keywords: [
        "appreciation",
        "cleanliness",
        "drive",
        "streets",
        "sweeping",
        "dustbins",
      ],
      sentiment: "positive",
      urgencyScore: 20,
      priority: "low",
      suggestedDepartment: "municipal",
    },
  ],
  water_supply: [
    {
      title: "Complete water shortage for 5 days - emergency situation",
      description:
        "Our entire area has been without water supply for 5 consecutive days. Residents are buying water from private tankers at very high costs. Children, elderly, and sick people are suffering the most. Local shops have run out of bottled water. This is an emergency situation requiring immediate intervention and restoration of water supply.",
      keywords: [
        "water",
        "shortage",
        "emergency",
        "tankers",
        "suffering",
        "restoration",
      ],
      sentiment: "negative",
      urgencyScore: 98,
      priority: "urgent",
      suggestedDepartment: "municipal",
    },
    {
      title: "Contaminated water supply causing illness",
      description:
        "The water supplied to our area appears to be contaminated. Several residents have fallen ill with stomach problems and diarrhea after consuming the water. We suspect the water source or distribution system is compromised. Immediate water quality testing and treatment is required to prevent a health crisis.",
      keywords: [
        "contaminated",
        "water",
        "illness",
        "stomach",
        "diarrhea",
        "testing",
      ],
      sentiment: "negative",
      urgencyScore: 88,
      priority: "urgent",
      suggestedDepartment: "municipal",
    },
    {
      title: "Water pressure too low during peak hours",
      description:
        "Water pressure in our building drops to almost zero during peak morning hours (7-9 AM) and evening hours (6-8 PM). This makes it impossible to fill water tanks or use water for daily activities. The pressure is normal during off-peak hours. We need pressure regulation to ensure consistent supply.",
      keywords: ["water", "pressure", "low", "peak", "hours", "regulation"],
      sentiment: "neutral",
      urgencyScore: 60,
      priority: "medium",
      suggestedDepartment: "municipal",
    },
    {
      title: "New water connection working perfectly",
      description:
        "I recently got a new water connection installed and I'm very satisfied with the service. The installation was done professionally and on time. The water quality is good and pressure is adequate. Thank you to the water department for the efficient service. I would recommend this to other residents.",
      keywords: [
        "water",
        "connection",
        "satisfied",
        "installation",
        "quality",
        "efficient",
      ],
      sentiment: "positive",
      urgencyScore: 15,
      priority: "low",
      suggestedDepartment: "municipal",
    },
  ],
  electricity: [
    {
      title: "Power transformer explosion - area without electricity",
      description:
        "The main power transformer in our area exploded last night around 11 PM. The entire neighborhood of 200+ houses has been without electricity for over 12 hours. Food is getting spoiled, medical equipment is not working, and students can't study. This is an emergency requiring immediate transformer replacement.",
      keywords: [
        "transformer",
        "explosion",
        "electricity",
        "emergency",
        "replacement",
        "urgent",
      ],
      sentiment: "negative",
      urgencyScore: 95,
      priority: "urgent",
      suggestedDepartment: "municipal",
    },
    {
      title: "Frequent power cuts damaging electronic appliances",
      description:
        "Our area experiences sudden power cuts 8-10 times daily without any warning. These frequent fluctuations are damaging electronic appliances including computers, refrigerators, and air conditioners. Many residents have suffered financial losses due to damaged equipment. We need stable power supply and voltage regulation.",
      keywords: [
        "power",
        "cuts",
        "frequent",
        "appliances",
        "damage",
        "voltage",
      ],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high",
      suggestedDepartment: "municipal",
    },
    {
      title: "Electricity bill showing incorrect readings",
      description:
        "My electricity bill for this month shows consumption of 800 units which is impossible as I was out of town for 20 days. The meter reading seems incorrect or there might be a billing error. I request verification of the meter reading and correction of the bill. My average monthly consumption is usually around 200 units.",
      keywords: [
        "electricity",
        "bill",
        "incorrect",
        "meter",
        "reading",
        "verification",
      ],
      sentiment: "neutral",
      urgencyScore: 45,
      priority: "medium",
      suggestedDepartment: "municipal",
    },
    {
      title: "Excellent response to power outage complaint",
      description:
        "I want to thank the electricity department for their quick response to yesterday's power outage complaint. The technical team arrived within 2 hours and restored power efficiently. The staff was professional and explained the issue clearly. This kind of prompt service is highly appreciated by all residents.",
      keywords: [
        "excellent",
        "response",
        "power",
        "outage",
        "quick",
        "professional",
      ],
      sentiment: "positive",
      urgencyScore: 10,
      priority: "low",
      suggestedDepartment: "municipal",
    },
  ],
  transportation: [
    {
      title: "Bus accident due to poor road conditions",
      description:
        "A city bus met with an accident yesterday due to poor road conditions on Highway 24. Fortunately, no one was seriously injured, but several passengers sustained minor injuries. The road has multiple potholes and uneven surfaces that make it dangerous for public transport. Immediate road repair is essential to prevent future accidents.",
      keywords: [
        "bus",
        "accident",
        "road",
        "conditions",
        "potholes",
        "dangerous",
        "repair",
      ],
      sentiment: "negative",
      urgencyScore: 85,
      priority: "urgent",
      suggestedDepartment: "transport",
    },
    {
      title: "Traffic signal malfunction causing chaos at intersection",
      description:
        "The traffic signal at the busy intersection of Mall Road and Station Road has been malfunctioning for 3 days. All lights are blinking yellow causing confusion among drivers. Traffic police are trying to manage manually but it's insufficient during rush hours. Multiple minor accidents have occurred due to this issue.",
      keywords: [
        "traffic",
        "signal",
        "malfunction",
        "intersection",
        "chaos",
        "accidents",
      ],
      sentiment: "negative",
      urgencyScore: 80,
      priority: "high",
      suggestedDepartment: "transport",
    },
    {
      title: "Request for bus route extension to new housing society",
      description:
        "The new housing society in Sector 18 has over 500 families but no direct bus connectivity. Residents have to walk 1.5 km to reach the nearest bus stop. We request extension of Route 42 or introduction of a new route to serve this area. This will greatly benefit working professionals and students living here.",
      keywords: [
        "bus",
        "route",
        "extension",
        "housing",
        "society",
        "connectivity",
      ],
      sentiment: "neutral",
      urgencyScore: 50,
      priority: "medium",
      suggestedDepartment: "transport",
    },
    {
      title: "New metro station has improved connectivity significantly",
      description:
        "The newly opened metro station in our area has significantly improved connectivity to the city center. Travel time has reduced from 2 hours to 45 minutes. The station is well-maintained and staff is helpful. This infrastructure development has positively impacted property values and quality of life in our area.",
      keywords: [
        "metro",
        "station",
        "connectivity",
        "improved",
        "infrastructure",
        "positive",
      ],
      sentiment: "positive",
      urgencyScore: 15,
      priority: "low",
      suggestedDepartment: "transport",
    },
  ],
  healthcare: [
    {
      title:
        "Ambulance service failed to respond during heart attack emergency",
      description:
        "During a heart attack emergency at 2 AM last night, we called the ambulance service multiple times but no ambulance arrived for over 1 hour. We had to arrange private transport to rush the patient to hospital. Fortunately, the patient survived, but this delay could have been fatal. Emergency services must be more responsive.",
      keywords: [
        "ambulance",
        "emergency",
        "heart",
        "attack",
        "delay",
        "fatal",
        "responsive",
      ],
      sentiment: "negative",
      urgencyScore: 98,
      priority: "urgent",
      suggestedDepartment: "health",
    },
    {
      title: "Government hospital lacks basic medicines and equipment",
      description:
        "The government hospital in our area is facing severe shortage of basic medicines like paracetamol, antibiotics, and blood pressure medications. Even basic equipment like thermometers and blood pressure monitors are not available. Poor families who depend on government healthcare are suffering. Immediate restocking is required.",
      keywords: [
        "hospital",
        "shortage",
        "medicines",
        "equipment",
        "healthcare",
        "families",
      ],
      sentiment: "negative",
      urgencyScore: 85,
      priority: "urgent",
      suggestedDepartment: "health",
    },
    {
      title: "Vaccination drive needs better organization",
      description:
        "The recent vaccination drive at the community center was poorly organized with long queues and no proper crowd management. Elderly people had to wait for hours in the sun. While we appreciate the vaccination initiative, better planning and organization is needed for future drives to ensure smooth operations.",
      keywords: [
        "vaccination",
        "drive",
        "organization",
        "queues",
        "elderly",
        "planning",
      ],
      sentiment: "neutral",
      urgencyScore: 40,
      priority: "medium",
      suggestedDepartment: "health",
    },
    {
      title: "Excellent treatment received at government clinic",
      description:
        "I received excellent treatment at the government health clinic for my diabetes checkup. The doctor was knowledgeable and spent adequate time explaining the condition and treatment. The medicines were available and the staff was courteous. I'm very satisfied with the quality of healthcare provided.",
      keywords: [
        "excellent",
        "treatment",
        "clinic",
        "doctor",
        "satisfied",
        "healthcare",
      ],
      sentiment: "positive",
      urgencyScore: 10,
      priority: "low",
      suggestedDepartment: "health",
    },
  ],
  education: [
    {
      title: "School building collapse risk - children's safety at stake",
      description:
        "The government primary school building in our area is showing signs of structural damage with visible cracks in walls and ceiling. During recent rains, water leaked into classrooms. We are extremely concerned about children's safety and request immediate structural assessment and necessary repairs before any accident occurs.",
      keywords: [
        "school",
        "building",
        "collapse",
        "safety",
        "children",
        "structural",
        "urgent",
      ],
      sentiment: "negative",
      urgencyScore: 92,
      priority: "urgent",
      suggestedDepartment: "education",
    },
    {
      title: "Severe teacher shortage affecting education quality",
      description:
        "Our government high school has only 6 teachers for 15 classes and 450 students. Many subjects like science and mathematics don't have dedicated teachers. Students are suffering academically and parents are considering private schools. Urgent recruitment of qualified teachers is needed to maintain education standards.",
      keywords: [
        "teacher",
        "shortage",
        "education",
        "quality",
        "students",
        "recruitment",
      ],
      sentiment: "negative",
      urgencyScore: 78,
      priority: "high",
      suggestedDepartment: "education",
    },
    {
      title:
        "School lacks basic facilities like clean toilets and drinking water",
      description:
        "The government school in our village lacks basic facilities. There are no clean toilets for girls, no proper drinking water facility, and classrooms don't have adequate furniture. These conditions are affecting school attendance, especially of girl students. Basic infrastructure development is urgently needed.",
      keywords: [
        "school",
        "facilities",
        "toilets",
        "water",
        "furniture",
        "attendance",
      ],
      sentiment: "negative",
      urgencyScore: 70,
      priority: "high",
      suggestedDepartment: "education",
    },
    {
      title: "Appreciation for new computer lab installation",
      description:
        "We want to thank the education department for installing a new computer lab in our government school. The 25 new computers with internet connectivity have opened up new learning opportunities for our children. The teachers have also been trained well. This initiative will help bridge the digital divide.",
      keywords: [
        "appreciation",
        "computer",
        "lab",
        "installation",
        "learning",
        "digital",
      ],
      sentiment: "positive",
      urgencyScore: 20,
      priority: "low",
      suggestedDepartment: "education",
    },
  ],
  police: [
    {
      title: "Gang violence incident requires immediate police action",
      description:
        "There was a violent clash between two groups in our area last night resulting in injuries to 3 people. The situation is still tense and residents are afraid to come out of their homes. We need immediate police deployment and patrolling to maintain law and order. The injured have been hospitalized but the perpetrators are still at large.",
      keywords: [
        "gang",
        "violence",
        "clash",
        "injuries",
        "police",
        "deployment",
        "urgent",
      ],
      sentiment: "negative",
      urgencyScore: 95,
      priority: "urgent",
      suggestedDepartment: "police",
    },
    {
      title: "Chain snatching incidents increasing in evening hours",
      description:
        "There have been 5 chain snatching incidents in our area in the past 2 weeks, all occurring between 7-9 PM. Women are afraid to go out during evening hours. The incidents are happening near the market area and bus stops. We request increased police patrolling during these hours and installation of CCTV cameras.",
      keywords: [
        "chain",
        "snatching",
        "incidents",
        "evening",
        "women",
        "patrolling",
        "CCTV",
      ],
      sentiment: "negative",
      urgencyScore: 75,
      priority: "high",
      suggestedDepartment: "police",
    },
    {
      title: "Noise pollution from illegal bars disturbing residents",
      description:
        "Several illegal bars in our residential area operate till late night with loud music and create noise pollution. Despite multiple complaints, no action has been taken. Residents including children and elderly are unable to sleep properly. We request strict action against these illegal establishments.",
      keywords: [
        "noise",
        "pollution",
        "illegal",
        "bars",
        "music",
        "residents",
        "action",
      ],
      sentiment: "negative",
      urgencyScore: 65,
      priority: "medium",
      suggestedDepartment: "police",
    },
    {
      title: "Quick police response prevented major incident",
      description:
        "I want to appreciate the quick response of the local police station yesterday. When I called about suspicious activity near my house, a patrol team arrived within 10 minutes and handled the situation professionally. Their prompt action prevented what could have been a serious incident. Excellent work by the police team.",
      keywords: [
        "police",
        "response",
        "quick",
        "suspicious",
        "professional",
        "excellent",
      ],
      sentiment: "positive",
      urgencyScore: 15,
      priority: "low",
      suggestedDepartment: "police",
    },
  ],
};

const seedComprehensiveData = async () => {
  try {
    console.log("🌱 Starting comprehensive data seeding...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("📡 Connected to MongoDB");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Grievance.deleteMany({}),
      Department.deleteMany({}),
    ]);

    // Create departments first
    console.log("🏢 Creating departments...");
    const departments = [
      {
        name: "Municipal Corporation",
        code: "MUNICIPAL",
        description:
          "Handles infrastructure, sanitation, water supply, and general municipal services",
        categories: [
          "infrastructure",
          "sanitation",
          "water_supply",
          "electricity",
          "other",
        ],
        contactInfo: {
          email: "municipal@city.gov",
          phone: "1234567899",
          address: {
            street: "City Hall, Main Street",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110001",
          },
        },
        workingHours: {
          start: "09:00",
          end: "17:00",
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      },
      {
        name: "Health Department",
        code: "HEALTH",
        description:
          "Manages healthcare services, hospitals, and public health initiatives",
        categories: ["healthcare"],
        contactInfo: {
          email: "health@city.gov",
          phone: "1234567899",
        },
        workingHours: {
          start: "08:00",
          end: "20:00",
          workingDays: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
        },
      },
      {
        name: "Education Department",
        code: "EDUCATION",
        description:
          "Oversees schools, educational institutions, and academic programs",
        categories: ["education"],
        contactInfo: {
          email: "education@city.gov",
          phone: "1234567899",
        },
        workingHours: {
          start: "09:00",
          end: "17:00",
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      },
      {
        name: "Transport Department",
        code: "TRANSPORT",
        description:
          "Manages public transportation, traffic, and transport infrastructure",
        categories: ["transportation"],
        contactInfo: {
          email: "transport@city.gov",
          phone: "1234567899",
        },
        workingHours: {
          start: "08:00",
          end: "18:00",
          workingDays: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
        },
      },
      {
        name: "Police Department",
        code: "POLICE",
        description:
          "Handles law enforcement, public safety, and security matters",
        categories: ["police"],
        contactInfo: {
          email: "police@city.gov",
          phone: "1234567899",
        },
        workingHours: {
          start: "00:00",
          end: "23:59",
          workingDays: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      },
    ];

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);

    // Create admin user
    console.log("👑 Creating admin user...");
    const admin = new User({
      name: "System Administrator",
      email: "admin@gmail.com",
      password: "123456",
      role: "admin",
      phone: "+919999999999",
      isActive: true,
    });
    await admin.save();
    console.log("✅ Admin user created");

    // Create citizens
    console.log("👥 Creating citizens...");
    const citizenData = [
      {
        name: "Anita Sharma",
        email: "anita.sharma@email.com",
        phone: "9876543210",
      },
      {
        name: "Rohit Gupta",
        email: "rohit.gupta@email.com",
        phone: "9876543211",
      },
      {
        name: "Sneha Patel",
        email: "sneha.patel@email.com",
        phone: "9876543212",
      },
      {
        name: "Vikash Singh",
        email: "vikash.singh@email.com",
        phone: "9876543213",
      },
      {
        name: "Ritu Agarwal",
        email: "ritu.agarwal@email.com",
        phone: "9876543214",
      },
      {
        name: "Manish Kumar",
        email: "manish.kumar@email.com",
        phone: "9876543215",
      },
      {
        name: "Deepika Reddy",
        email: "deepika.reddy@email.com",
        phone: "9876543216",
      },
      {
        name: "Arjun Malhotra",
        email: "arjun.malhotra@email.com",
        phone: "9876543217",
      },
      {
        name: "Kavya Joshi",
        email: "kavya.joshi@email.com",
        phone: "9876543218",
      },
      {
        name: "Sanjay Verma",
        email: "sanjay.verma@email.com",
        phone: "9876543219",
      },
    ];

    const citizens = [];
    for (const citizenInfo of citizenData) {
      const citizen = new User({
        ...citizenInfo,
        password: "citizen123",
        role: "citizen",
        isActive: true,
      });
      await citizen.save();
      citizens.push(citizen);
    }
    console.log(`✅ Created ${citizens.length} citizens`);

    // Create officers
    console.log("👮 Creating officers...");
    const officerData = [
      {
        name: "Rajesh Kumar Singh",
        email: "rajesh.singh@municipal.gov",
        department: "MUNICIPAL",
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@municipal.gov",
        department: "MUNICIPAL",
      },
      {
        name: "Amit Patel",
        email: "amit.patel@municipal.gov",
        department: "MUNICIPAL",
      },
      {
        name: "Dr. Sunita Reddy",
        email: "sunita.reddy@health.gov",
        department: "HEALTH",
      },
      {
        name: "Dr. Vikram Gupta",
        email: "vikram.gupta@health.gov",
        department: "HEALTH",
      },
      {
        name: "Prof. Ramesh Agarwal",
        email: "ramesh.agarwal@education.gov",
        department: "EDUCATION",
      },
      {
        name: "Kavita Desai",
        email: "kavita.desai@education.gov",
        department: "EDUCATION",
      },
      {
        name: "Ravi Malhotra",
        email: "ravi.malhotra@transport.gov",
        department: "TRANSPORT",
      },
      {
        name: "Neha Kapoor",
        email: "neha.kapoor@transport.gov",
        department: "TRANSPORT",
      },
      {
        name: "Inspector Arjun Thakur",
        email: "arjun.thakur@police.gov",
        department: "POLICE",
      },
      {
        name: "Sub-Inspector Pooja Nair",
        email: "pooja.nair@police.gov",
        department: "POLICE",
      },
    ];

    const officers = [];
    for (const officerInfo of officerData) {
      const officer = new User({
        ...officerInfo,
        password: "officer123",
        role: "officer",
        phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        isActive: true,
      });
      await officer.save();
      officers.push(officer);
    }
    console.log(`✅ Created ${officers.length} officers`);

    // Update departments with officers
    for (const dept of createdDepartments) {
      const deptOfficers = officers.filter((o) => o.department === dept.code);
      if (deptOfficers.length > 0) {
        dept.officers = deptOfficers.map((o) => o._id);
        dept.head = deptOfficers[0]._id;
        await dept.save();
      }
    }

    // Create grievances with proper AI analysis
    console.log("📝 Creating grievances with AI analysis...");
    let totalCreated = 0;
    const statuses = [
      "pending",
      "assigned",
      "in_progress",
      "resolved",
      "closed",
    ];

    for (const [category, templates] of Object.entries(
      ENHANCED_GRIEVANCE_TEMPLATES
    )) {
      console.log(`Creating grievances for category: ${category}`);

      for (const template of templates) {
        // Create 3-4 grievances per template
        const grievancesToCreate = Math.floor(Math.random() * 2) + 3;

        for (let i = 0; i < grievancesToCreate; i++) {
          const citizen = citizens[Math.floor(Math.random() * citizens.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];

          // Create date in the past (last 6 months)
          const createdDate = new Date();
          createdDate.setDate(
            createdDate.getDate() - Math.floor(Math.random() * 180)
          );

          const grievanceData = {
            title: template.title,
            description: template.description,
            category: category,
            priority: template.priority,
            status: status,
            citizen: citizen._id,
            department: getDepartmentByCategory(category).toUpperCase(),
            location: {
              address: getRandomAddress(),
              coordinates: {
                latitude: 28.6139 + (Math.random() - 0.5) * 0.2,
                longitude: 77.209 + (Math.random() - 0.5) * 0.2,
              },
              landmark: `Landmark ${totalCreated + 1}`,
            },
            createdAt: createdDate,
            updatedAt: createdDate,
            // Enhanced AI analysis data
            analysisData: {
              sentiment: template.sentiment,
              urgencyScore: Math.min(
                99,
                Math.max(
                  0,
                  template.urgencyScore + Math.floor(Math.random() * 10 - 5)
                )
              ),
              keywords: template.keywords,
              suggestedDepartment: template.suggestedDepartment,
              confidence: 0.75 + Math.random() * 0.25,
            },
            isAnonymous: Math.random() > 0.8,
          };

          // Assign officer if not pending
          if (status !== "pending") {
            const departmentOfficers = officers.filter(
              (o) =>
                o.department === getDepartmentByCategory(category).toUpperCase()
            );
            if (departmentOfficers.length > 0) {
              grievanceData.assignedOfficer =
                departmentOfficers[
                  Math.floor(Math.random() * departmentOfficers.length)
                ]._id;
            }
          }

          // Add resolution data if resolved/closed
          if (status === "resolved" || status === "closed") {
            const resolutionDate = new Date(createdDate);
            const resolutionHours = 12 + Math.floor(Math.random() * 168);
            resolutionDate.setHours(
              resolutionDate.getHours() + resolutionHours
            );

            grievanceData.actualResolutionDate = resolutionDate;
            grievanceData.resolutionTime = resolutionHours;
            grievanceData.updatedAt = resolutionDate;

            // Add feedback for resolved cases (70% chance)
            if (status === "resolved" && Math.random() > 0.3) {
              grievanceData.feedback = {
                rating: Math.floor(Math.random() * 3) + 3,
                comment: getRandomFeedback(),
                submittedAt: new Date(
                  resolutionDate.getTime() + 24 * 60 * 60 * 1000
                ),
              };
            }
          }

          // Generate status updates
          grievanceData.updates = generateStatusUpdates(
            status,
            createdDate,
            grievanceData.assignedOfficer
          );

          const grievance = new Grievance(grievanceData);
          await grievance.save();
          totalCreated++;
        }
      }
    }

    console.log(`✅ Created ${totalCreated} grievances with AI analysis`);

    // Display summary
    const summary = await Promise.all([
      User.countDocuments({ role: "citizen" }),
      User.countDocuments({ role: "officer" }),
      User.countDocuments({ role: "admin" }),
      Grievance.countDocuments(),
      Department.countDocuments(),
    ]);

    console.log("\n📊 Seeding Summary:");
    console.log(`   • Citizens: ${summary[0]}`);
    console.log(`   • Officers: ${summary[1]}`);
    console.log(`   • Admins: ${summary[2]}`);
    console.log(`   • Grievances: ${summary[3]}`);
    console.log(`   • Departments: ${summary[4]}`);

    // Display category breakdown
    const categoryStats = await Grievance.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgUrgency: { $avg: "$analysisData.urgencyScore" },
        },
      },
    ]);

    console.log("\n📈 Category Breakdown:");
    categoryStats.forEach((stat) => {
      const avgUrgency = Math.min(Math.round(stat.avgUrgency), 99); // ensures below 100
      console.log(
        `   • ${stat._id}: ${stat.count} grievances (avg urgency: ${avgUrgency})`
      );
    });

    // Display officer assignments
    const officerStats = await Grievance.aggregate([
      {
        $match: { assignedOfficer: { $exists: true } },
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedOfficer",
          foreignField: "_id",
          as: "officer",
        },
      },
      {
        $group: {
          _id: "$assignedOfficer",
          count: { $sum: 1 },
          officerName: { $first: "$officer.name" },
        },
      },
    ]);

    console.log("\n👮 Officer Assignments:");
    officerStats.forEach((stat) => {
      console.log(`   • ${stat.officerName}: ${stat.count} assigned cases`);
    });

    console.log("\n🎉 Comprehensive seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during comprehensive seeding:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
};

// Helper functions
function getDepartmentByCategory(category) {
  const categoryDepartmentMap = {
    infrastructure: "municipal",
    sanitation: "municipal",
    water_supply: "municipal",
    electricity: "municipal",
    transportation: "transport",
    healthcare: "health",
    education: "education",
    police: "police",
    other: "municipal",
  };
  return (categoryDepartmentMap[category] || "municipal").toUpperCase();
}

function getRandomAddress() {
  const addresses = [
    "123 Main Street, Sector 12, New Delhi",
    "456 Park Avenue, Block A, Mumbai",
    "789 Garden Road, Whitefield, Bangalore",
    "321 Lake View, T. Nagar, Chennai",
    "654 Hill Station, Koregaon Park, Pune",
    "987 River Side, Banjara Hills, Hyderabad",
    "147 Market Square, Salt Lake, Kolkata",
    "258 Tech Park, Cyber City, Gurgaon",
    "369 Green Valley, Sector 62, Noida",
    "741 Sunset Boulevard, C-Scheme, Jaipur",
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}

function getRandomFeedback() {
  const feedbacks = [
    "Very satisfied with the resolution. The officer was professional and efficient.",
    "Good service overall, though it took longer than expected to resolve.",
    "Excellent work by the department. The issue was handled promptly and effectively.",
    "The resolution was satisfactory. Communication could have been better during the process.",
    "Outstanding service! The officer went above and beyond to solve the problem.",
    "Decent resolution but the process was quite slow. Room for improvement.",
    "Very happy with the outcome. The department showed great responsiveness.",
    "The issue was resolved well but I had to follow up multiple times.",
    "Exceptional service quality. This is how government services should work.",
    "Good resolution but the initial response time was disappointing.",
  ];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}

function generateStatusUpdates(finalStatus, createdDate, assignedOfficer) {
  const updates = [];
  const statusFlow = {
    pending: [],
    assigned: ["assigned"],
    in_progress: ["assigned", "in_progress"],
    resolved: ["assigned", "in_progress", "resolved"],
    closed: ["assigned", "in_progress", "resolved", "closed"],
  };

  const flow = statusFlow[finalStatus] || [];
  let currentDate = new Date(createdDate);

  const updateMessages = {
    assigned:
      "Case has been assigned to a department officer for review and action",
    in_progress:
      "Officer has started working on the issue. Investigation and resolution in progress",
    resolved:
      "The reported issue has been successfully resolved. Please verify and provide feedback",
    closed:
      "Case has been closed after successful resolution and citizen confirmation",
  };

  flow.forEach((status) => {
    currentDate = new Date(
      currentDate.getTime() + (Math.random() * 48 + 12) * 60 * 60 * 1000
    );

    updates.push({
      message: updateMessages[status] || `Status updated to ${status}`,
      status: status,
      updatedBy: assignedOfficer,
      timestamp: currentDate,
    });
  });

  return updates;
}

// Run if called directly
if (require.main === module) {
  seedComprehensiveData();
}

module.exports = seedComprehensiveData;
