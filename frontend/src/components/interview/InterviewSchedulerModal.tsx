import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  Check, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Bell, 
  Send,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface InterviewScheduleData {
  jobTitle: string;
  company: string;
  candidateName?: string;
  candidateEmail?: string;
}

interface InterviewSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InterviewScheduleData | null;
  onSuccess?: (details: { date: string; time: string; format: string }) => void;
}

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  isOpen,
  onClose,
  data,
  onSuccess
}) => {
  if (!isOpen || !data) return null;

  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 - 11:00');
  const [meetingFormat, setMeetingFormat] = useState<'google_meet' | 'zoom' | 'onsite'>('google_meet');
  const [roundType, setRoundType] = useState<'tech_deep_dive' | 'system_design' | 'hr_culture'>('tech_deep_dive');
  const [notes, setNotes] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const TIME_SLOTS = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '14:00 - 15:00',
    '15:30 - 16:30'
  ];

  const roundTitles: Record<string, { vi: string; en: string }> = {
    tech_deep_dive: { vi: 'Vòng 1: Phỏng vấn Kỹ thuật Chuyên sâu', en: 'Round 1: Technical Deep-Dive' },
    system_design: { vi: 'Vòng 2: Thiết kế Kiến trúc Hệ thống', en: 'Round 2: System Architecture & Design' },
    hr_culture: { vi: 'Vòng 3: Văn hóa Doanh nghiệp & Trao đổi Offer', en: 'Round 3: Culture & Offer Negotiation' }
  };

  const currentRoundTitle = isVi ? roundTitles[roundType].vi : roundTitles[roundType].en;
  const meetLink = 'https://meet.google.com/tb-int-2026';

  // Generate Google Calendar Link
  const handleOpenGoogleCalendar = () => {
    const title = encodeURIComponent(`[TalentBridge] ${currentRoundTitle} - ${data.jobTitle} @ ${data.company}`);
    const details = encodeURIComponent(
      `Phỏng vấn vị trí: ${data.jobTitle} tại ${data.company}\nỨng viên: ${data.candidateName || 'Vũ Minh Khang'}\nHình thức: ${meetingFormat === 'google_meet' ? 'Google Meet (' + meetLink + ')' : meetingFormat === 'zoom' ? 'Zoom' : 'Tại văn phòng'}\nGhi chú: ${notes || 'Vui lòng chuẩn bị slide hoặc portfolio dự án gần nhất.'}`
    );
    const location = encodeURIComponent(meetingFormat === 'google_meet' ? meetLink : 'Trụ sở công ty ' + data.company);
    
    // Dates formatted as YYYYMMDDTHHmmssZ
    const dateClean = selectedDate.replace(/-/g, '');
    const startTimeClean = selectedTimeSlot.split(' - ')[0].replace(':', '') + '00';
    const endTimeClean = selectedTimeSlot.split(' - ')[1].replace(':', '') + '00';
    const datesParam = `${dateClean}T${startTimeClean}/${dateClean}T${endTimeClean}`;

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${datesParam}`;
    window.open(gcalUrl, '_blank');
  };

  // Generate .ICS file download
  const handleDownloadIcs = () => {
    const title = `[TalentBridge] ${currentRoundTitle} - ${data.jobTitle}`;
    const dateClean = selectedDate.replace(/-/g, '');
    const startTimeClean = selectedTimeSlot.split(' - ')[0].replace(':', '') + '00';
    const endTimeClean = selectedTimeSlot.split(' - ')[1].replace(':', '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TalentBridge//AI Recruitment Platform//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:Phong van vi tri ${data.jobTitle} tai ${data.company}`,
      `LOCATION:${meetingFormat === 'google_meet' ? meetLink : 'Van phong ' + data.company}`,
      `DTSTART:${dateClean}T${startTimeClean}`,
      `DTEND:${dateClean}T${endTimeClean}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_${data.company.replace(/\s+/g, '_')}_${dateClean}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduled(true);
    onSuccess?.({
      date: selectedDate,
      time: selectedTimeSlot,
      format: meetingFormat
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      data-testid="interview-scheduler-modal"
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-soft">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isVi ? 'Điều Phối & Đồng Bộ Lịch Phỏng Vấn' : 'Interview Coordinator & Calendar Sync'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
                  AI Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.jobTitle} • <span className="font-semibold text-emerald-600">{data.company}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="btn-close-scheduler-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          
          {isScheduled ? (
            /* Scheduled Success State */
            <div 
              data-testid="scheduler-success-state"
              className="p-6 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-fade-in"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {isVi ? 'Đã Lên Lịch & Đồng Bộ Thành Công!' : 'Interview Successfully Scheduled!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {isVi 
                    ? `Buổi phỏng vấn ${currentRoundTitle} đã được xác nhận vào lúc ${selectedTimeSlot}, ngày ${selectedDate}.` 
                    : `Confirmed for ${selectedTimeSlot} on ${selectedDate}.`}
                </p>
              </div>

              {/* Sync Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  data-testid="btn-sync-gcal"
                  onClick={handleOpenGoogleCalendar}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-soft-2xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Google Calendar</span>
                </button>

                <button
                  type="button"
                  data-testid="btn-download-ics"
                  onClick={handleDownloadIcs}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-soft-2xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-teal-500" />
                  <span>File Lịch (.ics)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-soft cursor-pointer transition-all"
                >
                  {isVi ? 'Xong & Đóng' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            /* Scheduling Form */
            <form onSubmit={handleConfirmSchedule} className="space-y-4">
              
              {/* Round Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isVi ? 'Vòng phỏng vấn' : 'Interview Round'}
                </label>
                <select
                  value={roundType}
                  data-testid="select-round-type"
                  onChange={(e) => setRoundType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="tech_deep_dive">Vòng 1: Phỏng vấn Kỹ thuật Chuyên sâu (Tech Deep-Dive)</option>
                  <option value="system_design">Vòng 2: Thiết kế Kiến trúc Hệ thống (System Architecture)</option>
                  <option value="hr_culture">Vòng 3: Văn hóa Doanh nghiệp & Trao đổi Offer</option>
                </select>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    {isVi ? 'Ngày phỏng vấn' : 'Interview Date'}
                  </label>
                  <input
                    type="date"
                    data-testid="input-scheduler-date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    {isVi ? 'Khung giờ phù hợp' : 'Time Slot'}
                  </label>
                  <select
                    value={selectedTimeSlot}
                    data-testid="select-time-slot"
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Format Selection (Google Meet vs Zoom vs Onsite) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isVi ? 'Hình thức phỏng vấn & Kết nối' : 'Interview Medium'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    data-testid="format-google-meet"
                    onClick={() => setMeetingFormat('google_meet')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      meetingFormat === 'google_meet'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 shadow-soft-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-4 h-4 text-emerald-500" />
                    <span>Google Meet</span>
                  </button>

                  <button
                    type="button"
                    data-testid="format-zoom"
                    onClick={() => setMeetingFormat('zoom')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      meetingFormat === 'zoom'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 shadow-soft-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Video className="w-4 h-4 text-blue-500" />
                    <span>Zoom Video</span>
                  </button>

                  <button
                    type="button"
                    data-testid="format-onsite"
                    onClick={() => setMeetingFormat('onsite')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      meetingFormat === 'onsite'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 shadow-soft-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <span>{isVi ? 'Tại văn phòng' : 'On-site Office'}</span>
                  </button>
                </div>
              </div>

              {/* Automatic Meet Link Card */}
              {meetingFormat === 'google_meet' && (
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Link phòng họp: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{meetLink}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    Sẵn sàng
                  </span>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isVi ? 'Ghi chú cho buổi phỏng vấn (Tùy chọn)' : 'Interview Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  data-testid="input-scheduler-notes"
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isVi ? 'VD: Trình bày dự án Transformer gần nhất, chuẩn bị câu hỏi kiến trúc...' : 'e.g. Prepare system design portfolio...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  data-testid="btn-submit-schedule"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-soft flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isVi ? 'Xác Nhận Lịch Phỏng Vấn' : 'Confirm & Dispatch Calendar'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
