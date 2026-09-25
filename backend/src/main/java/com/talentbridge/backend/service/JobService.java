package com.talentbridge.backend.service;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;

import java.util.List;

public interface JobService {

    PageResponse<JobResponseDto> searchJobs(JobFilterRequestDto filter);

    JobResponseDto getJobById(Long id);

    JobResponseDto getJobByUuid(String uuid);

    List<JobResponseDto> getFeaturedJobs();
}
