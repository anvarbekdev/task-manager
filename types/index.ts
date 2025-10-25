export type Task = {
  id: string
  title: string
  completed: boolean
  createdAt: string
  dueDate?: string
}

export type TaskFilter = "all" | "pending" | "completed"

export type NewsArticle = {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
}