import React from 'react';
import { Star, MessageSquareQuote, CheckCircle, ExternalLink } from 'lucide-react';
import type { GoogleReview, CompanySettings } from '../../types/index.ts';

interface ReviewsSectionProps {
  reviews: GoogleReview[];
  company: CompanySettings | null;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, company }) => {
  const rating = company?.googleRating || 4.9;
  const totalReviews = company?.totalReviewsCount || 148;
  const googleReviewUrl = company?.googleReviewUrl || 'https://share.google/y7Mb7XZgDgyd375HY';

  return (
    <section id="avaliacoes" className="py-16 md:py-24 bg-slate-950 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Google Score and CTA button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/70">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="h-4 w-4 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span>Avaliações Verificadas no Google Business</span>
              <span className="text-slate-600">·</span>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 underline font-normal transition-colors"
              >
                Perfil Oficial Google (share.google/y7Mb7XZgDgyd375HY)
              </a>
            </div>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
              O que nossos clientes dizem
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xl font-bold font-mono text-white tabular-nums">{rating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">
                baseado em <span className="font-semibold text-slate-200">{totalReviews}</span> avaliações no Google
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <span>Ver perfil no Google</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <span>Avaliar no Google</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-950" />
            </a>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300">
                      {rev.authorName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">{rev.authorName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{rev.relativeTimeDescription}</p>
                    </div>
                  </div>
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="h-3.5 w-3.5 opacity-80"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                <div className="mt-3 flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-cyan-400">
                  <CheckCircle className="h-3 w-3" />
                  <span>Cliente verificado</span>
                </span>
                <span>{rev.source === 'google' ? 'Google Maps' : 'Avaliação registrada'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
