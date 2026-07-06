import { create } from 'zustand'
import { apiClient } from '../../api/client'
import type { ApiKey } from '../../types/security'

interface State { list: ApiKey[]; loading: boolean; error: string | null }
interface Actions { fetchApiKeys: () => Promise<void>; createApiKey: (input: Partial<ApiKey>) => Promise<void>; updateApiKey: (id: string, input: Partial<ApiKey>) => Promise<void>; deleteApiKey: (id: string) => Promise<void> }
export type Store = State & Actions
function extract(e: unknown) { return ((e as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? (e as Error).message ?? '操作失败') }
export const useApiKeyStore = create<Store>()((set, get) => ({
  list: [], loading: false, error: null,
  fetchApiKeys: async () => { set({ loading: true, error: null }); try { set({ list: (await apiClient.get<ApiKey[]>('/api-keys')).data, loading: false }) } catch (e) { set({ loading: false, error: extract(e) }) } },
  createApiKey: async (input) => { set({ loading: true, error: null }); try { const r = await apiClient.post<ApiKey>('/api-keys', input); set({ list: [r.data, ...get().list], loading: false }) } catch (e) { set({ loading: false, error: extract(e) }) } },
  updateApiKey: async (id, input) => { set({ loading: true, error: null }); try { const r = await apiClient.put<ApiKey>(`/api-keys/${id}`, input); set({ list: get().list.map((k) => k.id === id ? r.data : k), loading: false }) } catch (e) { set({ loading: false, error: extract(e) }) } },
  deleteApiKey: async (id) => { set({ loading: true, error: null }); try { await apiClient.delete(`/api-keys/${id}`); set({ list: get().list.filter((k) => k.id !== id), loading: false }) } catch (e) { set({ loading: false, error: extract(e) }) } },
}))
