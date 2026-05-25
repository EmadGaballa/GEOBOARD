import { apiClient } from '../apiClient'
import { NewsArticle } from '../types'

// ======================================================
// API SERVICE: NEWS
// ======================================================

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '9c0ebda7e88b4576b2261478d8b8f93e'
const NEWS_API_BASE = 'https://newsapi.org/v2'

export const fetchNewsData = async (
  category: string = 'general',
  country: string = 'us',
  pageSize: number = 12
): Promise<NewsArticle[]> => {
  try {
    const response = await apiClient.get<any>(
      `${NEWS_API_BASE}/top-headlines?category=${category}&country=${country}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
    )

    if (response.status === 'ok' && response.articles) {
      return response.articles.map((article: any, index: number) => ({
        id: `${article.url}-${index}-${Date.now()}`,
        title: article.title,
        description: article.description || 'No description available',
        image: article.urlToImage || 'https://via.placeholder.com/400x300?text=News',
        category,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt || new Date().toISOString(),
        url: article.url,
        author: article.author,
        content: article.content,
      }))
    }

    return getMockNewsData(category)
  } catch (error) {
    console.error('Error fetching news:', error)
    return getMockNewsData(category)
  }
}

export const searchNews = async (
  query: string,
  pageSize: number = 12
): Promise<NewsArticle[]> => {
  try {
    const response = await apiClient.get<any>(
      `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    )

    if (response.status === 'ok' && response.articles) {
      return response.articles.map((article: any, index: number) => ({
        id: `${article.url}-${index}-${Date.now()}`,
        title: article.title,
        description: article.description || 'No description available',
        image: article.urlToImage || 'https://via.placeholder.com/400x300?text=News',
        category: 'search',
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt || new Date().toISOString(),
        url: article.url,
        author: article.author,
        content: article.content,
      }))
    }

    return []
  } catch (error) {
    console.error('Error searching news:', error)
    return []
  }
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const getMockNewsData = (category: string): NewsArticle[] => {
  const mockTitles: { [key: string]: string[] } = {
    technology: [
      'Latest Technology Breakthrough in Quantum Computing',
      'New AI Model Shows Promising Results',
      'Tech Giant Announces Revolutionary Product',
    ],
    business: [
      'Stock Market Reaches All-Time High',
      'Companies Report Strong Q4 Earnings',
      'Major Investment Round Announced',
    ],
    sports: [
      'Championship Team Claims Victory',
      'Athletes Break World Records',
      'Sports Tournament Highlights Incredible Performance',
    ],
    health: [
      'New Health Initiative Launched',
      'Medical Breakthrough Offers Hope',
      'Wellness Program Shows Positive Results',
    ],
    science: [
      'Scientists Make Groundbreaking Discovery',
      'New Research Challenges Old Theories',
      'Laboratory Announces Significant Findings',
    ],
    entertainment: [
      'Celebrity Announces New Project',
      'Film Festival Celebrates Diverse Films',
      'Music Industry Celebrates Innovation',
    ],
    general: [
      'Important News from Around the World',
      'Latest Updates on Global Events',
      'Breaking News Story Emerges',
    ],
  }

  const titles = mockTitles[category] || mockTitles['general']
  const sources = ['BBC', 'Reuters', 'AP News', 'The Guardian', 'CNN', 'Fox News']
  const authors = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams']

  return titles.map((title, index) => ({
    id: `mock-${category}-${index}-${Date.now()}`,
    title,
    description: `This is a mock article about ${category}. The article contains important information relevant to the ${category} category.`,
    image: `https://via.placeholder.com/400x300?text=${category}`,
    category,
    source: sources[index % sources.length],
    publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
    url: '#',
    author: authors[index % authors.length],
  }))
}