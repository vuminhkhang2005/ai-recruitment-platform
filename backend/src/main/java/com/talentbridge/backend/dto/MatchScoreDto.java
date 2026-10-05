package com.talentbridge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Skill-based match between a candidate and a job.
 * {@code score} is null when it cannot be computed honestly
 * (job has no skills listed, or candidate has not declared any skills).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchScoreDto {
    private Long jobId;
    private Integer score;
    private List<String> matchedSkills;
    private List<String> missingSkills;
}
