import { Clock3 } from 'lucide-react'
import type { Problem } from '../types'

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export const Editorial = ({ problem }: { problem: Problem }) => (
  <section>
    <h2 className="mb-4 text-lg font-semibold text-ink">Editorial</h2>
    {problem.secureUrl ? (
      <div className="overflow-hidden rounded-2xl border border-border bg-black">
        <video
          controls
          preload="metadata"
          poster={problem.thumbnailUrl}
          className="aspect-video w-full"
          src={problem.secureUrl}
          aria-label={`Editorial video for ${problem.title}`}
        >
          Your browser does not support video playback.
        </video>
        {problem.duration !== undefined && (
          <p className="flex items-center gap-2 bg-page px-4 py-3 text-sm text-muted">
            <Clock3 size={15} aria-hidden="true" />
            {formatDuration(problem.duration)}
          </p>
        )}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <p className="font-medium text-ink">No editorial yet</p>
        <p className="mt-1 text-sm text-muted">A video explanation will appear here when available.</p>
      </div>
    )}
  </section>
)
