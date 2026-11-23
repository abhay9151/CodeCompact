import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, Film, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProblem } from '../../../api/problems'
import { getVideoUploadSignature, saveSolutionVideo, uploadVideoToCloudinary } from '../../../api/video'
import { Spinner } from '../../../components/Spinner'
import { Toast } from '../../../components/Toast'
import { useAdminToast } from '../../../hooks/useAdminToast'
import { getErrorMessage } from '../../../lib/errors'
import { useDocumentTitle } from '../../../hooks/useDocumentTitle'

export const Route = createFileRoute('/_auth/admin/upload/$problemId')({
  component: UploadVideoPage,
})

const maxVideoSize = 100 * 1024 * 1024

const readVideoDuration = (file: File): Promise<number> => new Promise((resolve, reject) => {
  const video = document.createElement('video')
  const objectUrl = URL.createObjectURL(file)
  video.preload = 'metadata'
  video.onloadedmetadata = () => {
    URL.revokeObjectURL(objectUrl)
    if (Number.isFinite(video.duration) && video.duration > 0) resolve(video.duration)
    else reject(new Error('Could not read the video duration.'))
  }
  video.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error('Could not read the selected video file.'))
  }
  video.src = objectUrl
})

function UploadVideoPage() {
  const { problemId } = Route.useParams()
  useDocumentTitle('Upload solution video | CodeCompact')
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File>()
  const [progress, setProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState<string>()
  const [uploadedDuration, setUploadedDuration] = useState<number>()
  const { toast, showToast, dismissToast } = useAdminToast()
  const problemQuery = useQuery({ queryKey: ['problems', problemId], queryFn: () => getProblem(problemId) })
  const uploadMutation = useMutation({
    mutationFn: async (selectedFile: File) => {
    const signature = await getVideoUploadSignature(problemId)
    const cloudinaryResult = await uploadVideoToCloudinary(signature, selectedFile, setProgress)
    const finalDuration = cloudinaryResult.duration && Number.isFinite(cloudinaryResult.duration)
      ? cloudinaryResult.duration
      : await readVideoDuration(selectedFile)
      await saveSolutionVideo({
        problemId,
        cloudinaryPublicId: signature.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: finalDuration,
      })
      return { secureUrl: cloudinaryResult.secure_url, duration: finalDuration }
    },
    onSuccess: async (result) => {
      setUploadedUrl(result.secureUrl)
      setUploadedDuration(result.duration)
      showToast('Editorial video uploaded successfully.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['problems', problemId] }),
        queryClient.invalidateQueries({ queryKey: ['problems'] }),
      ])
    },
    onError: (error) => showToast(getErrorMessage(error, 'Could not upload the video.'), 'error'),
  })

  useEffect(() => {
    if (problemQuery.data?.secureUrl) setUploadedUrl(problemQuery.data.secureUrl)
    if (problemQuery.data?.duration) setUploadedDuration(problemQuery.data.duration)
  }, [problemQuery.data])

  const handleFileChange = (selected: File | undefined) => {
    setFile(undefined)
    setProgress(0)
    setUploadedUrl(undefined)
    if (!selected) return
    if (!selected.type.startsWith('video/')) {
      showToast('Choose a video file.', 'error')
      return
    }
    if (selected.size > maxVideoSize) {
      showToast('Video files must be 100 MB or smaller.', 'error')
      return
    }
    setFile(selected)
  }

  if (problemQuery.isLoading) return <main className="flex justify-center px-4 py-24"><Spinner label="Loading problem" /></main>
  if (problemQuery.isError || !problemQuery.data) {
    return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><h1 className="text-3xl text-ink">Upload solution video</h1><p role="alert" className="mt-6 border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{getErrorMessage(problemQuery.error, 'Could not load the problem.')}</p></main>
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/admin/video" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:underline"><ArrowLeft size={16} aria-hidden="true" />All videos</Link>
      <h1 className="mt-6 text-3xl text-ink">{problemQuery.data.title}</h1>
      {toast && <div className="mt-5"><Toast message={toast.message} variant={toast.variant} onDismiss={dismissToast} /></div>}

      <section className="mt-7 border-y border-border bg-surface p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <Film size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
          <div><h2 className="font-semibold text-ink">Upload a solution video</h2><p className="mt-1 max-w-[70ch] text-sm leading-6 text-muted">Video formats up to 100 MB are supported. The file uploads directly to Cloudinary.</p></div>
        </div>

        <label htmlFor="solution-video" className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-raised px-4 py-8 text-center transition hover:border-accent hover:bg-accent/5 focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-page">
          <Upload size={23} className="text-accent" aria-hidden="true" />
          <span className="mt-3 text-sm font-semibold text-ink">{file ? file.name : 'Choose a video file'}</span>
          <span className="mt-1 text-xs text-muted">{file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Video file, maximum 100 MB'}</span>
          <input id="solution-video" type="file" accept="video/*" className="sr-only" disabled={uploadMutation.isPending} onChange={(event) => handleFileChange(event.target.files?.[0])} />
        </label>

        {uploadMutation.isPending && (
          <div className="mt-5" role="status" aria-live="polite">
            <div className="mb-2 flex justify-between text-sm"><span className="font-medium text-ink">Uploading video to Cloudinary…</span><span className="tabular-nums text-muted">{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-raised"><div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button type="button" disabled={!file || uploadMutation.isPending} onClick={() => file && uploadMutation.mutate(file)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-solid px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">
            <Upload size={16} aria-hidden="true" />{uploadMutation.isPending ? 'Uploading…' : 'Upload video'}
          </button>
        </div>
      </section>

      {uploadedUrl && (
        <section className="mt-6 rounded-2xl border border-success/30 bg-surface p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 size={16} aria-hidden="true" />Video ready{uploadedDuration ? ` (${Math.round(uploadedDuration)} seconds)` : ''}</div>
          <video className="max-h-[480px] w-full rounded-xl bg-black" controls src={uploadedUrl}>Your browser does not support video playback.</video>
        </section>
      )}
    </main>
  )
}
