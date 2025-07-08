// Enhanced AI Analysis utility with more sophisticated algorithms
const natural = require('natural')
const sentiment = require('sentiment')

// Initialize sentiment analyzer
const Sentiment = new sentiment()

// Initialize TF-IDF
const TfIdf = natural.TfIdf

class AIAnalysisEngine {
  
  constructor() {
    // Category keywords for classification
    this.categoryKeywords = {
      infrastructure: [
        'road', 'bridge', 'building', 'construction', 'repair', 'maintenance',
        'pothole', 'street', 'sidewalk', 'pavement', 'infrastructure', 'structure'
      ],
      sanitation: [
        'garbage', 'waste', 'trash', 'cleaning', 'dirty', 'smell', 'hygiene',
        'toilet', 'sewage', 'drain', 'sanitation', 'cleanliness', 'litter'
      ],
      water_supply: [
        'water', 'tap', 'pipe', 'leak', 'supply', 'pressure', 'quality',
        'contamination', 'shortage', 'pipeline', 'valve', 'meter'
      ],
      electricity: [
        'power', 'electricity', 'light', 'outage', 'blackout', 'voltage',
        'transformer', 'wire', 'pole', 'meter', 'bill', 'connection'
      ],
      transportation: [
        'bus', 'train', 'traffic', 'signal', 'parking', 'vehicle', 'transport',
        'route', 'schedule', 'fare', 'station', 'stop', 'congestion'
      ],
      healthcare: [
        'hospital', 'doctor', 'medicine', 'health', 'medical', 'clinic',
        'treatment', 'patient', 'emergency', 'ambulance', 'nurse', 'disease'
      ],
      education: [
        'school', 'teacher', 'student', 'education', 'class', 'exam',
        'book', 'fee', 'admission', 'college', 'university', 'learning'
      ],
      police: [
        'police', 'crime', 'theft', 'safety', 'security', 'law', 'order',
        'violence', 'harassment', 'complaint', 'officer', 'station'
      ]
    }

    // Urgency indicators
    this.urgencyKeywords = {
      urgent: [
        'urgent', 'emergency', 'immediate', 'critical', 'serious', 'danger',
        'life', 'death', 'accident', 'fire', 'flood', 'crisis'
      ],
      high: [
        'important', 'priority', 'soon', 'quickly', 'fast', 'asap',
        'problem', 'issue', 'concern', 'trouble', 'difficulty'
      ],
      medium: [
        'request', 'need', 'require', 'want', 'should', 'could',
        'improvement', 'better', 'fix', 'solve'
      ]
    }

    // Sentiment modifiers
    this.sentimentModifiers = {
      intensifiers: ['very', 'extremely', 'really', 'absolutely', 'completely'],
      negations: ['not', 'no', 'never', 'nothing', 'none', 'neither']
    }
  }

  /**
   * Comprehensive analysis of grievance text
   */
  async analyzeGrievance(title, description, category = null) {
    try {
      const fullText = `${title} ${description}`.toLowerCase()
      
      // Perform all analyses
      const [
        sentimentResult,
        urgencyResult,
        categoryResult,
        keywordsResult,
        confidenceResult
      ] = await Promise.all([
        this.analyzeSentiment(fullText),
        this.analyzeUrgency(fullText),
        this.classifyCategory(fullText, category),
        this.extractKeywords(fullText),
        this.calculateConfidence(fullText, category)
      ])

      // Suggest department based on classification
      const suggestedDepartment = this.suggestDepartment(categoryResult.category)

      return {
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        urgencyScore: urgencyResult.score,
        urgencyLevel: urgencyResult.level,
        category: categoryResult.category,
        categoryConfidence: categoryResult.confidence,
        keywords: keywordsResult,
        suggestedDepartment,
        confidence: confidenceResult,
        analysis: {
          textLength: fullText.length,
          wordCount: fullText.split(' ').length,
          hasUrgentKeywords: urgencyResult.hasUrgentKeywords,
          sentimentIntensity: sentimentResult.intensity
        }
      }
    } catch (error) {
      console.error("AI Analysis error:", error)
      return this.getDefaultAnalysis(category)
    }
  }

  /**
   * Enhanced sentiment analysis
   */
  async analyzeSentiment(text) {
    const result = Sentiment.analyze(text)
    
    // Normalize score to -1 to 1 range
    const normalizedScore = Math.max(-1, Math.min(1, result.score / 10))
    
    // Determine sentiment category
    let sentiment = 'neutral'
    let intensity = 'low'
    
    if (normalizedScore > 0.1) {
      sentiment = 'positive'
      intensity = normalizedScore > 0.5 ? 'high' : 'medium'
    } else if (normalizedScore < -0.1) {
      sentiment = 'negative'
      intensity = normalizedScore < -0.5 ? 'high' : 'medium'
    }

    return {
      sentiment,
      score: normalizedScore,
      intensity,
      comparative: result.comparative,
      positiveWords: result.positive,
      negativeWords: result.negative
    }
  }

  /**
   * Urgency analysis based on keywords and context
   */
  async analyzeUrgency(text) {
    let urgencyScore = 50 // Base score
    let urgencyLevel = 'medium'
    let hasUrgentKeywords = false

    // Check for urgency keywords
    for (const [level, keywords] of Object.entries(this.urgencyKeywords)) {
      const matchCount = keywords.filter(keyword => text.includes(keyword)).length
      
      if (matchCount > 0) {
        hasUrgentKeywords = true
        
        switch (level) {
          case 'urgent':
            urgencyScore += matchCount * 20
            break
          case 'high':
            urgencyScore += matchCount * 10
            break
          case 'medium':
            urgencyScore += matchCount * 5
            break
        }
      }
    }

    // Adjust based on sentiment
    const sentimentResult = Sentiment.analyze(text)
    if (sentimentResult.score < -3) {
      urgencyScore += 15 // Negative sentiment increases urgency
    }

    // Check for time-sensitive phrases
    const timeSensitive = [
      'today', 'now', 'immediately', 'right away', 'this morning',
      'tonight', 'this evening', 'before', 'deadline', 'expires'
    ]
    
    const timeMatches = timeSensitive.filter(phrase => text.includes(phrase)).length
    urgencyScore += timeMatches * 8

    // Normalize score
    urgencyScore = Math.min(100, Math.max(0, urgencyScore))

    // Determine urgency level
    if (urgencyScore >= 80) urgencyLevel = 'urgent'
    else if (urgencyScore >= 65) urgencyLevel = 'high'
    else if (urgencyScore >= 35) urgencyLevel = 'medium'
    else urgencyLevel = 'low'

    return {
      score: urgencyScore,
      level: urgencyLevel,
      hasUrgentKeywords
    }
  }

  /**
   * Category classification using keyword matching and TF-IDF
   */
  async classifyCategory(text, providedCategory = null) {
    if (providedCategory) {
      return {
        category: providedCategory,
        confidence: 1.0,
        method: 'provided'
      }
    }

    const categoryScores = {}
    
    // Calculate scores for each category
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0
      let matchedKeywords = []
      
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1
          matchedKeywords.push(keyword)
        }
      }
      
      // Normalize by category keyword count
      categoryScores[category] = {
        score: score / keywords.length,
        matches: matchedKeywords.length,
        keywords: matchedKeywords
      }
    }

    // Find best match
    const bestMatch = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b.score - a.score)[0]

    const category = bestMatch ? bestMatch[0] : 'other'
    const confidence = bestMatch ? Math.min(bestMatch[1].score * 2, 1) : 0.3

    return {
      category,
      confidence,
      method: 'keyword_matching',
      allScores: categoryScores
    }
  }

  /**
   * Extract important keywords using TF-IDF
   */
  async extractKeywords(text) {
    const tfidf = new TfIdf()
    tfidf.addDocument(text)
    
    const keywords = []
    const items = tfidf.listTerms(0)
    
    // Get top 10 keywords
    items.slice(0, 10).forEach(item => {
      if (item.term.length > 2 && !this.isStopWord(item.term)) {
        keywords.push({
          word: item.term,
          score: item.tfidf
        })
      }
    })

    return keywords.map(k => k.word)
  }

  /**
   * Calculate overall confidence in the analysis
   */
  async calculateConfidence(text, category) {
    let confidence = 0.5 // Base confidence

    // Text length factor
    const wordCount = text.split(' ').length
    if (wordCount > 10) confidence += 0.1
    if (wordCount > 50) confidence += 0.1
    if (wordCount > 100) confidence += 0.1

    // Category match factor
    if (category && this.categoryKeywords[category]) {
      const keywords = this.categoryKeywords[category]
      const matches = keywords.filter(keyword => text.includes(keyword)).length
      confidence += (matches / keywords.length) * 0.3
    }

    // Sentiment clarity factor
    const sentimentResult = Sentiment.analyze(text)
    if (Math.abs(sentimentResult.comparative) > 0.5) {
      confidence += 0.1
    }

    return Math.min(1, confidence)
  }

  /**
   * Suggest department based on category
   */
  suggestDepartment(category) {
    const categoryDepartmentMap = {
      infrastructure: 'municipal',
      sanitation: 'municipal',
      water_supply: 'municipal',
      electricity: 'municipal',
      transportation: 'transport',
      healthcare: 'health',
      education: 'education',
      police: 'police',
      other: 'municipal'
    }

    return categoryDepartmentMap[category] || 'municipal'
  }

  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = [
      'the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as',
      'was', 'with', 'for', 'his', 'he', 'that', 'in', 'it', 'of', 'be',
      'will', 'not', 'have', 'this', 'but', 'by', 'from', 'they', 'she',
      'or', 'an', 'had', 'been', 'has', 'her', 'can', 'all', 'were'
    ]
    return stopWords.includes(word.toLowerCase())
  }

  /**
   * Get default analysis when AI fails
   */
  getDefaultAnalysis(category = 'other') {
    return {
      sentiment: 'neutral',
      sentimentScore: 0,
      urgencyScore: 50,
      urgencyLevel: 'medium',
      category: category,
      categoryConfidence: 0.5,
      keywords: [],
      suggestedDepartment: this.suggestDepartment(category),
      confidence: 0.3,
      analysis: {
        textLength: 0,
        wordCount: 0,
        hasUrgentKeywords: false,
        sentimentIntensity: 'low'
      }
    }
  }

  /**
   * Batch analyze multiple grievances
   */
  async batchAnalyze(grievances) {
    const results = []
    
    for (const grievance of grievances) {
      const analysis = await this.analyzeGrievance(
        grievance.title,
        grievance.description,
        grievance.category
      )
      
      results.push({
        grievanceId: grievance._id,
        analysis
      })
    }

    return results
  }

  /**
   * Update grievance with AI analysis
   */
  async updateGrievanceWithAnalysis(grievanceId) {
    try {
      const Grievance = require('../models/Grievance')
      const grievance = await Grievance.findById(grievanceId)
      
      if (!grievance) {
        throw new Error('Grievance not found')
      }

      const analysis = await this.analyzeGrievance(
        grievance.title,
        grievance.description,
        grievance.category
      )

      // Update grievance with AI analysis
      grievance.aiAnalysis = {
        sentiment: analysis.sentiment,
        urgencyScore: analysis.urgencyScore,
        keywords: analysis.keywords,
        suggestedDepartment: analysis.suggestedDepartment,
        confidence: analysis.confidence
      }

      // Update priority based on urgency
      if (analysis.urgencyLevel === 'urgent') {
        grievance.priority = 'urgent'
      } else if (analysis.urgencyLevel === 'high') {
        grievance.priority = 'high'
      }

      await grievance.save()

      return {
        success: true,
        grievance,
        analysis
      }

    } catch (error) {
      console.error('Update grievance with analysis error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

module.exports = new AIAnalysisEngine()