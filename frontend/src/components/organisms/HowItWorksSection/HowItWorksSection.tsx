import { steps } from '../../../data/homeContent'
import { SectionHeading } from '../../atoms/SectionHeading/SectionHeading'
import { useLanguage } from '../../../providers/LanguageProvider'

export function HowItWorksSection() {
  const { t } = useLanguage()

  return (
    <section id="how" className="scroll-mt-24 bg-white px-6 py-24" aria-labelledby="how-heading">
      <div className="mx-auto max-w-5xl">
        <SectionHeading id="how-heading" title={t("How SpielSpot works")} description={t("Less searching. More playing.")} />
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => <li className={`card-hover relative rounded-3xl border-2 border-green-100 bg-green-50 p-8 ${index === 1 ? 'md:mt-6' : ''}`} key={step.number}>
            <span className="display absolute right-6 top-4 text-7xl text-green-200">{step.number}</span>
            <img className="mb-5 h-30 w-30 object-contain" src={step.image} alt="" />
            <h3 className="display mb-2 text-2xl font-semibold text-gray-800">{t(step.title)}</h3>
            <p className="text-sm font-normal leading-relaxed text-gray-500">{t(step.description)}</p>
          </li>)}
        </ol>
      </div>
    </section>
  )
}
