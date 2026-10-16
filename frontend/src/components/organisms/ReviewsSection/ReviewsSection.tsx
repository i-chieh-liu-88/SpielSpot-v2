import { useNavigate } from '@tanstack/react-router'
import { reviews } from '../../../data/homeContent'
import Button from '../../atoms/Button'
import { SectionHeading } from '../../atoms/SectionHeading/SectionHeading'
import { ReviewCard } from '../../molecules/ReviewCard/ReviewCard'
import { useLanguage } from '../../../providers/LanguageProvider'

export function ReviewsSection() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <section id="reviews" className="spot-home-section spot-reviews relative scroll-mt-24 overflow-hidden px-6 py-24" aria-labelledby="reviews-heading">
      <div className="relative mx-auto max-w-5xl">
        <SectionHeading id="reviews-heading" title={t("Example parent reviews")} description={t("Illustrative examples, not reviews from real users. Read community reviews on each playground page.")} />
        <div className="grid gap-6 md:grid-cols-3">{reviews.map((review, index) => <div className={index === 1 ? 'md:mt-5' : ''} key={review.name}><ReviewCard review={review} /></div>)}</div>
        <div className="mt-10 text-center">
          <Button type="button" size="lg" onClick={() => navigate({ to: '/playgrounds' })}>
            {t("Share your playground review")}
          </Button>
        </div>
      </div>
    </section>
  )
}
