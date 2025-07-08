const mongoose = require("mongoose")
const Department = require("../models/Department")
const User = require("../models/User")
require("dotenv").config()

const departments = [
  {
    name: "Municipal Corporation",
    code: "MUNICIPAL",
    description: "Handles infrastructure, sanitation, water supply, and general municipal services",
    categories: ["infrastructure", "sanitation", "water_supply", "electricity", "other"],
    contactInfo: {
      email: "municipal@city.gov",
      phone: "1234567899",
      address: {
        street: "City Hall, Main Street",
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
      email: "health@city.gov",
      phone: "1234567899",
      address: {
        street: "Health Secretariat, Medical Complex",
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
      email: "education@city.gov",
      phone: "1234567899",
      address: {
        street: "Education Bhawan, Academic Road",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110003"
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
      email: "transport@city.gov",
      phone: "1234567899",
      address: {
        street: "Transport Bhawan, Highway Circle",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110004"
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
      email: "police@city.gov",
      phone: "1234567899",
      address: {
        street: "Police Headquarters, Central District",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110005"
      }
    },
    workingHours: {
      start: "00:00",
      end: "23:59",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    }
  },
  {
    name: "Revenue Department",
    code: "REVENUE",
    description: "Manages taxation, revenue collection, and financial administration",
    categories: ["revenue"],
    contactInfo: {
      email: "revenue@city.gov",
      phone: "1234567899",
      address: {
        street: "Revenue Secretariat, Finance Complex",
        city: "New Delhi",
        state: "Delhi",
        zipCode: "110006"
      }
    },
    workingHours: {
      start: "10:00",
      end: "16:00",
      workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  }
]

const seedDepartments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB")

    // Clear existing departments
    await Department.deleteMany({})
    console.log("Cleared existing departments")

    // Create departments
    const createdDepartments = await Department.insertMany(departments)
    console.log(`Created ${createdDepartments.length} departments`)

    // Update existing officers with department codes
    const departmentMap = {
      municipal: "MUNICIPAL",
      health: "HEALTH",
      education: "EDUCATION",
      transport: "TRANSPORT",
      police: "POLICE",
      revenue: "REVENUE"
    }

    for (const [oldCode, newCode] of Object.entries(departmentMap)) {
      const result = await User.updateMany(
        { department: oldCode },
        { department: newCode }
      )
      console.log(`Updated ${result.modifiedCount} officers from ${oldCode} to ${newCode}`)
    }

    // Assign officers to departments
    for (const dept of createdDepartments) {
      const officers = await User.find({ 
        role: "officer", 
        department: dept.code 
      })
      
      if (officers.length > 0) {
        dept.officers = officers.map(officer => officer._id)
        // Set first officer as head (if any)
        if (officers.length > 0) {
          dept.head = officers[0]._id
        }
        await dept.save()
        console.log(`Assigned ${officers.length} officers to ${dept.name}`)
      }
    }

    console.log("✅ Department seeding completed successfully!")
    
    // Display summary
    console.log("\n📊 Department Summary:")
    for (const dept of createdDepartments) {
      console.log(`- ${dept.name} (${dept.code}): ${dept.categories.join(", ")}`)
    }

  } catch (error) {
    console.error("❌ Error seeding departments:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seeding
if (require.main === module) {
  seedDepartments()
}

module.exports = seedDepartments