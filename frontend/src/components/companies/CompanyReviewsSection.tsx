import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, Loader2, MessageSquareText, Pencil, Star, ThumbsDown, ThumbsUp, Trash2, UserRound } from 'lucide-react';
import { reviewApi, type ReviewSort } from '../../lib/api';
import type {
  CompanyReview,
  CompanyReviewEligibility,
  CompanyReviewInput,
  CompanyReviewPage,
  ReviewExperienceLevel,
} from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, Spinner, btnPrimary, btnSecondary, inputCls } from '../ui/primitives';

const PAGE_SIZE = 5;

// ------------------------------------------------------------------ small building blocks

export const StarRating: React.FC<{ value: number; size?: string; className?: string }> = ({ value, size = 'w-4 h-4', className = '' }) => (
  <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} / 5`}>
    {[1, 2, 3, 4, 5].map((i) => {
      const fill = Math.max(0, Math.min(1, value - (i - 1)));
      return (
        <span key={i} className={`relative inline-block ${size}`}>
          <Star className={`${size} text-slate-300 dark:text-slate-600`} />
          {fill > 0 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} text-amber-400 fill-amber-400`} />
            </span>
          )}
        </span>
      );
    })}
  </span>
);

const StarInput: React.FC<{ value: number; onChange: (v: number) => void; labels: string[] }> = ({ value, onChange, labels }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" role="radiogroup" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} / 5`}
            data-testid={`review-star-${i}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Star className={`w-7 h-7 transition-colors ${i <= shown ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
          </button>
        ))}
      </div>
      {shown > 0 && <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{labels[shown - 1]}</span>}
    </div>
  );
};

const ExperienceBadge: React.FC<{ level: ReviewExperienceLevel; isVi: boolean }> = ({ level, isVi }) => {
  const map: Record<ReviewExperienceLevel, { vi: string; en: string; cls: string }> = {
    APPLIED: { vi: 'Đã ứng tuyển', en: 'Applied', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    INTERVIEWED: { vi: 'Đã phỏng vấn', en: 'Interviewed', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' },
    HIRED: { vi: 'Đã trúng tuyển', en: 'Hired', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  };
  const m = map[level] ?? map.APPLIED;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${m.cls}`}
      title={isVi ? 'Đã xác minh qua quy trình tuyển dụng trên TalentBridge' : 'Verified through the TalentBridge hiring pipeline'}
    >
      <BadgeCheck className="w-3 h-3" />
      {isVi ? m.vi : m.en}
    </span>
  );
};

// ------------------------------------------------------------------ form

const emptyInput: CompanyReviewInput = { rating: 0, title: '', pros: '', cons: '', anonymous: true };

const ReviewForm: React.FC<{
  initial?: CompanyReview | null;
  experienceLevel: ReviewExperienceLevel | null;
  submitting: boolean;
  onSubmit: (input: CompanyReviewInput) => void;
  onCancel?: () => void;
  isVi: boolean;
}> = ({ initial, experienceLevel, submitting, onSubmit, onCancel, isVi }) => {
  const [input, setInput] = useState<CompanyReviewInput>(
    initial
      ? { rating: initial.rating, title: initial.title, pros: initial.pros ?? '', cons: initial.cons ?? '', anonymous: initial.anonymous }
      : emptyInput,
  );
  const [error, setError] = useState<string | null>(null);
  const labels = isVi ? ['Rất tệ', 'Chưa tốt', 'Bình thường', 'Tốt', 'Tuyệt vời'] : ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.rating < 1) return setError(isVi ? 'Vui lòng chọn số sao.' : 'Please choose a star rating.');
    if (input.title.trim().length < 5) return setError(isVi ? 'Tiêu đề tối thiểu 5 ký tự.' : 'Title must be at least 5 characters.');
    if (input.pros.trim().length + input.cons.trim().length < 20)
      return setError(
        isVi
          ? 'Hãy chia sẻ thêm ưu điểm hoặc nhược điểm (tối thiểu 20 ký tự).'
          : 'Please share more pros or cons (at least 20 characters).',
      );
    setError(null);
    onSubmit({ ...input, title: input.title.trim(), pros: input.pros.trim(), cons: input.cons.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="review-form">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StarInput value={input.rating} onChange={(rating) => setInput((s) => ({ ...s, rating }))} labels={labels} />
        {experienceLevel && <ExperienceBadge level={experienceLevel} isVi={isVi} />}
      </div>
      <input
        value={input.title}
        maxLength={150}
        onChange={(e) => setInput((s) => ({ ...s, title: e.target.value }))}
        placeholder={isVi ? 'Tiêu đề (vd: Quy trình phỏng vấn chuyên nghiệp)' : 'Title (e.g. Professional interview process)'}
        aria-label={isVi ? 'Tiêu đề đánh giá' : 'Review title'}
        className={inputCls}
        data-testid="review-title"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
            <ThumbsUp className="w-3.5 h-3.5" /> {isVi ? 'Điều bạn thích' : 'Pros'}
          </span>
          <textarea
            value={input.pros}
            maxLength={2000}
            rows={4}
            onChange={(e) => setInput((s) => ({ ...s, pros: e.target.value }))}
            placeholder={isVi ? 'Môi trường, quy trình, phản hồi của HR...' : 'Culture, process, HR responsiveness...'}
            className={inputCls}
            data-testid="review-pros"
          />
        </label>
        <label className="block">
          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
            <ThumbsDown className="w-3.5 h-3.5" /> {isVi ? 'Điều cần cải thiện' : 'Cons'}
          </span>
          <textarea
            value={input.cons}
            maxLength={2000}
            rows={4}
            onChange={(e) => setInput((s) => ({ ...s, cons: e.target.value }))}
            placeholder={isVi ? 'Thời gian phản hồi, độ khó bài test...' : 'Response time, test difficulty...'}
            className={inputCls}
            data-testid="review-cons"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          checked={input.anonymous}
          onChange={(e) => setInput((s) => ({ ...s, anonymous: e.target.checked }))}
          className="w-4 h-4 rounded accent-emerald-600"
          data-testid="review-anonymous"
        />
        {isVi ? 'Đăng ẩn danh (không hiển thị tên của bạn)' : 'Post anonymously (your name is not shown)'}
      </label>
      {error && <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting} className={btnPrimary} data-testid="review-submit">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initial ? (isVi ? 'Lưu thay đổi' : 'Save changes') : isVi ? 'Gửi đánh giá' : 'Submit review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnSecondary}>
            {isVi ? 'Huỷ' : 'Cancel'}
          </button>
        )}
      </div>
    </form>
  );
};

// ------------------------------------------------------------------ review item

const ReviewItem: React.FC<{ review: CompanyReview; isVi: boolean }> = ({ review, isVi }) => (
  <article className="py-5 first:pt-0 border-b last:border-b-0 border-slate-100 dark:border-slate-800" data-testid="review-item">
    <div className="flex flex-wrap items-center gap-2">
      <StarRating value={review.rating} />
      <h4 className="font-bold text-slate-900 dark:text-white">{review.title}</h4>
      {review.mine && (
        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">{isVi ? 'Của bạn' : 'Yours'}</span>
      )}
    </div>
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1 font-semibold">
        <UserRound className="w-3.5 h-3.5" />
        {review.anonymous || !review.authorName ? (isVi ? 'Ứng viên ẩn danh' : 'Anonymous candidate') : review.authorName}
      </span>
      <ExperienceBadge level={review.experienceLevel} isVi={isVi} />
      {review.jobTitle && <span>· {review.jobTitle}</span>}
      <span>· {new Date(review.createdAt).toLocaleDateString(isVi ? 'vi-VN' : 'en-GB')}</span>
    </div>
    {review.pros && (
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line selectable-text">
        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 mr-1">
          <ThumbsUp className="w-3.5 h-3.5" />
          {isVi ? 'Ưu điểm:' : 'Pros:'}
        </span>
        {review.pros}
      </p>
    )}
    {review.cons && (
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line selectable-text">
        <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-400 mr-1">
          <ThumbsDown className="w-3.5 h-3.5" />
          {isVi ? 'Cần cải thiện:' : 'Cons:'}
        </span>
        {review.cons}
      </p>
    )}
  </article>
);

// ------------------------------------------------------------------ main section

/**
 * Company reviews: rating summary + distribution, sortable list, and a write/edit form
 * for candidates who applied to this company.
 */
export const CompanyReviewsSection: React.FC<{ companyId: number; companyName: string; onSummaryChange?: () => void }> = ({
  companyId,
  companyName,
  onSummaryChange,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const { isAuthenticated, isCandidate } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [sort, setSort] = useState<ReviewSort>('newest');
  const [data, setData] = useState<CompanyReviewPage | null>(null);
  const [items, setItems] = useState<CompanyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<CompanyReviewEligibility | null>(null);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    async (page = 0) => {
      setLoading(true);
      try {
        const res = await reviewApi.list(companyId, sort, page, PAGE_SIZE);
        setData(res);
        setItems((prev) => (page === 0 ? res.items : [...prev, ...res.items]));
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [companyId, sort],
  );

  const loadEligibility = useCallback(() => {
    if (!isCandidate) {
      setEligibility(null);
      return;
    }
    reviewApi.eligibility(companyId).then(setEligibility).catch(() => setEligibility(null));
  }, [companyId, isCandidate]);

  useEffect(() => {
    load(0);
  }, [load]);

  useEffect(() => {
    loadEligibility();
  }, [loadEligibility]);

  const refreshAll = async () => {
    await load(0);
    loadEligibility();
    onSummaryChange?.();
  };

  const handleSubmit = async (input: CompanyReviewInput) => {
    setSubmitting(true);
    try {
      if (eligibility?.myReview) {
        await reviewApi.updateMine(companyId, input);
        toast(isVi ? 'Đã cập nhật đánh giá' : 'Review updated', 'success');
      } else {
        await reviewApi.create(companyId, input);
        toast(isVi ? 'Cảm ơn bạn đã chia sẻ đánh giá!' : 'Thanks for sharing your review!', 'success');
      }
      setEditing(false);
      await refreshAll();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(isVi ? 'Xoá đánh giá của bạn?' : 'Delete your review?')) return;
    try {
      await reviewApi.deleteMine(companyId);
      toast(isVi ? 'Đã xoá đánh giá' : 'Review deleted', 'info');
      setEditing(false);
      await refreshAll();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const summary = data?.summary;
  const total = summary?.count ?? 0;
  const myReview = eligibility?.myReview ?? null;

  // --- "write a review" panel, depending on who is looking
  let writePanel: React.ReactNode = null;
  if (!isAuthenticated) {
    writePanel = (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        <Link to={`/login?next=${encodeURIComponent(location.pathname + '#reviews')}`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
          {isVi ? 'Đăng nhập' : 'Sign in'}
        </Link>{' '}
        {isVi ? 'bằng tài khoản ứng viên để chia sẻ trải nghiệm ứng tuyển tại ' : 'as a candidate to share your application experience at '}
        {companyName}.
      </p>
    );
  } else if (isCandidate && eligibility) {
    if (eligibility.canReview || editing) {
      writePanel = (
        <ReviewForm
          initial={editing ? myReview : null}
          experienceLevel={eligibility.experienceLevel}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={editing ? () => setEditing(false) : undefined}
          isVi={isVi}
        />
      );
    } else if (eligibility.reason === 'ALREADY_REVIEWED' && myReview) {
      writePanel = (
        <div className="space-y-3">
          {myReview.status === 'HIDDEN' && (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
              {isVi ? 'Đánh giá của bạn đang bị ẩn bởi quản trị viên' : 'Your review is hidden by an administrator'}
              {myReview.moderationNote ? `: ${myReview.moderationNote}` : '.'}
            </p>
          )}
          <ReviewItem review={myReview} isVi={isVi} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(true)} className={btnSecondary} data-testid="review-edit">
              <Pencil className="w-4 h-4" /> {isVi ? 'Chỉnh sửa' : 'Edit'}
            </button>
            <button type="button" onClick={handleDelete} className={`${btnSecondary} text-rose-600`} data-testid="review-delete">
              <Trash2 className="w-4 h-4" /> {isVi ? 'Xoá' : 'Delete'}
            </button>
          </div>
        </div>
      );
    } else if (eligibility.reason === 'NO_APPLICATION') {
      writePanel = (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isVi
            ? `Bạn có thể đánh giá ${companyName} sau khi ứng tuyển ít nhất một vị trí của công ty. Điều này giúp đánh giá trên TalentBridge luôn đến từ trải nghiệm thật.`
            : `You can review ${companyName} after applying to at least one of its jobs, so every review comes from a real experience.`}
        </p>
      );
    }
  }

  return (
    <section id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 scroll-mt-24" data-testid="company-reviews">
      <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white mb-5">
        <MessageSquareText className="w-5 h-5 text-emerald-600" />
        {isVi ? 'Đánh giá từ ứng viên' : 'Candidate reviews'}
        {total > 0 && <span className="text-base font-bold text-slate-400">({total})</span>}
      </h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
            {summary && total > 0 ? (
              <>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-slate-900 dark:text-white" data-testid="review-average">
                    {summary.average?.toFixed(1)}
                  </span>
                  <div className="pb-1.5">
                    <StarRating value={summary.average ?? 0} size="w-5 h-5" />
                    <p className="text-xs text-slate-500 mt-1">
                      {total} {isVi ? 'đánh giá' : total === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-1.5">
                  {summary.distribution.map((n, idx) => {
                    const stars = 5 - idx;
                    const pct = total ? Math.round((n / total) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-7 font-semibold text-slate-600 dark:text-slate-300">{stars}★</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-9 text-right text-slate-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : loading && !data ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isVi ? 'Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ!' : 'No reviews yet. Be the first to share!'}
              </p>
            )}
          </div>

          {writePanel && (
            <div className="bg-white dark:bg-slate-900/95 border border-emerald-200/80 dark:border-emerald-900/60 rounded-3xl p-6 shadow-soft-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                {myReview && !editing
                  ? isVi
                    ? 'Đánh giá của bạn'
                    : 'Your review'
                  : isVi
                    ? 'Viết đánh giá'
                    : 'Write a review'}
              </h3>
              {writePanel}
            </div>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-soft-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isVi ? 'Tất cả đánh giá' : 'All reviews'}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ReviewSort)}
              aria-label={isVi ? 'Sắp xếp đánh giá' : 'Sort reviews'}
              className={`${inputCls} !w-auto py-1.5 text-sm`}
              data-testid="review-sort"
            >
              <option value="newest">{isVi ? 'Mới nhất' : 'Newest'}</option>
              <option value="highest">{isVi ? 'Điểm cao nhất' : 'Highest rated'}</option>
              <option value="lowest">{isVi ? 'Điểm thấp nhất' : 'Lowest rated'}</option>
            </select>
          </div>

          {items.length === 0 && !loading ? (
            <EmptyState
              title={isVi ? 'Chưa có đánh giá' : 'No reviews yet'}
              description={
                isVi
                  ? 'Ứng viên đã ứng tuyển vào công ty có thể chia sẻ trải nghiệm tại đây.'
                  : 'Candidates who applied to this company can share their experience here.'
              }
            />
          ) : (
            <div>
              {items.map((r) => (
                <ReviewItem key={r.id} review={r} isVi={isVi} />
              ))}
            </div>
          )}

          {data && data.page + 1 < data.totalPages && (
            <div className="pt-4 text-center">
              <button type="button" onClick={() => load(data.page + 1)} disabled={loading} className={btnSecondary} data-testid="review-load-more">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isVi ? 'Xem thêm đánh giá' : 'Load more reviews'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
