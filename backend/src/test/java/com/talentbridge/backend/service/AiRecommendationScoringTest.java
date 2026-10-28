package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.AiDtos.RecommendedJobDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.entity.*;
import com.talentbridge.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Regression tests for the AI job-matching calibration done in week 10:
 * word-boundary skill matching, seniority caps, title specialization gate and location criterion.
 */
class AiRecommendationScoringTest {

    // ------------------------------------------------------------------ pure helpers

    @Nested
    @DisplayName("Word-boundary skill matching")
    class SkillMatching {

        @ParameterizedTest(name = "\"{0}\" must NOT contain skill \"{1}\"")
        @CsvSource({
                "'built 3 projects for students', ts",
                "'javascript and react', java",
                "'mongodb atlas cluster', go",
                "'c++ and c# basics', c",
        })
        void noSubstringFalsePositives(String text, String keyword) {
            assertThat(AiService.containsSkillKeyword(text, keyword)).isFalse();
        }

        @ParameterizedTest(name = "\"{0}\" contains skill \"{1}\"")
        @CsvSource({
                "'java (spring boot), c#', java",
                "'skills: c#, .net core', c#",
                "'frontend with node.js and react', node.js",
                "'go, docker', go",
        })
        void realSkillsDetected(String text, String keyword) {
            assertThat(AiService.containsSkillKeyword(text, keyword)).isTrue();
        }

        @Test
        @DisplayName("An English CV without TypeScript is not detected as TypeScript")
        void typescriptNotDetectedFromProjectsWord() {
            String cv = "final-year student. projects: hrm system, e-commerce. skills: java, spring boot, react, javascript, mysql";
            List<String> skills = AiService.extractAllSkillsFromCvText(cv);
            assertThat(skills).doesNotContain("TypeScript", "HR Business Partner");
            assertThat(skills).contains("Java", "React", "JavaScript");
        }
    }

    @Nested
    @DisplayName("Seniority calibration")
    class Seniority {

        @ParameterizedTest(name = "0 yrs vs {0} → cap {1}, levelMatched={2}")
        @CsvSource({
                "INTERN, 97, true",
                "FRESHER, 90, true",
                "JUNIOR, 68, false",
                "MIDDLE, 54, false",
                "SENIOR, 40, false",
        })
        void internCaps(String level, int cap, boolean matched) {
            AiService.SeniorityCalibration c = AiService.computeSeniorityCalibration(0, level, 0);
            assertThat(c.seniorityCap).isEqualTo(cap);
            assertThat(c.levelMatched).isEqualTo(matched);
        }

        @Test
        @DisplayName("Meeting the required years gives full depth and no cap")
        void experiencedCandidate() {
            AiService.SeniorityCalibration c = AiService.computeSeniorityCalibration(3, "JUNIOR", 1);
            assertThat(c.skillDepthFactor).isEqualTo(1.0);
            assertThat(c.seniorityCap).isEqualTo(97);
            assertThat(c.levelMatched).isTrue();
        }

        @Test
        @DisplayName("Larger experience deficit means a lower cap")
        void deficitIsMonotonic() {
            int d1 = AiService.computeSeniorityCalibration(3, "SENIOR", 4).seniorityCap;
            int d2 = AiService.computeSeniorityCalibration(2, "SENIOR", 4).seniorityCap;
            int d3 = AiService.computeSeniorityCalibration(1, "SENIOR", 4).seniorityCap;
            assertThat(d1).isGreaterThan(d2);
            assertThat(d2).isGreaterThan(d3);
        }

        @Test
        @DisplayName("Intern wording without explicit years → 0 years; explicit years win")
        void experienceYearsExtraction() {
            assertThat(AiService.extractExperienceYearsFromCvText("backend software engineer intern, final-year student")).isZero();
            assertThat(AiService.extractExperienceYearsFromCvText("3 years of experience with java")).isEqualTo(3);
            assertThat(AiService.extractExperienceYearsFromCvText("5 năm kinh nghiệm lập trình")).isEqualTo(5);
        }
    }

    @Nested
    @DisplayName("Title specialization gate")
    class TitleGate {

        private final String webCv = "java spring boot react javascript mysql docker c# .net core";

        @ParameterizedTest(name = "\"{0}\" requires missing \"{1}\"")
        @CsvSource({
                "'Mobile Developer (Flutter)', 'Flutter / Dart'",
                "'Fresher Android Developer (Kotlin)', 'Kotlin / Android'",
                "'Senior Golang Engineer', 'Golang (Go)'",
                "'Junior DevOps Specialist', 'Cloud / DevOps (CI/CD, Kubernetes, AWS)'",
        })
        void missingCoreSpecialization(String title, String expected) {
            assertThat(AiService.detectMissingTitleCoreSkill(title, webCv, Set.of())).isEqualTo(expected);
        }

        @Test
        @DisplayName("Matching specialization → no gate")
        void matchingSpecialization() {
            assertThat(AiService.detectMissingTitleCoreSkill("Fresher Java Software Engineer", webCv, Set.of())).isNull();
            assertThat(AiService.detectMissingTitleCoreSkill("Mobile Developer (Flutter)", webCv + " flutter dart", Set.of())).isNull();
        }
    }

    // ------------------------------------------------------------------ full pipeline

    @Nested
    @ExtendWith(MockitoExtension.class)
    @MockitoSettings(strictness = Strictness.LENIENT)
    @DisplayName("getRecommendedJobsForCandidate (Intern profile in Ho Chi Minh City)")
    class Pipeline {

        @Mock CandidateService candidateService;
        @Mock CandidateProfileRepository candidateProfileRepository;
        @Mock CandidateSkillRepository candidateSkillRepository;
        @Mock JobRepository jobRepository;
        @Mock JobSkillRepository jobSkillRepository;
        @Mock JobApplicationRepository jobApplicationRepository;
        @Mock UserRepository userRepository;
        @Mock CvRepository cvRepository;
        @Mock JobService jobService;

        private AiService aiService;
        private final Map<Long, List<JobSkill>> jobSkills = new HashMap<>();
        private final List<Job> jobs = new ArrayList<>();
        private long skillSeq = 1;

        private Skill skill(String name) {
            return Skill.builder().id(skillSeq++).name(name).build();
        }

        private void job(long id, String title, String level, String city, String type, String... skills) {
            Job j = Job.builder().title(title).expLevel(level).locationCity(city).jobType(type)
                    .status("PUBLISHED").description(title).requirements("")
                    .deadline(LocalDateTime.now().plusDays(20)).build();
            j.setId(id);
            jobs.add(j);
            List<JobSkill> list = new ArrayList<>();
            for (String s : skills) {
                list.add(JobSkill.builder().skill(skill(s)).isRequired(true).weight(BigDecimal.ONE).minYearsExp(0).build());
            }
            jobSkills.put(id, list);
        }

        @BeforeEach
        void setUp() {
            aiService = new AiService(candidateService, candidateProfileRepository, candidateSkillRepository, jobRepository,
                    jobSkillRepository, jobApplicationRepository, userRepository, cvRepository, jobService);

            CandidateProfile profile = CandidateProfile.builder().id(10L).userId(1L)
                    .headline("Backend Software Engineer Intern")
                    .bio("Final-year student seeking an internship. Java, Spring Boot, React, JavaScript, MySQL, C#, .NET Core")
                    .city("Ho Chi Minh City").build();
            when(candidateProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
            List<CandidateSkill> cs = new ArrayList<>();
            for (String s : List.of("Java", "Spring Boot", "React", "JavaScript", "MySQL", "C#", ".NET Core")) {
                cs.add(CandidateSkill.builder().skill(skill(s)).yearsExperience(0).build());
            }
            when(candidateSkillRepository.findByCandidateProfileId(10L)).thenReturn(cs);
            when(cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(10L)).thenReturn(List.of());
            when(jobApplicationRepository.findByCandidateProfileId(10L)).thenReturn(List.of());

            job(1, "Fresher Java Software Engineer", "FRESHER", "Ho Chi Minh City", "FULL_TIME", "Java", "Spring Boot", "MySQL");
            job(2, "Junior Software Engineer (.NET)", "JUNIOR", "Ho Chi Minh City", "FULL_TIME", "C#", ".NET Core");
            job(3, "Full-Stack Engineer (React & Java)", "MIDDLE", "Ho Chi Minh City", "FULL_TIME", "Java", "React");
            job(4, "Senior .NET Developer", "SENIOR", "Ho Chi Minh City", "FULL_TIME", "C#", ".NET Core");
            job(5, "Mobile Developer (Flutter)", "JUNIOR", "Ho Chi Minh City", "FULL_TIME", "TypeScript", "Git");
            job(6, "Intern .NET Backend Developer", "INTERN", "Da Nang", "INTERNSHIP", "C#", ".NET Core");
            job(7, "Intern React Developer (Remote)", "INTERN", "Ha Noi", "REMOTE", "React", "JavaScript");

            when(jobRepository.findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc("PUBLISHED")).thenReturn(jobs);
            when(jobSkillRepository.findByJobId(anyLong())).thenAnswer(inv -> jobSkills.getOrDefault(inv.getArgument(0, Long.class), List.of()));
            when(jobService.toDto(any(Job.class))).thenAnswer(inv -> {
                Job j = inv.getArgument(0);
                return JobResponseDto.builder().id(j.getId()).title(j.getTitle()).expLevel(j.getExpLevel()).locationCity(j.getLocationCity()).build();
            });
        }

        private Map<Long, RecommendedJobDto> scoreAll() {
            Map<Long, RecommendedJobDto> byId = new HashMap<>();
            for (RecommendedJobDto r : aiService.getRecommendedJobsForCandidate(1L, null, 50, 0)) {
                byId.put(r.getJob().getId(), r);
            }
            return byId;
        }

        @Test
        @DisplayName("Right level + same city → strong match")
        void strongMatchForFresherInSameCity() {
            RecommendedJobDto r = scoreAll().get(1L);
            assertThat(r.getMatchScore()).isBetween(82, 97);
            assertThat(r.getLevelMatched()).isTrue();
            assertThat(r.getLocationStatus()).isEqualTo("SAME_CITY");
        }

        @Test
        @DisplayName("Intern vs Junior/Middle/Senior is capped at 68 / 54 / 40")
        void seniorityCapsApplied() {
            Map<Long, RecommendedJobDto> s = scoreAll();
            assertThat(s.get(2L).getMatchScore()).isLessThanOrEqualTo(68);
            assertThat(s.get(3L).getMatchScore()).isLessThanOrEqualTo(54);
            assertThat(s.get(4L).getMatchScore()).isLessThanOrEqualTo(40);
        }

        @Test
        @DisplayName("Flutter job with wrong seed tags never matches a web CV")
        void flutterJobGated() {
            RecommendedJobDto r = scoreAll().get(5L);
            assertThat(r.getMatchScore()).isLessThanOrEqualTo(34);
            assertThat(r.getMissingSkills()).contains("Flutter / Dart");
        }

        @Test
        @DisplayName("Onsite job in another city is penalized (≤ 55) and explained")
        void otherCityPenalized() {
            RecommendedJobDto r = scoreAll().get(6L);
            assertThat(r.getLocationStatus()).isEqualTo("OTHER_CITY");
            assertThat(r.getLocationMatched()).isFalse();
            assertThat(r.getMatchScore()).isLessThanOrEqualTo(55);
            assertThat(r.getRecommendationReason()).contains("Khác khu vực");
        }

        @Test
        @DisplayName("Remote job in another city is NOT penalized")
        void remoteJobKept() {
            RecommendedJobDto r = scoreAll().get(7L);
            assertThat(r.getLocationStatus()).isEqualTo("REMOTE");
            assertThat(r.getLocationMatched()).isTrue();
            assertThat(r.getMatchScore()).isGreaterThanOrEqualTo(80);
        }

        @Test
        @DisplayName("Curated list (minScore > 0) excludes other-city onsite jobs")
        void curatedListExcludesOtherCity() {
            List<RecommendedJobDto> curated = aiService.getRecommendedJobsForCandidate(1L, null, 12, 50);
            assertThat(curated).extracting(r -> r.getJob().getId()).doesNotContain(6L).contains(1L, 7L);
        }

        @Test
        @DisplayName("Profile city has priority over the CV")
        void profileCityPriority() {
            RecommendedJobDto r = scoreAll().get(1L);
            assertThat(r.getCandidateCity()).isEqualTo("Ho Chi Minh City");
            assertThat(r.getCandidateCitySource()).isEqualTo("PROFILE");
        }
    }
}
