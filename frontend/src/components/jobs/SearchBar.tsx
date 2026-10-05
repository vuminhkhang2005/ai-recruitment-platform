import React, { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { CITIES } from '../../lib/format';

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
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(kw.trim(), ct);
      }}
      className="flex flex-col sm:flex-row gap-2"
    >
      <div className="relative sm:w-48">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <select
          value={ct}
          onChange={(e) => setCt(e.target.value)}
          aria-label="Địa điểm"
          className="w-full h-12 pl-9 pr-3 rounded-md bg-white text-sm text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
        >
          <option value="">Tất cả thành phố</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="Nhập từ khóa theo kỹ năng, chức vụ, công ty…"
          aria-label="Từ khóa"
          className="w-full h-12 pl-9 pr-3 rounded-md bg-white text-sm text-slate-900 border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
        />
      </div>
      <button type="submit" className="h-12 px-8 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold text-sm">
        Tìm kiếm
      </button>
    </form>
  );
};
