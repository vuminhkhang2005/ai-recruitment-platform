package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.QuickApplyRequestDto;
import com.talentbridge.backend.dto.QuickApplyResponseDto;

public interface ApplicationService {

    QuickApplyResponseDto quickApply(QuickApplyRequestDto request);
}
