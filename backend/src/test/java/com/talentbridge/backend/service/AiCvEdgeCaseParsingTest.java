package com.talentbridge.backend.service;

import com.talentbridge.backend.service.impl.JobServiceImpl;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;

class AiCvEdgeCaseParsingTest {

    @Test
    void twoColumnCvLayout_extractsNameHeadlineAndHeaderCityWithoutFalsePositives() {
        String twoColCv = """
                CURRICULUM VITAE
                CONTACT                           NGUYEN MINH QUAN
                Phone: +84 90 123 4567            Senior Backend Software Engineer
                Email: quan.nm@gmail.com          SUMMARY
                Ho Chi Minh City, Vietnam         University of Science (HCMUS) - B.S. Computer Science
                SKILLS                            EXPERIENCE
                Java, Spring Boot, Docker         4 years of experience building microservices
                """;

        assertEquals("NGUYEN MINH QUAN", AiService.extractFullName(twoColCv));
        assertEquals("Senior Backend Software Engineer", AiService.extractHeadlineFromCvText(twoColCv));
        assertEquals("+84 90 123 4567", AiService.extractPhoneFromCvText(twoColCv));

        AiService.CityDetection city = AiService.detectCityWithSource(twoColCv);
        assertNotNull(city);
        assertEquals("Ho Chi Minh City", city.city);
        assertEquals("CV_HEADER", city.source,
                "Even when the right column on the same row mentions University, the left contact column city should be detected as CV_HEADER");
    }

    @Test
    void docxMultiParagraphExtraction_preservesLineBreaksForAccurateParsing() throws Exception {
        String xml = "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">"
                + "<w:body>"
                + "<w:p><w:r><w:t>TRAN THI MAI ANH</w:t></w:r></w:p>"
                + "<w:p><w:r><w:t>Frontend Engineer (React / TypeScript)</w:t></w:r></w:p>"
                + "<w:p><w:r><w:t>Địa chỉ: Hải Châu, Đà Nẵng | SĐT: 0912.345.678</w:t></w:r></w:p>"
                + "<w:p><w:r><w:t>HỌC VẤN</w:t></w:r></w:p>"
                + "<w:p><w:r><w:t>Trường Đại học Bách Khoa - Đại học Đà Nẵng</w:t></w:r></w:p>"
                + "<w:p><w:r><w:t>KINH NGHIỆM</w:t></w:r></w:p>"
                + "<w:p><w:r><w:t>Kinh nghiệm làm việc: hơn 3 năm phát triển ứng dụng React, TypeScript, Next.js và Tailwind CSS cho khách hàng doanh nghiệp.</w:t></w:r></w:p>"
                + "</w:body></w:document>";

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.putNextEntry(new ZipEntry("word/document.xml"));
            zos.write(xml.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }

        AiService aiService = new AiService(null, null, null, null, null, null, null, null, null);
        String extracted = aiService.extractDocumentText(baos.toByteArray(), "CV_TranThiMaiAnh.docx");

        assertTrue(extracted.contains("\n"), "DOCX extraction must preserve paragraph line breaks");
        assertEquals("TRAN THI MAI ANH", AiService.extractFullName(extracted));
        assertEquals("Frontend Engineer (React / TypeScript)", AiService.extractHeadlineFromCvText(extracted));
        assertEquals("0912.345.678", AiService.extractPhoneFromCvText(extracted));
        assertEquals("Trường Đại học Bách Khoa - Đại học Đà Nẵng", AiService.extractSchoolFromCvText(extracted));
        assertEquals(3, AiService.extractExperienceYearsFromCvText(extracted.toLowerCase()));

        AiService.CityDetection city = AiService.detectCityWithSource(extracted);
        assertNotNull(city);
        assertEquals("Da Nang", city.city);
        assertEquals("CV_ADDRESS", city.source);
    }

    @Test
    void decomposedUnicodeNfdAndReverseExperienceLabels_areNormalizedAndParsedCorrectly() {
        String nfdIntern = Normalizer.normalize(
                "Thực tập sinh Backend Java. Sinh viên năm cuối tại Đại học Sư phạm Kỹ thuật TP.HCM.",
                Normalizer.Form.NFD);
        assertTrue(AiService.isInternOrFresherText(nfdIntern.toLowerCase()),
                "NFD decomposed Vietnamese intern CV must be recognized as intern/fresher");
        assertEquals(0, AiService.extractExperienceYearsFromCvText(nfdIntern.toLowerCase()));

        String nfdReverseExp = Normalizer.normalize(
                "Kinh nghiệm: 4 năm phát triển hệ thống tài chính với Java, Spring Boot, PostgreSQL.",
                Normalizer.Form.NFD);
        assertFalse(AiService.isInternOrFresherText(nfdReverseExp.toLowerCase()));
        assertEquals(4, AiService.extractExperienceYearsFromCvText(nfdReverseExp.toLowerCase()));

        assertEquals(2, AiService.extractExperienceYearsFromCvText("experience: 2+ years in react and typescript"));
        assertEquals(5, AiService.extractExperienceYearsFromCvText("kinh nghiệm làm việc - trên 5 năm"));
    }

    @Test
    void bilingualJobSearchExpansion_bridgesVietnameseCategoriesToEnglishSeedJobs() {
        List<String> salesTerms = JobServiceImpl.expandBilingualSearchKeywords("Kinh doanh");
        assertTrue(salesTerms.contains("sales"));
        assertTrue(salesTerms.contains("b2b"));

        List<String> financeTerms = JobServiceImpl.expandBilingualSearchKeywords("Tài chính");
        assertTrue(financeTerms.contains("financial"));
        assertTrue(financeTerms.contains("accounting"));

        List<String> designTerms = JobServiceImpl.expandBilingualSearchKeywords("Thiết kế");
        assertTrue(designTerms.contains("ui/ux"));
        assertTrue(designTerms.contains("designer"));

        List<String> hrTerms = JobServiceImpl.expandBilingualSearchKeywords("Nhân sự");
        assertTrue(hrTerms.contains("talent acquisition"));
        assertTrue(hrTerms.contains("recruiter"));
    }
}
