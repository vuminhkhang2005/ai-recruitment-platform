import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { CITIES } from '../../lib/format';

/** Search console in the original TalentBridge style: gradient frame, divided fields, gradient button. */
export const SearchBar: React.FC<{
  keyword?: string;
  city?: string;
  onSearch: (keyword: string, city: string) => void;
}> = ({ keyword = '', city = '', onSearch }) => {
  const [kw, setKw] = useState(keyword);
  const [ct, setCt] = useState(city);

  useEffect(() => setKw(keyword), [keyword]);
  useEffect(() => setCt(city), [city]);

  return (
    <div className="p-[2px] rounded-3xl bg-gradient-to-r from-emerald-500/40 via-teal-400/30 to-cyan-500/40 shadow-[0_12px_35px_-12px_rgba(16,185,129,0.25)]">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(kw.trim(), ct);
        }}
        className="bg-white/95 dark:bg-slate-900/95 rounded-[calc(1.5rem-2px)] p-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="Nhập từ khóa theo kỹ năng, chức vụ, công ty…"
            aria-label="Từ khóa"
            className="w-full h-12 pl-12 pr-3 rounded-2xl bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/60"
          />
        </div>
        <span className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
        <div className="relative sm:w-56">
          <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={ct}
            onChange={(e) => setCt(e.target.value)}
            aria-label="Địa điểm"
            className="w-full h-12 pl-12 pr-3 rounded-2xl bg-transparent text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/60 dark:[&>option]:bg-slate-900"
          >
            <option value="">Tất cả thành phố</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="sm:ml-2 h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-soft inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Tìm kiếm
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
