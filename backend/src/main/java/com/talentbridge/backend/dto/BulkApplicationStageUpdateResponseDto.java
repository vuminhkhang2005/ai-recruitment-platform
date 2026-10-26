package com.talentbridge.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkApplicationStageUpdateResponseDto {
    private int totalRequested;
    private int updatedCount;
    private int skippedCount;
    private int emailSentCount;
    private List<ApplicationResponseDto> updatedApplications;
    private List<String> skippedReasons;
}
