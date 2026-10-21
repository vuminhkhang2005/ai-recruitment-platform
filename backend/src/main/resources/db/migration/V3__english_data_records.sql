SET NAMES utf8mb4;

-- ============================================================================
-- 1. COMPANIES (10 Featured Partner Companies in English)
-- ============================================================================
UPDATE companies SET
    industry = 'Software & IT Services',
    city = 'Ha Noi',
    address = 'FPT Tower, 10 Pham Van Bach, Cau Giay',
    description = 'Vietnam''s leading global technology corporation delivering end-to-end digital transformation, cloud computing, AI solutions, and enterprise software services to Fortune 500 clients across 30+ countries.'
WHERE id = 1;

UPDATE companies SET
    industry = 'Internet & Gaming',
    city = 'Ho Chi Minh City',
    address = 'VNG Campus, Z06 Street 13, Tan Thuan EPZ, District 7',
    description = 'Vietnam''s first technology unicorn building a comprehensive digital ecosystem spanning Zalo, ZaloPay, VNGGames, and Digital Business (VNG Cloud & AI) for over 100 million users.'
WHERE id = 2;

UPDATE companies SET
    industry = 'Telecommunications & IT',
    city = 'Ha Noi',
    address = 'Viettel Building, 1 Giang Van Minh, Ba Dinh',
    description = 'The flagship enterprise solutions corporation of Viettel Group, pioneering national digital infrastructure, e-Government platforms, smart cities, Cloud, Big Data, and AI security.'
WHERE id = 3;

UPDATE companies SET
    industry = 'FinTech & E-commerce',
    city = 'Ha Noi',
    address = 'Tower T26, Times City, 458 Minh Khai, Hai Ba Trung',
    description = 'Building Vietnam''s largest technological ecosystem connecting retail supply chains, digital distribution, real estate, and financial services through VinShop, VinID, and OneHousing.'
WHERE id = 4;

UPDATE companies SET
    industry = 'FinTech',
    city = 'Ho Chi Minh City',
    address = 'Phu My Hung Tower, 8 Hoang Van Thai, District 7',
    description = 'Vietnam''s #1 financial super-app and digital payment platform serving over 30 million users and 50,000+ business partners with AI-powered financial and lifestyle services.'
WHERE id = 5;

UPDATE companies SET
    industry = 'Banking & FinTech',
    city = 'Ho Chi Minh City',
    address = 'The Hallmark, 15 Tran Bach Dang, Thu Thiem, Thu Duc City',
    description = 'The premier global technology and software engineering hub of National Australia Bank (NAB), empowering thousands of cloud and software engineers to build next-generation digital banking.'
WHERE id = 6;

UPDATE companies SET
    industry = 'E-commerce & Logistics',
    city = 'Ho Chi Minh City',
    address = 'Viettel Complex, 285 Cach Mang Thang 8, District 10',
    description = 'Leading trusted e-commerce marketplace and TikiNOW smart fulfillment logistics platform delivering millions of authentic products nationwide with 2-hour express delivery.'
WHERE id = 7;

UPDATE companies SET
    industry = 'Software Engineering',
    city = 'Ho Chi Minh City',
    address = '2 Tan Vien, Ward 2, Tan Binh District',
    description = 'Global market leader in software product development, quality engineering, AI/data consulting, and technology incubation with engineering centers in the US and Vietnam.'
WHERE id = 8;

UPDATE companies SET
    industry = 'IT Consulting & Outsourcing',
    city = 'Ho Chi Minh City',
    address = 'E-Town Central, 11 Doan Van Bo, District 4',
    description = 'A division of Harvey Nash Group delivering world-class software engineering, cloud architecture, and data solutions for enterprise clients across the UK, US, Europe, and APAC.'
WHERE id = 9;

UPDATE companies SET
    industry = 'Public Safety Tech',
    city = 'Ho Chi Minh City',
    address = 'Friendship Tower, 31 Le Duan, Ben Nghe, District 1',
    description = 'High-tech R&D engineering center for Axon Enterprise (NASDAQ: AXON), developing AI-powered body cameras, connected public safety devices, and petabyte-scale Axon Evidence cloud platforms.'
WHERE id = 10;

-- ============================================================================
-- 2. CLEAN UP AUTOMATED QA TEST ARTIFACTS & DUPLICATE JOBS
-- ============================================================================
UPDATE jobs SET status = 'CLOSED', deleted_at = NOW() WHERE id IN (33, 34) OR id >= 49;
DELETE FROM job_skills WHERE skill_id IN (66, 67);
DELETE FROM candidate_skills WHERE skill_id IN (66, 67);
DELETE FROM skills WHERE id IN (66, 67) OR name LIKE 'Agentic AI (%';

-- ============================================================================
-- 3. JOBS (All 42 Active Jobs Converted to Rich Professional English)
-- ============================================================================
UPDATE jobs SET
    title = 'Fresher .NET Backend Developer',
    location_city = 'Ha Noi',
    location_address = 'FPT Tower, 10 Pham Van Bach, Cau Giay, Ha Noi',
    description = '• Participate in developing enterprise backend microservices for global digital transformation projects.
• Design and implement RESTful APIs using C#, .NET Core / .NET 8, and Entity Framework Core.
• Optimize relational database queries on SQL Server and PostgreSQL.
• Collaborate with Solution Architects, Frontend Engineers, and QA in an Agile/Scrum environment.',
    requirements = '• Bachelor''s degree or final-year student in Computer Science, Software Engineering, or related IT fields.
• Solid foundation in Object-Oriented Programming (OOP), data structures, and C# / .NET Core.
• Working knowledge of SQL Server or PostgreSQL, RESTful API design, and Git version control.
• Familiarity with Docker or unit testing is a strong plus.',
    benefits = '• Competitive starting salary (9 - 14M VND) with bi-annual performance salary reviews.
• 13th-month salary bonus plus project completion incentives.
• Comprehensive FPT Care premium health insurance and structured on-the-job mentorship.'
WHERE id = 1;

UPDATE jobs SET
    title = 'Senior .NET Core Microservices Engineer',
    location_city = 'Ha Noi',
    location_address = 'FPT Tower, 10 Pham Van Bach, Cau Giay, Ha Noi',
    description = '• Architect and build high-throughput, low-latency distributed microservices using .NET 8 and C#.
• Lead technical design discussions, code reviews, and performance tuning for mission-critical enterprise systems.
• Integrate event-driven messaging pipelines with Kafka/RabbitMQ, Redis caching, and Docker/Kubernetes clusters.
• Mentor junior and mid-level backend engineers on Clean Architecture and engineering best practices.',
    requirements = '• Minimum 5+ years of professional backend engineering experience with .NET Core / C# in large-scale systems.
• Deep expertise in Microservices Architecture, Domain-Driven Design (DDD), SQL Server/PostgreSQL, and Redis.
• Hands-on experience with Docker, Kubernetes, CI/CD pipelines, and Azure or AWS cloud services.
• Strong English communication skills for working directly with international clients.',
    benefits = '• Attractive compensation package (30 - 45M VND) + annual performance bonus of 3-5 months'' salary.
• High-spec workstation laptop provided, plus full sponsorship for Azure/AWS professional certifications.
• Premium healthcare insurance for employee and family members.'
WHERE id = 2;

UPDATE jobs SET
    title = 'Junior Frontend React Developer',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Develop responsive, high-performance web applications for the ZaloPay ecosystem and merchant payment portals.
• Build reusable UI component libraries using React, TypeScript, Next.js, and Tailwind CSS.
• Collaborate closely with Product Managers, UI/UX Designers, and Backend Engineers to deliver seamless user experiences.
• Optimize Core Web Vitals, bundle sizes, and cross-browser rendering performance.',
    requirements = '• 1-2 years of hands-on web development experience with React, Next.js, and TypeScript.
• Strong proficiency in modern HTML5, CSS3/Tailwind CSS, JavaScript (ES6+), and state management (Redux Toolkit / Zustand).
• Experience integrating RESTful APIs and working with Git workflows.
• Eye for detail and passion for clean, accessible UI/UX.',
    benefits = '• Competitive salary (15 - 22M VND) with 2 performance reviews per year.
• 13th-month salary, product performance bonuses, and free daily lunch at VNG Campus.
• Full access to VNG Campus gym, swimming pool, and premium VIP health insurance.'
WHERE id = 3;

UPDATE jobs SET
    title = 'Backend Golang Engineer',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Design, build, and operate high-concurrency backend services in Golang handling tens of thousands of requests per second.
• Develop distributed payment and messaging services using gRPC, Protobuf, Kafka, Redis, and MySQL/PostgreSQL.
• Ensure high availability (99.99% SLA), observability, and fault tolerance across production clusters.
• Participate in architecture reviews, load testing, and incident response.',
    requirements = '• At least 3 years of backend engineering experience, including 1.5+ years of production experience with Golang.
• Strong understanding of Go concurrency primitives (goroutines, channels), memory management, and network programming.
• Experience with MySQL/PostgreSQL, Redis, Kafka, Docker, and Kubernetes.
• Solid problem-solving skills and experience with high-traffic distributed systems.',
    benefits = '• Highly competitive compensation (25 - 38M VND) + annual product performance bonuses.
• Modern MacBook Pro workstation, free meals, and world-class amenities at VNG Campus.
• Premium health insurance and annual international tech conference sponsorship.'
WHERE id = 4;

UPDATE jobs SET
    title = 'Java Spring Boot Software Engineer',
    location_city = 'Ha Noi',
    location_address = 'Viettel Building, Cau Giay, Ha Noi',
    description = '• Research, design, and develop large-scale enterprise software platforms for National Digital Transformation and e-Government initiatives.
• Build secure, scalable backend services using Java 17/21, Spring Boot, Spring Security, and Hibernate/JPA.
• Optimize high-volume relational and NoSQL databases (PostgreSQL, Oracle, Redis, Elasticsearch).
• Collaborate with cross-functional engineering squads to deliver high-reliability software releases.',
    requirements = '• 2-4 years of software engineering experience with Java and the Spring Boot ecosystem.
• Strong knowledge of RESTful APIs, Microservices, Spring Security, JPA/Hibernate, and SQL optimization.
• Experience with message brokers (Kafka / RabbitMQ), Docker, and CI/CD pipelines.
• Strong analytical thinking and commitment to code quality and security standards.',
    benefits = '• Competitive compensation (20 - 32M VND) plus quarterly and annual Viettel Group performance bonuses.
• Clear career progression path toward Technical Lead or Solution Architect.
• Comprehensive healthcare package, annual retreats, and telecommunications allowances.'
WHERE id = 5;

UPDATE jobs SET
    title = 'Cloud DevOps Engineer',
    location_city = 'Ha Noi',
    location_address = 'Viettel Building, Cau Giay, Ha Noi',
    description = '• Operate and scale Viettel Cloud infrastructure, automating multi-cluster Kubernetes deployments and CI/CD pipelines.
• Manage Infrastructure as Code (IaC) using Terraform, Ansible, and Helm charts.
• Build end-to-end observability, logging, and alerting stacks using Prometheus, Grafana, and ELK.
• Collaborate with development teams to enforce DevSecOps practices and zero-downtime deployments.',
    requirements = '• 2-4 years of hands-on experience in DevOps, SRE, or Cloud Infrastructure Engineering.
• Production experience with Kubernetes, Docker, Linux administration, Terraform, and CI/CD (GitLab CI / Jenkins / GitHub Actions).
• Proficiency in scripting with Bash, Python, or Go, and monitoring with Prometheus & Grafana.
• Experience with AWS, Azure, or OpenStack cloud environments.',
    benefits = '• Competitive salary (22 - 35M VND) with generous project and holiday bonuses.
• Direct career track to Cloud Infrastructure Lead / Principal SRE.
• Full sponsorship for CKA, CKAD, and AWS/Azure Solution Architect certifications.'
WHERE id = 6;

UPDATE jobs SET
    title = 'Fresher Data Engineer',
    location_city = 'Ha Noi',
    location_address = 'Times City, 458 Minh Khai, Hai Ba Trung, Ha Noi',
    description = '• Build and maintain batch and streaming data pipelines ingesting retail and loyalty data for VinShop and VinID.
• Transform and model analytical datasets in the enterprise Data Warehouse / Lakehouse using Python, SQL, and Apache Spark.
• Work with Data Analysts and Data Scientists to ensure high data quality, lineage, and reliability.',
    requirements = '• Bachelor''s degree in Computer Science, Data Science, Information Systems, or related quantitative fields.
• Strong proficiency in Python and advanced SQL (window functions, query optimization).
• Foundational knowledge of Data Warehousing, ETL/ELT pipelines, Apache Spark, or Airflow.
• Eager to learn and thrive in a fast-paced, data-driven tech ecosystem.',
    benefits = '• Competitive fresher package (10 - 16M VND) + 13th-month salary and performance incentives.
• Modern Grade-A office at Times City, Ha Noi with a collaborative, product-focused culture.
• Direct mentorship from senior data engineers and architects from leading global tech companies.'
WHERE id = 7;

UPDATE jobs SET
    title = 'Senior Full-Stack Developer',
    location_city = 'Ha Noi',
    location_address = 'Times City, 458 Minh Khai, Hai Ba Trung, Ha Noi',
    description = '• Lead end-to-end feature development for the OneHousing PropTech platform, integrating interactive digital maps and real estate valuation engines.
• Architect modern web frontends with React/Next.js and scalable backend services with Node.js/NestJS or Java Spring Boot.
• Drive technical excellence through architectural reviews, automated testing, and performance optimization.',
    requirements = '• 4-5+ years of full-stack development experience with React/TypeScript on the frontend and Node.js or Java on the backend.
• Strong experience with PostgreSQL/MySQL, Redis, Docker, and cloud-native deployments (AWS/GCP).
• Proven product mindset and ability to deliver complex user-facing features at scale.',
    benefits = '• Top-of-market compensation (35 - 50M VND) + preferential Employee Stock Ownership Plan (ESOP).
• Premium Vinmec healthcare insurance for employee and immediate family.
• Flexible hybrid work policy and latest MacBook Pro equipment.'
WHERE id = 8;

UPDATE jobs SET
    title = 'Mobile Developer (Flutter)',
    location_city = 'Ho Chi Minh City',
    location_address = 'Phu My Hung Tower, District 7, Ho Chi Minh City',
    description = '• Develop high-frequency QR payment flows, financial mini-apps, and interactive user experiences on the MoMo Super App.
• Write clean, maintainable, and testable code using Flutter/Dart and reactive state management patterns (BLoC / Riverpod).
• Optimize app startup time, frame rendering (60/120 FPS), and memory footprint across iOS and Android devices.',
    requirements = '• 1-3 years of mobile application development experience with Flutter/Dart (or Native iOS/Android transitioning to Flutter).
• Solid understanding of Reactive Programming, RESTful API integration, offline caching, and mobile security.
• Experience publishing and maintaining apps on the App Store and Google Play.',
    benefits = '• Competitive salary (16 - 25M VND) + quarterly fintech performance bonuses.
• International-standard office in Phu My Hung, District 7 with free snacks and recreational zones.
• Comprehensive private health insurance and annual learning stipend.'
WHERE id = 9;

UPDATE jobs SET
    title = 'Database Administrator (MySQL/Redis)',
    location_city = 'Ho Chi Minh City',
    location_address = 'Phu My Hung Tower, District 7, Ho Chi Minh City',
    description = '• Administer, tune, and guarantee 99.99% high availability for mission-critical MySQL, PostgreSQL, and Redis database clusters supporting millions of daily financial transactions.
• Implement database sharding, replication, backup/recovery automation, and zero-downtime schema migrations.
• Collaborate with backend engineering teams to optimize slow queries, indexing strategies, and connection pooling.',
    requirements = '• Minimum 3+ years of hands-on DBA experience managing large-scale MySQL/PostgreSQL and Redis clusters in production.
• Deep expertise in InnoDB internals, query execution plans, replication, high availability (Orchestrator/ProxySQL/Sentinel), and backup recovery.
• Experience with Linux performance tuning, Prometheus/Grafana monitoring, and automation scripting.',
    benefits = '• Attractive compensation (25 - 40M VND) + Tet bonus and quarterly performance rewards.
• International health insurance package for employee and family.
• Opportunity to operate one of Vietnam''s highest-throughput financial database infrastructures.'
WHERE id = 10;

UPDATE jobs SET
    title = 'Junior Software Engineer (.NET & Cloud)',
    location_city = 'Ho Chi Minh City',
    location_address = 'The Hallmark, Thu Thiem, Ho Chi Minh City',
    description = '• Join cross-functional international engineering squads modernizing core digital banking platforms for National Australia Bank (NAB).
• Build cloud-native backend services using C# / .NET Core, RESTful APIs, and AWS/Azure services.
• Practice Clean Code, Test-Driven Development (TDD), pair programming, and automated CI/CD delivery.',
    requirements = '• 1+ year of software development experience with C# / .NET Core, REST APIs, and relational databases.
• Strong mindset for Clean Code, Unit Testing, and Agile engineering practices.
• Good English communication skills for daily collaboration with Australian engineering teams.',
    benefits = '• Competitive salary (18 - 28M VND) in a 100% English-speaking international banking tech hub.
• Grade-A office at The Hallmark (Thu Thiem) + latest MacBook Pro M3.
• Full sponsorship for AWS/Azure cloud certifications and generous annual leave.'
WHERE id = 11;

UPDATE jobs SET
    title = 'QA Automation Engineer',
    location_city = 'Ho Chi Minh City',
    location_address = 'The Hallmark, Thu Thiem, Ho Chi Minh City',
    description = '• Design, build, and maintain end-to-end automated test frameworks using Playwright, Cypress, or Selenium for digital banking web and API platforms.
• Integrate automated regression and performance test suites into CI/CD pipelines.
• Partner with developers and product owners to shift quality left and define comprehensive acceptance criteria.',
    requirements = '• 2-4 years of experience in Software Quality Assurance and Test Automation (Playwright, Cypress, Selenium, or RestAssured).
• Solid programming skills in TypeScript/JavaScript, Java, or Python.
• Strong understanding of CI/CD pipelines, Git, API testing, and Agile/Scrum methodologies.',
    benefits = '• Competitive compensation (22 - 32M VND) + 13th-month salary and annual bonus.
• Flexible Hybrid working model (2 days work-from-home per week).
• Premium international healthcare for employee and dependents.'
WHERE id = 12;

UPDATE jobs SET
    title = 'Backend Engineer (Go/Java)',
    location_city = 'Ho Chi Minh City',
    location_address = 'Viettel Complex, District 10, Ho Chi Minh City',
    description = '• Develop high-throughput backend systems for TikiNOW smart warehouse management, order fulfillment, and real-time inventory synchronization.
• Design resilient microservices using Golang or Java Spring Boot, Kafka event streaming, Redis, and MySQL.
• Optimize system latency and throughput during mega-sale traffic spikes.',
    requirements = '• 2-4 years of backend development experience using Golang, Java, or Python.
• Strong foundation in data structures, algorithms, distributed systems, and relational/NoSQL databases.
• Experience with Kafka, Redis, Docker, and Kubernetes in production environments.',
    benefits = '• Competitive salary (20 - 35M VND) + performance bonuses and Tiki employee shopping perks.
• Opportunity to solve large-scale e-commerce and fulfillment engineering challenges.
• Premium VIP health insurance and flexible hybrid work arrangements.'
WHERE id = 13;

UPDATE jobs SET
    title = 'Frontend Developer (Next.js)',
    location_city = 'Ho Chi Minh City',
    location_address = 'Viettel Complex, District 10, Ho Chi Minh City',
    description = '• Build fast, SEO-friendly e-commerce shopping experiences on Tiki.vn using React, Next.js (SSR/ISR), and TypeScript.
• Optimize Core Web Vitals (LCP, FID, CLS), page load performance, and mobile web responsiveness.
• Collaborate with Product, Design, and Backend teams to run A/B experiments and improve conversion rates.',
    requirements = '• 1-3 years of frontend engineering experience with React, Next.js, and TypeScript.
• Deep understanding of Server-Side Rendering (SSR), browser rendering internals, Web Vitals, and state management.
• Experience writing unit/integration tests with Jest and React Testing Library.',
    benefits = '• Competitive compensation (15 - 22M VND) + bi-annual performance reviews.
• Exclusive employee discounts on Tiki.vn and comprehensive VIP health insurance.
• Dynamic, product-driven engineering culture.'
WHERE id = 14;

UPDATE jobs SET
    title = 'Software Engineer Intern (All Tracks)',
    location_city = 'Ho Chi Minh City',
    location_address = '2 Tan Vien, Tan Binh District, Ho Chi Minh City',
    description = '• Paid 3-month intensive software engineering internship program designed for outstanding 3rd-year and final-year IT students.
• Work on real-world Full-Stack, Backend, Frontend, or AI/Data engineering projects under the mentorship of Senior Engineers.
• Learn Agile/Scrum workflows, Clean Architecture, Git code reviews, unit testing, and CI/CD automation.',
    requirements = '• 3rd-year or final-year undergraduate student majoring in Computer Science, Software Engineering, or Information Technology.
• Solid foundation in Object-Oriented Programming (OOP), data structures, and at least one language: Java, C#, JavaScript/TypeScript, or Python.
• Basic knowledge of SQL/databases, Git, and good English reading/communication skills.',
    benefits = '• Attractive monthly internship allowance (4 - 6M VND) + free lunch and parking allowance.
• Fast-track conversion to full-time Software Engineer after the 3-month program.
• Support for graduation thesis / capstone project verification and dedicated 1-on-1 mentorship.'
WHERE id = 15;

UPDATE jobs SET
    title = 'Full-Stack Engineer (React & Java)',
    location_city = 'Ho Chi Minh City',
    location_address = '2 Tan Vien, Tan Binh District, Ho Chi Minh City',
    description = '• Develop enterprise SaaS web applications for US and European clients using React/TypeScript on the frontend and Java Spring Boot on the backend.
• Participate in full product lifecycle from requirements analysis and system design to cloud deployment on AWS.
• Write clean, well-tested code and collaborate directly with US-based product engineering teams.',
    requirements = '• 2-4 years of full-stack software engineering experience with ReactJS and Java Spring Boot.
• Strong proficiency in RESTful APIs, PostgreSQL/MySQL, Docker, and Git.
• Good spoken and written English communication skills and ability to work independently.',
    benefits = '• Competitive salary (22 - 34M VND) + 13th-month salary and project bonuses.
• 100% English-speaking global engineering environment + full sponsorship for AWS certifications.
• Flexible hybrid work policy and premium private health insurance.'
WHERE id = 16;

UPDATE jobs SET
    title = 'Senior .NET Developer',
    location_city = 'Ho Chi Minh City',
    location_address = 'E-Town Central, District 4, Ho Chi Minh City',
    description = '• Design and build cloud-native financial applications on Microsoft Azure for leading UK and international financial institutions.
• Develop scalable backend services using C#, .NET Core / .NET 8, Entity Framework Core, and Azure PaaS services.
• Lead code reviews, mentor junior developers, and collaborate with UK-based solution architects.',
    requirements = '• Minimum 3-5 years of professional experience with C#, .NET Core, ASP.NET Core Web API, and Entity Framework Core.
• Hands-on experience with Microsoft Azure (App Services, Azure Functions, Service Bus, Azure SQL) and Azure DevOps CI/CD.
• Strong command of SOLID principles, Clean Architecture, and English communication.',
    benefits = '• Competitive salary package (28 - 42M VND) + project performance bonuses.
• Comprehensive family health insurance package and 15+ days of paid annual leave.
• Opportunities for short-term onsite assignments in the UK, Singapore, or Australia.'
WHERE id = 17;

UPDATE jobs SET
    title = 'Fresher Java Software Engineer',
    location_city = 'Ho Chi Minh City',
    location_address = 'E-Town Central, District 4, Ho Chi Minh City',
    description = '• Join the NashTech Fresher Academy for intensive hands-on training in Java Spring Boot, React, SQL, and Cloud Engineering before joining global client projects.
• Build enterprise backend APIs, write unit tests, and practice Agile/Scrum software delivery under senior technical mentors.',
    requirements = '• Recent graduate or final-year student in Computer Science, Software Engineering, or Information Technology.
• Solid grasp of Java Core, OOP principles, relational databases (SQL), and basic web technologies.
• Good English reading and communication skills; eager to learn enterprise software standards.',
    benefits = '• Full salary from day one of training (8.5 - 12M VND) + official permanent contract upon completion.
• Structured career roadmap, technical mentorship, and international project exposure.
• Full social insurance, private healthcare, and modern office at E-Town Central.'
WHERE id = 18;

UPDATE jobs SET
    title = 'Software Engineer (AI & Computer Vision)',
    location_city = 'Ho Chi Minh City',
    location_address = 'Friendship Tower, 31 Le Duan, District 1, Ho Chi Minh City',
    description = '• Research, train, and deploy real-time Computer Vision and Deep Learning models for smart public safety cameras and video evidence analytics.
• Optimize neural network inference pipelines using Python, PyTorch, OpenCV, ONNX/TensorRT, and Docker.
• Partner with US R&D teams to bring cutting-edge AI capabilities from research into production.',
    requirements = '• 2-4 years of experience in AI/Machine Learning or Computer Vision engineering.
• Strong proficiency in Python or C++, PyTorch/TensorFlow, OpenCV, and Docker.
• Experience with object detection, tracking, video analytics, or multimodal deep learning models.',
    benefits = '• US tech standard compensation (30 - 50M VND) + Restricted Stock Units (RSUs) in Axon Enterprise (NASDAQ: AXON).
• Grade-A office at Friendship Tower (District 1), daily catered restaurant lunches, and top-tier MacBook Pro.
• Premium global healthcare coverage for employee and family.'
WHERE id = 19;

UPDATE jobs SET
    title = 'Cloud Backend Engineer (Go / AWS)',
    location_city = 'Ho Chi Minh City',
    location_address = 'Friendship Tower, 31 Le Duan, District 1, Ho Chi Minh City',
    description = '• Architect and scale cloud-native microservices on AWS managing petabytes of mission-critical digital evidence video and metadata.
• Build highly reliable distributed systems using Golang, gRPC, Kafka, AWS (ECS/EKS, S3, DynamoDB), and Kubernetes.
• Ensure strict security compliance, high availability, and low-latency global data access.',
    requirements = '• 4+ years of backend engineering experience with strong production expertise in Golang.
• Deep hands-on experience with AWS cloud services (ECS/EKS, S3, DynamoDB, Lambda), Kafka, and gRPC.
• Strong background in distributed systems, microservices architecture, and automated testing.',
    benefits = '• Exceptional compensation (35 - 55M VND) + generous equity (RSU) grants and annual bonuses.
• World-class workspace in District 1, daily catered lunches, wellness allowance, and unlimited learning resources.
• Opportunity to build mission-critical cloud systems at global scale.'
WHERE id = 20;

UPDATE jobs SET
    title = 'Intern .NET Backend Developer',
    location_city = 'Da Nang',
    location_address = 'FPT Complex, Ngu Hanh Son, Da Nang',
    description = '• Designed for 3rd-year and 4th-year IT students passionate about learning enterprise C# / .NET backend architecture in Da Nang.
• Assist project teams in building RESTful APIs, writing unit tests, and working with SQL Server databases.
• Receive hands-on training in ASP.NET Core, Entity Framework Core, Git, and Agile/Scrum workflows.',
    requirements = '• 3rd-year or final-year student in Information Technology, Software Engineering, or Computer Science.
• Good foundational knowledge of C#, OOP, and relational databases (SQL).
• Proactive, eager to learn, and able to commit at least 4 days/week during the internship.',
    benefits = '• Monthly internship allowance (3.5 - 5.5M VND) + official graduation internship stamp/verification.
• Direct hiring path to Fresher .NET Developer at FPT Software Da Nang upon graduation.
• Modern campus environment at FPT Complex with shuttle bus and canteen support.'
WHERE id = 21;

UPDATE jobs SET
    title = 'Fresher Frontend Web (React)',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Join the product engineering team building the next-generation Zing MP3 and Zalo Web experiences.
• Develop interactive, responsive UI components using ReactJS, TypeScript, and modern CSS.
• Work closely with senior frontend engineers to learn state management, performance optimization, and frontend testing.',
    requirements = '• Recent graduate or final-year student in Computer Science or Software Engineering.
• Solid grasp of HTML5, CSS3, JavaScript (ES6+), and at least 1 completed project using ReactJS.
• Passion for building polished user interfaces and learning modern web standards.',
    benefits = '• Competitive fresher salary (9 - 14M VND) + 13th-month salary and free daily lunch.
• Experience the vibrant tech unicorn culture at VNG Campus (gym, pool, library, tech talks).
• Dedicated mentorship and rapid career growth.'
WHERE id = 22;

UPDATE jobs SET
    title = 'Fresher Android Developer (Kotlin)',
    location_city = 'Ha Noi',
    location_address = 'Times City, 458 Minh Khai, Hai Ba Trung, Ha Noi',
    description = '• Participate in developing the VinShop mobile application empowering over 100,000 retail store owners across Vietnam.
• Build clean, modular Android features using Kotlin, Jetpack Compose / XML, Coroutines, and MVVM Architecture.
• Collaborate with QA and Product Designers to deliver reliable mobile releases.',
    requirements = '• Bachelor''s degree or final-year student in Computer Science or Software Engineering.
• Strong foundational knowledge of Kotlin, Android SDK, MVVM architecture, and RESTful API integration.
• Published personal or academic Android projects on GitHub or Google Play is a plus.',
    benefits = '• Competitive fresher package (9.5 - 14.5M VND) + performance bonuses.
• Learn directly from principal mobile engineers with experience from Google, Grab, and leading tech firms.
• Modern office at Times City, Ha Noi with full health insurance.'
WHERE id = 23;

UPDATE jobs SET
    title = 'Intern QA Engineer',
    location_city = 'Ho Chi Minh City',
    location_address = 'The Hallmark, Thu Thiem, Ho Chi Minh City',
    description = '• Learn enterprise software quality engineering, including manual functional testing, API testing, and an introduction to test automation at NAB Innovation Centre Vietnam.
• Design test cases, execute regression suites, and collaborate with Agile banking squads.',
    requirements = '• Final-year IT/Computer Science student with strong attention to detail and analytical thinking.
• Basic understanding of software testing lifecycles (STLC), SQL, and web/API fundamentals.
• Good English communication skills in an international environment.',
    benefits = '• Competitive internship allowance (5 - 7M VND) + modern Grade-A office at Thu Thiem.
• 100% English-speaking environment with dedicated mentorship and full-time conversion opportunities.'
WHERE id = 24;

UPDATE jobs SET
    title = 'Junior DevOps Specialist',
    location_city = 'Ho Chi Minh City',
    location_address = '2 Tan Vien, Tan Binh District, Ho Chi Minh City',
    description = '• Assist in building, maintaining, and automating CI/CD pipelines and containerized environments for software engineering squads.
• Manage Docker containers, Linux servers, and cloud resources on AWS and Azure.
• Monitor system health, logs, and deployment metrics.',
    requirements = '• 1+ year of experience with Docker, Linux administration, Bash/Python scripting, and Git.
• Exposure to CI/CD tools (GitHub Actions, GitLab CI, or Jenkins) and at least one cloud provider (AWS or Azure).
• Strong troubleshooting skills and eagerness to pursue cloud certifications.',
    benefits = '• Competitive salary (14 - 21M VND) + full sponsorship for AWS/Azure/Kubernetes certifications.
• Open, collaborative engineering culture with hybrid working flexibility.'
WHERE id = 25;

UPDATE jobs SET
    title = 'Staff Cloud Architect',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Define the multi-year cloud architecture vision and technical strategy across VNG''s high-scale consumer and enterprise platforms.
• Design multi-region, fault-tolerant Kubernetes and cloud-native infrastructures handling millions of concurrent users.
• Lead architecture review boards, cloud FinOps optimization, and security governance.',
    requirements = '• 6+ years of experience in Cloud Architecture, Distributed Systems, and DevOps/SRE leadership.
• Deep expertise in AWS/GCP, Kubernetes at scale, Terraform, Service Mesh, and high-throughput networking.
• Proven track record of leading complex architectural transformations.',
    benefits = '• Executive compensation package (60 - 90M VND) + equity incentives and leadership bonuses.
• Hybrid work flexibility, international conference travel budget, and VIP family healthcare.'
WHERE id = 29;

UPDATE jobs SET
    title = 'Senior Cloud Architect (AWS & Kubernetes)',
    location_city = 'Ha Noi',
    location_address = 'Keangnam Landmark 72, Pham Hung, Ha Noi',
    description = '• Architect and scale large-scale distributed cloud platforms on AWS and Kubernetes.
• Lead infrastructure modernization, zero-downtime migration strategies, and automated disaster recovery.
• Partner with engineering directors to establish cloud reliability, security, and observability standards.',
    requirements = '• 5+ years of hands-on experience with AWS architecture, production Kubernetes (EKS), and Terraform IaC.
• Strong expertise in microservices networking, CI/CD automation, and observability (Prometheus, Grafana, OpenTelemetry).
• AWS Certified Solutions Architect Professional or CKA certification preferred.',
    benefits = '• Competitive salary (60 - 80M VND) + project performance bonuses.
• Comprehensive family health insurance and flexible hybrid work model.'
WHERE id = 31;

UPDATE jobs SET
    title = 'Senior AI / Deep Learning Engineer (LLM & GenAI)',
    location_city = 'Ha Noi',
    location_address = 'Keangnam Landmark 72, Ha Noi & Remote',
    description = '• Lead the research, fine-tuning, and production deployment of Large Language Models (LLMs), Bi-Encoder/Cross-Encoder Transformers, and Retrieval-Augmented Generation (RAG) pipelines.
• Optimize low-latency GPU inference using PyTorch, HuggingFace Transformers, vLLM, and FastAPI microservices.
• Design rigorous evaluation benchmarks, semantic retrieval pipelines, and multi-agent AI workflows.',
    requirements = '• Minimum 4+ years of hands-on experience developing and optimizing Machine Learning / Deep Learning models in production.
• Strong expertise in Python, PyTorch, HuggingFace Transformers, LLM fine-tuning (LoRA/QLoRA), and RAG architectures.
• Experience deploying scalable AI inference APIs with Docker, Kubernetes, and FastAPI.',
    benefits = '• Top-tier compensation (55 - 85M VND) + quarterly international project bonuses.
• Dedicated GPU cluster access, research publication incentives, and short-term international onsite opportunities.'
WHERE id = 32;

UPDATE jobs SET
    title = 'B2B Enterprise Solutions Consultant',
    location_city = 'Ha Noi',
    location_address = 'FPT Tower, 10 Pham Van Bach, Cau Giay, Ha Noi',
    description = '• Identify enterprise clients and consult on comprehensive digital transformation, cloud migration, and enterprise software solutions.
• Partner with Solution Architects to deliver executive product demonstrations, technical proposals, and commercial negotiations.
• Manage strategic enterprise accounts and drive long-term revenue growth.',
    requirements = '• 1-3 years of experience in B2B Sales, IT Solution Consulting, or Enterprise Account Management.
• Strong presentation, commercial negotiation, and relationship-building skills.
• Solid understanding of enterprise software, cloud, or SaaS business models.',
    benefits = '• Attractive base salary (18 - 35M VND) + uncapped project sales commission.
• FPT Care premium health insurance, travel allowances, and executive sales training.'
WHERE id = 35;

UPDATE jobs SET
    title = 'IT Talent Acquisition Specialist',
    location_city = 'Ha Noi',
    location_address = 'FPT Tower, 10 Pham Van Bach, Cau Giay, Ha Noi',
    description = '• Manage end-to-end technical recruitment lifecycles for key software engineering, AI, and cloud projects at FPT Software.
• Source, screen, and interview candidates across Backend, Frontend, DevOps, and Data Engineering roles using AI-driven ATS tools.
• Partner with Hiring Managers to build talent pipelines and employer branding initiatives.',
    requirements = '• 1-2 years of experience as an IT Recruiter or Talent Acquisition Specialist.
• Strong understanding of software engineering roles, tech stacks, and modern sourcing channels (LinkedIn, GitHub, TalentBridge).
• Excellent interpersonal communication and candidate experience mindset.',
    benefits = '• Competitive salary (12 - 20M VND) + 13th-month salary and KPI hiring bonuses.
• Professional HR & Talent Acquisition certification sponsorship and FPT Care health insurance.'
WHERE id = 36;

UPDATE jobs SET
    title = 'Content Marketing & Community Specialist',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Develop and execute engaging content marketing strategies across digital channels, social media, and user communities for VNG''s flagship products.
• Plan creative campaigns, video scripts, blog articles, and community engagement events.
• Analyze content engagement metrics to optimize reach and organic growth.',
    requirements = '• 1-2 years of experience in Content Marketing, Digital Communications, or Community Management.
• Exceptional copywriting, storytelling, and creative planning skills.
• Familiarity with social media analytics, SEO fundamentals, and digital media trends.',
    benefits = '• Competitive salary (14 - 22M VND) + free lunch, gym, and swimming pool access at VNG Campus.
• VIP health insurance and a creative, empowering product marketing environment.'
WHERE id = 37;

UPDATE jobs SET
    title = 'Senior UI/UX Product Designer',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Conduct user research, design end-to-end user flows, wireframes, and high-fidelity interactive prototypes for mobile and web products serving millions of users.
• Build and evolve scalable Design Systems in Figma in close collaboration with Frontend and Mobile engineers.
• Lead usability testing and data-informed design iterations.',
    requirements = '• Minimum 3+ years of experience in UI/UX Product Design for consumer or enterprise digital products.
• Expert proficiency in Figma, Design Systems, responsive web design, and mobile human interface guidelines.
• Strong portfolio demonstrating user-centered problem solving and visual craft.',
    benefits = '• Competitive salary up to 45M VND (30 - 45M VND) + product performance bonuses.
• Creative workspace at VNG Campus with top-of-the-line MacBook Pro and display setup.'
WHERE id = 38;

UPDATE jobs SET
    title = 'Enterprise Key Account Manager (B2B)',
    location_city = 'Ha Noi',
    location_address = 'Viettel Building, Cau Giay, Ha Noi',
    description = '• Lead business development and manage strategic relationships with large enterprise clients and government agencies at Viettel Solutions.
• Coordinate cross-functional technical and commercial teams to deliver tailored ICT, Cloud, and Smart City solutions.
• Drive contract negotiations, revenue targets, and long-term customer retention.',
    requirements = '• 2-4 years of proven experience in B2B Key Account Management, Enterprise Sales, or ICT Solution Consulting.
• Strong executive communication, proposal writing, and contract negotiation skills.
• Ability to understand complex technology solutions and translate them into business value.',
    benefits = '• Competitive package (25 - 40M VND) + quarterly and annual business performance bonuses.
• Comprehensive healthcare, communication allowances, and leadership development programs.'
WHERE id = 39;

UPDATE jobs SET
    title = 'Corporate Brand & Communications Specialist',
    location_city = 'Ha Noi',
    location_address = 'Viettel Building, Cau Giay, Ha Noi',
    description = '• Plan and execute corporate brand campaigns, product launch events, PR media relations, and digital communications for Viettel Solutions.
• Produce high-impact press releases, executive thought-leadership articles, and brand storytelling assets.
• Manage media partnerships and track brand health metrics.',
    requirements = '• Bachelor''s degree in Marketing, Communications, Journalism, or Public Relations.
• 2+ years of experience in Corporate Communications, Brand Management, or PR at large enterprises or agencies.
• Strong writing, event organization, and stakeholder management skills.',
    benefits = '• Competitive salary (18 - 28M VND) + Viettel Group holiday and annual bonuses.
• Annual company retreats, comprehensive healthcare, and professional growth opportunities.'
WHERE id = 40;

UPDATE jobs SET
    title = 'General & Tax Accountant',
    location_city = 'Ha Noi',
    location_address = 'Times City, 458 Minh Khai, Hai Ba Trung, Ha Noi',
    description = '• Verify accounting vouchers, record revenue and expense transactions, and prepare monthly/quarterly financial statements in compliance with VAS and IFRS standards.
• Handle corporate tax declarations (VAT, CIT, PIT), tax finalization, and external audit coordination.
• Collaborate with finance and operations teams to optimize internal financial controls.',
    requirements = '• Bachelor''s degree in Accounting, Auditing, or Finance.
• Minimum 2+ years of experience as a General Accountant or Tax Accountant in medium-to-large enterprises.
• Proficiency in ERP accounting software (SAP/Oracle/MISA), advanced Excel, and tax regulations.',
    benefits = '• Competitive salary (16 - 25M VND) + 13th-month salary and performance bonuses.
• Modern Grade-A office at Times City, Ha Noi + Vinmec health insurance package.'
WHERE id = 41;

UPDATE jobs SET
    title = 'Supply Chain & Logistics Operations Specialist',
    location_city = 'Ha Noi',
    location_address = 'Times City, 458 Minh Khai, Hai Ba Trung, Ha Noi',
    description = '• Monitor and optimize end-to-end merchandise allocation, warehouse fulfillment, and last-mile delivery operations for the VinShop retail network.
• Analyze supply chain KPIs (on-time delivery, inventory turnover, fulfillment cost) to identify operational bottlenecks.
• Coordinate with suppliers, warehouse partners, and product tech teams to automate logistics workflows.',
    requirements = '• 1-3 years of experience in Supply Chain Management, Logistics Operations, Demand Planning, or E-commerce Fulfillment.
• Strong analytical skills with Excel/SQL and data-driven operational mindset.
• Proactive problem-solver capable of coordinating across multiple stakeholders.',
    benefits = '• Competitive compensation (18 - 28M VND) + project incentives and structured supply chain leadership training.
• Dynamic digital ecosystem environment at One Mount Group (Times City).'
WHERE id = 42;

UPDATE jobs SET
    title = 'Credit Risk & Fraud Analytics Specialist',
    location_city = 'Ho Chi Minh City',
    location_address = 'Phu My Hung Tower, District 7, Ho Chi Minh City',
    description = '• Analyze large-scale financial transaction datasets to build, validate, and optimize credit scoring models and real-time fraud detection rules on MoMo.
• Monitor portfolio risk indicators, default rates, and anomaly patterns across consumer lending and payment products.
• Partner with Data Science and Engineering teams to deploy risk decisioning engines.',
    requirements = '• Bachelor''s degree in Finance, Banking, Economics, Statistics, or Data Science.
• 2+ years of experience in Credit Risk Analytics, Fraud Prevention, or Financial Data Analysis in Banking/FinTech.
• Strong proficiency in SQL, Python/R, and BI visualization tools (PowerBI/Tableau).',
    benefits = '• Competitive package (22 - 36M VND) + quarterly fintech performance bonuses.
• Modern Phu My Hung office, comprehensive private health insurance, and career growth in AI-driven FinTech.'
WHERE id = 43;

UPDATE jobs SET
    title = 'VIP Customer Experience Specialist',
    location_city = 'Ho Chi Minh City',
    location_address = 'Phu My Hung Tower, District 7, Ho Chi Minh City',
    description = '• Provide dedicated, white-glove support and issue resolution for VIP users and strategic merchant partners on the MoMo platform.
• Collaborate with product, operations, and technical support teams to resolve complex account or transaction inquiries promptly.
• Gather customer feedback to drive continuous improvements in product experience and CSAT scores.',
    requirements = '• 1+ year of experience in Customer Success, VIP Customer Care, or Account Support in FinTech, Banking, or E-commerce.
• Empathetic listener with clear communication, problem-solving, and conflict-resolution skills.
• Proficient with CRM ticketing systems and digital support channels.',
    benefits = '• Competitive salary (11 - 17M VND) + monthly KPI incentives and shift allowances.
• Friendly work environment in District 7 with full health insurance and career progression.'
WHERE id = 44;

UPDATE jobs SET
    title = 'FMCG Category Manager',
    location_city = 'Ho Chi Minh City',
    location_address = 'Viettel Complex, District 10, Ho Chi Minh City',
    description = '• Own the P&L, GMV growth, profit margins, and market share of the Fast-Moving Consumer Goods (FMCG) category on Tiki.vn.
• Negotiate strategic joint business plans, exclusive promotions, and supply terms with top global and domestic FMCG brands.
• Collaborate with Performance Marketing and Supply Chain teams to maximize mega-campaign sales.',
    requirements = '• 3-5 years of experience in Category Management, Key Account Management, or E-commerce Merchandising (FMCG/Retail preferred).
• Strong commercial acumen, data analysis, and vendor negotiation skills.
• Proven track record of scaling category GMV and managing brand partnerships.',
    benefits = '• Competitive compensation (32 - 50M VND) + performance bonuses and Tiki shopping privileges.
• High-autonomy leadership role with VIP health insurance.'
WHERE id = 45;

UPDATE jobs SET
    title = 'Performance Marketing Specialist',
    location_city = 'Ho Chi Minh City',
    location_address = 'Viettel Complex, District 10, Ho Chi Minh City',
    description = '• Plan, execute, and optimize large-budget Performance Marketing campaigns across Google Ads, Meta Ads, TikTok Ads, and programmatic channels for Tiki.
• Analyze ROAS, CAC, LTV, and attribution funnels to maximize conversion efficiency.
• Run continuous A/B testing on ad creatives, audience segmentation, and landing pages.',
    requirements = '• 2+ years of hands-on experience managing large-scale conversion ad campaigns in E-commerce, FinTech, or Digital Agencies.
• Deep proficiency in Google Ads, Meta Business Suite, Google Analytics 4, and Mobile Measurement Partners (AppsFlyer/Adjust).
• Strong analytical mindset and data-driven decision-making.',
    benefits = '• Competitive salary (20 - 32M VND) + campaign performance bonuses.
• Ownership of multi-billion VND marketing budgets and access to advanced MarTech tools.'
WHERE id = 46;

UPDATE jobs SET
    title = 'Senior HR Business Partner (HRBP)',
    location_city = 'Ho Chi Minh City',
    location_address = 'VNG Campus, District 7, Ho Chi Minh City',
    description = '• Act as a strategic HR partner to engineering and product business units at VNG, advising leadership on organizational design, talent retention, and performance management.
• Drive employee engagement initiatives, succession planning, and compensation review cycles.
• Foster a high-performing, inclusive engineering culture.',
    requirements = '• Minimum 3+ years of experience as an HR Business Partner (HRBP) or Senior HR Generalist in technology or multinational companies.
• Strong knowledge of talent management, organizational development, labor law, and coaching.
• Excellent stakeholder management and communication skills.',
    benefits = '• Attractive compensation (28 - 45M VND) + annual business performance bonuses.
• Full access to VNG Campus world-class facilities, free meals, and VIP family healthcare.'
WHERE id = 47;

UPDATE jobs SET
    title = 'Senior Graphic & Brand Designer',
    location_city = 'Ha Noi',
    location_address = 'Times City, 458 Minh Khai, Hai Ba Trung, Ha Noi',
    description = '• Conceptualize and design visual brand identities, digital marketing assets, key visuals, and event collateral across One Mount Group''s digital ecosystem.
• Collaborate with Brand Marketing, Content, and Product teams to maintain cohesive visual storytelling across all touchpoints.',
    requirements = '• Minimum 2+ years of experience in Brand Design, Graphic Design, or Art Direction at creative agencies or tech companies.
• Mastery of Adobe Creative Suite (Illustrator, Photoshop, After Effects) and Figma.
• Strong typography, layout composition, and creative portfolio.',
    benefits = '• Competitive salary (16 - 26M VND) + 13th-month salary and creative performance rewards.
• Modern workspace at Times City, Ha Noi with comprehensive Vinmec health insurance.'
WHERE id = 48;

-- ============================================================================
-- 4. SKILLS (All Skill Names & Descriptions in Clean Professional English)
-- ============================================================================
UPDATE skills SET description = 'Modern object-oriented programming language by Microsoft for enterprise and cloud applications' WHERE id = 1;
UPDATE skills SET description = 'Enterprise-grade object-oriented programming language running on the JVM ecosystem' WHERE id = 2;
UPDATE skills SET description = 'Versatile high-level programming language for AI/ML, Data Science, and Backend APIs' WHERE id = 3;
UPDATE skills SET description = 'Strongly typed superset of JavaScript for scalable frontend and full-stack engineering' WHERE id = 4;
UPDATE skills SET description = 'Core scripting language for interactive web frontends and Node.js runtimes' WHERE id = 5;
UPDATE skills SET description = 'High-concurrency, compiled systems programming language designed by Google' WHERE id = 6;
UPDATE skills SET description = 'Cross-platform, high-performance open-source framework by Microsoft' WHERE id = 7;
UPDATE skills SET description = 'Modern web framework for building high-throughput REST APIs and microservices in .NET' WHERE id = 8;
UPDATE skills SET description = 'Industry-standard Java framework for production-grade enterprise backend microservices' WHERE id = 9;
UPDATE skills SET description = 'Declarative component-based JavaScript library for building modern user interfaces' WHERE id = 10;
UPDATE skills SET description = 'Production React framework supporting Server-Side Rendering (SSR) and full-stack web apps' WHERE id = 11;
UPDATE skills SET description = 'Progressive JavaScript framework for building reactive web user interfaces' WHERE id = 12;
UPDATE skills SET description = 'High-performance asynchronous Python web framework for AI and REST APIs' WHERE id = 13;
UPDATE skills SET description = 'Widely adopted open-source relational database management system (RDBMS)' WHERE id = 14;
UPDATE skills SET description = 'Advanced enterprise-class open-source relational and JSONB database system' WHERE id = 15;
UPDATE skills SET description = 'Enterprise relational database management and analytics platform by Microsoft' WHERE id = 16;
UPDATE skills SET description = 'Ultra-low-latency in-memory data store for distributed caching and message brokering' WHERE id = 17;
UPDATE skills SET description = 'Document-oriented NoSQL database designed for high-volume, flexible schemas' WHERE id = 18;
UPDATE skills SET description = 'Containerization platform for packaging and deploying reproducible application environments' WHERE id = 19;
UPDATE skills SET description = 'Production container orchestration system for automated scaling and management' WHERE id = 20;
UPDATE skills SET description = 'Continuous Integration and Continuous Delivery automation pipelines' WHERE id = 21;
UPDATE skills SET description = 'Amazon Web Services cloud computing, storage, and serverless infrastructure platform' WHERE id = 22;
UPDATE skills SET description = 'Microsoft Azure enterprise cloud computing and DevOps platform' WHERE id = 23;
UPDATE skills SET description = 'Distributed version control system for collaborative software development' WHERE id = 24;
UPDATE skills SET description = 'Event-driven, non-blocking JavaScript runtime built on Chrome V8 engine' WHERE id = 25;
UPDATE skills SET description = 'Enterprise TypeScript platform for building scalable Single Page Applications (SPAs)' WHERE id = 26;
UPDATE skills SET description = 'Batteries-included high-level Python web framework for rapid, secure development' WHERE id = 27;
UPDATE skills SET description = 'Flexible declarative query language and runtime for APIs' WHERE id = 28;
UPDATE skills SET description = 'High-throughput distributed event streaming and message queue platform' WHERE id = 29;
UPDATE skills SET description = 'Distributed full-text search and real-time analytics engine' WHERE id = 30;
UPDATE skills SET description = 'Reliable open-source AMQP message broker for asynchronous microservices' WHERE id = 31;
UPDATE skills SET description = 'Industry-standard open-source operating system for cloud and production servers' WHERE id = 32;
UPDATE skills SET description = 'Automated component-level verification to ensure code reliability and prevent regressions' WHERE id = 33;
UPDATE skills SET description = 'Cross-browser web automation framework for end-to-end QA testing' WHERE id = 34;
UPDATE skills SET description = 'Iterative software delivery methodology emphasizing collaboration and rapid feedback' WHERE id = 35;
UPDATE skills SET description = 'Analytical thinking, algorithmic design, and systematic debugging capabilities' WHERE id = 36;
UPDATE skills SET description = 'Cross-functional collaboration, code review culture, and team synergy' WHERE id = 37;
UPDATE skills SET description = 'Clear technical presentation, stakeholder alignment, and documentation skills' WHERE id = 38;
UPDATE skills SET description = 'Professional English proficiency for technical documentation and global collaboration' WHERE id = 39;
UPDATE skills SET description = 'Layered domain-centric software architecture separating business rules from infrastructure' WHERE id = 40;
UPDATE skills SET description = 'Declarative Infrastructure as Code (IaC) tool for multi-cloud provisioning' WHERE id = 41;
UPDATE skills SET description = 'Deep learning framework for training and deploying neural networks and Transformers' WHERE id = 42;
UPDATE skills SET description = 'Large Language Models and Retrieval-Augmented Generation architectures' WHERE id = 43;
UPDATE skills SET description = 'High-throughput, memory-efficient inference and serving engine for LLMs' WHERE id = 44;
UPDATE skills SET description = 'Framework for orchestrating LLM applications, chains, and agentic workflows' WHERE id = 45;
UPDATE skills SET description = 'Enterprise B2B sales, solution consulting, and strategic partner development' WHERE id = 46;
UPDATE skills SET description = 'Multi-channel digital marketing, performance ads (Google/Meta), and growth optimization' WHERE id = 47;
UPDATE skills SET name = 'Financial Accounting', slug = 'financial-accounting', description = 'Corporate financial accounting, VAS/IFRS reporting, and tax compliance' WHERE id = 48;
UPDATE skills SET name = 'Talent Acquisition', slug = 'talent-acquisition', description = 'End-to-end technical sourcing, candidate screening, and competency interviewing' WHERE id = 49;
UPDATE skills SET description = 'User research, wireframing, and interactive UI/UX product design for Web & Mobile' WHERE id = 50;
UPDATE skills SET description = 'Collaborative interface design, prototyping, and Design System management tool' WHERE id = 51;
UPDATE skills SET description = 'Brand storytelling, copywriting, video scripting, and community growth' WHERE id = 52;
UPDATE skills SET description = 'Search Engine Optimization (SEO) and Search Engine Marketing (SEM) analytics' WHERE id = 53;
UPDATE skills SET name = 'Financial Analysis', slug = 'financial-analysis', description = 'Financial modeling, portfolio risk analytics, and quantitative forecasting' WHERE id = 54;
UPDATE skills SET name = 'Customer Success', slug = 'customer-success', description = 'VIP client relationship management, SLA resolution, and customer experience optimization' WHERE id = 55;
UPDATE skills SET name = 'Category Management', slug = 'category-management', description = 'E-commerce category P&L ownership, vendor negotiation, and assortment optimization' WHERE id = 56;
UPDATE skills SET description = 'End-to-end supply chain planning, warehouse fulfillment, and logistics operations' WHERE id = 57;
UPDATE skills SET description = 'Strategic HR partnering, organizational design, and talent retention for tech teams' WHERE id = 58;
UPDATE skills SET name = 'Commercial Negotiation', slug = 'commercial-negotiation', description = 'Strategic contract negotiation, stakeholder persuasion, and deal closing' WHERE id = 59;
UPDATE skills SET name = 'Risk Management', slug = 'risk-management', description = 'Credit risk scoring, fraud analytics, and financial compliance governance' WHERE id = 60;
UPDATE skills SET description = 'Structured Query Language for relational database design, querying, and optimization' WHERE id = 61;
UPDATE skills SET description = 'Architectural style for designing networked, stateless HTTP web services' WHERE id = 62;
UPDATE skills SET description = 'Distributed systems architecture decomposing applications into independently deployable services' WHERE id = 63;
UPDATE skills SET description = 'Utility-first CSS framework for rapid, responsive modern UI engineering' WHERE id = 64;
UPDATE skills SET description = 'Statistical learning algorithms, predictive modeling, and feature engineering' WHERE id = 65;

-- ============================================================================
-- 5. CANDIDATE PROFILES & RECRUITER PROFILES
-- ============================================================================
UPDATE candidate_profiles SET city = 'Ha Noi' WHERE city LIKE '%Hà Nội%' OR city LIKE '%Ha Noi%';
UPDATE candidate_profiles SET city = 'Ho Chi Minh City' WHERE city LIKE '%Hồ Chí Minh%' OR city LIKE '%Ho Chi Minh%';
UPDATE candidate_profiles SET city = 'Da Nang' WHERE city LIKE '%Đà Nẵng%' OR city LIKE '%Da Nang%';

UPDATE candidate_profiles SET bio = 'Final-year Software Engineering student passionate about C#/.NET backend development, Docker containerization, and Microservices architecture.' WHERE id = 1;
UPDATE candidate_profiles SET bio = '2 years of experience building responsive Single Page Applications (SPAs) using React, TypeScript, Redux Toolkit, and Tailwind CSS.' WHERE id = 2;
UPDATE candidate_profiles SET bio = 'Computer Science graduate from Hanoi University of Science and Technology (HUST) with hands-on project experience in Java Spring Boot, PostgreSQL, and Redis.' WHERE id = 3;
UPDATE candidate_profiles SET bio = 'Full-stack developer capable of building end-to-end web applications with ASP.NET Core Web API and ReactJS. Proactive and detail-oriented.' WHERE id = 4;
UPDATE candidate_profiles SET bio = 'Frontend engineer passionate about crafting smooth user interfaces, Core Web Vitals optimization, and SEO-friendly web apps with Vue.js and Nuxt.' WHERE id = 5;
UPDATE candidate_profiles SET bio = 'Backend engineering intern enthusiastic about high-concurrency systems, Go routines, gRPC microservices, and distributed caching.' WHERE id = 6;
UPDATE candidate_profiles SET bio = '1.5 years of full-stack JavaScript experience building scalable RESTful APIs and SSR web apps with Node.js, Next.js, and Docker.' WHERE id = 7;
UPDATE candidate_profiles SET bio = 'AI & Machine Learning graduate with hands-on research and engineering experience in Python, PyTorch, HuggingFace Transformers, and LLM/RAG pipelines.' WHERE id = 8;
UPDATE candidate_profiles SET bio = 'AWS Certified Solutions Architect Associate skilled in Docker, Kubernetes, Terraform, and automated CI/CD GitHub Actions pipelines.' WHERE id = 9;
UPDATE candidate_profiles SET bio = 'Detail-oriented Software QA Engineer experienced in test case design, functional regression testing, and automated API testing with Postman.' WHERE id = 10;
UPDATE candidate_profiles SET bio = 'Cross-platform mobile developer building smooth iOS & Android applications with Flutter, Dart, BLoC state management, and Firebase.' WHERE id = 11;
UPDATE candidate_profiles SET bio = 'Cloud-native backend engineer focused on Microsoft Azure, serverless functions, and enterprise .NET Core microservices.' WHERE id = 12;
UPDATE candidate_profiles SET bio = 'QA Automation Engineer proficient in Selenium WebDriver (Java), Playwright/Cypress, and JMeter performance testing.' WHERE id = 13;
UPDATE candidate_profiles SET bio = 'Data Analyst & Python Developer skilled in PowerBI executive dashboards, Pandas data wrangling, and advanced SQL analytics.' WHERE id = 14;
UPDATE candidate_profiles SET bio = '3 years of experience architecting and scaling enterprise microservices using Java Spring Boot, Apache Kafka, Redis, and MySQL.' WHERE id = 15;
UPDATE candidate_profiles SET bio = '2 years of production Golang backend experience, specializing in Redis caching and high-throughput database optimization.' WHERE id = 16;
UPDATE candidate_profiles SET bio = 'Product-minded UI/UX Designer creating user-centric wireframes, interactive Figma prototypes, and scalable Design Systems.' WHERE id = 17;
UPDATE candidate_profiles SET bio = 'Frontend Developer specializing in high-performance Next.js and Tailwind CSS web applications with strict accessibility standards.' WHERE id = 18;
UPDATE candidate_profiles SET bio = 'Junior Java Developer with strong foundations in Object-Oriented Programming, Data Structures & Algorithms, SQL, and Hibernate/JPA.' WHERE id = 19;
UPDATE candidate_profiles SET bio = 'Backend Developer experienced in designing secure RESTful APIs, JWT authentication, and data modeling with Node.js, Express, MongoDB, and PostgreSQL.' WHERE id = 20;
UPDATE candidate_profiles SET bio = '1 year of commercial experience building enterprise web APIs with C#, ASP.NET Core, Entity Framework Core, and SQL Server.' WHERE id = 21;
UPDATE candidate_profiles SET bio = '3rd-year Information Technology student with solid knowledge of HTML5, CSS3, modern JavaScript (ES6+), and ReactJS.' WHERE id = 22;
UPDATE candidate_profiles SET bio = 'Motivated Fresher Backend Developer eager to master Clean Architecture, automated testing, and cloud-native backend engineering.' WHERE id = 23;
UPDATE candidate_profiles SET bio = 'Honors Software Engineering graduate and Runner-Up of the University Capstone Project Award in Full-Stack Web Development.' WHERE id = 24;

UPDATE candidate_profiles SET headline = 'Software Engineer (Connected via Google)' WHERE headline LIKE '%Google%';
UPDATE candidate_profiles SET headline = 'Software Engineer (Connected via LinkedIn)' WHERE headline LIKE '%LinkedIn%';

UPDATE recruiter_profiles SET job_title = 'Talent Acquisition Specialist' WHERE job_title = 'Chuyên viên tuyển dụng';

-- ============================================================================
-- 6. CVS, CV PARSED DATA, APPLICATIONS, MATCHES, INTERVIEWS, MESSAGES, NOTES
-- ============================================================================
UPDATE cvs SET title = REPLACE(title, 'CV_Chinh_', 'Primary_Resume_') WHERE title LIKE 'CV_Chinh_%';
UPDATE cvs SET title = REPLACE(title, 'CV_ChuyenSau_', 'Specialized_Resume_') WHERE title LIKE 'CV_ChuyenSau_%';

UPDATE cv_parsed_data SET
    extracted_summary = 'Software Engineering candidate with strong algorithmic problem-solving skills and hands-on full-stack / backend project experience.',
    improvement_feedback = 'Well-structured resume. Consider adding quantifiable impact metrics (e.g., latency reduction %, throughput RPS) to project bullet points following the STAR method.';

UPDATE job_applications SET
    cover_letter = 'Dear Hiring Team, I am excited to submit my application for this role. With my hands-on experience in software engineering and strong alignment with your technical stack, I am confident I can contribute immediately to your engineering team.'
WHERE cover_letter LIKE 'Kính gửi%';

UPDATE job_applications SET rejection_reason = 'Strong Fresher .NET profile; passed initial screening.' WHERE id = 1;
UPDATE job_applications SET rejection_reason = 'Solid full-stack foundation in both .NET and React.' WHERE id = 2;
UPDATE job_applications SET rejection_reason = 'Newly submitted application; awaiting HR screening.' WHERE id = 3;
UPDATE job_applications SET rejection_reason = 'Missing core SQL optimization experience and production project exposure.' WHERE id = 4;
UPDATE job_applications SET rejection_reason = 'Does not yet meet the 5+ years senior experience requirement for this role.' WHERE id = 5;
UPDATE job_applications SET rejection_reason = 'Outstanding technical interview performance; formal offer extended.' WHERE id = 6;
UPDATE job_applications SET rejection_reason = 'Solid frontend skills; scheduled for technical round.' WHERE id = 7;
UPDATE job_applications SET rejection_reason = 'Strong Next.js and TypeScript profile; shortlisted for screening.' WHERE id = 8;
UPDATE job_applications SET rejection_reason = 'Accepted Golang Engineer offer and completed onboarding.' WHERE id = 9;
UPDATE job_applications SET rejection_reason = '2 years of production Go experience and strong systems design thinking.' WHERE id = 10;
UPDATE job_applications SET rejection_reason = 'Excellent Java Spring Boot expertise; offer extended.' WHERE id = 11;
UPDATE job_applications SET rejection_reason = 'Scheduled for Round 2 Technical Architecture Interview.' WHERE id = 12;
UPDATE job_applications SET rejection_reason = 'Application received; under initial review.' WHERE id = 13;
UPDATE job_applications SET rejection_reason = 'AWS Certified with strong hands-on Kubernetes production experience; hired.' WHERE id = 14;
UPDATE job_applications SET rejection_reason = 'Insufficient hands-on production cloud infrastructure experience.' WHERE id = 15;
UPDATE job_applications SET rejection_reason = 'Strong Python and advanced SQL skills for Data Engineering.' WHERE id = 16;
UPDATE job_applications SET rejection_reason = 'Technical interview scheduled via Google Meet.' WHERE id = 17;
UPDATE job_applications SET rejection_reason = 'Solid Full-Stack Node.js & React portfolio.' WHERE id = 18;
UPDATE job_applications SET rejection_reason = 'Completed Flutter technical take-home assignment with high score.' WHERE id = 19;
UPDATE job_applications SET rejection_reason = 'Shortlisted for Junior .NET & Cloud Engineer interview at NAB.' WHERE id = 20;
UPDATE job_applications SET rejection_reason = 'Passed resume screening; coordinating interview slot.' WHERE id = 21;
UPDATE job_applications SET rejection_reason = 'Strong QA Automation framework skills and fluent English; hired.' WHERE id = 22;
UPDATE job_applications SET rejection_reason = 'Finalizing compensation package and offer terms.' WHERE id = 23;
UPDATE job_applications SET rejection_reason = 'Good backend fundamentals; in screening stage.' WHERE id = 24;
UPDATE job_applications SET rejection_reason = 'Technical interview scheduled for next week.' WHERE id = 25;
UPDATE job_applications SET rejection_reason = '3rd-year undergraduate applying for Software Engineer Internship.' WHERE id = 26;
UPDATE job_applications SET rejection_reason = 'Reviewing university capstone project repository.' WHERE id = 27;
UPDATE job_applications SET rejection_reason = 'Does not yet meet the 3+ years Senior .NET requirement.' WHERE id = 28;
UPDATE job_applications SET rejection_reason = 'High-potential Fresher Java candidate; offer extended for NashTech Academy.' WHERE id = 29;
UPDATE job_applications SET rejection_reason = 'Preparing for technical interview round.' WHERE id = 30;

UPDATE candidate_job_matches SET
    ai_explanation = CONCAT('Candidate profile shows strong alignment with job requirements (Overall Match: ', overall_score, '%). Core technical skills and domain competencies are well-matched.');

UPDATE interviews SET
    meeting_link_or_room = 'Interview Room 502, 5th Floor, FPT Tower Cau Giay'
WHERE meeting_link_or_room LIKE '%Phòng phỏng vấn%';

UPDATE interviews SET
    notes_to_candidate = 'Please prepare your laptop for live coding/system discussion and join the meeting link 5 minutes early.'
WHERE notes_to_candidate IS NOT NULL;

UPDATE interview_evaluations SET
    feedback_notes = 'Candidate demonstrated solid computer science fundamentals and communicated technical trade-offs clearly during scenario-based questions.';

UPDATE notifications SET
    title = 'Application Status Updated',
    content = 'Your job application at FPT Software has progressed to the Interview stage.'
WHERE type = 'APPLICATION_UPDATE';

UPDATE career_roadmaps SET
    summary = 'Personalized 8-to-12-week AI-curated learning roadmap to bridge skill gaps and accelerate readiness for your target engineering role.';

UPDATE roadmap_milestones SET
    title = 'Phase 1: Containerization & Cloud Deployment Fundamentals (Docker)',
    description = 'Master Dockerfile multi-stage builds, Docker Compose networking, and containerized microservice deployment.'
WHERE stage_order = 1;

UPDATE roadmap_milestones SET
    title = 'Phase 2: Distributed Microservices & Event-Driven Messaging',
    description = 'Build resilient Event-Driven Architectures with RabbitMQ/Kafka and optimize relational database indexing.'
WHERE stage_order = 2;

UPDATE roadmap_tasks SET
    title = CONCAT('Task ', id, ': Study official documentation & build a hands-on capstone microservice'),
    description = 'Complete the practical engineering lab and push the verified source code to your public GitHub repository.';

UPDATE roles SET description = 'Job seekers and candidates using AI career matching and tools' WHERE name = 'ROLE_CANDIDATE';
UPDATE roles SET description = 'Enterprise talent acquisition specialists and recruiters' WHERE name = 'ROLE_RECRUITER';
UPDATE roles SET description = 'Technical leads and hiring managers conducting interviews' WHERE name = 'ROLE_HIRING_MANAGER';
UPDATE roles SET description = 'System administrators governing platform operations and AI models' WHERE name = 'ROLE_ADMIN';

UPDATE application_messages SET content = 'Hello Nguyen Van An, the FPT Software Hiring Committee was impressed by your 88% AI Match Score for the Fresher .NET Backend Developer role. We have scheduled Round 1 Technical Interview via Google Meet.' WHERE id = 5;
UPDATE application_messages SET content = 'Hello FPT Software HR Team! Thank you for the interview invitation—I am very excited about this opportunity. Could you share which technical areas Round 1 will focus on most?' WHERE id = 6;
UPDATE application_messages SET content = 'The 45-minute technical interview will focus on C#, ASP.NET Core Web API, Entity Framework Core, and SQL database design. Best of luck with your preparation!' WHERE id = 7;
UPDATE application_messages SET content = 'Hello Minh Duc, FPT Software HR is reviewing your application in the Screening stage. Could you share the GitHub link to your recent .NET projects here?' WHERE id = 8;
UPDATE application_messages SET content = 'Hello HR Team, here is the GitHub repository for my .NET 8 Clean Architecture Microservices project: https://github.com/phamminhduc-dev/dotnet-clean-arch. Looking forward to your feedback!' WHERE id = 9;
UPDATE application_messages SET content = 'I have completed my preparation and am ready for tomorrow''s C# / ASP.NET Core technical interview!' WHERE id IN (10, 12);
UPDATE application_messages SET content = 'Wonderful! Looking forward to meeting you in the interview session—the Google Meet link is attached in your schedule.' WHERE id IN (11, 13);
UPDATE application_messages SET content = 'Hello! We have scheduled your online technical interview. Please check your email and calendar invitation (.ics) to confirm your attendance.' WHERE content LIKE 'Xin chào bạn, chúng tôi đã xếp lịch%';
UPDATE application_messages SET content = 'Thank you! I have received the invitation and calendar file, and I will join the session on time.' WHERE content LIKE 'Dạ em đã nhận được thư mời%';

UPDATE application_notes SET content = 'Graduation capstone project follows Clean Architecture principles with solid understanding of Dependency Injection.' WHERE content LIKE 'Đồ án tốt nghiệp%';
UPDATE application_notes SET content = 'Should probe deeper into Docker multi-stage builds and SQL composite indexing during the technical interview.' WHERE content LIKE 'Cần kiểm tra kỹ%';
UPDATE application_notes SET content = 'Candidate''s expected salary is around 15M VND, flexible and open to negotiation based on total compensation.' WHERE content LIKE 'Kỳ vọng mức lương%';
UPDATE application_notes SET content = 'Hiring Manager highly rated the candidate''s algorithmic problem-solving and data structures proficiency.' WHERE content LIKE 'Hiring Manager đánh giá cao%';
UPDATE application_notes SET content = 'Minor gap: limited exposure to multi-developer Git branching workflows in production teams.' WHERE content LIKE 'Điểm trừ là chưa có%';
UPDATE application_notes SET content = 'Confident communicator with a proactive attitude that fits well with our engineering culture.' WHERE content LIKE 'Giao tiếp tự tin%';
UPDATE application_notes SET content = 'Completed the online technical coding assessment with a strong score of 85/100.' WHERE content LIKE 'Đã hoàn thành bài test%';
UPDATE application_notes SET content = 'Candidate demonstrates a strong growth mindset and fluent professional English communication.' WHERE content LIKE 'Ứng viên có thái độ%';
UPDATE application_notes SET content = 'Initial screening note: Candidate demonstrates solid foundational engineering knowledge.' WHERE content LIKE 'Đánh giá sơ bộ:%';

UPDATE ai_chat_sessions SET title = 'AI Career Advisory & Resume Optimization Session';
UPDATE ai_chat_messages SET content = 'Based on my current resume, which Fresher Software Engineer roles am I best suited for, and what skills should I add?' WHERE sender_type = 'USER';
UPDATE ai_chat_messages SET content = 'Hello! Based on your profile, you are a strong match for the Fresher .NET Backend Developer role. Your C# and OOP foundations are solid—adding hands-on Docker and unit testing projects will make your resume stand out to top employers.' WHERE sender_type = 'ASSISTANT';
