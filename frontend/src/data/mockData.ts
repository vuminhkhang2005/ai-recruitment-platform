export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogoId: string;
  logo?: string;
  logoColor?: string;
  location: string;
  locationEn?: string;
  type: 'Full-time' | 'Remote' | 'Hybrid';
  level: 'Junior' | 'Middle' | 'Senior' | 'Lead';
  category: 'Tech' | 'Marketing' | 'Design' | 'Finance' | 'Product' | 'HR';
  salary: string;
  salaryEn?: string;
  aiMatchScore: number;
  matchReasons: string[];
  matchReasonsEn?: string[];
  skills: string[];
  postedTime: string;
  postedTimeEn?: string;
  urgent?: boolean;
  hot?: boolean;
  bonus?: string;
  bonusEn?: string;
  applicantsCount?: number;
  daysLeft?: number;
  description: string;
  descriptionEn?: string;
  requirements: string[];
  requirementsEn?: string[];
  benefits: string[];
  benefitsEn?: string[];
}

export interface JobCategory {
  id: string;
  nameVi: string;
  nameEn: string;
  iconName: 'code' | 'finance' | 'marketing' | 'design' | 'hr' | 'product';
  count: number;
  trending?: boolean;
}

export interface TopCompany {
  id: string;
  name: string;
  tagline: string;
  taglineEn?: string;
  logoId: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  openJobsCount: number;
  location: string;
  locationEn?: string;
  industry: string;
  industryEn?: string;
  tags: string[];
  verified?: boolean;
  badges?: string[];
  badgesEn?: string[];
}

export interface Testimonial {
  name: string;
  role: string;
  roleEn?: string;
  avatar: string;
  content: string;
  contentEn?: string;
  badge: string;
  badgeEn?: string;
}

export const MOCK_CATEGORIES: JobCategory[] = [
  {
    id: 'tech',
    nameVi: 'Công nghệ thông tin',
    nameEn: 'Information Technology',
    iconName: 'code',
    count: 1420,
    trending: true
  },
  {
    id: 'finance',
    nameVi: 'Tài chính - Ngân hàng',
    nameEn: 'Finance & Banking',
    iconName: 'finance',
    count: 850
  },
  {
    id: 'marketing',
    nameVi: 'Marketing & Sales',
    nameEn: 'Marketing & Sales',
    iconName: 'marketing',
    count: 930,
    trending: true
  },
  {
    id: 'design',
    nameVi: 'Thiết kế UI/UX',
    nameEn: 'UI/UX Design',
    iconName: 'design',
    count: 320
  },
  {
    id: 'hr',
    nameVi: 'Nhân sự',
    nameEn: 'Human Resources',
    iconName: 'hr',
    count: 210
  }
];

export const MOCK_COMPANIES: TopCompany[] = [
  {
    id: 'vng',
    name: 'VNG Corporation',
    tagline: 'Kỳ lân công nghệ đầu tiên tại Việt Nam - Kiến tạo công nghệ và phát triển con người',
    taglineEn: "Vietnam's first tech unicorn - Pioneering digital entertainment and community platforms",
    logoId: 'vng',
    coverImage: '/companies/vng-campus.jpg',
    rating: 4.9,
    reviewCount: 420,
    openJobsCount: 36,
    location: 'TP. HCM (Campus Q7) & Hà Nội',
    locationEn: 'HCMC (Campus D7) & Hanoi',
    industry: 'Gaming, AI & Internet Ecosystem',
    tags: ['Zalo', 'ZaloPay', 'VNGGames', 'AI Cloud'],
    verified: true,
    badges: ['🏆 Top 1 Tech Employer', '⭐ Campus 5 sao', '🎁 Thưởng 13-16 tháng'],
    badgesEn: ['🏆 #1 Tech Employer', '⭐ 5-Star Campus', '🎁 13-16M Bonus']
  },
  {
    id: 'fpt',
    name: 'FPT Software',
    tagline: 'Tập đoàn công nghệ toàn cầu hàng đầu Đông Nam Á, hiện diện tại 30+ quốc gia',
    taglineEn: 'Leading Southeast Asian global technology corporation, operating in 30+ countries',
    logoId: 'fpt',
    coverImage: '/companies/fpt-campus.png',
    rating: 4.7,
    reviewCount: 680,
    openJobsCount: 52,
    location: 'Hà Nội, Đà Nẵng, TP. HCM',
    locationEn: 'Hanoi, Da Nang, HCMC',
    industry: 'Global IT Services & AI Labs',
    tags: ['Global Onsite', 'Automotive', 'Cloud & AI'],
    verified: true,
    badges: ['🌐 30+ Quốc gia', '✈️ Onsite Nhật/Mỹ', '📈 Thăng tiến nhanh'],
    badgesEn: ['🌐 30+ Countries', '✈️ US/Japan Onsite', '📈 Rapid Growth']
  },
  {
    id: 'vinai',
    name: 'VinAI Innovation Lab',
    tagline: 'Viện nghiên cứu Trí tuệ Nhân tạo top đầu khu vực thuộc hệ sinh thái Vingroup',
    taglineEn: 'Top regional AI Research Institute within the Vingroup technology ecosystem',
    logoId: 'vinai',
    coverImage: '/companies/landmark81-vinai.jpg',
    rating: 4.9,
    reviewCount: 260,
    openJobsCount: 24,
    location: 'Hà Nội & TP. HCM (VinHomes)',
    locationEn: 'Hanoi & HCMC (VinHomes)',
    industry: 'Generative AI & Autonomous Driving',
    tags: ['LLMs & RAG', 'Computer Vision', 'Smart Mobility'],
    verified: true,
    badges: ['🔬 Viện nghiên cứu Top 10', '🤖 Bài báo NeurIPS', '💰 Lương USD'],
    badgesEn: ['🔬 Top 10 AI Lab', '🤖 NeurIPS Publications', '💰 USD Salary']
  },
  {
    id: 'viettel',
    name: 'Viettel Telecom & R&D',
    tagline: 'Tập đoàn Công nghiệp - Viễn thông Quân đội, tiên phong làm chủ công nghệ cao',
    taglineEn: 'Military Industry and Telecoms Group, pioneering national high-tech autonomy',
    logoId: 'viettel',
    coverImage: '/companies/viettel-hq.jpg',
    rating: 4.8,
    reviewCount: 510,
    openJobsCount: 40,
    location: 'Hà Nội (Trụ sở Cầu Giấy)',
    locationEn: 'Hanoi (Cau Giay HQ)',
    industry: '5G Telecom, Cloud & Defense Tech',
    tags: ['5G Network', 'Viettel Cloud', 'Cyber Security'],
    verified: true,
    badges: ['📡 Tập đoàn Quốc gia', '🛡️ Dự án cấp Nhà nước', '🏥 Chăm sóc trọn đời'],
    badgesEn: ['📡 National Enterprise', '🛡️ State-level Projects', '🏥 Lifetime Healthcare']
  },
  {
    id: 'momo',
    name: 'MoMo Fintech Ecosystem',
    tagline: 'Siêu ứng dụng tài chính số phục vụ hơn 31 triệu người dùng Việt Nam',
    taglineEn: 'Leading financial super-app serving over 31 million users across Vietnam',
    logoId: 'momo',
    coverImage: '/companies/momo-hq.jpg',
    rating: 4.8,
    reviewCount: 390,
    openJobsCount: 28,
    location: 'TP. Hồ Chí Minh (Quận 7)',
    locationEn: 'Ho Chi Minh City (District 7)',
    industry: 'FinTech, Payments & Financial Platform',
    tags: ['E-Wallet', 'High-load Microservices', 'Big Data'],
    verified: true,
    badges: ['🦄 Kỳ lân Fintech', '💳 31M Khách hàng', '🎉 Văn hóa Agile'],
    badgesEn: ['🦄 Fintech Unicorn', '💳 31M+ Users', '🎉 Agile Culture']
  },
  {
    id: 'techcombank',
    name: 'Techcombank Digital',
    tagline: 'Ngân hàng số dẫn đầu xu hướng công nghệ Cloud First và Agile tại Việt Nam',
    taglineEn: 'Leading digital bank pioneering Cloud-First architecture and Agile in Vietnam',
    logoId: 'techcombank',
    coverImage: '/companies/techcombank-hq.jpg',
    rating: 4.7,
    reviewCount: 450,
    openJobsCount: 35,
    location: 'Hà Nội & TP. HCM (Tháp TCB)',
    locationEn: 'Hanoi & HCMC (TCB Tower)',
    industry: 'Digital Banking & Enterprise Cloud',
    tags: ['100% AWS Cloud', 'Data Lakehouse', 'Agile Way of Work'],
    verified: true,
    badges: ['🏛️ Ngân hàng số 1', '☁️ 100% Cloud First', '💎 Trụ sở Grade A'],
    badgesEn: ['🏛️ #1 Digital Bank', '☁️ 100% Cloud First', '💎 Grade-A HQ']
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior AI / Deep Learning Engineer (LLM & Vision)',
    company: 'VinAI Innovation Lab',
    companyLogoId: 'vinai',
    location: 'Hà Nội & Remote',
    locationEn: 'Hanoi & Remote',
    type: 'Hybrid',
    level: 'Senior',
    category: 'Tech',
    salary: '50 - 80 Triệu VNĐ',
    salaryEn: '50 - 80 Million VND',
    aiMatchScore: 98,
    matchReasons: [
      'Kinh nghiệm 4+ năm PyTorch & LLM Fine-tuning trùng khớp 100% với hồ sơ',
      'Đã từng phát triển hệ thống RAG & Semantic Vector Search quy mô lớn',
      'Điểm kỹ năng thuật toán & System Design đạt phân vị top 5%'
    ],
    matchReasonsEn: [
      '4+ years PyTorch & LLM fine-tuning aligns 100% with your candidate profile',
      'Demonstrated experience architecting large-scale RAG & Semantic Vector Search pipelines',
      'Algorithm & System Design skill benchmark places in the top 5th percentile'
    ],
    skills: ['Python', 'PyTorch', 'LLM / RAG', 'LangChain', 'FastAPI'],
    postedTime: '1 giờ trước',
    postedTimeEn: '1 hour ago',
    urgent: true,
    hot: true,
    bonus: 'Thưởng gia nhập $1,500',
    bonusEn: 'Sign-on Bonus $1,500',
    applicantsCount: 28,
    daysLeft: 5,
    description: 'Chịu trách nhiệm nghiên cứu và ứng dụng các mô hình ngôn ngữ lớn (LLMs), tối ưu hóa pipeline RAG và triển khai hạ tầng suy luận AI phục vụ hàng triệu người dùng tại Vingroup.',
    descriptionEn: 'Lead research and deployment of state-of-the-art Large Language Models (LLMs), optimizing high-throughput RAG pipelines and scalable AI inference infrastructure for millions of users across the Vingroup ecosystem.',
    requirements: [
      'Tối thiểu 4 năm kinh nghiệm thực chiến phát triển mô hình Machine Learning/Deep Learning',
      'Thành thạo PyTorch, Hugging Face Transformers, vLLM hoặc TensorRT-LLM',
      'Hiểu sâu về vector database (Qdrant, Milvus hoặc Pinecone)'
    ],
    requirementsEn: [
      'Minimum 4 years hands-on production experience training and fine-tuning ML/DL models',
      'Proficiency in PyTorch, Hugging Face Transformers, vLLM, or TensorRT-LLM acceleration',
      'Deep expertise with Vector Databases (Qdrant, Milvus, Pinecone) and hybrid retrieval'
    ],
    benefits: [
      'Lương thưởng cạnh tranh top đầu thị trường + Thưởng hiệu suất dự án hàng quý',
      'Gói bảo hiểm sức khỏe Vinmec quốc tế cao cấp toàn diện cho cả gia đình',
      'Ngân sách tham dự hội nghị AI quốc tế hàng năm (NeurIPS, CVPR, ICML)'
    ],
    benefitsEn: [
      'Top-tier competitive market salary + Quarterly project milestone performance bonuses',
      'Comprehensive international Vinmec premium healthcare coverage for employee and family',
      'Annual sponsored sponsorship package for premier international AI conferences (NeurIPS, CVPR, ICML)'
    ]
  },
  {
    id: 'job-2',
    title: 'Senior Fullstack Engineer (React & Golang)',
    company: 'VNG Corporation',
    companyLogoId: 'vng',
    location: 'TP. Hồ Chí Minh (Campus Q7)',
    locationEn: 'HCMC (Campus D7)',
    type: 'Hybrid',
    level: 'Senior',
    category: 'Tech',
    salary: '35 - 55 Triệu VNĐ',
    salaryEn: '35 - 55 Million VND',
    aiMatchScore: 96,
    matchReasons: [
      'Thành thạo React 18, TypeScript và Clean Architecture',
      'Kinh nghiệm tối ưu MySQL & Redis xử lý concurrency hàng triệu người dùng'
    ],
    matchReasonsEn: [
      'Mastery of React 18, modern TypeScript, and Clean Architecture patterns',
      'Hands-on experience optimizing MySQL & Redis for high-concurrency workloads'
    ],
    skills: ['React', 'TypeScript', 'Golang', 'Redis', 'Microservices', 'Docker'],
    postedTime: '2 giờ trước',
    postedTimeEn: '2 hours ago',
    urgent: true,
    hot: true,
    bonus: 'Thưởng tháng 13-15',
    bonusEn: '13-15th Month Bonus',
    applicantsCount: 34,
    daysLeft: 7,
    description: 'Phát triển các module cốt lõi trong hệ sinh thái dịch vụ số Zalo & Gaming của VNG, xây dựng API chịu tải lớn và giao diện người dùng mượt mà, chuẩn UI/UX.',
    descriptionEn: 'Build and scale mission-critical modules across VNG’s Zalo and Gaming digital ecosystem, engineering high-throughput APIs and sleek user interfaces adhering to modern UI/UX standards.',
    requirements: [
      'Từ 3-5 năm kinh nghiệm lập trình Fullstack với TypeScript/Golang & React',
      'Kinh nghiệm thiết kế RESTful & gRPC APIs đạt chuẩn bảo mật cao cấp',
      'Hiểu biết sâu về tối ưu hiệu năng cơ sở dữ liệu quan hệ (Indexing, Query Plan)'
    ],
    requirementsEn: [
      '3-5 years fullstack engineering experience using TypeScript/Golang & React',
      'Proven track record designing secure, low-latency RESTful and gRPC APIs',
      'Deep knowledge of relational database query optimization (Indexing, Query Execution Plans)'
    ],
    benefits: [
      'Thưởng tháng 13 + thưởng KPI hàng năm từ 2-4 tháng lương',
      'Khuôn viên công nghệ VNG Campus hiện đại với phòng gym, hồ bơi và canteen miễn phí',
      'Cơ hội thăng tiến lên vị trí Technical Architect / Tech Lead'
    ],
    benefitsEn: [
      '13th month salary guaranteed + annual KPI performance bonus of 2-4 months salary',
      'Modern 5-star VNG Campus with complimentary gym, swimming pool, and gourmet dining',
      'Clear structured career progression towards Technical Architect or Engineering Team Lead'
    ]
  },
  {
    id: 'job-3',
    title: 'Lead Cloud Solutions Architect',
    company: 'FPT Software',
    companyLogoId: 'fpt',
    location: 'Hà Nội & Đà Nẵng',
    locationEn: 'Hanoi & Da Nang',
    type: 'Full-time',
    level: 'Lead',
    category: 'Tech',
    salary: '45 - 70 Triệu VNĐ',
    salaryEn: '45 - 70 Million VND',
    aiMatchScore: 95,
    matchReasons: [
      'Chứng chỉ AWS Solutions Architect Professional hoặc Google Cloud Fellow',
      'Kinh nghiệm quản trị hạ tầng Cloud cho khách hàng Fortune 500'
    ],
    matchReasonsEn: [
      'AWS Solutions Architect Professional or Google Cloud Fellow certification aligned',
      'Extensive experience architecting enterprise cloud estates for Fortune 500 partners'
    ],
    skills: ['AWS Cloud', 'Kubernetes', 'Terraform', 'System Design', 'DevOps'],
    postedTime: '3 giờ trước',
    postedTimeEn: '3 hours ago',
    hot: true,
    bonus: 'Cơ hội Onsite Mỹ/Nhật',
    bonusEn: 'US/Japan Onsite',
    applicantsCount: 19,
    daysLeft: 10,
    description: 'Chủ trì thiết kế kiến trúc đám mây đa vùng, định hướng các tiêu chuẩn bảo mật và giải pháp hiện đại hóa ứng dụng cho các đối tác toàn cầu tại Mỹ, Nhật và Châu Âu.',
    descriptionEn: 'Lead the architecture of resilient multi-region cloud infrastructures, establishing security governance and cloud modernization solutions for global Fortune 500 clients across the US, Japan, and Europe.',
    requirements: [
      'Tối thiểu 5 năm kinh nghiệm về Cloud Architecture và Distributed Systems',
      'Thành thạo Kubernetes (EKS/GKE), Infrastructure as Code (Terraform)',
      'Kỹ năng giao tiếp tiếng Anh lưu loát với đối tác quốc tế'
    ],
    requirementsEn: [
      '5+ years leading enterprise Cloud Architecture and Distributed Systems design',
      'Expertise in multi-cluster Kubernetes (EKS/GKE) and Infrastructure-as-Code (Terraform)',
      'Fluent professional English communication with executive international partners'
    ],
    benefits: [
      'Cơ hội công tác dài hạn và làm việc Onsite tại Nhật Bản, Mỹ, Đức',
      'Chế độ đãi ngộ vượt trội, phụ cấp công tác và review lương 2 lần/năm',
      'FPT Care gói bảo hiểm đặc biệt cho cá nhân và người thân'
    ],
    benefitsEn: [
      'Prestigious overseas long-term onsite assignments in Japan, the United States, and Germany',
      'Industry-leading compensation package with bi-annual salary reviews and travel allowances',
      'FPT Care premium global health insurance policy for employee and direct family members'
    ]
  },
  {
    id: 'job-4',
    title: 'Senior Mobile Engineer (React Native & iOS)',
    company: 'MoMo Fintech Ecosystem',
    companyLogoId: 'momo',
    location: 'TP. Hồ Chí Minh / Hybrid',
    locationEn: 'Ho Chi Minh City / Hybrid',
    type: 'Hybrid',
    level: 'Senior',
    category: 'Tech',
    salary: '35 - 55 Triệu VNĐ',
    salaryEn: '35 - 55 Million VND',
    aiMatchScore: 94,
    matchReasons: [
      'Kinh nghiệm 4 năm Mobile App xử lý thanh toán và bảo mật tài chính',
      'Thành thạo React Native Bridge, Native Modules và Native Swift'
    ],
    matchReasonsEn: [
      '4+ years building high-security mobile financial transaction and payment workflows',
      'Strong proficiency in React Native Turbo Modules, Native Bridges, and Swift'
    ],
    skills: ['React Native', 'Swift / iOS', 'Fintech Security', 'Redux Toolkit', 'Jest'],
    postedTime: '5 giờ trước',
    postedTimeEn: '5 hours ago',
    urgent: true,
    bonus: 'Thưởng ký HĐ $1,000',
    bonusEn: 'Sign-on Bonus $1,000',
    applicantsCount: 42,
    daysLeft: 4,
    description: 'Xây dựng và tối ưu các tính năng thanh toán, chuyển tiền và dịch vụ số trong siêu ứng dụng MoMo, đảm bảo tính ổn định 99.99% cho 31 triệu người dùng.',
    descriptionEn: 'Engineer and optimize core payment flows, instant money transfers, and digital financial products within the MoMo super-app, ensuring 99.99% high availability for 31 million users.',
    requirements: [
      'Từ 3-5 năm kinh nghiệm phát triển ứng dụng di động React Native / iOS',
      'Am hiểu sâu về bảo mật ứng dụng tài chính (biometrics, encryption, jailbreak detection)',
      'Tư duy tối ưu bộ nhớ, startup time và 60fps animations'
    ],
    requirementsEn: [
      '3-5 years developing large-scale mobile applications in React Native and native iOS (Swift)',
      'Deep knowledge of fintech app security (biometrics, cryptographic signing, jailbreak detection)',
      'Relentless focus on memory footprint optimization, sub-second cold starts, and 60fps animations'
    ],
    benefits: [
      'Gói thu nhập hấp dẫn lên đến 16 tháng lương/năm',
      'Trang bị MacBook Pro M3 Max và thiết bị test mới nhất',
      'Chính sách làm việc linh hoạt Hybrid 2 ngày Remote/tuần'
    ],
    benefitsEn: [
      'Total annual compensation package reaching up to 16 months salary per year',
      'State-of-the-art MacBook Pro M3 Max plus multiple flagship mobile testing devices',
      'Flexible hybrid working policy allowing 2 days of remote work per week'
    ]
  },
  {
    id: 'job-5',
    title: 'Senior Backend Engineer (High Concurrency Go)',
    company: 'Shopee Tech Vietnam',
    companyLogoId: 'shopee',
    location: 'TP. Hồ Chí Minh / Hybrid',
    locationEn: 'Ho Chi Minh City / Hybrid',
    type: 'Hybrid',
    level: 'Senior',
    category: 'Tech',
    salary: '40 - 65 Triệu VNĐ',
    salaryEn: '40 - 65 Million VND',
    aiMatchScore: 96,
    matchReasons: [
      'Kinh nghiệm xử lý traffic siêu lớn trong các đợt Mega Sale (11.11, 12.12)',
      'Thành thạo Golang, Kafka event streaming và MySQL sharding'
    ],
    matchReasonsEn: [
      'Proven experience architecting for extreme peak traffic during Mega Sale campaigns (11.11, 12.12)',
      'Proficiency in Golang microservices, Kafka distributed streaming, and MySQL sharding'
    ],
    skills: ['Golang', 'Kafka', 'Redis Cluster', 'MySQL Sharding', 'gRPC'],
    postedTime: '6 giờ trước',
    postedTimeEn: '6 hours ago',
    urgent: true,
    hot: true,
    bonus: 'Cổ phiếu RSU',
    bonusEn: 'RSU Stock Options',
    applicantsCount: 31,
    daysLeft: 6,
    description: 'Thiết kế và duy trì các dịch vụ backend cốt lõi trong nền tảng thương mại điện tử Shopee, xử lý hàng trăm nghìn đơn hàng mỗi giây với độ trễ dưới 20ms.',
    descriptionEn: 'Design and maintain high-throughput backend services powering the Shopee e-commerce platform, handling hundreds of thousands of orders per second with sub-20ms latency.',
    requirements: [
      'Tối thiểu 3 năm kinh nghiệm lập trình Golang trong các hệ thống High Concurrency',
      'Kinh nghiệm thực chiến với Message Queue (Kafka/Pulsar) và distributed cache',
      'Tư duy phân tích dữ liệu và giải quyết bài toán tải đột biến'
    ],
    requirementsEn: [
      'Minimum 3 years Golang engineering experience in high-concurrency distributed systems',
      'Hands-on production mastery with Message Brokers (Kafka/Pulsar) and distributed caching',
      'Strong algorithmic problem-solving skills for extreme traffic spike and failover scenarios'
    ],
    benefits: [
      'Lương tháng 13 + thưởng Mega Sale cực khủng',
      'Chương trình cấp cổ phiếu RSU cho nhân sự xuất sắc',
      'Bữa ăn trưa và ăn tối miễn phí tại văn phòng hiện đại'
    ],
    benefitsEn: [
      '13th month salary guaranteed + substantial Mega Sale campaign performance bonuses',
      'Lucrative RSU employee stock grant program awarded to high-impact engineers',
      'Complimentary gourmet buffet lunches and dinners served daily at modern tech hub'
    ]
  },
  {
    id: 'job-6',
    title: 'Senior DevOps & Site Reliability Engineer (SRE)',
    company: 'Viettel Telecom & R&D',
    companyLogoId: 'viettel',
    location: 'Hà Nội (Cầu Giấy)',
    locationEn: 'Hanoi (Cau Giay)',
    type: 'Full-time',
    level: 'Senior',
    category: 'Tech',
    salary: '35 - 50 Triệu VNĐ',
    salaryEn: '35 - 50 Million VND',
    aiMatchScore: 92,
    matchReasons: [
      'Kinh nghiệm quản trị hạ tầng mạng viễn thông & Data Center Tier 3',
      'Năng lực tự động hóa CI/CD và giám sát Prometheus/Grafana quy mô lớn'
    ],
    matchReasonsEn: [
      'Extensive experience managing telecommunications network infrastructure and Tier 3 Data Centers',
      'Deep capabilities in enterprise CI/CD automation and large-scale Prometheus/Grafana observability'
    ],
    skills: ['Kubernetes', 'CI/CD Pipeline', 'Prometheus', 'Linux Kernel', 'Ansible'],
    postedTime: '8 giờ trước',
    postedTimeEn: '8 hours ago',
    bonus: 'Phụ cấp quốc phòng',
    bonusEn: 'Defense Allowance',
    applicantsCount: 17,
    daysLeft: 8,
    description: 'Đảm bảo tính sẵn sàng, độ an toàn và tự động hóa vận hành cho hạ tầng 5G và mạng lưới dịch vụ số quốc gia của Viettel.',
    descriptionEn: 'Ensure high availability, operational automation, and cyber resilience for Viettel’s nationwide 5G telecommunications infrastructure and national digital services.',
    requirements: [
      'Tối thiểu 4 năm kinh nghiệm quản trị hệ thống Linux và hạ tầng Kubernetes',
      'Thành thạo lập trình script tự động hóa (Python/Bash/Go)',
      'Hiểu biết sâu sắc về Networking (BGP, OSPF, VPN, Load Balancing)'
    ],
    requirementsEn: [
      '4+ years administering carrier-grade Linux servers and multi-cluster Kubernetes topologies',
      'Proficiency in operational automation scripting using Python, Bash, or Go',
      'In-depth understanding of enterprise networking protocols (BGP, OSPF, VPN, Load Balancing)'
    ],
    benefits: [
      'Môi trường làm việc chuẩn mực của Tập đoàn Quốc gia, uy tín vững chắc',
      'Chính sách phụ cấp độc hại, đãi ngộ quân đội và xét duyệt nâng lương định kỳ',
      'Bảo hiểm y tế toàn diện chất lượng cao tại Bệnh viện Trung ương Quân đội 108'
    ],
    benefitsEn: [
      'Prestigious, stable career environment at Vietnam’s leading national military enterprise',
      'Generous specialized defense allowances, military health benefits, and structured promotions',
      'Elite comprehensive medical care at Central Military Hospital 108 for employee and family'
    ]
  },
  {
    id: 'job-7',
    title: 'Lead Data Engineer & Analytics Platform',
    company: 'Techcombank',
    companyLogoId: 'techcombank',
    location: 'Hà Nội & TP. HCM',
    locationEn: 'Hanoi & HCMC',
    type: 'Full-time',
    level: 'Lead',
    category: 'Finance',
    salary: '45 - 70 Triệu VNĐ',
    salaryEn: '45 - 70 Million VND',
    aiMatchScore: 94,
    matchReasons: [
      'Kinh nghiệm xây dựng kiến trúc Data Lakehouse trên AWS Cloud',
      'Thành thạo Apache Spark, Snowflake, Databricks và dbt'
    ],
    matchReasonsEn: [
      'Demonstrated track record building modern Data Lakehouse architectures on AWS Cloud',
      'Mastery of Apache Spark, Snowflake, Databricks, and dbt analytics engineering'
    ],
    skills: ['Apache Spark', 'Databricks', 'Snowflake', 'Python', 'AWS Cloud', 'dbt'],
    postedTime: '1 ngày trước',
    postedTimeEn: '1 day ago',
    hot: true,
    bonus: 'Thưởng quý cao',
    bonusEn: 'High Quarterly Bonus',
    applicantsCount: 23,
    daysLeft: 12,
    description: 'Dẫn dắt thiết kế hạ tầng dữ liệu thế hệ mới cho ngân hàng số Techcombank, phục vụ các mô hình Real-time Scoring, Credit Risk và Hyper-Personalization.',
    descriptionEn: 'Lead the next-generation data lakehouse architecture for Techcombank digital banking, empowering real-time credit scoring, fraud prevention, and hyper-personalized AI models.',
    requirements: [
      '5+ năm kinh nghiệm Data Engineering trong ngành Ngân hàng hoặc FinTech',
      'Thành thạo kiến trúc Lakehouse (Delta Lake/Apache Iceberg)',
      'Kinh nghiệm quản lý và cố vấn chuyên môn cho đội ngũ Data Engineers'
    ],
    requirementsEn: [
      '5+ years enterprise Data Engineering experience in Banking, FinTech, or Cloud ecosystems',
      'Mastery of Lakehouse architectures (Delta Lake, Apache Iceberg, and Databricks)',
      'Proven leadership experience mentoring and directing senior Data Engineering squads'
    ],
    benefits: [
      'Mức đãi ngộ dẫn đầu ngành ngân hàng tại Việt Nam',
      'Làm việc tại tòa tháp biểu tượng Techcombank Tower chuẩn LEED Platinum',
      'Chương trình đào tạo chuyên sâu cùng các chuyên gia hàng đầu từ AWS & Snowflake'
    ],
    benefitsEn: [
      'Top-of-market compensation package among financial institutions in Southeast Asia',
      'Iconic workplace at Techcombank Tower certified with LEED Platinum international standards',
      'Exclusive continuous learning certifications partnered with AWS, Snowflake, and Databricks'
    ]
  },
  {
    id: 'job-8',
    title: 'Senior Product UI/UX Designer',
    company: 'Grab Vietnam',
    companyLogoId: 'grab',
    location: 'TP. Hồ Chí Minh & Remote',
    locationEn: 'Ho Chi Minh City & Remote',
    type: 'Remote',
    level: 'Senior',
    category: 'Design',
    salary: '32 - 50 Triệu VNĐ',
    salaryEn: '32 - 50 Million VND',
    aiMatchScore: 95,
    matchReasons: [
      'Portfolio thiết kế siêu ứng dụng di động đa dịch vụ xuất sắc',
      'Am hiểu sâu sắc Design System, Accessibility WCAG và User Research'
    ],
    matchReasonsEn: [
      'Outstanding consumer mobile super-app design portfolio exhibiting high craftsmanship',
      'Thorough expertise in scalable Design Systems, WCAG accessibility, and UX research methods'
    ],
    skills: ['Figma', 'Design System', 'User Testing', 'Mobile Prototyping', 'Micro-interactions'],
    postedTime: '1 ngày trước',
    postedTimeEn: '1 day ago',
    bonus: 'MacBook M3 Max',
    bonusEn: 'MacBook M3 Max',
    applicantsCount: 27,
    daysLeft: 9,
    description: 'Chịu trách nhiệm thiết kế trải nghiệm người dùng cho các tính năng mới trong siêu ứng dụng Grab (GrabFood, GrabTransport, GrabFin), từ discovery đến prototype tương tác cao.',
    descriptionEn: 'Spearhead end-to-end user experience design for new initiatives across the Grab super-app ecosystem (GrabFood, GrabTransport, GrabFin), from user discovery to interactive high-fidelity prototyping.',
    requirements: [
      '3-5 năm kinh nghiệm thiết kế UI/UX cho ứng dụng mobile tiêu chuẩn quốc tế',
      'Khả năng làm việc độc lập với Product Managers và Data Analysts tại Singapore & VN',
      'Kỹ năng tạo prototype tương tác cao với Protopie hoặc Figma Variables'
    ],
    requirementsEn: [
      '3-5 years designing user experience for international consumer mobile applications',
      'Strong cross-functional collaboration with Product Managers and Data Analysts across Singapore & VN',
      'High-fidelity interactive prototyping capabilities using ProtoPie and Figma Variables'
    ],
    benefits: [
      'Chế độ làm việc linh hoạt Remote 100% hoặc tại văn phòng tùy chọn',
      'Tín dụng đi Grab và đặt GrabFood hàng tháng trị giá 3 triệu VNĐ',
      'Bảo hiểm sức khỏe quốc tế cao cấp và trợ cấp thể thao chăm sóc sức khỏe'
    ],
    benefitsEn: [
      '100% remote-first flexibility with access to regional innovation hubs across Southeast Asia',
      'Monthly Grab transport and GrabFood credits valued at 3,000,000 VND',
      'Global premium international health insurance and annual wellness & fitness stipend'
    ]
  },
  {
    id: 'job-9',
    title: 'Lead Growth Product Manager (VinID / VinShop)',
    company: 'One Mount Group',
    companyLogoId: 'onemount',
    location: 'Hà Nội (Times City)',
    locationEn: 'Hanoi (Times City)',
    type: 'Full-time',
    level: 'Lead',
    category: 'Product',
    salary: '40 - 60 Triệu VNĐ',
    salaryEn: '40 - 60 Million VND',
    aiMatchScore: 91,
    matchReasons: [
      'Kinh nghiệm dẫn dắt chiến lược tăng trưởng người dùng B2B & B2C',
      'Khả năng phối hợp liên phòng ban kỹ thuật, vận hành và thương mại'
    ],
    matchReasonsEn: [
      'Proven background architecting rapid user acquisition and retention for B2B & B2C platforms',
      'High cross-functional leadership aligning engineering, operational, and commercial teams'
    ],
    skills: ['Product Growth', 'A/B Testing', 'Retention', 'Data Science', 'SQL'],
    postedTime: '2 ngày trước',
    postedTimeEn: '2 days ago',
    urgent: true,
    bonus: 'Thưởng cổ tức năm',
    bonusEn: 'Annual Dividend',
    applicantsCount: 15,
    daysLeft: 7,
    description: 'Định hình chiến lược phát triển sản phẩm số và phễu tăng trưởng cho mạng lưới bán lẻ công nghệ VinShop và chương trình khách hàng thân thiết VinID.',
    descriptionEn: 'Shape product strategy and user growth funnels for VinShop’s retail tech network and VinID’s consumer loyalty ecosystem, empowering hundreds of thousands of retail partners.',
    requirements: [
      '4+ năm kinh nghiệm Product Management với thế mạnh chuyên sâu về Growth',
      'Thành thạo phân tích dữ liệu với SQL, Amplitude hoặc Mixpanel',
      'Tư duy giải quyết bài toán phức tạp trong ngành bán lẻ truyền thống kết hợp số hóa'
    ],
    requirementsEn: [
      '4+ years Product Management experience with dedicated focus on Product-Led Growth and Funnels',
      'Analytical data fluency leveraging SQL, Amplitude, Mixpanel, and rigorous A/B experiment design',
      'Strategic mindset transforming traditional retail supply chains through intuitive digital apps'
    ],
    benefits: [
      'Lương thưởng cạnh tranh top đầu khối doanh nghiệp công nghệ',
      'Ưu đãi đặc quyền khi sử dụng các dịch vụ trong hệ sinh thái Vinmec, Vinschool',
      'Cơ hội tạo tác động trực tiếp đến hàng triệu tiểu thương và người tiêu dùng Việt Nam'
    ],
    benefitsEn: [
      'Market-leading executive salary plus substantial annual company performance dividends',
      'Exclusive VIP benefits and discounts across the Vingroup ecosystem (Vinmec, Vinschool, VinFast)',
      'Opportunity to deliver direct socio-economic impact to millions of traditional retail merchants'
    ]
  }
];

export const MOCK_STATS = [
  { label: 'Việc làm tuyển gấp', value: '10,000+', sub: 'Cập nhật hàng giờ' },
  { label: 'Doanh nghiệp hàng đầu', value: '3,800+', sub: 'Từ Tech Giants đến Startups' },
  { label: 'Độ khớp AI Parsing & Match', value: '96.4%', sub: 'Chuẩn năng lực thực tế' },
  { label: 'Thời gian kết nối phỏng vấn', value: '3-5 Ngày', sub: 'Nhanh hơn 70% truyền thống' }
];

export const MOCK_CAREER_ROADMAPS = [
  {
    targetRole: 'Junior Frontend → Senior Fullstack Engineer',
    targetRoleEn: 'Junior Frontend → Senior Fullstack Engineer',
    duration: '6 Tháng lộ trình học tập tập trung',
    durationEn: '6 Months intensive curriculum',
    matchCurrent: 65,
    matchTarget: 95,
    milestones: [
      {
        step: 1,
        title: 'Nền tảng Nâng cao & TypeScript Chuyên sâu',
        titleEn: 'Advanced Foundations & Deep TypeScript',
        status: 'completed',
        skills: ['TypeScript Strict Mode', 'Design Patterns', 'Modern Async/Await'],
        estimatedHours: '40 Giờ',
        estimatedHoursEn: '40 Hours'
      },
      {
        step: 2,
        title: 'Backend Engineering & Clean Architecture',
        titleEn: 'Backend Engineering & Clean Architecture',
        status: 'in-progress',
        skills: ['NestJS / Express', 'Database Design 3NF', 'Prisma ORM'],
        estimatedHours: '65 Giờ',
        estimatedHoursEn: '65 Hours'
      },
      {
        step: 3,
        title: 'Hệ thống Phân tán, Caching & Message Queue',
        titleEn: 'Distributed Systems, Caching & Message Queues',
        status: 'upcoming',
        skills: ['Redis Caching', 'RabbitMQ / Kafka', 'Microservices'],
        estimatedHours: '50 Giờ',
        estimatedHoursEn: '50 Hours'
      },
      {
        step: 4,
        title: 'DevOps, CI/CD & Triển khai Cloud',
        titleEn: 'DevOps, CI/CD & Cloud Deployment',
        status: 'upcoming',
        skills: ['Docker Multi-stage', 'Kubernetes Basic', 'AWS ECS / RDS'],
        estimatedHours: '45 Giờ',
        estimatedHoursEn: '45 Hours'
      }
    ]
  },
  {
    targetRole: 'Backend Dev → AI/ML Engineer',
    targetRoleEn: 'Backend Dev → AI/ML Engineer',
    duration: '9 Tháng lộ trình AI & Machine Learning chuyên sâu',
    durationEn: '9 Months specialized AI & ML track',
    matchCurrent: 55,
    matchTarget: 92,
    milestones: [
      {
        step: 1,
        title: 'Toán học Ứng dụng & Nền tảng Python/Data Science',
        titleEn: 'Applied Mathematics & Python/Data Science Foundations',
        status: 'completed',
        skills: ['Linear Algebra & Calculus', 'NumPy & Pandas', 'Data Preprocessing'],
        estimatedHours: '50 Giờ',
        estimatedHoursEn: '50 Hours'
      },
      {
        step: 2,
        title: 'Machine Learning & Deep Learning Thực chiến',
        titleEn: 'Applied Machine Learning & Deep Learning',
        status: 'in-progress',
        skills: ['Scikit-learn', 'PyTorch / TensorFlow', 'CNN & RNN Architecture'],
        estimatedHours: '80 Giờ',
        estimatedHoursEn: '80 Hours'
      },
      {
        step: 3,
        title: 'Generative AI, LLMs Fine-tuning & RAG Pipeline',
        titleEn: 'Generative AI, LLMs Fine-tuning & RAG Pipeline',
        status: 'upcoming',
        skills: ['HuggingFace Transformers', 'LangChain / LlamaIndex', 'Vector DBs (Qdrant/Milvus)'],
        estimatedHours: '70 Giờ',
        estimatedHoursEn: '70 Hours'
      },
      {
        step: 4,
        title: 'Triển khai Mô hình AI & Vận hành MLOps Production',
        titleEn: 'AI Model Deployment & Production MLOps',
        status: 'upcoming',
        skills: ['vLLM / TensorRT-LLM', 'FastAPI Inference', 'MLflow & Triton Server'],
        estimatedHours: '60 Giờ',
        estimatedHoursEn: '60 Hours'
      }
    ]
  },
  {
    targetRole: 'Software Engineer → Solutions Architect',
    targetRoleEn: 'Software Engineer → Solutions Architect',
    duration: '12 Tháng kiến trúc hệ thống quy mô lớn & Cloud',
    durationEn: '12 Months enterprise architecture & cloud track',
    matchCurrent: 50,
    matchTarget: 88,
    milestones: [
      {
        step: 1,
        title: 'Kiến trúc Doanh nghiệp & Domain-Driven Design (DDD)',
        titleEn: 'Enterprise Architecture & Domain-Driven Design (DDD)',
        status: 'completed',
        skills: ['Bounded Context', 'Event Sourcing & CQRS', 'Microservices Patterns'],
        estimatedHours: '60 Giờ',
        estimatedHoursEn: '60 Hours'
      },
      {
        step: 2,
        title: 'Kiến trúc Multi-Cloud & Độ sẵn sàng cao (High Availability)',
        titleEn: 'Multi-Cloud Architecture & High Availability (HA)',
        status: 'in-progress',
        skills: ['AWS / GCP Solutions Architecture', 'Terraform IaC', 'Kubernetes Multi-Cluster'],
        estimatedHours: '90 Giờ',
        estimatedHoursEn: '90 Hours'
      },
      {
        step: 3,
        title: 'Xử lý Dữ liệu Lớn theo Thời gian thực & Lakehouse',
        titleEn: 'Big Data Streaming & Real-time Lakehouse Analytics',
        status: 'upcoming',
        skills: ['Apache Kafka Cluster', 'Spark / Flink Streaming', 'Lakehouse & Snowflake'],
        estimatedHours: '75 Giờ',
        estimatedHoursEn: '75 Hours'
      },
      {
        step: 4,
        title: 'Bảo mật Zero-Trust, Cloud FinOps & Quản trị Công nghệ',
        titleEn: 'Zero-Trust Security, Cloud FinOps & Tech Governance',
        status: 'upcoming',
        skills: ['Zero-Trust Architecture', 'FinOps Cloud Cost', 'ISO 27001 & SOC2'],
        estimatedHours: '65 Giờ',
        estimatedHoursEn: '65 Hours'
      }
    ]
  }
];

export const MOCK_CV_SCAN_RESULT = {
  fileName: 'NguyenVanA_Senior_Fullstack_Resume.pdf',
  fileSize: '420 KB',
  overallScore: 94,
  status: 'Xuất sắc - Chuẩn ATS Quốc tế',
  statusEn: 'Excellent - Global ATS Standard',
  candidateInfo: {
    name: 'Nguyễn Văn An',
    currentRole: 'Fullstack Engineer (3 năm KN)',
    currentRoleEn: 'Fullstack Engineer (3 yrs exp)',
    email: 'an.nguyen.dev@example.com',
    phone: '+84 912 345 678',
    location: 'Hà Nội, Việt Nam',
    locationEn: 'Hanoi, Vietnam'
  },
  skillsDetected: [
    { name: 'React / Next.js', level: 'Chuyên gia (Expert)', levelEn: 'Expert', score: 96 },
    { name: 'Node.js / TypeScript', level: 'Thành thạo (Advanced)', levelEn: 'Advanced', score: 92 },
    { name: 'MySQL / Database Design', level: 'Thành thạo (Advanced)', levelEn: 'Advanced', score: 88 },
    { name: 'Docker & CI/CD', level: 'Khá (Intermediate)', levelEn: 'Intermediate', score: 82 },
    { name: 'AI Integration (LLMs/RAG)', level: 'Mới bắt đầu (Basic)', levelEn: 'Basic', score: 70 }
  ],
  aiRecommendations: [
    {
      type: 'improvement',
      text: 'Bổ sung số liệu định lượng về tác động kinh doanh (VD: "Tối ưu database query giảm thời gian phản hồi từ 800ms xuống 150ms").',
      textEn: 'Add quantitative business impact metrics (e.g. "Optimized DB query latency from 800ms down to 150ms").'
    },
    {
      type: 'skill_gap',
      text: 'Các vị trí Senior Fullstack hiện tại yêu cầu thêm kiến thức về Caching (Redis) và Message Queue (Kafka/RabbitMQ).',
      textEn: 'Current Senior Fullstack positions require additional proficiency in Caching (Redis) and Message Queues (Kafka/RabbitMQ).'
    },
    {
      type: 'ats_pass',
      text: 'Định dạng phông chữ, tiêu đề mục đạt chuẩn 100% hệ thống quét ATS, không bị lỗi bảng biểu hay đồ họa ẩn.',
      textEn: 'Font hierarchy and section headers achieve 100% ATS compliance with no hidden formatting errors.'
    }
  ]
};

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    name: 'Trần Minh Hoàng',
    role: 'Senior Frontend Engineer @ VNG Corporation',
    roleEn: 'Senior Frontend Engineer @ VNG Corporation',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Chỉ mất 5 giây kéo thả CV, hệ thống AI đã gợi ý ngay vị trí Senior Frontend tại VNG với độ khớp 98%. Mình ứng tuyển và nhận offer chỉ sau 1 tuần!',
    contentEn: 'Dragging and dropping my CV took only 5 seconds, and the AI immediately matched me with a Senior Frontend role at VNG with 98% accuracy. I received an offer in just one week!',
    badge: 'Ứng viên thành công',
    badgeEn: 'Successful Candidate'
  },
  {
    name: 'Lê Thu Trang',
    role: 'Head of Talent Acquisition @ FPT Software',
    roleEn: 'Head of Talent Acquisition @ FPT Software',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    content: 'Các hồ sơ nộp qua TalentBridge đều được chấm điểm AI Match chính xác, giúp chúng tôi nhanh chóng tiếp cận được các ứng viên chất lượng nhất mà không mất hàng tuần sàng lọc.',
    contentEn: 'Candidate profiles submitted via TalentBridge are scored with precise AI Match ratings, enabling our TA team to connect with top-tier talent without weeks of manual screening.',
    badge: 'Nhà tuyển dụng xác thực',
    badgeEn: 'Verified Employer'
  },
  {
    name: 'Đặng Quốc Bảo',
    role: 'Product Designer @ Zenith Media',
    roleEn: 'Product Designer @ Zenith Media',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'Giao diện tìm việc ở đây rất trực quan, hiển thị rõ ràng mức lương, công ty và tiêu chí tuyển dụng. Thao tác ứng tuyển cực kỳ nhanh chóng.',
    contentEn: 'The job exploration UI is exceptionally intuitive, clearly showcasing salary benchmarks, employer details, and requirements. One-click applying is lightning fast.',
    badge: 'Ứng viên thành công',
    badgeEn: 'Successful Candidate'
  }
];
