export const formatRuntime = (ms: number | null | undefined) => {
  if (ms === null || ms === undefined) return 'n/a'
  if (ms < 1) return '<1 ms'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

export const formatMemory = (kb: number | null | undefined) => {
  if (kb === null || kb === undefined) return 'n/a'
  if (kb < 1024) return `${kb} kB`
  return `${(kb / 1024).toFixed(1)} MB`
}
