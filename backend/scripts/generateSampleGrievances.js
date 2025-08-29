const mongoose = require("mongoose");
const Grievance = require("../models/Grievance");
const User = require("../models/User");
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

const generateRealisticGrievances = async () => {
  try {
    console.log("🌱 Generating realistic grievances...");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("📡 Connected to MongoDB");

    // Get all users
    const citizens = await User.find({ role: "citizen" });
    const officers = await User.find({ role: "officer" });
    
    if (citizens.length === 0) {
      throw new Error("No citizens found. Please run user seeding first.");
    }

    console.log(`Found ${citizens.length} citizens and ${officers.length} officers`);

    let totalCreated = 0;
    const statuses = ["pending", "assigned", "in_progress", "resolved", "closed"];
    
    // Create grievances for each category and template
    for (const [category, templates] of Object.entries(ENHANCED_GRIEVANCE_TEMPLATES)) {
      console.log(`Creating grievances for category: ${category}`);
      
      for (const template of templates) {
        // Create 2-3 grievances per template with different statuses
        const grievancesToCreate = Math.floor(Math.random() * 2) + 2; // 2-3 grievances
        
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
            department: getDepartmentByCategory(category).toUpperCase(),
            location: {
              address: getRandomAddress(),
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
              suggestedDepartment: getDepartmentByCategory(category),
              confidence: 0.75 + Math.random() * 0.25
            },
            isAnonymous: Math.random() > 0.8 // 20% anonymous
          };

          // Assign officer if not pending
          if (status !== "pending") {
            const departmentOfficers = officers.filter(o => 
              o.department === getDepartmentByCategory(category).toUpperCase()
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
                comment: getRandomFeedback(),
                submittedAt: new Date(resolutionDate.getTime() + 24 * 60 * 60 * 1000)
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

    console.log(`✅ Created ${totalCreated} realistic grievances`);
    
    // Display category breakdown
    const categoryStats = await Grievance.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgUrgency: { $avg: "$aiAnalysis.urgencyScore" }
        }
      }
    ]);
    
    console.log("\n📊 Category Breakdown:");
    categoryStats.forEach(stat => {
      console.log(`   • ${stat._id}: ${stat.count} grievances (avg urgency: ${Math.round(stat.avgUrgency)})`);
    });

  } catch (error) {
    console.error("❌ Error generating grievances:", error);
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
    other: "municipal"
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
    "741 Sunset Boulevard, C-Scheme, Jaipur"
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
    "Good resolution but the initial response time was disappointing."
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

// Run if called directly
if (require.main === module) {
  generateRealisticGrievances();
}

module.exports = generateRealisticGrievances;