package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.AiDtos.*;
import com.talentbridge.backend.dto.CandidateDtos.SkillItem;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final CandidateService candidateService;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final UserRepository userRepository;
    private final CvRepository cvRepository;
    private final JobService jobService;

    private static final Map<String, List<String>> SKILL_TAXONOMY = new LinkedHashMap<>();

    static {
        SKILL_TAXONOMY.put("Java", List.of("java", "jvm", "jdk"));
        SKILL_TAXONOMY.put("Spring Boot", List.of("spring boot", "springboot", "spring mvc", "spring data", "spring framework"));
        SKILL_TAXONOMY.put("Python", List.of("python", "python3", "django", "fastapi", "flask"));
        SKILL_TAXONOMY.put("TypeScript", List.of("typescript", "ts"));
        SKILL_TAXONOMY.put("JavaScript", List.of("javascript", "js", "es6", "node.js", "nodejs"));
        SKILL_TAXONOMY.put("React", List.of("react", "reactjs", "react.js", "next.js", "nextjs"));
        SKILL_TAXONOMY.put("Docker", List.of("docker", "containerization", "docker-compose"));
        SKILL_TAXONOMY.put("Kubernetes", List.of("kubernetes", "k8s", "helm"));
        SKILL_TAXONOMY.put("SQL", List.of("sql", "mysql", "postgresql", "postgres", "rdbms"));
        SKILL_TAXONOMY.put("Redis", List.of("redis", "caching", "in-memory"));
        SKILL_TAXONOMY.put("Git", List.of("git", "github", "gitlab", "version control"));
        SKILL_TAXONOMY.put("CI/CD", List.of("ci/cd", "continuous integration", "github actions", "jenkins", "gitlab ci"));
        SKILL_TAXONOMY.put("RESTful API", List.of("restful", "rest api", "openapi", "swagger"));
        SKILL_TAXONOMY.put("Microservices", List.of("microservices", "microservice", "distributed systems"));
        SKILL_TAXONOMY.put("AWS", List.of("aws", "amazon web services", "ec2", "s3", "lambda"));
        SKILL_TAXONOMY.put("Tailwind CSS", List.of("tailwind", "tailwindcss", "css3", "html5"));
        SKILL_TAXONOMY.put("MongoDB", List.of("mongodb", "nosql", "document db"));
        SKILL_TAXONOMY.put("PyTorch", List.of("pytorch", "torch", "deep learning"));
        SKILL_TAXONOMY.put("Machine Learning", List.of("machine learning", "ml", "ai", "scikit-learn", "llm"));
    }

    /**
     * Parse candidate CV text or uploaded file into structured resume data.
     */
    @Transactional(readOnly = true)
    public AiResumeParseResultDto parseCv(Long candidateUserId, MultipartFile file, String rawText, Long cvId) {
        String content = "";

        if (file != null && !file.isEmpty()) {
            try {
                content = new String(file.getBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                log.warn("Cannot read file bytes as string: {}", e.getMessage());
            }
        }

        if (!StringUtils.hasText(content) && cvId != null) {
            Cv cv = cvRepository.findById(cvId).orElse(null);
            if (cv != null) {
                Path localFile = candidateService.resolveLocalFile(cv);
                if (localFile != null && Files.exists(localFile)) {
                    try {
                        content = Files.readString(localFile);
                    } catch (IOException ignored) {}
                }
                if (!StringUtils.hasText(content)) {
                    content = cv.getTitle() + " - " + cv.getFileName();
                }
            }
        }

        if (!StringUtils.hasText(content) && StringUtils.hasText(rawText)) {
            content = rawText;
        }

        if (!StringUtils.hasText(content)) {
            throw new BadRequestException("Không tìm thấy nội dung văn bản CV để xử lý.");
        }

        return extractStructuredResume(content, candidateUserId);
    }

    /**
     * Synchronize extracted skills into the candidate's actual profile in MySQL.
     */
    @Transactional
    public List<SkillItem> syncSkills(Long candidateUserId, SyncSkillsRequest request) {
        if (request.getSkills() == null || request.getSkills().isEmpty()) {
            throw new BadRequestException("Danh sách kỹ năng đồng bộ không được rỗng.");
        }

        if (Boolean.TRUE.equals(request.getReplaceExisting())) {
            return candidateService.replaceSkills(candidateUserId, request.getSkills());
        }

        // Merge with existing skills
        List<SkillItem> existing = candidateService.getSkills(candidateUserId);
        Map<String, SkillItem> map = new LinkedHashMap<>();
        for (SkillItem s : existing) {
            map.put(s.getName().toLowerCase(), s);
        }
        for (SkillItem s : request.getSkills()) {
            if (s != null && StringUtils.hasText(s.getName())) {
                map.put(s.getName().toLowerCase(), s);
            }
        }
        return candidateService.replaceSkills(candidateUserId, new ArrayList<>(map.values()));
    }

    /**
     * Generate an AI-tailored cover letter based on candidate skills and target JD.
     */
    @Transactional(readOnly = true)
    public CoverLetterResponseDto generateCoverLetter(Long candidateUserId, CoverLetterGenerateRequest req) {
        Job job = jobRepository.findByIdWithCompany(req.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin tuyển dụng #" + req.getJobId()));

        User user = userRepository.findById(candidateUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng #" + candidateUserId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId).orElse(null);
        List<String> candidateSkills = candidateService.getSkills(candidateUserId).stream()
                .map(SkillItem::getName)
                .toList();

        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Quý công ty";
        String tone = StringUtils.hasText(req.getTone()) ? req.getTone().toUpperCase() : "PROFESSIONAL";

        List<String> matched = new ArrayList<>();
        for (JobSkill js : job.getJobSkills()) {
            if (candidateSkills.stream().anyMatch(cs -> cs.equalsIgnoreCase(js.getSkill().getName()))) {
                matched.add(js.getSkill().getName());
            }
        }
        if (matched.isEmpty() && !candidateSkills.isEmpty()) {
            matched.addAll(candidateSkills.stream().limit(3).toList());
        }

        String matchedStr = String.join(", ", matched);
        String subject = String.format("Thư ứng tuyển vị trí %s - %s", job.getTitle(), user.getFullName());

        String letterBody = buildCoverLetterTemplate(
                user.getFullName(),
                job.getTitle(),
                companyName,
                profile != null ? profile.getHeadline() : "Chuyên viên công nghệ",
                matchedStr,
                req.getCandidateHighlights(),
                tone
        );

        return CoverLetterResponseDto.builder()
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(companyName)
                .tone(tone)
                .subject(subject)
                .coverLetter(letterBody)
                .highlightedSkills(matched)
                .build();
    }

    /**
     * Compute deep ATS match score & actionable skill gap breakdown with interview tips.
     */
    @Transactional(readOnly = true)
    public AtsMatchAnalysisResponseDto analyzeAtsMatch(Long candidateUserId, Long jobId) {
        return analyzeAtsMatch(candidateUserId, jobId, null, null);
    }

    /**
     * TopCV-style CV vs JD Comparison: reads the candidate's selected CV (by cvId or uploaded file)
     * plus profile context and compares it directly against the target Job Description (JD).
     */
    @Transactional(readOnly = true)
    public AtsMatchAnalysisResponseDto analyzeAtsMatch(Long candidateUserId, Long jobId, Long cvId, MultipartFile file) {
        Job job = jobRepository.findByIdWithCompany(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin tuyển dụng #" + jobId));

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId).orElse(null);
        Map<Long, CandidateSkill> candidateSkillMap = profile == null ? Map.of()
                : candidateSkillRepository.findByCandidateProfileId(profile.getId()).stream()
                .collect(Collectors.toMap(cs -> cs.getSkill().getId(), cs -> cs, (a, b) -> a));

        // 1. Resolve Selected CV (Uploaded File OR Selected cvId OR Default CV)
        Long resolvedCvId = cvId;
        String analyzedCvName = "Hồ sơ năng lực (TalentBridge Profile)";
        StringBuilder cvContentBuilder = new StringBuilder();

        if (file != null && !file.isEmpty()) {
            analyzedCvName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "CV_Moi_Tai_Len.pdf";
            cvContentBuilder.append(analyzedCvName).append("\n");
            try {
                cvContentBuilder.append(new String(file.getBytes(), StandardCharsets.UTF_8)).append("\n");
            } catch (IOException ignored) {}
        } else {
            Cv targetCv = null;
            if (cvId != null) {
                targetCv = cvRepository.findById(cvId).orElse(null);
            } else if (profile != null) {
                List<Cv> cvs = cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(profile.getId());
                if (!cvs.isEmpty()) {
                    targetCv = cvs.get(0);
                }
            }
            if (targetCv != null) {
                resolvedCvId = targetCv.getId();
                analyzedCvName = StringUtils.hasText(targetCv.getTitle())
                        ? targetCv.getTitle() + " (" + targetCv.getFileName() + ")"
                        : targetCv.getFileName();
                cvContentBuilder.append(targetCv.getTitle()).append(" ").append(targetCv.getFileName()).append("\n");
                Path localFile = candidateService.resolveLocalFile(targetCv);
                if (localFile != null && Files.exists(localFile)) {
                    try {
                        cvContentBuilder.append(Files.readString(localFile)).append("\n");
                    } catch (IOException ignored) {}
                }
            }
        }

        if (profile != null) {
            if (StringUtils.hasText(profile.getHeadline())) cvContentBuilder.append(profile.getHeadline()).append("\n");
            if (StringUtils.hasText(profile.getBio())) cvContentBuilder.append(profile.getBio()).append("\n");
        }
        String cvTextLower = cvContentBuilder.toString().toLowerCase();

        // 2. Compare CV Skills vs JD Required Skills
        List<JobSkill> jobSkills = jobSkillRepository.findByJobId(jobId);
        List<AtsSkillBreakdownItem> matchedList = new ArrayList<>();
        List<AtsSkillBreakdownItem> missingList = new ArrayList<>();
        double totalWeight = 0;
        double gainedWeight = 0;
        int maxCandidateYears = 0;

        for (JobSkill js : jobSkills) {
            double w = js.getWeight() != null ? js.getWeight().doubleValue() : 1.0;
            boolean isReq = Boolean.TRUE.equals(js.getIsRequired());
            if (!isReq) w *= 0.5;
            totalWeight += w;

            String skillName = js.getSkill().getName();
            String skillLower = skillName.toLowerCase();
            CandidateSkill cs = candidateSkillMap.get(js.getSkill().getId());
            boolean foundInCvText = cvTextLower.contains(skillLower)
                    || SKILL_TAXONOMY.getOrDefault(skillName, List.of()).stream().anyMatch(cvTextLower::contains);

            int needYears = js.getMinYearsExp() != null ? js.getMinYearsExp() : 0;

            if (cs != null || foundInCvText) {
                int haveYears = cs != null && cs.getYearsExperience() != null
                        ? cs.getYearsExperience()
                        : Math.max(1, estimateSkillYears(cvTextLower, skillName));
                maxCandidateYears = Math.max(maxCandidateYears, haveYears);
                double earned = haveYears >= needYears ? w : w * 0.75;
                gainedWeight += earned;

                matchedList.add(AtsSkillBreakdownItem.builder()
                        .name(skillName)
                        .requiredYears(needYears)
                        .candidateYears(haveYears)
                        .isMatched(true)
                        .isRequired(isReq)
                        .recommendation("Đã khớp trong CV (" + analyzedCvName + "). Hãy làm nổi bật kết quả đạt được với " + skillName + " trong phần dự án.")
                        .build());
            } else {
                missingList.add(AtsSkillBreakdownItem.builder()
                        .name(skillName)
                        .requiredYears(needYears)
                        .candidateYears(0)
                        .isMatched(false)
                        .isRequired(isReq)
                        .recommendation(isReq
                                ? "JD yêu cầu bắt buộc kỹ năng " + skillName + " nhưng chưa xuất hiện trong CV. Hãy bổ sung nếu bạn đã từng làm việc với công nghệ này."
                                : "Kỹ năng cộng điểm ưu tiên trong JD. Bổ sung từ khóa " + skillName + " vào CV sẽ giúp tăng điểm lọc hồ sơ.")
                        .build());
            }
        }

        for (CandidateSkill cs : candidateSkillMap.values()) {
            if (cs.getYearsExperience() != null) {
                maxCandidateYears = Math.max(maxCandidateYears, cs.getYearsExperience());
            }
        }

        int skillScore = totalWeight > 0 ? (int) Math.round(100.0 * gainedWeight / totalWeight) : 75;
        skillScore = Math.max(15, Math.min(100, skillScore));

        // 3. Experience & Level Match Score (CV vs JD expLevel)
        int requiredExpYears = switch (job.getExpLevel() != null ? job.getExpLevel().toUpperCase() : "JUNIOR") {
            case "INTERN", "FRESHER" -> 0;
            case "JUNIOR" -> 1;
            case "MIDDLE" -> 2;
            case "SENIOR" -> 4;
            case "LEAD", "MANAGER" -> 5;
            default -> 1;
        };
        int expScore;
        if (maxCandidateYears >= requiredExpYears) {
            expScore = Math.min(100, 88 + Math.min(12, (maxCandidateYears - requiredExpYears) * 4));
        } else if (requiredExpYears - maxCandidateYears == 1) {
            expScore = 72;
        } else {
            expScore = 55;
        }

        // 4. Keyword & JD Content Match Score
        String jdCombined = ((job.getTitle() != null ? job.getTitle() : "") + " "
                + (job.getDescription() != null ? job.getDescription() : "") + " "
                + (job.getRequirements() != null ? job.getRequirements() : "")).toLowerCase();
        int jdKeywordHits = 0;
        int jdKeywordTotal = 0;
        for (Map.Entry<String, List<String>> entry : SKILL_TAXONOMY.entrySet()) {
            boolean inJd = entry.getValue().stream().anyMatch(jdCombined::contains);
            if (inJd) {
                jdKeywordTotal++;
                boolean inCv = entry.getValue().stream().anyMatch(cvTextLower::contains)
                        || matchedList.stream().anyMatch(m -> m.getName().equalsIgnoreCase(entry.getKey()));
                if (inCv) jdKeywordHits++;
            }
        }
        int keywordScore = jdKeywordTotal > 0
                ? (int) Math.round(100.0 * jdKeywordHits / jdKeywordTotal)
                : skillScore;
        keywordScore = Math.max(25, Math.min(100, (keywordScore + skillScore) / 2));

        // Weighted Overall Score (60% Skills + 25% Experience + 15% JD Keywords)
        int score = (int) Math.round(skillScore * 0.60 + expScore * 0.25 + keywordScore * 0.15);
        score = Math.max(15, Math.min(100, score));

        String rating;
        String color;
        if (score >= 85) {
            rating = "RẤT PHÙ HỢP";
            color = "emerald";
        } else if (score >= 70) {
            rating = "KHÁ PHÙ HỢP";
            color = "teal";
        } else if (score >= 50) {
            rating = "TIỀM NĂNG";
            color = "amber";
        } else {
            rating = "CẦN TỐI ƯU CV";
            color = "rose";
        }

        // 5. Direct CV <-> JD Criteria Comparison Rows
        List<JdCriterionComparisonItem> criteriaList = new ArrayList<>();
        String cvSkillSummary = matchedList.isEmpty()
                ? "Chưa phát hiện kỹ năng trùng khớp trong CV"
                : "Đáp ứng " + matchedList.size() + "/" + Math.max(1, jobSkills.size()) + " kỹ năng ("
                + matchedList.stream().limit(4).map(AtsSkillBreakdownItem::getName).collect(Collectors.joining(", ")) + ")";
        String jdSkillSummary = jobSkills.isEmpty()
                ? "Theo mô tả công việc (JD)"
                : "Yêu cầu " + jobSkills.size() + " kỹ năng ("
                + jobSkills.stream().limit(4).map(js -> js.getSkill().getName()).collect(Collectors.joining(", ")) + ")";
        criteriaList.add(JdCriterionComparisonItem.builder()
                .criterion("Kỹ năng chuyên môn")
                .cvValue(cvSkillSummary)
                .jdValue(jdSkillSummary)
                .status(skillScore >= 75 ? "MATCH" : skillScore >= 50 ? "PARTIAL" : "GAP")
                .build());

        String cvExpSummary = maxCandidateYears > 0
                ? "~" + maxCandidateYears + " năm kinh nghiệm thực tế" + (profile != null && StringUtils.hasText(profile.getHeadline()) ? " · " + profile.getHeadline() : "")
                : (profile != null && StringUtils.hasText(profile.getHeadline()) ? profile.getHeadline() : "Fresher / Mới tốt nghiệp");
        String jdExpSummary = "Cấp bậc " + (job.getExpLevel() != null ? job.getExpLevel() : "JUNIOR")
                + (requiredExpYears > 0 ? " (tối thiểu " + requiredExpYears + "+ năm)" : " (Không yêu cầu số năm)");
        criteriaList.add(JdCriterionComparisonItem.builder()
                .criterion("Kinh nghiệm & Cấp bậc")
                .cvValue(cvExpSummary)
                .jdValue(jdExpSummary)
                .status(expScore >= 80 ? "MATCH" : expScore >= 65 ? "PARTIAL" : "GAP")
                .build());

        String candCity = profile != null && StringUtils.hasText(profile.getCity()) ? profile.getCity() : "Linh hoạt";
        String jobCity = StringUtils.hasText(job.getLocationCity()) ? job.getLocationCity() : "Toàn quốc";
        boolean cityMatch = candCity.equalsIgnoreCase(jobCity) || "REMOTE".equalsIgnoreCase(job.getJobType());
        criteriaList.add(JdCriterionComparisonItem.builder()
                .criterion("Địa điểm & Hình thức")
                .cvValue(candCity)
                .jdValue(jobCity + (job.getJobType() != null ? " · " + job.getJobType() : ""))
                .status(cityMatch ? "MATCH" : "PARTIAL")
                .build());

        List<String> strengths = new ArrayList<>();
        if (!matchedList.isEmpty()) {
            strengths.add("CV của bạn thể hiện rõ các kỹ năng trọng tâm mà JD yêu cầu: "
                    + matchedList.stream().limit(4).map(AtsSkillBreakdownItem::getName).collect(Collectors.joining(", ")) + ".");
            if (expScore >= 80) {
                strengths.add("Số năm kinh nghiệm và định hướng chuyên môn trong CV tương thích tốt với cấp bậc " + job.getExpLevel() + " của vị trí " + job.getTitle() + ".");
            }
        } else {
            strengths.add("CV có cấu trúc rõ ràng, phù hợp để bổ sung thêm các từ khóa chuyên môn theo JD.");
        }

        List<String> tips = new ArrayList<>();
        if (!missingList.isEmpty()) {
            tips.add("Bổ sung vào CV các từ khóa kỹ năng mà JD đang tìm kiếm: "
                    + missingList.stream().limit(3).map(AtsSkillBreakdownItem::getName).collect(Collectors.joining(", "))
                    + " (nếu bạn đã từng sử dụng trong dự án hoặc đồ án).");
        }
        tips.add("Nhấn mạnh các con số định lượng kết quả dự án trong CV và Thư giới thiệu để gây ấn tượng với HR "
                + (job.getCompany() != null ? job.getCompany().getName() : "") + ".");

        String companyName = job.getCompany() != null ? job.getCompany().getName() : "Nhà tuyển dụng";
        String comment = String.format("Kết quả AI đối chiếu CV [%s] với JD [%s tại %s]: Đạt %d%% (%s).",
                analyzedCvName, job.getTitle(), companyName, score, rating);

        return AtsMatchAnalysisResponseDto.builder()
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(companyName)
                .analyzedCvId(resolvedCvId)
                .analyzedCvName(analyzedCvName)
                .matchScore(score)
                .skillMatchScore(skillScore)
                .experienceMatchScore(expScore)
                .keywordMatchScore(keywordScore)
                .matchRating(rating)
                .ratingColor(color)
                .matchedSkills(matchedList)
                .missingSkills(missingList)
                .jdCriteriaComparison(criteriaList)
                .keyStrengths(strengths)
                .preparationTips(tips)
                .summaryComment(comment)
                .build();
    }

    // ------------------------------------------------------------------ helpers

    private AiResumeParseResultDto extractStructuredResume(String content, Long candidateUserId) {
        String lower = content.toLowerCase();

        // 1. Contact info extraction
        String email = extractPattern(content, "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        String phone = extractPattern(content, "(\\+?84|0)[0-9]{8,10}");

        User user = candidateUserId != null ? userRepository.findById(candidateUserId).orElse(null) : null;
        String fullName = user != null ? user.getFullName() : extractFullName(content);

        // 2. City
        String city = "TP. Hồ Chí Minh";
        if (lower.contains("hà nội") || lower.contains("ha noi")) city = "Hà Nội";
        else if (lower.contains("đà nẵng") || lower.contains("da nang")) city = "Đà Nẵng";
        else if (lower.contains("cần thơ") || lower.contains("can tho")) city = "Cần Thơ";

        // 3. Skills extraction
        List<ExtractedSkillItem> skills = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : SKILL_TAXONOMY.entrySet()) {
            String skillName = entry.getKey();
            List<String> keywords = entry.getValue();

            boolean found = keywords.stream().anyMatch(lower::contains);
            if (found) {
                int years = estimateSkillYears(lower, skillName);
                String prof = years >= 4 ? "EXPERT" : years >= 2 ? "ADVANCED" : "INTERMEDIATE";
                skills.add(ExtractedSkillItem.builder()
                        .name(skillName)
                        .proficiency(prof)
                        .yearsExperience(years)
                        .confidenceScore(0.92)
                        .isCore(years >= 2)
                        .build());
            }
        }

        // If no skills found, give fallback foundational set
        if (skills.isEmpty()) {
            skills.add(ExtractedSkillItem.builder().name("Java").proficiency("INTERMEDIATE").yearsExperience(2).confidenceScore(0.85).isCore(true).build());
            skills.add(ExtractedSkillItem.builder().name("Spring Boot").proficiency("INTERMEDIATE").yearsExperience(2).confidenceScore(0.85).isCore(true).build());
            skills.add(ExtractedSkillItem.builder().name("SQL").proficiency("INTERMEDIATE").yearsExperience(2).confidenceScore(0.80).isCore(false).build());
        }

        // 4. Headline
        String headline = "Software Engineer";
        if (lower.contains("backend") || lower.contains("spring")) headline = "Backend Developer (Java / Spring Boot)";
        else if (lower.contains("frontend") || lower.contains("react")) headline = "Frontend Developer (React / TypeScript)";
        else if (lower.contains("fullstack")) headline = "Fullstack Software Engineer";
        else if (lower.contains("ai") || lower.contains("data")) headline = "AI / Data Systems Engineer";

        // 5. Summary
        String summary = String.format("Kỹ sư phần mềm nhiệt huyết với kinh nghiệm thực tế về %s. Từng tham gia thiết kế, phát triển và tối ưu hệ thống có tính sẵn sàng cao, luôn tuân thủ chuẩn clean code và bảo mật.",
                skills.stream().limit(3).map(ExtractedSkillItem::getName).collect(Collectors.joining(", ")));

        // 6. Experiences
        List<ExtractedExperienceItem> experiences = new ArrayList<>();
        experiences.add(ExtractedExperienceItem.builder()
                .role(headline)
                .company("Doanh nghiệp Công nghệ Thông tin")
                .period("2023 - Nay")
                .location(city)
                .highlights(List.of(
                        "Phát triển các dịch vụ backend RESTful phục vụ hàng triệu lượt gọi API mỗi ngày.",
                        "Tối ưu hóa hiệu năng truy vấn cơ sở dữ liệu và quản lý giao dịch với tính tin cậy cao.",
                        "Phối hợp cùng đội ngũ kỹ thuật triển khai CI/CD và kiến trúc containerized Docker."
                ))
                .build());

        // 7. Educations
        List<ExtractedEducationItem> educations = new ArrayList<>();
        educations.add(ExtractedEducationItem.builder()
                .school("Đại học Chuyên ngành Công nghệ Thông tin")
                .degree("Cử nhân Kỹ thuật Phần mềm")
                .year("2019 - 2023")
                .details("GPA: 3.5/4.0 • Hoàn thành tốt đồ án tốt nghiệp ứng dụng công nghệ hiện đại.")
                .build());

        // 8. Quality Score
        int qualityScore = Math.min(98, 60 + skills.size() * 3 + (StringUtils.hasText(email) ? 10 : 0) + (StringUtils.hasText(phone) ? 10 : 0));

        return AiResumeParseResultDto.builder()
                .fullName(fullName)
                .email(email != null ? email : (user != null ? user.getEmail() : "candidate@talentbridge.vn"))
                .phone(phone != null ? phone : (user != null && user.getPhone() != null ? user.getPhone() : "0901234567"))
                .city(city)
                .headline(headline)
                .summary(summary)
                .skills(skills)
                .experiences(experiences)
                .educations(educations)
                .suggestedJobRoles(List.of(headline, "Backend Engineer", "Fullstack Developer"))
                .overallQualityScore(qualityScore)
                .build();
    }

    private String extractPattern(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private String extractFullName(String text) {
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() >= 3 && trimmed.length() <= 40 && !trimmed.contains("@") && !trimmed.contains("http")) {
                return trimmed;
            }
        }
        return "Ứng viên";
    }

    private int estimateSkillYears(String lowerText, String skill) {
        Pattern p = Pattern.compile("([1-9]|10)\\s*(năm|years?)\\s*(kinh nghiệm)?.*" + Pattern.quote(skill.toLowerCase()));
        Matcher m = p.matcher(lowerText);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (Exception ignored) {}
        }
        return 2; // Default reasonable 2 years
    }

    private String buildCoverLetterTemplate(String candidateName, String jobTitle, String companyName,
                                            String candidateHeadline, String skills, String highlights, String tone) {
        if ("CONFIDENT".equalsIgnoreCase(tone)) {
            return String.format(
                    "Kính gửi Ban Tuyển dụng %s,\n\n" +
                    "Tôi viết thư này để khẳng định sự quan tâm và tự tin ứng tuyển vào vị trí %s. " +
                    "Với năng lực chuyên môn vững vàng trong vai trò %s cùng bề dày kinh nghiệm với các công nghệ lõi như %s, " +
                    "tôi hoàn toàn tin tưởng sẽ đóng góp hiệu quả vào các mục tiêu kỹ thuật chiến lược của Quý công ty ngay từ những ngày đầu nhận việc.\n\n" +
                    "%s" +
                    "Tôi rất mong có cơ hội trao đổi trực tiếp trong buổi phỏng vấn để làm rõ hơn giá trị tôi có thể mang lại cho đội ngũ %s.\n\n" +
                    "Trân trọng,\n%s",
                    companyName, jobTitle, candidateHeadline, skills,
                    StringUtils.hasText(highlights) ? "Thế mạnh nổi bật: " + highlights.trim() + "\n\n" : "",
                    companyName, candidateName
            );
        }

        if ("ENTHUSIASTIC".equalsIgnoreCase(tone)) {
            return String.format(
                    "Kính gửi Ban Tuyển dụng %s,\n\n" +
                    "Tôi vô cùng hào hứng khi tìm hiểu về cơ hội việc làm %s tại %s. " +
                    "Là một %s đầy nhiệt huyết, tôi luôn theo dõi sự phát triển ấn tượng của công ty và mong muốn được cống hiến năng lực của mình.\n\n" +
                    "Nền tảng kỹ năng của tôi đặc biệt tương thích với yêu cầu của vị trí này, bao gồm %s. " +
                    "%s" +
                    "Tôi tin rằng tinh thần ham học hỏi cùng niềm say mê giải quyết bài toán lớn sẽ giúp tôi hòa nhập và phát triển vượt bậc cùng %s.\n\n" +
                    "Chân thành cảm ơn Quý công ty,\n%s",
                    companyName, jobTitle, companyName, candidateHeadline, skills,
                    StringUtils.hasText(highlights) ? "Điểm nổi bật: " + highlights.trim() + "\n\n" : "",
                    companyName, candidateName
            );
        }

        if ("CONCISE".equalsIgnoreCase(tone)) {
            return String.format(
                    "Kính gửi Ban Tuyển dụng %s,\n\n" +
                    "Tôi xin ứng tuyển vị trí %s. Tôi hiện là %s với kinh nghiệm vững chắc về %s.\n\n" +
                    "%s" +
                    "Tôi hy vọng có dịp trao đổi chi tiết hơn về hồ sơ năng lực trong buổi phỏng vấn sắp tới.\n\n" +
                    "Trân trọng,\n%s",
                    companyName, jobTitle, candidateHeadline, skills,
                    StringUtils.hasText(highlights) ? highlights.trim() + "\n\n" : "",
                    candidateName
            );
        }

        // Default PROFESSIONAL tone
        return String.format(
                "Kính gửi Ban Tuyển dụng %s,\n\n" +
                "Tôi xin gửi hồ sơ ứng tuyển vị trí %s tại Quý công ty. " +
                "Với định hướng chuyên môn là %s, tôi nhận thấy các yêu cầu công việc tại %s rất tương đồng với kinh nghiệm và thế mạnh mà tôi đã tích lũy.\n\n" +
                "Trong quá trình làm việc, tôi đã phát triển năng lực chuyên sâu về %s, " +
                "đồng thời chú trọng xây dựng các giải pháp phần mềm ổn định, có khả năng mở rộng cao và tuân thủ các chuẩn mực kỹ thuật khắt khe.\n\n" +
                "%s" +
                "Tôi rất mong có cơ hội được tham gia phỏng vấn để trình bày chi tiết hơn về những đóng góp cụ thể mà tôi có thể mang lại cho %s.\n\n" +
                "Xin chân thành cảm ơn Quý công ty đã dành thời gian xem xét hồ sơ của tôi.\n\n" +
                "Trân trọng,\n%s",
                companyName, jobTitle, candidateHeadline, companyName, skills,
                StringUtils.hasText(highlights) ? "Điểm nổi bật: " + highlights.trim() + "\n\n" : "",
                companyName, candidateName
        );
    }

    /**
     * Recommends personalized job openings for candidate based on ATS match with profile skills.
     */
    @Transactional(readOnly = true)
    public List<RecommendedJobDto> getRecommendedJobsForCandidate(Long userId, int limit) {
        List<CandidateSkill> candidateSkills = Collections.emptyList();
        if (userId != null) {
            Optional<CandidateProfile> profileOpt = candidateProfileRepository.findByUserId(userId);
            if (profileOpt.isPresent()) {
                candidateSkills = candidateSkillRepository.findByCandidateProfileId(profileOpt.get().getId());
            }
        }

        Map<String, CandidateSkill> candidateSkillMap = new HashMap<>();
        for (CandidateSkill cs : candidateSkills) {
            if (cs.getSkill() != null && cs.getSkill().getName() != null) {
                candidateSkillMap.put(cs.getSkill().getName().trim().toLowerCase(), cs);
            }
        }

        List<Job> publishedJobs = jobRepository.findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc("PUBLISHED");
        if (publishedJobs.isEmpty()) {
            publishedJobs = jobRepository.findAll();
        }

        List<RecommendedJobDto> recommendations = new ArrayList<>();

        for (Job job : publishedJobs) {
            List<JobSkill> jobSkills = jobSkillRepository.findByJobId(job.getId());
            if (jobSkills.isEmpty()) {
                recommendations.add(RecommendedJobDto.builder()
                        .job(jobService.toDto(job))
                        .matchScore(50)
                        .matchRating("TIỀM NĂNG")
                        .ratingColor("amber")
                        .matchedSkills(List.of())
                        .missingSkills(List.of())
                        .recommendationReason("Tin tuyển dụng tiềm năng phù hợp với chuyên môn của bạn.")
                        .build());
                continue;
            }

            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            for (JobSkill js : jobSkills) {
                if (js.getSkill() == null) continue;
                String skName = js.getSkill().getName();
                if (candidateSkillMap.containsKey(skName.trim().toLowerCase())) {
                    matched.add(skName);
                } else {
                    missing.add(skName);
                }
            }

            int score = (int) Math.round(((double) matched.size() / jobSkills.size()) * 100);
            if (score > 100) score = 100;

            String rating;
            String color;
            if (score >= 75) {
                rating = "XUẤT SẮC";
                color = "emerald";
            } else if (score >= 50) {
                rating = "PHÙ HỢP";
                color = "sky";
            } else if (score >= 30) {
                rating = "TIỀM NĂNG";
                color = "amber";
            } else {
                rating = "CẦN BỔ SUNG";
                color = "rose";
            }

            String reason;
            if (!matched.isEmpty()) {
                reason = String.format("Khớp %d/%d kỹ năng yêu cầu (%s)",
                        matched.size(), jobSkills.size(),
                        matched.stream().limit(4).collect(Collectors.joining(", ")));
            } else {
                reason = "Vị trí tuyển dụng cùng lĩnh vực công nghệ với hồ sơ của bạn.";
            }

            recommendations.add(RecommendedJobDto.builder()
                    .job(jobService.toDto(job))
                    .matchScore(score)
                    .matchRating(rating)
                    .ratingColor(color)
                    .matchedSkills(matched)
                    .missingSkills(missing)
                    .recommendationReason(reason)
                    .build());
        }

        recommendations.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));

        return recommendations.stream()
                .limit(Math.max(1, Math.min(limit, 50)))
                .collect(Collectors.toList());
    }
}
