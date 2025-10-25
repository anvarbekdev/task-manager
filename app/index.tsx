"use client"

import { useEffect, useState, useMemo } from "react"
import { View, Alert, InteractionManager, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Image } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { Input } from "~/components/ui/input"
import { ThemeToggle } from "~/components/ThemeToggle"
import { useSession } from "~/context/AuthContext"
import { load, save } from "~/lib/storage"
import { TASKS_STORAGE_KEY } from "~/constants"
import { FlashList } from "@shopify/flash-list"
import { cn } from "~/lib/utils"
import { useQuery } from "react-query"
import { Task, TaskFilter } from "~/types"
import { fetchNews } from "~/services/news"

export default function Tasks() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [text, setText] = useState("")
  const [filter, setFilter] = useState<TaskFilter>("all")
  const { session, signOut } = useSession()

  const { data: news, isLoading: newsLoading, error: newsError } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  })

  if (session === undefined) return null

  useEffect(() => {
    const existing = load(TASKS_STORAGE_KEY)
    if (existing && Array.isArray(existing)) {
      setTasks(existing)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      InteractionManager.runAfterInteractions(() => {
        router.replace("/sign-in")
      })
    }
  }, [session, router])

  const persist = (next: Task[]) => {
    save(TASKS_STORAGE_KEY, next)
    setTasks(next)
  }

  const addTask = () => {
    if (!text.trim()) return Alert.alert("Error", "Please enter a task name.")
    const newTask: Task = {
      id: Date.now().toString(),
      title: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    persist([newTask, ...tasks])
    setText("")
  }

  const toggle = (id: string) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    persist(next)
  }

  const remove = (id: string) => {
    const next = tasks.filter((t) => t.id !== id)
    persist(next)
  }

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "pending":
        return tasks.filter((t) => !t.completed)
      case "completed":
        return tasks.filter((t) => t.completed)
      default:
        return tasks
    }
  }, [tasks, filter])

  const dailyStats = useMemo(() => {
    const today = new Date().toDateString()
    const todayTasks = tasks.filter((t) => new Date(t.createdAt).toDateString() === today)
    return [
      { day: "Today", tasks: todayTasks.length, completed: todayTasks.filter((t) => t.completed).length },
      { day: "Total", tasks: tasks.length, completed: tasks.filter((t) => t.completed).length },
    ]
  }, [tasks])

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => { } },
      {
        text: "Logout",
        onPress: () => {
          signOut()
          setTimeout(() => {
            router.push("/sign-in")
          }, 50)
        },
      },
    ])
  }

  const openNewsUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link")
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4 gap-4">
        {/* Header */}
        <View className="flex-row  items-center justify-between px-4shadow">
          <View>
            <Text className="text-4xl font-medium">Task Manager</Text>
            <Text className="text-2xl font-bold">
              Lets get things done
            </Text>
          </View>
          <Button variant="outline" onPress={handleLogout}>
            <Text>Logout</Text>
          </Button>
        </View>
        <View className="flex-row  items-center justify-between px-4shadow">
          <ThemeToggle />
        </View>

        {/* Input Section */}
        <Card className="p-4 gap-3 bg-card">
          <Input
            placeholder="Add a new task..."
            value={text}
            onChangeText={setText}
          />
          <Button onPress={addTask}>
            <Text>Add Task</Text>
          </Button>
        </Card>

        {/* Statistics Section */}
        <Card className="p-4">
          <Text className="text-lg font-semibold mb-3">
            Task Statistics
          </Text>
          <View className="flex-row justify-around mb-4">
            {dailyStats.map((stat, idx) => (
              <View key={idx} className="items-center">
                <Text className="text-2xl font-bold">
                  {stat.completed}/{stat.tasks}
                </Text>
                <Text className="text-xs">
                  {stat.day}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Filter Buttons */}
        <View className="flex-row gap-2">
          {(["all", "pending", "completed"] as TaskFilter[]).map((f) => (
            <Button
              key={f}
              onPress={() => setFilter(f)}
              className={cn(
                filter === f ? "bg-primary" : "bg-secondary"
              )}
            >
              <Text
                className={cn(
                  "uppercase",
                  filter === f
                    ? "text-primary-foreground"
                    : "text-secondary-foreground"
                )}
              >
                {f}
              </Text>
            </Button>
          ))}
        </View>

        {/* Tasks List */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">
            {filter === "all" ? "All Tasks" : filter === "pending" ? "Pending Tasks" : "Completed Tasks"} (
            {filteredTasks.length})
          </Text>
          {filteredTasks.length === 0 ? (
            <Card className="p-4 items-center">
              <Text>No tasks found</Text>
            </Card>
          ) : (
            <FlashList
              data={filteredTasks}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <Card
                  className={cn(
                    "p-3 mb-3",
                    item.completed ? "bg-muted" : "bg-card"
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={
                          item.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground text-base font-bold"
                        }
                      >
                        {item.title}
                      </Text>
                      <Text className="text-xs mt-1">
                        {item.completed ? "Completed" : "Pending"}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Button
                        onPress={() => toggle(item.id)}
                        variant="outline"
                        size="sm"
                        className={cn(
                          item.completed ? "bg-secondary" : "bg-primary"
                        )}
                      >
                        <Text
                          className={cn(
                            "text-lg",
                            item.completed ? "bg-secondary" : "text-white"
                          )}
                        >
                          {item.completed ? "Undo" : "Done"}
                        </Text>
                      </Button>
                      <Button
                        onPress={() => remove(item.id)}
                        variant="outline"
                        size="sm"
                        className="bg-destructive"
                      >
                        <Text className="text-lg text-white/80">
                          Delete
                        </Text>
                      </Button>
                    </View>
                  </View>
                </Card>
              )}
            />
          )}
        </View>

        {/* News Section */}
        <View className="mt-6 mb-8">
          <Text className="text-2xl font-bold mb-4">📰 Latest News</Text>

          {newsLoading ? (
            <Card className="p-8 items-center">
              <ActivityIndicator size="large" />
              <Text className="mt-4 text-muted-foreground">Loading news...</Text>
            </Card>
          ) : newsError ? (
            <Card className="p-4 items-center">
              <Text className="text-destructive">Failed to load news</Text>
            </Card>
          ) : (
            <View style={{ flex: 1, minHeight: 600 }}>
              <FlashList
                data={news}
                estimatedItemSize={200}
                keyExtractor={(item, index) => `${item.url}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => openNewsUrl(item.url)}
                    activeOpacity={0.7}
                  >
                    <Card className="p-4 mb-4 bg-card">
                      <View className="flex-row gap-3">
                        {item.urlToImage && (
                          <View className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                            <Image
                              source={{ uri: item.urlToImage }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="font-bold text-base mb-2 leading-tight">
                            {item.title}
                          </Text>
                          <Text className="text-xs text-muted-foreground mb-2" numberOfLines={2}>
                            {item.description}
                          </Text>
                          <View className="flex-row items-center justify-between">
                            <Text className="text-xs font-medium text-primary">
                              {item.source.name}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                              {formatDate(item.publishedAt)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}