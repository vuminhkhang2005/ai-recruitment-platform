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

            for (JobSkill js : jobSkills) {
                double w = (js.getWeight() != null ? js.getWeight() : BigDecimal.ONE).doubleValue();
                if (!Boolean.TRUE.equals(js.getIsRequired())) {
                    w *= 0.5;
                }
                total += w;
                CandidateSkill cs = candidateSkills.get(js.getSkill().getId());
                if (cs != null) {
                    matched.add(js.getSkill().getName());
                    int need = js.getMinYearsExp() != null ? js.getMinYearsExp() : 0;
                    int have = cs.getYearsExperience() != null ? cs.getYearsExperience() : 0;
                    gained += have >= need ? w : w * 0.7;
                } else {
                    missing.add(js.getSkill().getName());
                }
            }

            Integer score = null;
            if (total > 0 && !candidateSkills.isEmpty()) {
                score = (int) Math.round(100.0 * gained / total);
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
