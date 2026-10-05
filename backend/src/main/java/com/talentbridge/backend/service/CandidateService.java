package com.talentbridge.backend.service;

import com.talentbridge.backend.dto.CandidateDtos.CvItem;
import com.talentbridge.backend.dto.CandidateDtos.SkillItem;
import com.talentbridge.backend.dto.MatchScoreDto;
import com.talentbridge.backend.entity.CandidateProfile;
import com.talentbridge.backend.entity.CandidateSkill;
import com.talentbridge.backend.entity.Cv;
import com.talentbridge.backend.entity.Skill;
import com.talentbridge.backend.exception.BadRequestException;
import com.talentbridge.backend.exception.ResourceNotFoundException;
import com.talentbridge.backend.repository.CandidateProfileRepository;
import com.talentbridge.backend.repository.CandidateSkillRepository;
import com.talentbridge.backend.repository.CvRepository;
import com.talentbridge.backend.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private static final Set<String> ALLOWED_EXT = Set.of("pdf", "doc", "docx");
    private static final Set<String> PROFICIENCIES = Set.of("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT");
    private static final long MAX_CV_BYTES = 5L * 1024 * 1024;
    public static final String LOCAL_PREFIX = "local:";

    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateSkillRepository candidateSkillRepository;
    private final SkillRepository skillRepository;
    private final CvRepository cvRepository;
    private final MatchingService matchingService;

    @Value("${app.storage.dir:uploads}")
    private String storageDir;

    /** Returns the candidate profile for a user, creating an empty one if missing. */
    @Transactional
    public CandidateProfile requireProfile(Long userId) {
        return candidateProfileRepository.findByUserId(userId)
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder()
                        .userId(userId)
                        .isOpenToWork(true)
                        .visibility("PUBLIC")
                        .build()));
    }

    // ---------------------------------------------------------------- skills

    @Transactional
    public List<SkillItem> getSkills(Long userId) {
        CandidateProfile profile = requireProfile(userId);
        return candidateSkillRepository.findByCandidateProfileId(profile.getId()).stream()
                .map(this::toSkillItem)
                .sorted(Comparator.comparing(SkillItem::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional
    public List<SkillItem> replaceSkills(Long userId, List<SkillItem> items) {
        CandidateProfile profile = requireProfile(userId);
        if (items != null && items.size() > 50) {
            throw new BadRequestException("Tối đa 50 kỹ năng");
        }
        candidateSkillRepository.deleteAllByCandidateProfileId(profile.getId());
        candidateSkillRepository.flush();

        Set<Long> seen = new HashSet<>();
        if (items != null) {
            for (SkillItem item : items) {
                if (item == null || !StringUtils.hasText(item.getName())) continue;
                String name = item.getName().trim();
                if (name.length() > 100) {
                    throw new BadRequestException("Tên kỹ năng quá dài: " + name);
                }
                Skill skill = skillRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> skillRepository.save(Skill.builder()
                                .name(name)
                                .slug(toSlug(name) + "-" + UUID.randomUUID().toString().substring(0, 6))
                                .category("OTHER")
                                .isActive(true)
                                .build()));
                if (!seen.add(skill.getId())) continue;

                String prof = item.getProficiency() != null ? item.getProficiency().toUpperCase() : "INTERMEDIATE";
                if (!PROFICIENCIES.contains(prof)) prof = "INTERMEDIATE";
                int years = item.getYearsExperience() != null ? Math.max(0, Math.min(item.getYearsExperience(), 40)) : 0;

                candidateSkillRepository.save(CandidateSkill.builder()
                        .candidateProfileId(profile.getId())
                        .skill(skill)
                        .proficiency(prof)
                        .yearsExperience(years)
                        .isVerified(false)
                        .build());
            }
        }
        return getSkills(userId);
    }

    // ---------------------------------------------------------------- match

    @Transactional
    public List<MatchScoreDto> matchScores(Long userId, List<Long> jobIds) {
        CandidateProfile profile = requireProfile(userId);
        List<Long> ids = jobIds == null ? List.of() : jobIds.stream().filter(Objects::nonNull).distinct().limit(200).toList();
        return new ArrayList<>(matchingService.computeForJobs(profile.getId(), ids).values());
    }

    // ---------------------------------------------------------------- CVs

    @Transactional
    public List<CvItem> listCvs(Long userId) {
        CandidateProfile profile = requireProfile(userId);
        return cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(profile.getId())
                .stream().map(this::toCvItem).toList();
    }

    @Transactional
    public CvItem uploadCv(Long userId, MultipartFile file, String title) {
        CandidateProfile profile = requireProfile(userId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file CV");
        }
        if (file.getSize() > MAX_CV_BYTES) {
            throw new BadRequestException("File CV tối đa 5MB");
        }
        String original = StringUtils.cleanPath(Optional.ofNullable(file.getOriginalFilename()).orElse("cv.pdf"));
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!ALLOWED_EXT.contains(ext)) {
            throw new BadRequestException("Chỉ chấp nhận file PDF, DOC hoặc DOCX");
        }

        String uuid = UUID.randomUUID().toString();
        String relative = "cvs/" + uuid + "." + ext;
        Path target = Paths.get(storageDir).toAbsolutePath().normalize().resolve(relative);
        String md5;
        try {
            Files.createDirectories(target.getParent());
            MessageDigest digest = MessageDigest.getInstance("MD5");
            try (InputStream in = new DigestInputStream(file.getInputStream(), digest)) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            md5 = HexFormat.of().formatHex(digest.digest());
        } catch (IOException | NoSuchAlgorithmException e) {
            throw new BadRequestException("Không thể lưu file CV: " + e.getMessage());
        }

        List<Cv> existing = cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(profile.getId());
        boolean makeDefault = existing.stream().noneMatch(c -> Boolean.TRUE.equals(c.getIsDefault()));

        String cleanTitle = StringUtils.hasText(title) ? title.trim() : original.replaceAll("\\.[^.]+$", "");
        if (cleanTitle.length() > 150) cleanTitle = cleanTitle.substring(0, 150);

        Cv cv = cvRepository.save(Cv.builder()
                .uuid(uuid)
                .candidateProfileId(profile.getId())
                .title(cleanTitle)
                .fileUrl(LOCAL_PREFIX + relative)
                .fileName(original.length() > 255 ? original.substring(0, 255) : original)
                .fileSizeBytes((int) file.getSize())
                .fileMd5(md5)
                .parsingStatus("PENDING")
                .isDefault(makeDefault)
                .build());
        return toCvItem(cv);
    }

    @Transactional
    public List<CvItem> setDefaultCv(Long userId, Long cvId) {
        CandidateProfile profile = requireProfile(userId);
        Cv target = ownedCv(profile, cvId);
        for (Cv cv : cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(profile.getId())) {
            boolean shouldBeDefault = cv.getId().equals(target.getId());
            if (!Objects.equals(cv.getIsDefault(), shouldBeDefault)) {
                cv.setIsDefault(shouldBeDefault);
                cv.setUpdatedAt(LocalDateTime.now());
                cvRepository.save(cv);
            }
        }
        return listCvs(userId);
    }

    @Transactional
    public List<CvItem> deleteCv(Long userId, Long cvId) {
        CandidateProfile profile = requireProfile(userId);
        Cv cv = ownedCv(profile, cvId);
        cv.setDeletedAt(LocalDateTime.now());
        boolean wasDefault = Boolean.TRUE.equals(cv.getIsDefault());
        cv.setIsDefault(false);
        cvRepository.save(cv);
        if (wasDefault) {
            cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(profile.getId())
                    .stream().findFirst().ifPresent(next -> {
                        next.setIsDefault(true);
                        cvRepository.save(next);
                    });
        }
        return listCvs(userId);
    }

    /** Resolves a CV that the candidate may use to apply: the given one (if owned) or their default. */
    @Transactional
    public Cv resolveCvForApplication(CandidateProfile profile, Long requestedCvId) {
        if (requestedCvId != null) {
            return ownedCv(profile, requestedCvId);
        }
        return cvRepository.findByCandidateProfileIdAndDeletedAtIsNullOrderByIsDefaultDescCreatedAtDesc(profile.getId())
                .stream().findFirst()
                .orElseThrow(() -> new BadRequestException("Bạn cần tải lên CV trước khi ứng tuyển."));
    }

    public Path resolveLocalFile(Cv cv) {
        if (cv.getFileUrl() == null || !cv.getFileUrl().startsWith(LOCAL_PREFIX)) {
            return null;
        }
        Path base = Paths.get(storageDir).toAbsolutePath().normalize();
        Path p = base.resolve(cv.getFileUrl().substring(LOCAL_PREFIX.length())).normalize();
        return p.startsWith(base) && Files.exists(p) ? p : null;
    }

    private Cv ownedCv(CandidateProfile profile, Long cvId) {
        Cv cv = cvRepository.findByIdAndDeletedAtIsNull(cvId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy CV"));
        if (!cv.getCandidateProfileId().equals(profile.getId())) {
            throw new AccessDeniedException("CV không thuộc về bạn");
        }
        return cv;
    }

    private SkillItem toSkillItem(CandidateSkill cs) {
        return SkillItem.builder()
                .skillId(cs.getSkill().getId())
                .name(cs.getSkill().getName())
                .proficiency(cs.getProficiency())
                .yearsExperience(cs.getYearsExperience())
                .build();
    }

    public CvItem toCvItem(Cv cv) {
        return CvItem.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .fileName(cv.getFileName())
                .fileSizeBytes(cv.getFileSizeBytes())
                .isDefault(cv.getIsDefault())
                .downloadable(cv.getFileUrl() != null && cv.getFileUrl().startsWith(LOCAL_PREFIX))
                .createdAt(cv.getCreatedAt())
                .build();
    }

    private static String toSlug(String input) {
        String n = Normalizer.normalize(input.trim().replaceAll("\\s+", "-"), Normalizer.Form.NFD);
        return n.replaceAll("[^\\w-]", "").toLowerCase(Locale.ENGLISH);
    }
}
