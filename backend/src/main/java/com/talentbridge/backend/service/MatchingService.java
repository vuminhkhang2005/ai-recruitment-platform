package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.MatchScoreDto;
import com.talentbridge.backend.entity.CandidateSkill;
import com.talentbridge.backend.entity.JobSkill;
import com.talentbridge.backend.repository.CandidateSkillRepository;
import com.talentbridge.backend.repository.JobSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Computes a transparent skill-overlap score between a candidate and jobs.
 *
 * score = 100 * Σ(weight of matched job skills) / Σ(weight of all job skills)
 * where required skills count fully and nice-to-have skills count half,
 * and a matched skill with fewer years than required counts 70%.
 */
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final JobSkillRepository jobSkillRepository;
    private final CandidateSkillRepository candidateSkillRepository;

    @Transactional(readOnly = true)
    public MatchScoreDto computeForJob(Long candidateProfileId, Long jobId) {
        return computeForJobs(candidateProfileId, List.of(jobId)).get(jobId);
    }

    @Transactional(readOnly = true)
    public Map<Long, MatchScoreDto> computeForJobs(Long candidateProfileId, Collection<Long> jobIds) {
        Map<Long, MatchScoreDto> result = new LinkedHashMap<>();
        if (jobIds == null || jobIds.isEmpty()) {
            return result;
        }

        Map<Long, CandidateSkill> candidateSkills = candidateProfileId == null ? Map.of()
                : candidateSkillRepository.findByCandidateProfileId(candidateProfileId).stream()
                .collect(Collectors.toMap(cs -> cs.getSkill().getId(), cs -> cs, (a, b) -> a));

        Map<Long, List<JobSkill>> skillsByJob = jobSkillRepository.findByJobIdIn(jobIds).stream()
                .collect(Collectors.groupingBy(js -> js.getJob().getId()));

        for (Long jobId : jobIds) {
            List<JobSkill> jobSkills = skillsByJob.getOrDefault(jobId, List.of());
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();
            double total = 0;
            double gained = 0;

            int maxHaveYears = candidateSkills.values().stream()
                    .map(CandidateSkill::getYearsExperience)
                    .filter(Objects::nonNull)
                    .max(Integer::compareTo)
                    .orElse(0);

            String expLevel = !jobSkills.isEmpty() && jobSkills.get(0).getJob() != null && jobSkills.get(0).getJob().getExpLevel() != null
                    ? jobSkills.get(0).getJob().getExpLevel().toUpperCase()
                    : "JUNIOR";
            int reqYears = switch (expLevel) {
                case "INTERN", "FRESHER" -> 0;
                case "JUNIOR" -> 1;
                case "MIDDLE" -> 2;
                case "SENIOR" -> 4;
                case "LEAD", "MANAGER" -> 5;
                default -> 1;
            };

            for (JobSkill js : jobSkills) {
                double w = (js.getWeight() != null ? js.getWeight() : BigDecimal.ONE).doubleValue();
                if (!Boolean.TRUE.equals(js.getIsRequired())) {
                    w *= 0.5;
                }
                total += w;
                CandidateSkill cs = candidateSkills.get(js.getSkill().getId());
                if (cs != null) {
                    matched.add(js.getSkill().getName());
                    int need = reqYears == 0 ? 0 : Math.max(reqYears, js.getMinYearsExp() != null ? js.getMinYearsExp() : reqYears);
                    int have = cs.getYearsExperience() != null ? cs.getYearsExperience() : 0;
                    gained += have >= need ? w : w * 0.68;
                } else {
                    missing.add(js.getSkill().getName());
                }
            }

            Integer score = null;
            if (total > 0 && !candidateSkills.isEmpty()) {
                int rawSkillScore = (int) Math.round(100.0 * gained / total);
                int deficit = Math.max(0, reqYears - maxHaveYears);
                int cap = deficit == 0 ? 97 : deficit == 1 ? 68 : deficit == 2 ? 54 : 40;
                int expComponent = deficit == 0 ? 94 : deficit == 1 ? 48 : deficit == 2 ? 32 : 20;
                score = Math.min(cap, (int) Math.round(rawSkillScore * 0.70 + expComponent * 0.30));
            }

            result.put(jobId, MatchScoreDto.builder()
                    .jobId(jobId)
                    .score(score)
                    .matchedSkills(matched)
                    .missingSkills(missing)
                    .build());
        }
        return result;
    }
}
