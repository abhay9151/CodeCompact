import { formatMemory, formatRuntime } from '../lib/format'

export const AuthShowcase = () => (
  <aside className="showcase-grid relative hidden min-h-[34rem] overflow-hidden border border-border bg-surface p-6 lg:flex lg:flex-col lg:justify-between">
    <div className="relative z-10 flex items-center justify-between">
      <span className="text-sm font-medium text-ink">CodeCompact</span>
      <span className="font-mono text-xs text-muted">JavaScript</span>
    </div>

    <div className="relative z-10 mx-auto w-full max-w-xl">
      <div className="overflow-hidden border border-border bg-page">
        <div className="flex h-10 items-center justify-between border-b border-border px-3">
          <span className="text-sm font-medium text-ink">Two Sum</span>
          <span className="font-mono text-xs text-muted">solution.js</span>
        </div>
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 px-3 py-4 font-mono text-xs leading-7">
          <span className="select-none text-right text-muted">1<br />2<br />3<br />4<br />5</span>
          <pre className="overflow-x-auto text-ink"><code><span className="text-accent">function</span>{' twoSum(nums, target) {\n  '}<span className="text-accent">const</span>{' seen = new Map();\n  '}<span className="text-accent">for</span>{' (let i = 0; i < nums.length; i++) {\n    '}<span className="text-highlight">if</span>{' (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i];\n  }'}</code></pre>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-2.5 text-xs">
          <span className="font-semibold text-success">Accepted</span>
          <span className="text-muted">3 of 3 test cases</span>
          <span className="font-mono tabular-nums text-muted">{formatRuntime(52)}</span>
          <span className="font-mono tabular-nums text-muted">{formatMemory(1152)}</span>
        </div>
      </div>
    </div>

    <p className="relative z-10 max-w-[38ch] text-sm text-muted">
      Work through a problem. Run the examples. Keep the solution you can explain.
    </p>
  </aside>
)
