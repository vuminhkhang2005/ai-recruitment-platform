package com.talentbridge.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Verifies the priority used to detect a candidate's city from CV text:
 * explicit address/location → contact header → university → most mentioned city.
 */
class AiServiceCityDetectionTest {

    private static AiService.CityDetection detect(String text) {
        return AiService.detectCityWithSource(text);
    }

    @Test
    void explicitAddressWinsOverUniversity() {
        String cv = "Nguyen Van A\nBackend Intern\n"
                + "EDUCATION\nHCMC University of Technology and Engineering (HCMUTE)\n"
                + "CONTACT\nAddress: 12 Cau Giay, Ha Noi\n";
        AiService.CityDetection d = detect(cv);
        assertEquals("Ha Noi", d.city);
        assertEquals("CV_ADDRESS", d.source);
    }

    @Test
    void vietnameseAddressLabelIsRecognized() {
        AiService.CityDetection d = detect("Trần Văn B\nĐịa chỉ: Quận Hải Châu, Đà Nẵng\nHỌC VẤN\nĐại học Bách Khoa Hà Nội");
        assertEquals("Da Nang", d.city);
        assertEquals("CV_ADDRESS", d.source);
    }

    @Test
    void contactHeaderLocationIsUsed() {
        String cv = "Vu Minh Khang\nBackend Software Engineer Intern\n"
                + "0981832403 khangminhvu97@gmail.com https://github.com/x Ho Chi Minh City\n"
                + "OBJECTIVE\nLooking for internship at FPT Software Da Nang\n";
        AiService.CityDetection d = detect(cv);
        assertEquals("Ho Chi Minh City", d.city);
        assertEquals("CV_HEADER", d.source);
    }

    @Test
    void fallsBackToUniversityWhenNoLocationIsWritten() {
        String cv = "Le Van C\nJava Developer Intern\nc@gmail.com\n"
                + "EDUCATION\nHo Chi Minh City University of Technology and Education (HCMUTE)\n"
                + "PROJECTS\nTourism app for Da Nang and Da Nang hotels\n";
        AiService.CityDetection d = detect(cv);
        assertEquals("Ho Chi Minh City", d.city);
        assertEquals("CV_SCHOOL", d.source);
    }

    @Test
    void universityAbbreviationOnly() {
        AiService.CityDetection d = detect("Pham D\nEDUCATION\nHUST - School of ICT\n");
        assertEquals("Ha Noi", d.city);
        assertEquals("CV_SCHOOL", d.source);
    }

    @Test
    void unknownWhenNoCityAnywhere() {
        assertNull(detect("John Doe\nSKILLS\nJava, Spring Boot, MySQL\n"));
    }

    @Test
    void normalizeCityKeyHandlesVariants() {
        assertEquals("HCM", AiService.normalizeCityKey("TP.HCM"));
        assertEquals("HCM", AiService.normalizeCityKey("Hồ Chí Minh"));
        assertEquals("HCM", AiService.normalizeCityKey("Ho Chi Minh City"));
        assertEquals("HN", AiService.normalizeCityKey("Hà Nội"));
        assertEquals("DN", AiService.normalizeCityKey("Da Nang"));
        assertNull(AiService.normalizeCityKey("Vietnam"));
    }
}
