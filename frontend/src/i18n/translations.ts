export type Language = 'vi' | 'en';

export interface Translations {
  nav: {
    brandSubtitle: string;
    findJobs: string;
    topCompanies: string;
    careerGuide: string;
    cvScanner: string;
    skillRoadmap: string;
    profile: string;
    employers: string;
    candidateRole: string;
    recruiterRole: string;
    postJob: string;
    login: string;
    getStarted: string;
    notificationsTitle: string;
    markAllRead: string;
    noNotifications: string;
    recruiterActiveBanner: string;
  };
  hero: {
    topBadgePill: string;
    topBadgeSub: string;
    headline: string;
    subtitle: string;
    inputTitle: string;
    inputLocation: string;
    inputCategory: string;
    btnFindJob: string;
    trending: string;
    badgeManual: string;
    badgePrivacy: string;
    badgeExplain: string;
    scannerCardTitle: string;
    scannerCardEngine: string;
    simulatedCandidate: string;
    targetRole: string;
    jdMatchRate: string;
    coreSkillsExtracted: string;
    aiAdviceTitle: string;
    aiAdviceBody: string;
    btnTryScan: string;
    floatingInterviewChance: string;
    floatingInterviewSub: string;
  };
  categories: {
    title: string;
    subtitle: string;
    jobCountSuffix: string;
  };
  hotJobs: {
    title: string;
    subtitle: string;
    tabAll: string;
    tabHighSalary: string;
    tabUrgent: string;
    tabRemote: string;
    applyNow: string;
    viewDetails: string;
    aiMatchScore: string;
    moreSkills: string;
  };
  topCompanies: {
    title: string;
    subtitle: string;
    openJobs: string;
    viewJobs: string;
    rating: string;
  };
  quickCv: {
    title: string;
    subtitle: string;
    btnUpload: string;
    btnDemo: string;
    note: string;
  };
  stats: {
    stat1Label: string;
    stat1Desc: string;
    stat2Label: string;
    stat2Desc: string;
    stat3Label: string;
    stat3Desc: string;
    stat4Label: string;
    stat4Desc: string;
    partnersTitle: string;
  };
  scanner: {
    badge: string;
    headline: string;
    subtitle: string;
    dragDropText: string;
    browseFile: string;
    fileLimitNote: string;
    complianceNote: string;
    testingFileLabel: string;
    sampleBadge: string;
    btnRescan: string;
    btnScanning: string;
    scoreTitle: string;
    scoreRating: string;
    candidateNameLabel: string;
    candidateRoleLabel: string;
    candidateContactLabel: string;
    btnMatchJobs: string;
    tabOverview: string;
    tabSkills: string;
    tabRecommendations: string;
    auditCard1Title: string;
    auditCard1Desc: string;
    auditCard2Title: string;
    auditCard2Desc: string;
    auditCard3Title: string;
    auditCard3Desc: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  bento: {
    badge: string;
    headline: string;
    subtitle: string;
    card1Badge: string;
    card1Title: string;
    card1Desc: string;
    card1Metric1Label: string;
    card1Metric2Label: string;
    card1Metric3Label: string;
    card2Badge: string;
    card2Title: string;
    card2Desc: string;
    card2Compliance: string;
    card3Badge: string;
    card3Title: string;
    card3Desc: string;
    card3Metric: string;
    card3Cta: string;
    card4Badge: string;
    card4Title: string;
    card4Desc: string;
    card4Integration: string;
    card4Cta: string;
  };
  jobs: {
    badge: string;
    headline: string;
    subtitle: string;
    filterAll: string;
    filterAi: string;
    filterBackend: string;
    filterFrontend: string;
    filterDevops: string;
    filterProduct: string;
    urgentBadge: string;
    matchScore: string;
    btnApply: string;
    btnDetails: string;
    btnExploreAll: string;
    savedToast: string;
    removedToast: string;
    quickApplyToast: string;
  };
  roadmap: {
    badge: string;
    headline: string;
    subtitle: string;
    track1Title: string;
    track1Duration: string;
    track2Title: string;
    track2Duration: string;
    track3Title: string;
    track3Duration: string;
    targetTitle: string;
    readinessLabel: string;
    hoursLabel: string;
    skillsGoalLabel: string;
    disclaimer: string;
    btnCreateRoadmap: string;
  };
  employer: {
    badge: string;
    headline: string;
    subtitle: string;
    pipelineTitle: string;
    pipelineCount: string;
    autoFilterStatus: string;
    btnRescanAll: string;
    col1Title: string;
    col2Title: string;
    col3Title: string;
    col4Title: string;
    verifiedAts: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    btnPostJob: string;
    btnScheduleDemo: string;
  };
  testimonials: {
    badge: string;
    headline: string;
    subtitle: string;
    quote1: string;
    quote2: string;
    quote3: string;
  };
  cta: {
    badge: string;
    headline: string;
    subtitle: string;
    btnScanCv: string;
    btnForEmployers: string;
    complianceBadge: string;
    noCardNeeded: string;
    securityAssurance: string;
    btnCandidate: string;
    btnEmployer: string;
    securityBadge: string;
    noCardBadge: string;
    cancelBadge: string;
  };
  footer: {
    brandDesc: string;
    mission: string;
    complianceNotice: string;
    hotline: string;
    colCandidates: string;
    colCandidateTitle: string;
    linkFindJobs: string;
    linkAtsScanner: string;
    linkRoadmap: string;
    linkAiMatch: string;
    linkProResume: string;
    colEmployers: string;
    colEmployerTitle: string;
    linkPostJob: string;
    linkAtsKanban: string;
    linkTalentPool: string;
    linkAiScreening: string;
    linkPricing: string;
    colNewsletter: string;
    colNewsletterTitle: string;
    newsletterDesc: string;
    emailPlaceholder: string;
    btnSubscribe: string;
    subscribedToast: string;
    copyright: string;
    terms: string;
    privacy: string;
    language: string;
  };
  jobModal: {
    salary: string;
    type: string;
    level: string;
    matchScore: string;
    whyAiMatch: string;
    jobDesc: string;
    requirements: string;
    coreSkills: string;
    benefits: string;
    aiCoverLetterTitle: string;
    aiCoverLetterDesc: string;
    btnGenerateLetter: string;
    btnGenerating: string;
    applicationFormTitle: string;
    fullNamePlaceholder: string;
    emailPlaceholder: string;
    btnSubmitApplication: string;
    appliedSuccess: string;
    close: string;
  };
  authModal: {
    loginTitle: string;
    registerTitle: string;
    welcomeSubtitle: string;
    candidateRole: string;
    recruiterRole: string;
    googleAuth: string;
    linkedinAuth: string;
    orEmail: string;
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    btnLogin: string;
    btnRegister: string;
    btnDemoLogin: string;
    noAccountPrompt: string;
    haveAccountPrompt: string;
    registerNow: string;
    loginNow: string;
    authSuccess: string;
  };
}

export const translations: Record<Language, Translations> = {
  vi: {
    nav: {
      brandSubtitle: 'NỀN TẢNG TUYỂN DỤNG & VIỆC LÀM AI',
      findJobs: 'Tìm việc làm',
      topCompanies: 'Công ty',
      careerGuide: 'Cẩm nang nghề nghiệp',
      cvScanner: 'Tạo & Quét CV AI',
      skillRoadmap: 'Lộ trình kỹ năng',
      profile: 'Hồ sơ',
      employers: 'Doanh nghiệp & ATS',
      candidateRole: 'Ứng viên',
      recruiterRole: 'Nhà tuyển dụng',
      postJob: 'Đăng tin tuyển dụng',
      login: 'Đăng nhập',
      getStarted: 'Tạo tài khoản',
      notificationsTitle: 'Thông báo mới nhất',
      markAllRead: 'Đánh dấu đã đọc',
      noNotifications: 'Không có thông báo mới',
      recruiterActiveBanner: 'Chế độ Nhà Tuyển Dụng đang kích hoạt: Khám phá công cụ ATS tự động lọc CV và phân loại ứng viên thông minh bên dưới.'
    },
    hero: {
      topBadgePill: 'NỀN TẢNG TUYỂN DỤNG THẾ HỆ MỚI 2026',
      topBadgeSub: 'Bóc tách CV & Matching AI',
      headline: 'Tìm kiếm công việc mơ ước của bạn',
      subtitle: 'Kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu. 10,000+ cơ hội đang chờ bạn!',
      inputTitle: 'Chức danh, từ khóa, kỹ năng (VD: ReactJS, Marketing...)',
      inputLocation: 'Tất cả',
      inputCategory: 'Tất cả ngành nghề',
      btnFindJob: 'Tìm việc ngay',
      trending: 'Gợi ý xu hướng:',
      badgeManual: 'Không cần chỉnh sửa tay',
      badgePrivacy: 'Bảo mật dữ liệu 100%',
      badgeExplain: 'Giải thích lý do AI match',
      scannerCardTitle: 'Bóc tách CV Thời gian thực',
      scannerCardEngine: 'Phân tích bằng Gemini 2.0 Flash',
      simulatedCandidate: 'Ứng viên mô phỏng',
      targetRole: 'Senior Fullstack',
      jdMatchRate: 'Độ khớp tiêu chuẩn công việc (JD Match)',
      coreSkillsExtracted: 'KỸ NĂNG CỐT LÕI ĐƯỢC AI TRÍCH XUẤT:',
      aiAdviceTitle: 'Gợi ý tối ưu từ AI:',
      aiAdviceBody: '"CV của bạn có thế mạnh lớn về Frontend. Bổ sung thêm kinh nghiệm về Caching Redis và Message Queue sẽ giúp bạn tăng tỷ lệ qua vòng hồ sơ lên 99%."',
      btnTryScan: 'Thử nghiệm Bóc tách CV của bạn ngay',
      floatingInterviewChance: '+3.2x Cơ hội Phỏng vấn',
      floatingInterviewSub: 'Đã tối ưu chuẩn ATS Quốc tế'
    },
    categories: {
      title: 'Top Ngành nghề nổi bật',
      subtitle: 'Khám phá các ngành nghề có nhu cầu tuyển dụng lớn nhất và mức thu nhập hấp dẫn',
      jobCountSuffix: 'việc làm'
    },
    hotJobs: {
      title: 'Việc làm tuyển gấp / Phù hợp nhất',
      subtitle: 'Được hệ thống AI tự động đề xuất dựa trên xu hướng thị trường và năng lực ứng viên',
      tabAll: 'Tất cả việc làm',
      tabHighSalary: 'Lương cao (> 30 Triệu)',
      tabUrgent: 'Tuyển gấp',
      tabRemote: 'Làm việc từ xa (Remote)',
      applyNow: 'Ứng tuyển ngay',
      viewDetails: 'Chi tiết & AI Match',
      aiMatchScore: 'AI Match',
      moreSkills: 'kỹ năng khác'
    },
    topCompanies: {
      title: 'Top Công ty hàng đầu đang tuyển',
      subtitle: 'Khám phá môi trường làm việc lý tưởng và chế độ đãi ngộ vượt trội từ các tập đoàn công nghệ',
      openJobs: 'việc làm đang mở',
      viewJobs: 'Xem việc làm',
      rating: 'Đánh giá'
    },
    quickCv: {
      title: 'Kéo thả CV để AI tự động tìm việc làm phù hợp trong 5 giây',
      subtitle: 'Hệ thống tự động phân tích kinh nghiệm, đo lường điểm chuẩn ATS và kết nối trực tiếp với 100+ vị trí tuyển dụng tương thích nhất.',
      btnUpload: 'Tải CV lên ngay',
      btnDemo: 'Chạy thử với CV mẫu',
      note: 'Hỗ trợ PDF, DOCX tối đa 10MB • Bảo mật chuẩn Nghị định 13/2023/NĐ-CP'
    },
    stats: {
      stat1Label: '10,000+',
      stat1Desc: 'Việc làm chất lượng cao',
      stat2Label: '3,800+',
      stat2Desc: 'Doanh nghiệp tin cậy tuyển dụng',
      stat3Label: '96.4%',
      stat3Desc: 'Độ chính xác AI Semantic Matching',
      stat4Label: '3-5 Ngày',
      stat4Desc: 'Thời gian kết nối phỏng vấn',
      partnersTitle: 'ĐƯỢC TIN TƯỞNG BỞI CÁC DOANH NGHIỆP CÔNG NGHỆ HÀNG ĐẦU'
    },
    scanner: {
      badge: 'CÔNG NGHỆ BÓC TÁCH CV THỜI GIAN THỰC',
      headline: 'Kiểm tra Độ chuẩn ATS & Bóc tách Kỹ năng bằng AI',
      subtitle: 'Tải lên bản CV của bạn để AI phân tích cấu trúc, trích xuất dữ liệu thực thể và kiểm tra xem hồ sơ của bạn có vượt qua các thuật toán lọc tự động của nhà tuyển dụng hay không.',
      dragDropText: 'Kéo thả file CV vào đây hoặc',
      browseFile: 'chọn tệp từ máy tính',
      fileLimitNote: 'Hỗ trợ định dạng PDF, DOCX dung lượng tối đa 10MB',
      complianceNote: 'Bảo mật tuyệt đối 100% theo Nghị định 13/2023/NĐ-CP',
      testingFileLabel: 'File đang thử nghiệm:',
      sampleBadge: 'Mẫu thực tế',
      btnRescan: 'Chạy lại mô phỏng quét AI ngay',
      btnScanning: 'Đang bóc tách thực thể AI...',
      scoreTitle: 'ĐIỂM CHUẨN ATS',
      scoreRating: 'Xuất sắc - Chuẩn ATS Quốc tế',
      candidateNameLabel: 'Ứng viên:',
      candidateRoleLabel: 'Chức danh:',
      candidateContactLabel: 'Liên hệ:',
      btnMatchJobs: 'Xem các việc làm khớp > 90%',
      tabOverview: 'Tổng quan đánh giá',
      tabSkills: 'Kỹ năng nhận diện',
      tabRecommendations: 'Khuyến nghị cải thiện',
      auditCard1Title: 'Định dạng & Bố cục',
      auditCard1Desc: 'Cấu trúc một cột chuẩn mực, các đầu mục Kinh nghiệm và Học vấn phân cấp rõ ràng, phông chữ đạt tiêu chuẩn.',
      auditCard2Title: 'Mật độ Từ khóa Kỹ thuật',
      auditCard2Desc: 'Đạt 92% độ phủ từ khóa ngành Fullstack (React, Node, SQL, Docker). Phù hợp với các yêu cầu Senior hiện nay.',
      auditCard3Title: 'Chỉ số Đo lường Tác động',
      auditCard3Desc: 'Nên bổ sung thêm phần trăm con số liệu định lượng (VD: cải thiện 30% tốc độ render, giảm chi phí server).',
      step1: 'Bóc tách cấu trúc Layout & Phông chữ',
      step2: 'Trích xuất thực thể NER (Kỹ năng, Kinh nghiệm)',
      step3: 'Đối chiếu với 150+ tiêu chuẩn ATS toàn cầu',
      step4: 'Sinh khuyến nghị tối ưu hóa bằng AI'
    },
    bento: {
      badge: 'KIẾN TRÚC CÔNG NGHỆ CỐT LÕI',
      headline: 'Bộ Giải pháp Toàn diện cho Kỷ nguyên Tuyển dụng AI',
      subtitle: 'Kết hợp mô hình học sâu, Vector Database và kiến trúc Microservices để giải quyết bài toán tuyển dụng từ gốc rễ: tính minh bạch, sự chính xác và định hướng phát triển bền vững.',
      card1Badge: 'THUẬT TOÁN ĐỘC QUYỀN',
      card1Title: 'Công cụ Đo lường Độ phù hợp Semantic Matching 2 Chiều',
      card1Desc: 'Không chỉ đếm từ khóa thô sơ. Hệ thống mã hóa hồ sơ CV và yêu cầu tuyển dụng (JD) thành các vector ngữ nghĩa 1536 chiều, phân tích đồng thời 4 trục: năng lực kỹ thuật, kinh nghiệm, dự án thực chiến và văn hóa doanh nghiệp.',
      card1Metric1Label: 'Độ sâu Vector',
      card1Metric2Label: 'Tốc độ Matching',
      card1Metric3Label: 'Giải minh bạch',
      card2Badge: 'BÓC TÁCH DỮ LIỆU',
      card2Title: 'Bóc tách CV Tự động & Chuẩn hóa ATS Score',
      card2Desc: 'Nhận diện chính xác 98% cấu trúc CV tiếng Việt và tiếng Anh. Kiểm tra hơn 150 tiêu chí lọc của các hệ thống Applicant Tracking System quốc tế như Greenhouse, Lever, Workday.',
      card2Compliance: 'Đạt chuẩn Nghị định 13/2023/NĐ-CP',
      card3Badge: 'CÁ NHÂN HÓA LỘ TRÌNH',
      card3Title: 'Bản đồ Khoảng cách Kỹ năng (Skill Gap Roadmap)',
      card3Desc: 'Hệ thống tự động so khớp năng lực hiện tại của bạn với vị trí mục tiêu. Liệt kê các kỹ năng còn thiếu và tự động tạo thời gian biểu ôn luyện kèm đề xuất khóa học chất lượng cao.',
      card3Metric: 'Giúp tăng 300% khả năng trúng tuyển',
      card3Cta: 'Khám phá Roadmap',
      card4Badge: 'DÀNH CHO NHÀ TUYỂN DỤNG',
      card4Title: 'Phễu Tuyển dụng ATS Kanban & Rubrics Đánh giá',
      card4Desc: 'Giao diện kéo thả trực quan theo từng giai đoạn (Ứng tuyển, Sàng lọc AI, Phỏng vấn Kỹ thuật, Offer). Tự động tạo link phòng họp Google Meet và chấm điểm ứng viên theo thang Rubrics chuẩn mực.',
      card4Integration: 'Tích hợp Google Calendar & Email tự động',
      card4Cta: 'Tìm hiểu thêm'
    },
    jobs: {
      badge: 'GỢI Ý VIỆC LÀM PHÙ HỢP NHẤT',
      headline: 'Cơ hội Việc làm Công nghệ Hàng đầu',
      subtitle: 'Được thuật toán AI đánh giá và sắp xếp dựa trên mức độ tương thích cao nhất với kỹ năng của bạn.',
      filterAll: 'Tất cả',
      filterAi: 'AI/Data',
      filterBackend: 'Backend',
      filterFrontend: 'Frontend',
      filterDevops: 'DevOps',
      filterProduct: 'Product',
      urgentBadge: 'Tuyển gấp',
      matchScore: 'Độ tương thích AI',
      btnApply: 'Ứng tuyển',
      btnDetails: 'Chi tiết',
      btnExploreAll: 'Khám phá toàn bộ 1,200+ việc làm IT đang tuyển',
      savedToast: 'Đã lưu công việc vào danh sách yêu thích!',
      removedToast: 'Đã bỏ lưu công việc.',
      quickApplyToast: 'Ứng tuyển thành công! Nhà tuyển dụng sẽ phản hồi trong 24h.'
    },
    roadmap: {
      badge: 'ĐỊNH HƯỚNG NGHỀ NGHIỆP TƯƠNG LAI',
      headline: 'Vạch rõ Lộ trình Nâng cấp Năng lực (Skill Gap Roadmap)',
      subtitle: 'Không còn bối rối trước hàng trăm yêu cầu tuyển dụng. AI đối soát hồ sơ của bạn với thị trường việc làm, chỉ ra chính xác các mắt xích kỹ năng còn thiếu và vạch lộ trình chinh phục chi tiết.',
      track1Title: 'Junior Frontend → Senior Fullstack',
      track1Duration: '6 Tháng',
      track2Title: 'Backend Dev → AI/ML Engineer',
      track2Duration: '9 Tháng',
      track3Title: 'Software Engineer → Solutions Architect',
      track3Duration: '12 Tháng',
      targetTitle: 'Mục tiêu chuyển đổi nghề nghiệp:',
      readinessLabel: 'Độ sẵn sàng hiện tại:',
      hoursLabel: 'Thời lượng:',
      skillsGoalLabel: 'KỸ NĂNG MỤC TIÊU:',
      disclaimer: 'Lộ trình được cập nhật định kỳ theo biến động thị trường tuyển dụng Việt Nam và Đông Nam Á.',
      btnCreateRoadmap: 'Thiết lập Lộ trình Riêng cho Bạn'
    },
    employer: {
      badge: 'DÀNH CHO NHÀ TUYỂN DỤNG & ENTERPRISE',
      headline: 'Tự Động Hóa Quy Trình Tuyển Dụng Với ATS Kanban Tích Hợp AI',
      subtitle: 'Giảm thiểu 70% thời gian đọc CV thủ công. Hệ thống tự động phân loại, xếp hạng ứng viên theo độ khớp JD và điều phối lịch phỏng vấn đồng bộ với Google Meet.',
      pipelineTitle: 'Pipeline Tuyển dụng: Senior AI Engineer',
      pipelineCount: '26 Ứng viên đang trong phễu',
      autoFilterStatus: 'Đồng bộ AI Thời gian thực ⚡',
      btnRescanAll: 'Quét lại toàn bộ',
      col1Title: 'Ứng tuyển mới',
      col2Title: 'Đã qua Sàng lọc AI',
      col3Title: 'Phỏng vấn Kỹ thuật',
      col4Title: 'Gửi Offer',
      verifiedAts: 'Chuẩn ATS > 90 điểm',
      feature1Title: 'AI JD Generator & Tối ưu hóa',
      feature1Desc: 'Nhập tiêu đề công việc, AI sẽ tự động sinh bản mô tả công việc (JD) chuẩn hóa với đầy đủ khung năng lực, yêu cầu và câu hỏi phỏng vấn gợi ý.',
      feature2Title: 'Điều phối Lịch Phỏng vấn Thông minh',
      feature2Desc: 'Tự động đối soát thời gian rảnh giữa Hiring Manager và Ứng viên, gửi email xác nhận kèm link phòng họp Google Meet / Zoom chỉ trong 1 cú click.',
      feature3Title: 'Phiếu Đánh giá Phỏng vấn Rubrics',
      feature3Desc: 'Chuẩn hóa thang điểm phỏng vấn theo các tiêu chí khách quan, giảm thiểu thiên kiến chủ quan và dễ dàng tổng hợp đánh giá giữa các vòng tuyển dụng.',
      btnPostJob: 'Đăng tin Tuyển dụng Miễn phí',
      btnScheduleDemo: 'Đặt Lịch Trải Nghiệm Demo'
    },
    testimonials: {
      badge: 'CÂU CHUYỆN THÀNH CÔNG',
      headline: 'Được Tin Tưởng Bởi Hàng Ngàn Kỹ Sư & Nhà Tuyển Dụng',
      subtitle: 'Xem người dùng thực tế nói gì về trải nghiệm tìm kiếm việc làm và tuyển dụng cùng AI-TalentBridge.',
      quote1: 'Nhờ tính năng Skill Gap Roadmap của AI-TalentBridge, mình biết chính xác những kỹ năng còn thiếu để ứng tuyển vào vị trí Senior. Chỉ sau 3 tháng tập trung học đúng lộ trình, mình đã pass vòng phỏng vấn kỹ thuật với mức lương mong đợi!',
      quote2: 'Tính năng AI Match Score và bóc tách CV tự động giúp đội ngũ tuyển dụng của chúng tôi rút ngắn 70% thời gian sàng lọc sơ bộ. Các ứng viên được hệ thống đề xuất đều có tỷ lệ phù hợp chuyên môn cực kỳ cao.',
      quote3: 'Là sinh viên mới ra trường còn mông lung về định hướng, AI Career Assistant đã phân tích đồ án tốt nghiệp của mình và vạch ra lộ trình trở thành AI Engineer chi tiết đến từng tuần. Rất hữu ích cho người mới bắt đầu!'
    },
    cta: {
      badge: 'HOÀN TOÀN MIỄN PHÍ DÀNH CHO ỨNG VIÊN',
      headline: 'Sẵn Sàng Đột Phá Kỹ Năng & Chinh Phục Cơ Hội Việc Làm Mơ Ước?',
      subtitle: 'Chỉ mất chưa đầy 30 giây để bóc tách hồ sơ CV, nhận ngay hộp tác cá nhân hóa và bản đồ lộ trình kỹ năng giúp bạn tăng gấp đôi tỷ lệ được nhà tuyển dụng liên hệ.',
      btnScanCv: 'Bắt đầu bóc tách CV Ngay',
      btnForEmployers: 'Dành cho Doanh nghiệp',
      complianceBadge: 'Bảo vệ dữ liệu cá nhân theo Nghị định 13',
      noCardNeeded: 'Không yêu cầu thẻ tín dụng',
      securityAssurance: 'Hủy tài khoản bất kỳ lúc nào',
      btnCandidate: 'Tạo tài khoản tìm việc ngay',
      btnEmployer: 'Dành cho Nhà tuyển dụng',
      securityBadge: 'Bảo mật chuẩn Nghị định 13/2023',
      noCardBadge: 'Hoàn toàn miễn phí',
      cancelBadge: 'Kết nối việc làm tức thì'
    },
    footer: {
      brandDesc: 'Nền tảng tuyển dụng thông minh và định hướng lộ trình sự nghiệp bằng AI. Tích hợp bóc tách CV chuẩn ATS, chấm điểm matching 2 chiều và cá nhân hóa lộ trình phát triển kỹ năng.',
      mission: 'Sứ mệnh kết nối nhân tài với các doanh nghiệp công nghệ hàng đầu thông qua thuật toán AI thông minh và minh bạch.',
      complianceNotice: 'Nghị định 13/2023/NĐ-CP',
      hotline: '1900 68xx (8h - 20h)',
      colCandidates: 'DÀNH CHO ỨNG VIÊN',
      colCandidateTitle: 'DÀNH CHO ỨNG VIÊN',
      linkFindJobs: 'Tìm việc làm công nghệ',
      linkAtsScanner: 'Phân tích CV chuẩn ATS',
      linkRoadmap: 'Bản đồ lộ trình kỹ năng',
      linkAiMatch: 'Tính điểm AI Matching',
      linkProResume: 'Tạo CV chuyên nghiệp',
      colEmployers: 'NHÀ TUYỂN DỤNG',
      colEmployerTitle: 'NHÀ TUYỂN DỤNG',
      linkPostJob: 'Đăng tin tuyển dụng',
      linkAtsKanban: 'Hệ thống ATS Kanban',
      linkTalentPool: 'Tìm kiếm trong Talent Pool',
      linkAiScreening: 'AI Sàng lọc & Xếp hạng',
      linkPricing: 'Báo cáo phễu tuyển dụng',
      colNewsletter: 'NHẬN BẢN TIN XU HƯỚNG',
      colNewsletterTitle: 'BẢN TIN NGHỀ NGHIỆP',
      newsletterDesc: 'Cập nhật báo cáo mức lương IT và xu hướng thị mới nhất mỗi tháng.',
      emailPlaceholder: 'Email của bạn...',
      btnSubscribe: 'Đăng ký nhận tin →',
      subscribedToast: 'Đăng ký nhận bản tin việc làm thành công!',
      copyright: '© 2026 AI-TalentBridge Platform. Khóa luận tốt nghiệp chuyên ngành CNTT.',
      terms: 'Điều khoản dịch vụ',
      privacy: 'Chính sách bảo mật',
      language: 'Ngôn ngữ:'
    },
    jobModal: {
      salary: 'Mức lương',
      type: 'Hình thức',
      level: 'Cấp bậc',
      matchScore: 'Độ tương thích AI',
      whyAiMatch: 'Tại sao AI đề xuất công việc này cho bạn?',
      jobDesc: 'MÔ TẢ CÔNG VIỆC',
      requirements: 'YÊU CẦU ỨNG VIÊN',
      coreSkills: 'KỸ NĂNG CỐT LÕI',
      benefits: 'QUYỀN LỢI & ĐÃI NGỘ',
      aiCoverLetterTitle: 'Trợ lý AI Soạn Đơn Ứng tuyển (Cover Letter)',
      aiCoverLetterDesc: 'Tự động tạo một bức thư ứng tuyển ấn tượng, nêu bật các kinh nghiệm trùng khớp với yêu cầu của nhà tuyển dụng chỉ trong 2 giây.',
      btnGenerateLetter: 'Tự động soạn bằng AI',
      btnGenerating: 'AI đang phân tích JD & viết thư...',
      applicationFormTitle: 'Thông tin Ứng tuyển Nhanh',
      fullNamePlaceholder: 'Họ và tên của bạn',
      emailPlaceholder: 'Địa chỉ email liên hệ',
      btnSubmitApplication: 'Gửi Hồ sơ Ứng tuyển Ngay',
      appliedSuccess: 'Ứng tuyển thành công! Nhà tuyển dụng đã nhận được hồ sơ của bạn.',
      close: 'Đóng'
    },
    authModal: {
      loginTitle: 'Chào mừng bạn trở lại',
      registerTitle: 'Tạo tài khoản mới',
      welcomeSubtitle: 'Truy cập hệ thống tìm việc và bóc tách CV thông minh',
      candidateRole: 'Ứng viên tìm việc',
      recruiterRole: 'Nhà tuyển dụng',
      googleAuth: 'Tiếp tục với Google',
      linkedinAuth: 'Tiếp tục với LinkedIn',
      orEmail: 'Hoặc sử dụng email cá nhân',
      emailLabel: 'Địa chỉ Email',
      passwordLabel: 'Mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      btnLogin: 'Đăng nhập vào hệ thống',
      btnRegister: 'Đăng ký tài khoản',
      btnDemoLogin: '⚡ Đăng nhập nhanh bằng Tài khoản Thử nghiệm (Demo)',
      noAccountPrompt: 'Chưa có tài khoản?',
      haveAccountPrompt: 'Đã có tài khoản?',
      registerNow: 'Đăng ký ngay',
      loginNow: 'Đăng nhập ngay',
      authSuccess: 'Đăng nhập thành công! Chào mừng bạn trở lại.'
    }
  },
  en: {
    nav: {
      brandSubtitle: 'AI RECRUITMENT & JOB PORTAL',
      findJobs: 'Find Jobs',
      topCompanies: 'Companies',
      careerGuide: 'Career Guide',
      cvScanner: 'Create & Scan CV',
      skillRoadmap: 'Skill Roadmap',
      profile: 'Profile',
      employers: 'For Employers & ATS',
      candidateRole: 'Candidate',
      recruiterRole: 'Recruiter',
      postJob: 'Post a Job',
      login: 'Log in',
      getStarted: 'Sign up',
      notificationsTitle: 'Latest Notifications',
      markAllRead: 'Mark all as read',
      noNotifications: 'No new notifications',
      recruiterActiveBanner: 'Recruiter Mode Active: Discover smart candidate filtering and automated ATS Kanban pipeline below.'
    },
    hero: {
      topBadgePill: 'NEXT-GEN RECRUITMENT PLATFORM 2026',
      topBadgeSub: 'CV Parsing & Semantic AI Match',
      headline: 'Find your dream job with AI',
      subtitle: 'Connecting top talent with leading employers. 10,000+ opportunities waiting for you!',
      inputTitle: 'Job Title, keyword, skills (e.g. ReactJS, Marketing...)',
      inputLocation: 'All',
      inputCategory: 'All Categories',
      btnFindJob: 'Search Jobs',
      trending: 'Trending:',
      badgeManual: 'Zero manual formatting',
      badgePrivacy: '100% Data Privacy Guaranteed',
      badgeExplain: 'Explainable AI Match Reasoning',
      scannerCardTitle: 'Real-Time CV Parsing',
      scannerCardEngine: 'Analyzed by Gemini 2.0 Flash',
      simulatedCandidate: 'Simulated Candidate',
      targetRole: 'Senior Fullstack',
      jdMatchRate: 'Job Description Match Score',
      coreSkillsExtracted: 'AI EXTRACTED CORE SKILLS:',
      aiAdviceTitle: 'AI Optimization Tip:',
      aiAdviceBody: '"Your profile has a solid Frontend foundation. Adding Redis Caching and Message Queue experience will elevate your ATS pass rate to 99%."',
      btnTryScan: 'Simulate Your CV Parsing Now',
      floatingInterviewChance: '+3.2x Interview Rate',
      floatingInterviewSub: 'Optimized for Global ATS Standards'
    },
    categories: {
      title: 'Top Job Categories',
      subtitle: 'Explore high-demand career sectors with competitive compensation packages',
      jobCountSuffix: 'jobs'
    },
    hotJobs: {
      title: 'Hot Jobs & Best AI Matches',
      subtitle: 'Curated and ranked by AI based on real market trends and candidate competency',
      tabAll: 'All Jobs',
      tabHighSalary: 'High Salary (> 30M)',
      tabUrgent: 'Urgent Hiring',
      tabRemote: 'Remote Jobs',
      applyNow: 'Apply Now',
      viewDetails: 'Details & AI Match',
      aiMatchScore: 'AI Match',
      moreSkills: 'more skills'
    },
    topCompanies: {
      title: 'Top Hiring Companies',
      subtitle: 'Explore ideal workplaces with outstanding benefits and culture from leading technology leaders',
      openJobs: 'open jobs',
      viewJobs: 'View Jobs',
      rating: 'Rating'
    },
    quickCv: {
      title: 'Drop your CV for instant AI job matching in 5 seconds',
      subtitle: 'AI automatically extracts core skills, evaluates ATS score, and matches 100+ hiring partners.',
      btnUpload: 'Upload CV Now',
      btnDemo: 'Try with Demo CV',
      note: 'Supports PDF, DOCX up to 10MB • Strict privacy & security compliance'
    },
    stats: {
      stat1Label: '10,000+',
      stat1Desc: 'High Quality Tech Jobs',
      stat2Label: '3,800+',
      stat2Desc: 'Verified Trusted Employers',
      stat3Label: '96.4%',
      stat3Desc: 'Semantic AI Match Accuracy',
      stat4Label: '3-5 Days',
      stat4Desc: 'Average Time to Interview',
      partnersTitle: 'TRUSTED BY LEADING TECH & FINANCIAL ENTERPRISES'
    },
    scanner: {
      badge: 'REAL-TIME AI CV PARSER ENGINE',
      headline: 'ATS Compliance Audit & Deep Skill Extraction',
      subtitle: 'Upload your CV to let our multimodal model inspect layout hierarchy, extract entity tokens, and test pass rates across modern Applicant Tracking Systems.',
      dragDropText: 'Drag and drop your CV here or',
      browseFile: 'browse from computer',
      fileLimitNote: 'Supports PDF, DOCX formats up to 10MB',
      complianceNote: 'Strictly compliant with Decree 13/2023/ND-CP Personal Data Protection',
      testingFileLabel: 'Active Test File:',
      sampleBadge: 'Production Sample',
      btnRescan: 'Re-run AI Scan Simulation',
      btnScanning: 'Extracting NER Entities...',
      scoreTitle: 'ATS PASS SCORE',
      scoreRating: 'Excellent - Global ATS Ready',
      candidateNameLabel: 'Candidate:',
      candidateRoleLabel: 'Role:',
      candidateContactLabel: 'Contact:',
      btnMatchJobs: 'View Jobs with > 90% Match',
      tabOverview: 'Audit Overview',
      tabSkills: 'Extracted Skills',
      tabRecommendations: 'AI Suggestions',
      auditCard1Title: 'Format & Layout Structure',
      auditCard1Desc: 'Clean single-column standard, well-demarcated Experience and Education sections, standard system typography.',
      auditCard2Title: 'Technical Keyword Density',
      auditCard2Desc: '92% keyword coverage for Fullstack (React, Node, SQL, Docker). Well suited for Senior level standards.',
      auditCard3Title: 'Impact Quantification Metric',
      auditCard3Desc: 'Recommend adding quantifiable impact metrics (e.g. "Optimized query latency from 800ms down to 150ms").',
      step1: 'Parsing Layout & Typography hierarchy',
      step2: 'Extracting NER Entities (Skills, Roles, Experience)',
      step3: 'Benchmarking against 150+ global ATS rules',
      step4: 'Synthesizing actionable optimization suggestions'
    },
    bento: {
      badge: 'CORE SYSTEM ARCHITECTURE',
      headline: 'Complete AI Solution for Modern Talent Acquisition',
      subtitle: 'Fusing Deep Learning embeddings, Vector Database indexing, and scalable Microservices to resolve recruitment challenges at the foundation.',
      card1Badge: 'PROPRIETARY ALGORITHM',
      card1Title: 'Bidirectional 2-Way Semantic Matching Engine',
      card1Desc: 'Moves beyond primitive keyword counting. Projects both candidate resumes and Job Descriptions into a 1,536-dimensional latent space to assess true competence, domain depth, and culture fit.',
      card1Metric1Label: 'Vector Depth',
      card1Metric2Label: 'Match Speed',
      card1Metric3Label: 'Explainability',
      card2Badge: 'RESUME INTELLIGENCE',
      card2Title: 'Automated CV Parsing & ATS Score Audit',
      card2Desc: '98% parsing accuracy across Vietnamese and English resumes. Audits over 150 criteria matching global ATS systems like Greenhouse, Lever, and Workday.',
      card2Compliance: 'Decree 13/2023/ND-CP Compliant',
      card3Badge: 'CAREER PERSONALIZATION',
      card3Title: 'Skill Gap Visual Map & Adaptive Roadmap',
      card3Desc: 'Automatically benchmarks your present competency profile against target dream positions, detailing exact missing skills with curated learning modules.',
      card3Metric: 'Increases interview success by 300%',
      card3Cta: 'Explore Roadmap',
      card4Badge: 'ENTERPRISE HIRING PIPELINE',
      card4Title: 'ATS Kanban Funnel & Standardized Rubrics',
      card4Desc: 'Drag-and-drop applicant pipeline across key hiring stages (Applied, AI Screened, Tech Interview, Offer). Auto-generates Google Meet room links and objective rubric grading.',
      card4Integration: 'Google Calendar & Email automated sync',
      card4Cta: 'Learn more'
    },
    jobs: {
      badge: 'RECOMMENDED OPPORTUNITIES',
      headline: 'Featured Tech & Creative Career Openings',
      subtitle: 'Ranked and scored by AI based on maximum alignment with your professional profile.',
      filterAll: 'All Positions',
      filterAi: 'AI/Data',
      filterBackend: 'Backend',
      filterFrontend: 'Frontend',
      filterDevops: 'DevOps',
      filterProduct: 'Product',
      urgentBadge: 'Urgent',
      matchScore: 'AI Match Score',
      btnApply: 'Apply Now',
      btnDetails: 'Details',
      btnExploreAll: 'Explore all 1,200+ active tech jobs',
      savedToast: 'Job saved to your bookmarks!',
      removedToast: 'Job removed from bookmarks.',
      quickApplyToast: 'Application submitted successfully! Recruiter will respond within 24 hours.'
    },
    roadmap: {
      badge: 'CAREER NAVIGATION',
      headline: 'Skill Gap Blueprint & Personalized Roadmap',
      subtitle: 'Never feel overwhelmed by hundreds of conflicting job requirements again. Let AI audit your profile and map out the exact milestones needed to reach your target role.',
      track1Title: 'Junior Frontend → Senior Fullstack',
      track1Duration: '6 Months',
      track2Title: 'Backend Dev → AI/ML Engineer',
      track2Duration: '9 Months',
      track3Title: 'Software Engineer → Solutions Architect',
      track3Duration: '12 Months',
      targetTitle: 'Career Transition Goal:',
      readinessLabel: 'Current Readiness:',
      hoursLabel: 'Effort:',
      skillsGoalLabel: 'TARGET SKILLS:',
      disclaimer: 'Curriculum periodically refreshed based on live market demand across Vietnam and Southeast Asia.',
      btnCreateRoadmap: 'Generate My Custom Roadmap'
    },
    employer: {
      badge: 'FOR EMPLOYERS & ENTERPRISE',
      headline: 'Automate Talent Acquisition with AI-Powered ATS Kanban',
      subtitle: 'Eliminate 70% of manual CV screening time. Automatically score and rank candidates against your exact JD requirements and sync interviews directly with Google Meet.',
      pipelineTitle: 'Active Hiring Pipeline: Senior AI Engineer',
      pipelineCount: '26 Candidates in pipeline',
      autoFilterStatus: 'Real-time AI Match Active ⚡',
      btnRescanAll: 'Rescan All Applicants',
      col1Title: 'New Applied',
      col2Title: 'AI Screened',
      col3Title: 'Tech Interview',
      col4Title: 'Offer Extended',
      verifiedAts: 'ATS Score > 90',
      feature1Title: 'AI JD Generator & Enhancement',
      feature1Desc: 'Enter a role title and let AI draft a comprehensive, bias-free job description with core competencies, requirements, and recommended interview questions.',
      feature2Title: 'Smart Interview Scheduling',
      feature2Desc: 'Automatically checks calendar availability between Hiring Managers and Candidates, dispatching confirmations with Google Meet links in 1 click.',
      feature3Title: 'Standardized Rubric Evaluations',
      feature3Desc: 'Align your hiring team on structured evaluation criteria, minimizing unconscious bias and synthesizing candidate ratings seamlessly.',
      btnPostJob: 'Post a Job for Free',
      btnScheduleDemo: 'Schedule Enterprise Demo'
    },
    testimonials: {
      badge: 'SUCCESS STORIES',
      headline: 'Trusted by Thousands of Engineers & Recruiters',
      subtitle: 'Hear authentic feedback from professionals advancing their careers and building teams with AI-TalentBridge.',
      quote1: 'Thanks to the Skill Gap Roadmap, I knew exactly which backend competencies to bridge for Senior roles. Landed my dream position in 3 months!',
      quote2: 'The automated ATS score audit and semantic match reduced our screening overhead by 70%. Candidate quality has never been higher.',
      quote3: 'As a fresh graduate, the personalized AI Career Assistant guided me week by week to transition into an AI Engineer role with confidence.'
    },
    cta: {
      badge: 'COMPLETELY FREE FOR JOB SEEKERS',
      headline: 'Ready to Advance Your Skills & Land Your Dream Role?',
      subtitle: 'Take under 30 seconds to parse your CV, unlock personalized job matching, and explore skill roadmap blueprints.',
      btnScanCv: 'Start CV Analysis Now',
      btnForEmployers: 'For Employers',
      complianceBadge: 'Data protected under Decree 13/2023/ND-CP',
      noCardNeeded: 'No credit card required',
      securityAssurance: 'Cancel anytime',
      btnCandidate: 'Create Job Seeker Account',
      btnEmployer: 'For Employers & ATS',
      securityBadge: 'Decree 13/2023 Compliant',
      noCardBadge: '100% Free for Candidates',
      cancelBadge: 'Instant Job Matching'
    },
    footer: {
      brandDesc: 'Next-generation AI recruitment and career navigation platform. Combining ATS-compliant resume parsing, bidirectional semantic matching, and personalized skill gap roadmaps.',
      mission: 'Our mission is to connect top tech talent with leading enterprises through transparent, intelligent AI-driven matching.',
      complianceNotice: 'Decree 13/2023/ND-CP Personal Data Protection',
      hotline: '1900 68xx (8:00 - 20:00)',
      colCandidates: 'FOR CANDIDATES',
      colCandidateTitle: 'FOR CANDIDATES',
      linkFindJobs: 'Find Tech Jobs',
      linkAtsScanner: 'ATS Resume Audit',
      linkRoadmap: 'Skill Gap Blueprint',
      linkAiMatch: 'Calculate AI Match',
      linkProResume: 'Professional CV Builder',
      colEmployers: 'FOR EMPLOYERS',
      colEmployerTitle: 'FOR EMPLOYERS',
      linkPostJob: 'Post a Job Opening',
      linkAtsKanban: 'ATS Kanban System',
      linkTalentPool: 'Search Talent Pool',
      linkAiScreening: 'AI Screening & Ranking',
      linkPricing: 'Hiring Funnel Analytics',
      colNewsletter: 'NEWSLETTER',
      colNewsletterTitle: 'CAREER DIGEST',
      newsletterDesc: 'Get monthly tech salary reports and hiring trend digests delivered to your inbox.',
      emailPlaceholder: 'Enter your work email...',
      btnSubscribe: 'Subscribe →',
      subscribedToast: 'Subscribed to job digests successfully!',
      copyright: '© 2026 AI-TalentBridge Platform. All rights reserved.',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      language: 'Language:'
    },
    jobModal: {
      salary: 'Salary',
      type: 'Work Model',
      level: 'Seniority',
      matchScore: 'AI Match Score',
      whyAiMatch: 'Why does AI recommend this position to you?',
      jobDesc: 'JOB DESCRIPTION',
      requirements: 'REQUIREMENTS',
      coreSkills: 'CORE SKILLS',
      benefits: 'COMPENSATION & BENEFITS',
      aiCoverLetterTitle: 'AI Cover Letter Assistant',
      aiCoverLetterDesc: 'Instantly compose an impressive cover letter highlighting your aligned strengths for this exact position.',
      btnGenerateLetter: 'Auto-Generate with AI',
      btnGenerating: 'Analyzing JD & drafting letter...',
      applicationFormTitle: 'Quick Application Form',
      fullNamePlaceholder: 'Your full name',
      emailPlaceholder: 'Contact email address',
      btnSubmitApplication: 'Submit Application Now',
      appliedSuccess: 'Application submitted! The recruiter has received your profile.',
      close: 'Close'
    },
    authModal: {
      loginTitle: 'Welcome Back',
      registerTitle: 'Create an Account',
      welcomeSubtitle: 'Access intelligent job matching and ATS parsing suite',
      candidateRole: 'Candidate',
      recruiterRole: 'Recruiter',
      googleAuth: 'Continue with Google',
      linkedinAuth: 'Continue with LinkedIn',
      orEmail: 'Or sign in with email',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot password?',
      btnLogin: 'Sign in to platform',
      btnRegister: 'Create Account',
      btnDemoLogin: '⚡ Quick 1-Click Demo Account Login',
      noAccountPrompt: "Don't have an account?",
      haveAccountPrompt: 'Already have an account?',
      registerNow: 'Sign up now',
      loginNow: 'Log in here',
      authSuccess: 'Login successful! Welcome back.'
    }
  }
};
