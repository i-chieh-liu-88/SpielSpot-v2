import type { ReactNode } from 'react'

type SectionHeadingProps = { eyebrow?: string; title: string; description?: ReactNode; id: string; tone?: 'coral' | 'grass' | 'sand' }

const eyebrowStyles = {
  coral: 'bg-coral/10 text-coral',
  grass: 'bg-white text-grass shadow-sm',
  sand: 'bg-sand text-bark',
}

export function SectionHeading({ eyebrow, title, description, id, tone = 'coral' }: SectionHeadingProps) {
  return (
    <header className="mx-auto mb-14 max-w-2xl text-center">
      {eyebrow && <p className={`mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${eyebrowStyles[tone]}`}>{eyebrow}</p>}
      <h2 id={id} className="display text-5xl font-bold text-gray-800">{title}</h2>
      {description && <p className="mt-3 text-lg font-normal text-gray-400">{description}</p>}
    </header>
  )
}
