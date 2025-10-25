import { NewsArticle } from "~/types"

export const fetchNews = async (): Promise<NewsArticle[]> => {
  const response = await fetch(
    `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${process.env.NEWS_API_KEY}`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch news')
  }

  const data = await response.json()
  return data.articles || []
}