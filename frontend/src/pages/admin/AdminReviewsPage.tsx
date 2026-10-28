import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, MessageSquareText, RefreshCw, Search, ThumbsDown, ThumbsUp } from 'lucide-react';
import { reviewApi } from '../../lib/api';
import type { CompanyReview } from '../../lib/types';
import { EmptyState, ErrorBox, Modal, PageLoader, btnPrimary, btnSecondary, inputCls } from '../../components/ui/primitives';
import { StarRating } from '../../components/companies/CompanyReviewsSection';
import { usePageTitle } from '../../lib/usePageTitle';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { AdminHeader } from './AdminHeader';

type StatusFilter = 'ALL' | 'PUBLISHED' | 'HIDDEN';

/** Admin moderation of candidate company reviews (hide with a reason / re-publish). */
export const AdminReviewsPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  usePageTitle(isVi ? 'Kiểm duyệt Đánh giá công ty' : 'Company Review Moderation');
  const toast = useToast();

  const [reviews, setReviews] = useState<CompanyReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [keyword, setKeyword] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [hiding, setHiding] = useState<CompanyReview | null>(null);
  const [note, setNote] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await reviewApi.adminList({ status: status === 'ALL' ? undefined : status, keyword: keyword.trim() || undefined }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [status, keyword]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const visible = useMemo(
    () => (reviews ?? []).filter((r) => !ratingFilter || r.rating === ratingFilter),
    [reviews, ratingFilter],
  );

  const counts = useMemo(() => {
    const all = reviews ?? [];
    return {
      total: all.length,
      hidden: all.filter((r) => r.status === 'HIDDEN').length,
      low: all.filter((r) => r.rating <= 2).length,
      avg: all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0,
    };
  }, [reviews]);

  const moderate = async (review: CompanyReview, next: 'PUBLISHED' | 'HIDDEN', reason?: string) => {
    setBusyId(review.id);
    try {
      const updated = await reviewApi.adminModerate(review.id, next, reason);
      setReviews((prev) => (prev ?? []).map((r) => (r.id === updated.id ? updated : r)));
      toast(
        next === 'HIDDEN' ? (isVi ? 'Đã ẩn đánh giá' : 'Review hidden') : isVi ? 'Đã hiển thị lại đánh giá' : 'Review re-published',
        'success',
      );
      setHiding(null);
      setNote('');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (error && !reviews) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <ErrorBox message={error} onRetry={load} />
      </div>
    );
  }
  if (!reviews) return <PageLoader />;

  const kpi = 'rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/70 p-4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" data-testid="admin-reviews-page">
      <AdminHeader
        title={isVi ? 'Kiểm duyệt Đánh giá công ty' : 'Company Review Moderation'}
        subtitle={
          isVi
            ? 'Rà soát đánh giá của ứng viên, ẩn nội dung vi phạm (kèm lý do) và hiển thị lại khi cần. Mọi thao tác đều được ghi vào Audit Log.'
            : 'Review candidate feedback, hide abusive content (with a reason) and re-publish when needed. Every action is written to the audit log.'
        }
        rightSlot={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-soft-xs transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {isVi ? 'Tải lại' : 'Refresh'}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={kpi}>
          <p className="text-xs font-bold text-slate-500 uppercase">{isVi ? 'Tổng đánh giá' : 'Total reviews'}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{counts.total}</p>
        </div>
        <div className={kpi}>
          <p className="text-xs font-bold text-slate-500 uppercase">{isVi ? 'Điểm trung bình' : 'Average rating'}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {counts.avg ? counts.avg.toFixed(1) : '—'}
            {counts.avg > 0 && <StarRating value={counts.avg} />}
          </p>
        </div>
        <div className={kpi}>
          <p className="text-xs font-bold text-slate-500 uppercase">{isVi ? 'Điểm thấp (≤ 2★)' : 'Low ratings (≤ 2★)'}</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{counts.low}</p>
        </div>
        <div className={kpi}>
          <p className="text-xs font-bold text-slate-500 uppercase">{isVi ? 'Đang ẩn' : 'Hidden'}</p>
          <p className="mt-1 text-2xl font-black text-rose-600">{counts.hidden}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={isVi ? 'Tìm trong tiêu đề, ưu / nhược điểm' : 'Search title, pros, cons'}
            className={`${inputCls} pl-9 w-72`}
            aria-label={isVi ? 'Tìm đánh giá' : 'Search reviews'}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className={`${inputCls} w-auto`} aria-label="status">
          <option value="ALL">{isVi ? 'Mọi trạng thái' : 'All statuses'}</option>
          <option value="PUBLISHED">{isVi ? 'Đang hiển thị' : 'Published'}</option>
          <option value="HIDDEN">{isVi ? 'Đang ẩn' : 'Hidden'}</option>
        </select>
        <select value={ratingFilter} onChange={(e) => setRatingFilter(Number(e.target.value))} className={`${inputCls} w-auto`} aria-label="rating">
          <option value={0}>{isVi ? 'Mọi số sao' : 'All ratings'}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}★
            </option>
          ))}
        </select>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 ? (
          <EmptyState title={isVi ? 'Không có đánh giá phù hợp' : 'No matching reviews'} />
        ) : (
          visible.map((r) => (
            <article
              key={r.id}
              data-testid="admin-review-row"
              className={`rounded-2xl border p-4 sm:p-5 bg-white dark:bg-slate-800/70 ${
                r.status === 'HIDDEN' ? 'border-rose-200 dark:border-rose-900/60 opacity-80' : 'border-slate-200/80 dark:border-slate-700/60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StarRating value={r.rating} />
                    <h3 className="font-bold text-slate-900 dark:text-white">{r.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        r.status === 'HIDDEN'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {r.status === 'HIDDEN' ? (isVi ? 'Đang ẩn' : 'Hidden') : isVi ? 'Đang hiển thị' : 'Published'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <Link to={`/companies/${r.companyId}#reviews`} className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      {r.companyName}
                    </Link>
                    {' · '}
                    {r.authorName} &lt;{r.authorEmail}&gt;
                    {r.anonymous && ` · ${isVi ? 'đăng ẩn danh' : 'posted anonymously'}`}
                    {' · '}
                    {r.experienceLevel}
                    {' · '}
                    {new Date(r.createdAt).toLocaleString(isVi ? 'vi-VN' : 'en-GB')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'PUBLISHED' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setHiding(r);
                        setNote('');
                      }}
                      disabled={busyId === r.id}
                      className={`${btnSecondary} text-rose-600`}
                      data-testid="admin-review-hide"
                    >
                      <EyeOff className="w-4 h-4" /> {isVi ? 'Ẩn' : 'Hide'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => moderate(r, 'PUBLISHED')}
                      disabled={busyId === r.id}
                      className={btnSecondary}
                      data-testid="admin-review-publish"
                    >
                      {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      {isVi ? 'Hiển thị lại' : 'Re-publish'}
                    </button>
                  )}
                </div>
              </div>
              {r.pros && (
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  <ThumbsUp className="inline w-3.5 h-3.5 text-emerald-600 mr-1" />
                  {r.pros}
                </p>
              )}
              {r.cons && (
                <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  <ThumbsDown className="inline w-3.5 h-3.5 text-rose-600 mr-1" />
                  {r.cons}
                </p>
              )}
              {r.status === 'HIDDEN' && r.moderationNote && (
                <p className="mt-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {isVi ? 'Lý do ẩn: ' : 'Hidden because: '}
                  {r.moderationNote}
                </p>
              )}
            </article>
          ))
        )}
      </div>

      {hiding && (
        <Modal title={isVi ? 'Ẩn đánh giá' : 'Hide review'} onClose={() => setHiding(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <MessageSquareText className="inline w-4 h-4 mr-1" />“{hiding.title}” — {hiding.companyName}
            </p>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isVi ? 'Lý do (ứng viên sẽ thấy lý do này)' : 'Reason (shown to the author)'}
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                className={`${inputCls} mt-1`}
                placeholder={isVi ? 'Vd: Ngôn từ xúc phạm, thông tin cá nhân, spam...' : 'e.g. Abusive language, personal data, spam...'}
                data-testid="admin-review-note"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className={btnSecondary} onClick={() => setHiding(null)}>
                {isVi ? 'Huỷ' : 'Cancel'}
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={!note.trim() || busyId === hiding.id}
                onClick={() => moderate(hiding, 'HIDDEN', note.trim())}
                data-testid="admin-review-confirm-hide"
              >
                {busyId === hiding.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {isVi ? 'Xác nhận ẩn' : 'Hide review'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
