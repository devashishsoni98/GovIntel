// Mock AI Analysis utility
// In production, this would integrate with actual AI services like OpenAI, Google AI, etc.

const analyzeGrievanceWithAI = async (title, description, category) => {
    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
  
      // Mock sentiment analysis
      const sentimentKeywords = {
        negative: ["angry", "frustrated", "terrible", "awful", "horrible", "disgusted", "outraged"],
        positive: ["good", "excellent", "satisfied", "happy", "pleased", "grateful"],
        neutral: [],
      }
  
      const text = `${title} ${description}`.toLowerCase()
      let sentiment = "neutral"
      let urgencyScore = 50
  
      // Check for negative sentiment
      if (sentimentKeywords.negative.some((word) => text.includes(word))) {
        sentiment = "negative"
        urgencyScore += 20
      }
      // Check for positive sentiment
      else if (sentimentKeywords.positive.some((word) => text.includes(word))) {
        sentiment = "positive"
        urgencyScore -= 10
      }
  
      // Urgency keywords
      const urgentKeywords = ["urgent", "emergency", "immediate", "critical", "serious", "danger"]
      if (urgentKeywords.some((word) => text.includes(word))) {
        urgencyScore += 30
      }
  
      // Category-based urgency adjustment
      const categoryUrgency = {
        healthcare: 20,
        police: 25,
        water_supply: 15,
        electricity: 15,
        sanitation: 10,
        infrastructure: 5,
        transportation: 5,
        education: 0,
        other: 0,
      }
  
      urgencyScore += categoryUrgency[category] || 0
  
      // Ensure urgency score is within bounds
      urgencyScore = Math.min(100, Math.max(0, urgencyScore))
  
      // Extract keywords (simple implementation)
      const keywords = extractKeywords(text)
  
      // Suggest department based on keywords and category
      const suggestedDepartment = suggestDepartment(text, category)
  
      // Calculate confidence based on keyword matches
      const confidence = calculateConfidence(text, category, keywords)
  
      return {
        sentiment,
        urgencyScore,
        keywords,
        suggestedDepartment,
        confidence,
      }
    } catch (error) {
      console.error("AI Analysis error:", error)
  
      // Return default analysis if AI fails
      return {
        sentiment: "neutral",
        urgencyScore: 50,
        keywords: [],
        suggestedDepartment: mapCategoryToDepartment(category),
        confidence: 0.5,
      }
    }
  }
  
  const extractKeywords = (text) => {
    // Simple keyword extraction
    const commonWords = [
      "the",
      "is",
      "at",
      "which",
      "on",
      "and",
      "a",
      "to",
      "are",
      "as",
      "was",
      "with",
      "for",
      "his",
      "he",
      "that",
      "in",
      "it",
      "of",
      "be",
      "will",
      "not",
      "have",
      "this",
      "but",
      "by",
      "from",
      "they",
      "she",
      "or",
      "an",
      "had",
      "been",
      "has",
      "her",
      "can",
      "all",
      "were",
      "when",
      "we",
      "there",
      "each",
      "do",
      "their",
      "time",
      "if",
      "up",
      "out",
      "many",
      "then",
      "them",
      "these",
      "so",
      "some",
      "would",
      "into",
      "him",
      "could",
      "two",
      "more",
      "very",
      "what",
      "know",
      "just",
      "first",
      "get",
      "over",
      "think",
      "also",
      "your",
      "work",
      "life",
      "only",
      "new",
      "years",
      "way",
      "may",
      "say",
      "come",
      "its",
      "now",
      "most",
      "such",
      "here",
      "take",
      "than",
      "them",
      "well",
      "see",
    ]
  
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word))
  
    // Count word frequency
    const wordCount = {}
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
  
    // Return top 10 keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }
  
  const suggestDepartment = (text, category) => {
    const departmentKeywords = {
      municipal: ["road", "street", "garbage", "waste", "water", "drain", "sewer", "park", "building"],
      health: ["hospital", "doctor", "medicine", "health", "medical", "clinic", "disease"],
      education: ["school", "teacher", "student", "education", "class", "exam"],
      transport: ["bus", "train", "traffic", "vehicle", "transport", "road"],
      police: ["police", "crime", "theft", "safety", "security", "law"],
      revenue: ["tax", "revenue", "payment", "bill", "fee"],
    }
  
    let maxScore = 0
    let suggestedDept = mapCategoryToDepartment(category)
  
    Object.entries(departmentKeywords).forEach(([dept, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0)
      }, 0)
  
      if (score > maxScore) {
        maxScore = score
        suggestedDept = dept
      }
    })
  
    return suggestedDept
  }
  
  const calculateConfidence = (text, category, keywords) => {
    let confidence = 0.5 // Base confidence
  
    // Increase confidence based on text length
    if (text.length > 100) confidence += 0.1
    if (text.length > 300) confidence += 0.1
  
    // Increase confidence based on keywords found
    confidence += Math.min(0.2, keywords.length * 0.02)
  
    // Category-specific confidence
    const categoryConfidence = {
      healthcare: 0.8,
      police: 0.8,
      water_supply: 0.7,
      electricity: 0.7,
      sanitation: 0.6,
      infrastructure: 0.6,
      transportation: 0.6,
      education: 0.5,
      other: 0.3,
    }
  
    confidence = Math.max(confidence, categoryConfidence[category] || 0.5)
  
    return Math.min(1, confidence)
  }
  
  const mapCategoryToDepartment = (category) => {
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
    }
  
    return categoryDepartmentMap[category] || "municipal"
  }
  
  module.exports = {
    analyzeGrievanceWithAI,
  }
  