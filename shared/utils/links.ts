// Ссылки на конкретные рилсы/посты Instagram показываются на карточке бренда как видео
export function isVideoPermalink(url: string) {
  return /instagram\.com\/(reel|reels|p|tv)\//i.test(url)
}
