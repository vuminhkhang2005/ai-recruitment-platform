import React, { useEffect, useState } from 'react';
import { Building2, Globe, MapPin, Users, Briefcase, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { userApi, companyApi } from '../../lib/api';
import type { Company, UserProfile } from '../../lib/types';
import { useLanguage } from '../../i18n/LanguageContext';

export const EmployerCompanyPage: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setLoading(true);
    userApi
      .getMe()
      .then(async (me) => {
        setProfile(me);
        if (me.companyId) {
          const comp = await companyApi.get(me.companyId);
          setCompany(comp);
          setName(comp.name || '');
          setLogoUrl(comp.logoUrl || '');
          setBannerUrl(comp.bannerUrl || '');
          setWebsite(comp.website || '');
          setCompanySize(comp.companySize || '');
          setIndustry(comp.industry || '');
          setAddress(comp.address || '');
          setCity(comp.city || '');
          setDescription(comp.description || '');
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await companyApi.update(company.id, {
        name: name.trim(),
        logoUrl: logoUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        website: website.trim() || undefined,
        companySize: companySize || undefined,
        industry: industry.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
      });
      setCompany(updated);
      setSuccess(isVi ? 'Đã lưu thông tin công ty thành công!' : 'Company details saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : isVi ? 'Lưu thất bại' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const isAdmin = profile?.teamRole === 'ADMIN' || profile?.isCompanyAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          {isVi ? 'Hồ sơ Công ty Tuyển dụng' : 'Company Profile'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {isVi
            ? 'Cập nhật thương hiệu, thông tin giới thiệu và quy mô doanh nghiệp trên TalentBridge'
            : 'Update company branding, description, and enterprise details on TalentBridge'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isVi ? 'Tên công ty' : 'Company Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            disabled={!isAdmin}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Link ảnh Logo' : 'Logo URL'}
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Link ảnh Banner' : 'Banner URL'}
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://.../banner.jpg"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Website' : 'Website'}
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.com"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Quy mô công ty' : 'Company Size'}
            </label>
            <select
              disabled={!isAdmin}
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
            >
              <option value="">{isVi ? '-- Chọn quy mô --' : '-- Select size --'}</option>
              <option value="1-50">1-50 {isVi ? 'nhân viên' : 'employees'}</option>
              <option value="50-200">50-200 {isVi ? 'nhân viên' : 'employees'}</option>
              <option value="200-500">200-500 {isVi ? 'nhân viên' : 'employees'}</option>
              <option value="500-1000">500-1000 {isVi ? 'nhân viên' : 'employees'}</option>
              <option value="1000+">1000+ {isVi ? 'nhân viên' : 'employees'}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Ngành nghề' : 'Industry'}
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Fintech, E-commerce, AI..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isVi ? 'Thành phố' : 'City'}
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="TP. Hồ Chí Minh, Hà Nội..."
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isVi ? 'Địa chỉ trụ sở' : 'Office Address'}
          </label>
          <input
            type="text"
            disabled={!isAdmin}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Tầng X, Toà nhà Y, Đường Z..."
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {isVi ? 'Giới thiệu công ty' : 'About Company'}
          </label>
          <textarea
            rows={5}
            disabled={!isAdmin}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isVi ? 'Mô tả về văn hoá, sứ mệnh và môi trường làm việc...' : 'Describe company culture, mission, and work environment...'}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800"
          />
        </div>

        {isAdmin ? (
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (isVi ? 'Đang lưu...' : 'Saving...') : isVi ? 'Lưu thông tin công ty' : 'Save Details'}</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            {isVi
              ? 'Chỉ Quản trị viên công ty mới có quyền cập nhật thông tin hồ sơ doanh nghiệp.'
              : 'Only company administrators have permission to modify company profile details.'}
          </p>
        )}
      </form>
    </div>
  );
};
