package com.talentbridge.backend.controller;

import com.talentbridge.backend.common.ApiResponse;
import com.talentbridge.backend.dto.AdminDtos.*;
import com.talentbridge.backend.security.UserPrincipal;
import com.talentbridge.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "8. Admin Governance Portal", description = "Quản trị hệ thống toàn diện: Thống kê nền tảng, Quản lý User & RBAC, Xác minh Doanh nghiệp, Kiểm duyệt Tin đăng, Từ điển Kỹ năng và Nhật ký Audit (UC-ADM-01 -> UC-ADM-06)")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/overview")
    @Operation(summary = "UC-ADM-01 & UC-ADM-06: Xem thống kê tổng quan toàn sàn & trạng thái AI Engine")
    public ResponseEntity<ApiResponse<PlatformOverviewDto>> getPlatformOverview() {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getPlatformOverview()));
    }

    @GetMapping("/users")
    @Operation(summary = "UC-ADM-02: Danh sách người dùng toàn hệ thống kèm bộ lọc vai trò và trạng thái")
    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getUsers(keyword, role, status)));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "UC-ADM-02: Khóa / Mở khóa / Cập nhật trạng thái tài khoản người dùng")
    public ResponseEntity<ApiResponse<AdminUserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminUserDto updated = adminService.updateUserStatus(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật trạng thái tài khoản thành công", updated));
    }

    @PutMapping("/users/{id}/roles")
    @Operation(summary = "UC-ADM-02: Phân quyền RBAC cho tài khoản người dùng")
    public ResponseEntity<ApiResponse<AdminUserDto>> updateUserRoles(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminUserDto updated = adminService.updateUserRoles(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật phân quyền vai trò thành công", updated));
    }

    @GetMapping("/companies")
    @Operation(summary = "UC-ADM-03: Danh sách doanh nghiệp đối tác và trạng thái xác minh")
    public ResponseEntity<ApiResponse<List<AdminCompanyDto>>> getCompanies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String verificationStatus
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getCompanies(keyword, verificationStatus)));
    }

    @PatchMapping("/companies/{id}/verify")
    @Operation(summary = "UC-ADM-03: Xác minh hoặc từ chối hồ sơ doanh nghiệp (PENDING / VERIFIED / REJECTED)")
    public ResponseEntity<ApiResponse<AdminCompanyDto>> verifyCompany(
            @PathVariable Long id,
            @Valid @RequestBody VerifyCompanyRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminCompanyDto updated = adminService.verifyCompany(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật trạng thái xác minh doanh nghiệp", updated));
    }

    @GetMapping("/jobs")
    @Operation(summary = "UC-ADM-04: Danh sách toàn bộ tin tuyển dụng trên hệ thống để kiểm duyệt")
    public ResponseEntity<ApiResponse<List<AdminJobDto>>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long companyId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getJobs(keyword, status, companyId)));
    }

    @PatchMapping("/jobs/{id}/moderate")
    @Operation(summary = "UC-ADM-04: Kiểm duyệt tin tuyển dụng (PUBLISHED / PENDING_APPROVAL / PAUSED / CLOSED)")
    public ResponseEntity<ApiResponse<AdminJobDto>> moderateJob(
            @PathVariable Long id,
            @Valid @RequestBody ModerateJobRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminJobDto updated = adminService.moderateJob(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật trạng thái kiểm duyệt tin tuyển dụng", updated));
    }

    @GetMapping("/skills")
    @Operation(summary = "UC-ADM-05: Danh mục từ điển kỹ năng chuẩn (Master Skill Taxonomy)")
    public ResponseEntity<ApiResponse<List<AdminSkillDto>>> getSkills(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getSkills(keyword, category, activeOnly)));
    }

    @PostMapping("/skills")
    @Operation(summary = "UC-ADM-05: Thêm kỹ năng mới vào từ điển chuẩn")
    public ResponseEntity<ApiResponse<AdminSkillDto>> createSkill(
            @Valid @RequestBody SaveSkillRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminSkillDto created = adminService.createSkill(adminId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đã thêm kỹ năng mới vào từ điển chuẩn", created));
    }

    @PutMapping("/skills/{id}")
    @Operation(summary = "UC-ADM-05: Cập nhật thông tin kỹ năng trong từ điển chuẩn")
    public ResponseEntity<ApiResponse<AdminSkillDto>> updateSkill(
            @PathVariable Long id,
            @Valid @RequestBody SaveSkillRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminSkillDto updated = adminService.updateSkill(adminId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật kỹ năng thành công", updated));
    }

    @DeleteMapping("/skills/{id}")
    @Operation(summary = "UC-ADM-05: Bật / Tắt trạng thái kích hoạt của kỹ năng")
    public ResponseEntity<ApiResponse<AdminSkillDto>> toggleSkillStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long adminId = principal != null ? principal.getId() : 1L;
        AdminSkillDto toggled = adminService.toggleOrDeleteSkill(adminId, id);
        return ResponseEntity.ok(ApiResponse.ok("Đã chuyển đổi trạng thái hiển thị của kỹ năng", toggled));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "FR-38: Truy xuất nhật ký hoạt động hệ thống (System Audit Trail)")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityName,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "100") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getAuditLogs(action, entityName, keyword, limit)));
    }

    @GetMapping("/email-logs")
    @Operation(summary = "FR-38: Truy xuất nhật ký gửi email giao dịch toàn hệ thống")
    public ResponseEntity<ApiResponse<List<EmailLogDto>>> getEmailLogs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "100") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminService.getEmailLogs(status, limit)));
    }
}
