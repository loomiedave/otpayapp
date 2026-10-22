import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from "react-native";

const NEWS_URL =
  "https://oicrtvfceigbwpvufhih.supabase.co/functions/v1/dxy-news";

type Article = {
  uuid: string;
  title: string;
  description?: string;
  url: string;
  image_url?: string;
  published_at?: string;
  source?: string;
};

export default function DXYNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = async () => {
    try {
      setError(false);

      const response = await fetch(NEWS_URL);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      const data = await response.json();

      setArticles(data.data ?? []);
    } catch (err) {
      console.error("DXY news error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Refresh every 10 minutes.
    const interval = setInterval(
      fetchNews,
      10 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date?: string) => {
    if (!date) return "";

    const published = new Date(date);
    const now = new Date();

    const minutes = Math.floor(
      (now.getTime() - published.getTime()) / 60000
    );

    if (minutes < 1) return "Just now";

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <View className="mt-6 px-4">
        <Text className="mb-4 text-xl font-bold text-text-main dark:text-text-main-dark">
          Dollar News
        </Text>

        <View className="items-center rounded-2xl border border-border-main bg-background-card py-10 dark:border-border-main-dark dark:bg-background-card-dark">
          <ActivityIndicator
            size="small"
            color="#2563eb"
          />

          <Text className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
            Loading latest news...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-6 px-4">
        <View className="rounded-2xl border border-border-main bg-background-card p-5 dark:border-border-main-dark dark:bg-background-card-dark">
          <Text className="text-base font-semibold text-text-main dark:text-text-main-dark">
            Dollar News
          </Text>

          <Text className="mt-2 text-sm text-text-muted dark:text-text-muted-dark">
            Unable to load the latest news.
          </Text>

          <TouchableOpacity
            onPress={fetchNews}
            className="mt-4 self-start rounded-lg bg-primary px-4 py-2"
          >
            <Text className="font-semibold text-white">
              Try again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-6 px-4 pb-8">
      {/* Section header */}

      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-text-main dark:text-text-main-dark">
            Dollar News
          </Text>

          <Text className="mt-1 text-xs text-text-muted dark:text-text-muted-dark">
            Latest market-moving stories
          </Text>
        </View>

        <View className="rounded-full bg-primary/10 px-3 py-1.5">
          <Text className="text-xs font-semibold text-primary dark:text-primary-dark">
            DXY
          </Text>
        </View>
      </View>

      {/* Articles */}

      {articles.map((article) => (
        <TouchableOpacity
          key={article.uuid}
          activeOpacity={0.75}
          onPress={() => Linking.openURL(article.url)}
          className="mb-3 overflow-hidden rounded-2xl border border-border-main bg-background-card dark:border-border-main-dark dark:bg-background-card-dark"
        >
          <View className="flex-row">
            {/* Image */}

            {article.image_url ? (
              <Image
                source={{ uri: article.image_url }}
                className="h-28 w-28"
                resizeMode="cover"
              />
            ) : (
              <View className="h-28 w-28 items-center justify-center bg-primary/10">
                <Text className="text-2xl font-bold text-primary">
                  $
                </Text>
              </View>
            )}

            {/* Content */}

            <View className="flex-1 p-3">
              <Text
                numberOfLines={3}
                className="text-sm font-semibold leading-5 text-text-main dark:text-text-main-dark"
              >
                {article.title}
              </Text>

              <View className="mt-2 flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  className="mr-2 flex-1 text-xs text-text-muted dark:text-text-muted-dark"
                >
                  {article.source || "Financial News"}
                </Text>

                <Text className="text-xs text-text-muted dark:text-text-muted-dark">
                  {formatTime(article.published_at)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {articles.length === 0 && (
        <View className="rounded-2xl border border-border-main bg-background-card p-6 dark:border-border-main-dark dark:bg-background-card-dark">
          <Text className="text-center text-sm text-text-muted dark:text-text-muted-dark">
            No recent dollar news found.
          </Text>
        </View>
      )}
    </View>
  );
}
