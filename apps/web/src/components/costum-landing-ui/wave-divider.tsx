// ============================================
// FILE: app/home/_components/ui/wave-divider.tsx
// ============================================

interface WaveDividerProps {
  className?: string
  variant?: 'default' | 'flipped' | 'curved' | 'layered'
  color?: string
  height?: string
}

export function WaveDivider({ 
  className = '', 
  variant = 'default',
  color = 'fill-white dark:fill-slate-900',
  height = '80'
}: WaveDividerProps) {
  const waves = {
    default: (
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          className={color}
        />
      </svg>
    ),
    flipped: (
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,40 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,0 L0,0 Z"
          className={color}
        />
      </svg>
    ),
    curved: (
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,80 Q360,0 720,40 T1440,80 L1440,80 L0,80 Z"
          className={color}
        />
      </svg>
    ),
    layered: (
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          className={`${color} opacity-50`}
        />
        <path
          d="M0,60 C240,20 480,100 720,60 C960,20 1200,100 1440,60 L1440,80 L0,80 Z"
          className={color}
        />
      </svg>
    )
  }

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      {waves[variant]}
    </div>
  )
}