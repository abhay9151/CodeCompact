export const shortName = (name: string, max = 25) => (
  name.length <= max ? name : `${name.slice(0, Math.max(0, max - 1))}…`
)
