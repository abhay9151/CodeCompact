import type { ApiMessage } from '../types'
import axios from 'axios'
import { api } from '../lib/api'

export interface VideoUploadSignature {
  signature: string
  timestamp: number
  public_id: string
  api_key: string
  cloud_name: string
  upload_url: string
}

export interface SavedSolutionVideo {
  id: string
  thumbnailUrl: string
  duration: number
}

export interface CloudinaryUploadResult {
  secure_url: string
  duration?: number
}

export const getVideoUploadSignature = async (problemId: string): Promise<VideoUploadSignature> => {
  const { data } = await api.get<VideoUploadSignature>(`/video/create/${problemId}`)
  return data
}

export const saveSolutionVideo = async (input: {
  problemId: string
  cloudinaryPublicId: string
  secureUrl: string
  duration: number
}): Promise<SavedSolutionVideo> => {
  const { data } = await api.post<SavedSolutionVideo>('/video/save', input)
  return data
}

export const deleteSolutionVideo = async (problemId: string): Promise<ApiMessage> => {
  const { data } = await api.delete<ApiMessage>(`/video/delete/${problemId}`)
  return data
}

export const uploadVideoToCloudinary = async (
  signature: VideoUploadSignature,
  file: File,
  onProgress: (progress: number) => void,
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', signature.signature)
  formData.append('timestamp', String(signature.timestamp))
  formData.append('public_id', signature.public_id)
  formData.append('api_key', signature.api_key)

  const { data } = await axios.post<CloudinaryUploadResult>(signature.upload_url, formData, {
    withCredentials: false,
    onUploadProgress: (event) => {
      if (event.total) onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })
  return data
}
