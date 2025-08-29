const mongoose = require("mongoose");
const User = require("../models/User");
const Department = require("../models/Department");
const Grievance = require("../models/Grievance");
const AIAnalysisEngine = require("../utils/aiAnalysis");
require("dotenv").config();

class ComprehensiveSeeder {
  constructor() {
    this.departments = [
      {
        name: "Municipal Corporation",
        code: "MUNICIPAL",
        description: "Handles infrastructure, sanitation, water supply, and general municipal services",
        categories: ["infrastructure", "sanitation", "water_supply", "electricity", "other"],
        contactInfo: {
          email: "municipal@city.gov",
          phone: "+91-11-23456789",
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
        description: "Manages healthcare services, hospitals, and public health initiatives",
        categories: ["healthcare"],
        contactInfo: {
          email: "health@city.gov",
          phone: "+91-11-23456790",
          address: {
            street: "Health Secretariat, Medical Complex",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110002",
          },
        },
        workingHours: {
          start: "08:00",
          end: "20:00",
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        },
      },
      {
        name: "Education Department",
        code: "EDUCATION",
        description: "Oversees schools, educational institutions, and academic programs",
        categories: ["education"],
        contactInfo: {
          email: "education@city.gov",
          phone: "+91-11-23456791",
          address: {
            street: "Education Bhawan, Academic Road",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110003",
          },
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
        description: "Manages public transportation, traffic, and transport infrastructure",
        categories: ["transportation"],
        contactInfo: {
          email: "transport@city.gov",
          phone: "+91-11-23456792",
          address: {
            street: "Transport Bhawan, Highway Circle",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110004",
          },
        },
        workingHours: {
          start: "08:00",
          end: "18:00",
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        },
      },
      {
        name: "Police Department",
        code: "POLICE",
        description: "Handles law enforcement, public safety, and security matters",
        categories: ["police"],
        contactInfo: {
          email: "police@city.gov",
          phone: "+91-100",
          address: {
            street: "Police Headquarters, Central District",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110005",
          },
        },
        workingHours: {
          start: "00:00",
          end: "23:59",
          workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        },
      },
    ];

    this.users = {
      admin: {
        name: "System Administrator",
        email: "admin@govintel.gov",
        password: "admin123",
        role: "admin",
        phone: "+91-9999999999",
        isActive: true,
      },
      officers: [
        // Municipal Officers
        {
          name: "Rajesh Kumar Singh",
          email: "rajesh.singh@municipal.gov",
          password: "officer123",
          role: "officer",
          department: "MUNICIPAL",
          phone: "+91-9876543210",
          address: {
            street: "123 Officer Colony",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110001",
          },
        },
        {
          name: "Priya Sharma",
          email: "priya.sharma@municipal.gov",
          password: "officer123",
          role: "officer",
          department: "MUNICIPAL",
          phone: "+91-9876543211",
          address: {
            street: "456 Government Quarters",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110001",
          },
        },
        {
          name: "Amit Patel",
          email: "amit.patel@municipal.gov",
          password: "officer123",
          role: "officer",
          department: "MUNICIPAL",
          phone: "+91-9876543212",
          address: {
            street: "789 Civil Lines",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110001",
          },
        },
        // Health Officers
        {
          name: "Dr. Sunita Reddy",
          email: "sunita.reddy@health.gov",
          password: "officer123",
          role: "officer",
          department: "HEALTH",
          phone: "+91-9876543213",
          address: {
            street: "Medical Complex, Block A",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110002",
          },
        },
        {
          name: "Dr. Vikram Gupta",
          email: "vikram.gupta@health.gov",
          password: "officer123",
          role: "officer",
          department: "HEALTH",
          phone: "+91-9876543214",
          address: {
            street: "Health Secretariat",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110002",
          },
        },
        {
          name: "Dr. Meera Joshi",
          email: "meera.joshi@health.gov",
          password: "officer123",
          role: "officer",
          department: "HEALTH",
          phone: "+91-9876543215",
          address: {
            street: "Public Health Center",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110002",
          },
        },
        // Education Officers
        {
          name: "Prof. Ramesh Agarwal",
          email: "ramesh.agarwal@education.gov",
          password: "officer123",
          role: "officer",
          department: "EDUCATION",
          phone: "+91-9876543216",
          address: {
            street: "Education Bhawan",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110003",
          },
        },
        {
          name: "Kavita Desai",
          email: "kavita.desai@education.gov",
          password: "officer123",
          role: "officer",
          department: "EDUCATION",
          phone: "+91-9876543217",
          address: {
            street: "Academic Complex",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110003",
          },
        },
        {
          name: "Suresh Yadav",
          email: "suresh.yadav@education.gov",
          password: "officer123",
          role: "officer",
          department: "EDUCATION",
          phone: "+91-9876543218",
          address: {
            street: "School Board Office",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110003",
          },
        },
        // Transport Officers
        {
          name: "Ravi Malhotra",
          email: "ravi.malhotra@transport.gov",
          password: "officer123",
          role: "officer",
          department: "TRANSPORT",
          phone: "+91-9876543219",
          address: {
            street: "Transport Bhawan",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110004",
          },
        },
        {
          name: "Neha Kapoor",
          email: "neha.kapoor@transport.gov",
          password: "officer123",
          role: "officer",
          department: "TRANSPORT",
          phone: "+91-9876543220",
          address: {
            street: "Traffic Control Center",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110004",
          },
        },
        {
          name: "Deepak Verma",
          email: "deepak.verma@transport.gov",
          password: "officer123",
          role: "officer",
          department: "TRANSPORT",
          phone: "+91-9876543221",
          address: {
            street: "Highway Authority Office",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110004",
          },
        },
        // Police Officers
        {
          name: "Inspector Arjun Thakur",
          email: "arjun.thakur@police.gov",
          password: "officer123",
          role: "officer",
          department: "POLICE",
          phone: "+91-9876543222",
          address: {
            street: "Police Headquarters",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110005",
          },
        },
        {
          name: "Sub-Inspector Pooja Nair",
          email: "pooja.nair@police.gov",
          password: "officer123",
          role: "officer",
          department: "POLICE",
          phone: "+91-9876543223",
          address: {
            street: "Central Police Station",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110005",
          },
        },
        {
          name: "Constable Manoj Kumar",
          email: "manoj.kumar@police.gov",
          password: "officer123",
          role: "officer",
          department: "POLICE",
          phone: "+91-9876543224",
          address: {
            street: "District Police Office",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110005",
          },
        },
      ],
      citizens: [
        {
          name: "Anita Sharma",
          email: "anita.sharma@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543225",
          address: {
            street: "123 Residential Area",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110006",
          },
        },
        {
          name: "Rohit Gupta",
          email: "rohit.gupta@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543226",
          address: {
            street: "456 Housing Society",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110007",
          },
        },
        {
          name: "Sneha Patel",
          email: "sneha.patel@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543227",
          address: {
            street: "789 Apartment Complex",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110008",
          },
        },
        {
          name: "Vikash Singh",
          email: "vikash.singh@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543228",
          address: {
            street: "321 Colony Road",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110009",
          },
        },
        {
          name: "Ritu Agarwal",
          email: "ritu.agarwal@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543229",
          address: {
            street: "654 Sector 12",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110010",
          },
        },
        {
          name: "Manish Kumar",
          email: "manish.kumar@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543230",
          address: {
            street: "987 Block B",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110011",
          },
        },
        {
          name: "Deepika Reddy",
          email: "deepika.reddy@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543231",
          address: {
            street: "147 Green Park",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110012",
          },
        },
        {
          name: "Arjun Malhotra",
          email: "arjun.malhotra@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543232",
          address: {
            street: "258 Model Town",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110013",
          },
        },
        {
          name: "Kavya Joshi",
          email: "kavya.joshi@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543233",
          address: {
            street: "369 Lajpat Nagar",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110014",
          },
        },
        {
          name: "Sanjay Verma",
          email: "sanjay.verma@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543234",
          address: {
            street: "741 Karol Bagh",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110015",
          },
        },
        {
          name: "Pooja Desai",
          email: "pooja.desai@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543235",
          address: {
            street: "852 Connaught Place",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110016",
          },
        },
        {
          name: "Rahul Yadav",
          email: "rahul.yadav@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543236",
          address: {
            street: "963 Janakpuri",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110017",
          },
        },
        {
          name: "Nisha Kapoor",
          email: "nisha.kapoor@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543237",
          address: {
            street: "159 Rohini",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110018",
          },
        },
        {
          name: "Sunil Thakur",
          email: "sunil.thakur@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543238",
          address: {
            street: "357 Dwarka",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110019",
          },
        },
        {
          name: "Meera Nair",
          email: "meera.nair@email.com",
          password: "citizen123",
          role: "citizen",
          phone: "+91-9876543239",
          address: {
            street: "468 Vasant Kunj",
            city: "New Delhi",
            state: "Delhi",
            zipCode: "110020",
          },
        },
      ],
    };

    this.grievanceTemplates = {
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
        }
      ]
    };
  }

  // Helper method to get department by category
  getDepartmentByCategory(category) {
    const categoryDepartmentMap = {
      infrastructure: "MUNICIPAL",
      sanitation: "MUNICIPAL",
      water_supply: "MUNICIPAL",
      electricity: "MUNICIPAL",
      transportation: "TRANSPORT",
      healthcare: "HEALTH",
      education: "EDUCATION",
      police: "POLICE",
      other: "MUNICIPAL"
    };
    return categoryDepartmentMap[category] || "MUNICIPAL";
  }

  // Helper method to get random address
  getRandomAddress() {
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
      "741 Sunset Boulevard, C-Scheme, Jaipur"
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  // Helper method to get random feedback
  getRandomFeedback() {
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
      "Good resolution but the initial response time was disappointing."
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }

  // Helper method to generate status updates
  generateStatusUpdates(finalStatus, createdDate, assignedOfficer) {
    const updates = [];
    const statusFlow = {
      pending: [],
      assigned: ["assigned"],
      in_progress: ["assigned", "in_progress"],
      resolved: ["assigned", "in_progress", "resolved"],
      closed: ["assigned", "in_progress", "resolved", "closed"]
    };

    const flow = statusFlow[finalStatus] || [];
    let currentDate = new Date(createdDate);

    const updateMessages = {
      assigned: "Case has been assigned to a department officer for review and action",
      in_progress: "Officer has started working on the issue. Investigation and resolution in progress",
      resolved: "The reported issue has been successfully resolved. Please verify and provide feedback",
      closed: "Case has been closed after successful resolution and citizen confirmation"
    };

    flow.forEach((status) => {
      currentDate = new Date(currentDate.getTime() + (Math.random() * 48 + 12) * 60 * 60 * 1000); // 12-60 hours later
      
      updates.push({
        message: updateMessages[status] || `Status updated to ${status}`,
        status: status,
        updatedBy: assignedOfficer,
        timestamp: currentDate
      });
    });

    return updates;
  }

  async clearExistingData() {
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      Grievance.deleteMany({}),
      User.deleteMany({}),
      Department.deleteMany({})
    ]);
    console.log("✅ Existing data cleared");
  }

  async createDepartments() {
    console.log("🏢 Creating departments...");
    const createdDepartments = await Department.insertMany(this.departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);
    return createdDepartments;
  }

  async createUsers() {
    console.log("👥 Creating users...");
    
    // Create admin
    const admin = new User(this.users.admin);
    await admin.save();
    
    // Create officers
    const officers = [];
    for (const officerData of this.users.officers) {
      const officer = new User(officerData);
      await officer.save();
      officers.push(officer);
    }
    
    // Create citizens
    const citizens = [];
    for (const citizenData of this.users.citizens) {
      const citizen = new User(citizenData);
      await citizen.save();
      citizens.push(citizen);
    }

    console.log(`✅ Created 1 admin, ${officers.length} officers, ${citizens.length} citizens`);
    return { admin, officers, citizens };
  }

  async assignOfficersToDepartments(departments, officers) {
    console.log("🔗 Assigning officers to departments...");
    
    for (const department of departments) {
      const departmentOfficers = officers.filter(officer => officer.department === department.code);
      
      if (departmentOfficers.length > 0) {
        department.officers = departmentOfficers.map(officer => officer._id);
        department.head = departmentOfficers[0]._id; // First officer as head
        await department.save();
        console.log(`   • ${department.name}: ${departmentOfficers.length} officers`);
      }
    }
    
    console.log("✅ Officers assigned to departments");
  }

  async createGrievances(citizens, officers) {
    console.log("📋 Creating grievances with AI analysis...");
    
    let totalCreated = 0;
    const statuses = ["pending", "assigned", "in_progress", "resolved", "closed"];
    
    // Create grievances for each category and template
    for (const [category, templates] of Object.entries(this.grievanceTemplates)) {
      console.log(`  Creating grievances for category: ${category}`);
      
      for (const template of templates) {
        // Create 3-5 grievances per template with different statuses
        const grievancesToCreate = Math.floor(Math.random() * 3) + 3; // 3-5 grievances
        
        for (let i = 0; i < grievancesToCreate; i++) {
          const citizen = citizens[Math.floor(Math.random() * citizens.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Create date in the past (last 6 months)
          const createdDate = new Date();
          createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180));
          
          const grievanceData = {
            title: template.title,
            description: template.description,
            category: category,
            priority: template.priority,
            status: status,
            citizen: citizen._id,
            department: this.getDepartmentByCategory(category), // This will return uppercase values
            location: {
              address: this.getRandomAddress(),
              coordinates: {
                latitude: 28.6139 + (Math.random() - 0.5) * 0.2, // Delhi area
                longitude: 77.2090 + (Math.random() - 0.5) * 0.2
              },
              landmark: `Landmark ${totalCreated + 1}`
            },
            createdAt: createdDate,
            updatedAt: createdDate,
            aiAnalysis: {
              sentiment: template.sentiment,
              urgencyScore: template.urgencyScore + Math.floor(Math.random() * 10 - 5),
              keywords: template.keywords,
              suggestedDepartment: this.getDepartmentByCategory(category).toLowerCase(),
              confidence: 0.75 + Math.random() * 0.25
            },
            isAnonymous: Math.random() > 0.8 // 20% anonymous
          };

          // Assign officer if not pending
          if (status !== "pending") {
            const departmentOfficers = officers.filter(o => 
              o.department === this.getDepartmentByCategory(category)
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
            const resolutionHours = 12 + Math.floor(Math.random() * 168); // 12 hours to 7 days
            resolutionDate.setHours(resolutionDate.getHours() + resolutionHours);
            
            grievanceData.actualResolutionDate = resolutionDate;
            grievanceData.resolutionTime = resolutionHours;
            grievanceData.updatedAt = resolutionDate;
            
            // Add feedback for resolved cases (70% chance)
            if (status === "resolved" && Math.random() > 0.3) {
              grievanceData.feedback = {
                rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
                comment: this.getRandomFeedback(),
                submittedAt: new Date(resolutionDate.getTime() + 24 * 60 * 60 * 1000)
              };
            }
          }

          // Generate status updates
          grievanceData.updates = this.generateStatusUpdates(
            status, 
            createdDate, 
            grievanceData.assignedOfficer
          );

          try {
            const grievance = new Grievance(grievanceData);
            await grievance.save();
            totalCreated++;
          } catch (error) {
            console.error(`Error creating grievance: ${error.message}`);
            console.error("Grievance data:", grievanceData);
            throw error;
          }
        }
      }
    }

    console.log(`✅ Created ${totalCreated} realistic grievances`);
    return totalCreated;
  }

  async updateDepartmentStatistics(departments) {
    console.log("📊 Updating department statistics...");
    
    for (const department of departments) {
      await department.updateStatistics();
    }
    
    console.log("✅ Department statistics updated");
  }

  async generateSummaryReport() {
    console.log("\n📊 SEEDING SUMMARY REPORT");
    console.log("=" * 50);
    
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } }
        }
      }
    ]);
    
    console.log("\n👥 USER STATISTICS:");
    userStats.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count} total (${stat.active} active)`);
    });

    // Department statistics
    const deptStats = await Department.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "officers",
          foreignField: "_id",
          as: "officerDetails"
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          officerCount: { $size: "$officerDetails" },
          categories: 1
        }
      }
    ]);
    
    console.log("\n🏢 DEPARTMENT STATISTICS:");
    deptStats.forEach(dept => {
      console.log(`   • ${dept.name} (${dept.code}): ${dept.officerCount} officers`);
      console.log(`     Categories: ${dept.categories.join(", ")}`);
    });

    // Grievance statistics
    const grievanceStats = await Grievance.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byStatus: {
            $push: {
              status: "$status",
              count: 1
            }
          },
          byCategory: {
            $push: {
              category: "$category",
              count: 1
            }
          },
          byDepartment: {
            $push: {
              department: "$department",
              count: 1
            }
          },
          avgUrgency: { $avg: "$aiAnalysis.urgencyScore" },
          withFeedback: { $sum: { $cond: [{ $ne: ["$feedback.rating", null] }, 1, 0] } }
        }
      }
    ]);

    if (grievanceStats.length > 0) {
      const stats = grievanceStats[0];
      console.log("\n📋 GRIEVANCE STATISTICS:");
      console.log(`   • Total Grievances: ${stats.total}`);
      console.log(`   • Average Urgency Score: ${Math.round(stats.avgUrgency)}`);
      console.log(`   • With Feedback: ${stats.withFeedback}`);
    }

    // Category breakdown
    const categoryStats = await Grievance.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgUrgency: { $avg: "$aiAnalysis.urgencyScore" }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log("\n📊 CATEGORY BREAKDOWN:");
    categoryStats.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count} grievances (avg urgency: ${Math.round(stat.avgUrgency)})`);
    });

    // Status breakdown
    const statusStats = await Grievance.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log("\n📈 STATUS BREAKDOWN:");
    statusStats.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count} grievances`);
    });

    console.log("\n🎯 QUICK ACCESS CREDENTIALS:");
    console.log("   • Admin: admin@govintel.gov / admin123");
    console.log("   • Officer: rajesh.singh@municipal.gov / officer123");
    console.log("   • Citizen: anita.sharma@email.com / citizen123");
    console.log("   • Officer Passcode: OFFICER2024");
    
    console.log("\n" + "=" * 50);
    console.log("✅ COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY!");
  }

  async seedAll() {
    try {
      // Clear existing data
      await this.clearExistingData();
      
      // Create departments
      const departments = await this.createDepartments();
      
      // Create users
      const { admin, officers, citizens } = await this.createUsers();
      
      // Assign officers to departments
      await this.assignOfficersToDepartments(departments, officers);
      
      // Create grievances
      await this.createGrievances(citizens, officers);
      
      // Update department statistics
      await this.updateDepartmentStatistics(departments);
      
      // Generate summary report
      await this.generateSummaryReport();
      
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      throw error;
    }
  }
}

const seedComprehensiveData = async () => {
  try {
    console.log("🌱 Starting comprehensive data seeding...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("📡 Connected to MongoDB");

    // Create seeder instance and run
    const seeder = new ComprehensiveSeeder();
    await seeder.seedAll();

  } catch (error) {
    console.error("❌ Seeding process failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
};

// Run if called directly
if (require.main === module) {
  seedComprehensiveData()
    .then(() => {
      console.log("🎉 Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = seedComprehensiveData;