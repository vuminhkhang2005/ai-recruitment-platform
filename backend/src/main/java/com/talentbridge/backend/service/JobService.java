package com.talentbridge.backend.service;

import com.talentbridge.backend.common.PageResponse;
import com.talentbridge.backend.dto.JobCreateRequestDto;
import com.talentbridge.backend.dto.JobFilterRequestDto;
import com.talentbridge.backend.dto.JobResponseDto;
import com.talentbridge.backend.dto.JobUpdateRequestDto;

import java.util.List;

public interface JobService {

    PageResponse<JobResponseDto> searchJobs(JobFilterRequestDto filter);

    JobResponseDto getJobById(Long id);

    JobResponseDto getJobByUuid(String uuid);

    List<JobResponseDto> getFeaturedJobs();

    JobResponseDto createJob(JobCreateRequestDto request, Long recruiterUserId);

    JobResponseDto updateJob(Long id, JobUpdateRequestDto request, Long recruiterUserId, boolean isAdmin);

    JobResponseDto updateJobStatus(Long id, String status, Long recruiterUserId, boolean isAdmin);

    void deleteJob(Long id, Long recruiterUserId, boolean isAdmin);
}
