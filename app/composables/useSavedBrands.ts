export function useSavedBrands() {
  const { loggedIn } = useUserSession()
  const savedIds = useState<string[]>('saved-brand-ids', () => [])

  async function refresh() {
    if (!loggedIn.value) {
      savedIds.value = []
      return
    }
    savedIds.value = await $fetch<string[]>('/api/library/ids')
  }

  function isSaved(brandId: string) {
    return savedIds.value.includes(brandId)
  }

  async function save(brandId: string) {
    await $fetch('/api/library', { method: 'POST', body: { brandId } })
    if (!savedIds.value.includes(brandId)) savedIds.value = [...savedIds.value, brandId]
  }

  async function unsave(brandId: string) {
    await $fetch(`/api/library/${brandId}`, { method: 'DELETE' })
    savedIds.value = savedIds.value.filter(id => id !== brandId)
  }

  async function toggle(brandId: string) {
    if (!loggedIn.value) {
      sessionStorage.setItem('pending-save-brand-id', brandId)
      await navigateTo(`/login?redirect=${encodeURIComponent(useRoute().fullPath)}`)
      return
    }
    if (isSaved(brandId)) await unsave(brandId)
    else await save(brandId)
  }

  async function completePendingSave() {
    const pendingBrandId = sessionStorage.getItem('pending-save-brand-id')
    if (!pendingBrandId) return
    sessionStorage.removeItem('pending-save-brand-id')
    await save(pendingBrandId)
  }

  return { savedIds, isSaved, save, unsave, toggle, refresh, completePendingSave }
}
