// Rule-based insight analyzer - 100% GRATIS, tanpa AI API

const CATEGORY_RULES = {
  service: ['pelayanan', 'ramah', 'cepat', 'lama', 'staff', 'karyawan', 'kasir', 'pelayan'],
  product: ['kopi', 'makanan', 'minuman', 'rasa', 'enak', 'manis', 'pahit', 'segar'],
  ambiance: ['tempat', 'suasana', 'nyaman', 'bersih', 'kotor', 'ramai', 'dekorasi'],
  price: ['harga', 'mahal', 'murah', 'terjangkau', 'worth it'],
}

const SENTIMENT_KEYWORDS = {
  positive: ['enak', 'ramah', 'cepat', 'nyaman', 'bagus', 'mantap', 'recommend', 'best', 'puas'],
  negative: ['lama', 'mahal', 'kotor', 'busuk', 'buruk', 'jelek', 'kecewa', 'kurang'],
}

export function analyzeFeedback(feedbackList) {
  const insights = {
    satisfaction: 0,
    topComplaint: 'Belum ada data',
    topComplaintPercent: 0,
    favoriteProduct: 'Belum ada data',
    peakHour: 'Belum ada data',
    trend: '+0',
    categories: {
      service: { count: 0, percentage: 0 },
      product: { count: 0, percentage: 0 },
      ambiance: { count: 0, percentage: 0 },
      price: { count: 0, percentage: 0 },
    },
    sentiment: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    keyPhrases: [],
  }

  if (!feedbackList || feedbackList.length === 0) {
    return insights
  }

  const total = feedbackList.length
  const categoryCounts = { service: 0, product: 0, ambiance: 0, price: 0 }
  let positiveCount = 0
  let negativeCount = 0
  let neutralCount = 0

  const phraseCount = {}
  const stopWords = ['yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'saya', 'kami', 'anda', 'untuk', 'dengan', 'ada', 'juga']

  feedbackList.forEach((feedback) => {
    const text = (feedback.message || '').toLowerCase()
    const rating = feedback.rating || 0

    // Category analysis
    Object.entries(CATEGORY_RULES).forEach(([category, keywords]) => {
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          categoryCounts[category]++
        }
      })
    })

    // Sentiment analysis
    if (rating >= 4) {
      positiveCount++
    } else if (rating <= 2) {
      negativeCount++
    } else {
      neutralCount++
    }

    // Extract key phrases
    const words = text.split(/\s+/).filter((w) => w.length > 2 && !stopWords.includes(w))
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words[i] + ' ' + words[i + 1]
      phraseCount[phrase] = (phraseCount[phrase] || 0) + 1
    }
  })

  // Calculate percentages
  const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1
  Object.entries(categoryCounts).forEach(([key, value]) => {
    insights.categories[key] = {
      count: value,
      percentage: Math.round((value / totalCategories) * 100),
    }
  })

  // Sentiment
  insights.sentiment = {
    positive: Math.round((positiveCount / total) * 100),
    neutral: Math.round((neutralCount / total) * 100),
    negative: Math.round((negativeCount / total) * 100),
  }

  // Satisfaction
  insights.satisfaction = insights.sentiment.positive

  // Top complaint
  let topComplaint = 'Tidak ada keluhan'
  let topComplaintCount = 0
  const complaintKeywords = ['lama', 'mahal', 'kotor', 'busuk', 'buruk', 'jelek', 'kecewa', 'kurang']

  feedbackList.forEach((feedback) => {
    const text = (feedback.message || '').toLowerCase()
    complaintKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        const count = (text.match(new RegExp(keyword, 'g')) || []).length
        if (count > topComplaintCount) {
          topComplaint = keyword
          topComplaintCount = count
        }
      }
    })
  })

  insights.topComplaint = topComplaint.charAt(0).toUpperCase() + topComplaint.slice(1)
  insights.topComplaintPercent = topComplaintCount > 0 ? Math.round((topComplaintCount / total) * 100) : 0

  // Key phrases (top 5)
  insights.keyPhrases = Object.entries(phraseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, count }))

  return insights
}

export function getCategoryFromText(text) {
  const lowerText = (text || '').toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category
      }
    }
  }
  return 'general'
}

export function getSentimentFromText(text, rating) {
  if (rating >= 4) return 'positive'
  if (rating <= 2) return 'negative'

  const lowerText = (text || '').toLowerCase()
  for (const word of SENTIMENT_KEYWORDS.positive) {
    if (lowerText.includes(word)) return 'positive'
  }
  for (const word of SENTIMENT_KEYWORDS.negative) {
    if (lowerText.includes(word)) return 'negative'
  }
  return 'neutral'
}