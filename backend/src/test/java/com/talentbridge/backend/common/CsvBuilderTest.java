package com.talentbridge.backend.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CsvBuilderTest {

    @Test
    @DisplayName("Output starts with UTF-8 BOM and keeps Vietnamese characters")
    void bomAndUnicode() {
        byte[] bytes = new CsvBuilder().row("Họ tên", "Thành phố").row("Vũ Minh Khang", "Hồ Chí Minh").toBytes();
        assertThat(bytes[0]).isEqualTo((byte) 0xEF);
        assertThat(bytes[1]).isEqualTo((byte) 0xBB);
        assertThat(bytes[2]).isEqualTo((byte) 0xBF);
        String text = new String(bytes, 3, bytes.length - 3, StandardCharsets.UTF_8);
        assertThat(text).isEqualTo("Họ tên,Thành phố\r\nVũ Minh Khang,Hồ Chí Minh\r\n");
    }

    @Test
    @DisplayName("Commas, quotes and line breaks are quoted per RFC 4180")
    void quoting() {
        String text = new CsvBuilder().row("a,b", "say \"hi\"", "line1\nline2", "plain").asString();
        assertThat(text).isEqualTo("\"a,b\",\"say \"\"hi\"\"\",\"line1\nline2\",plain\r\n");
    }

    @Test
    @DisplayName("Formula injection is neutralised but negative numbers are kept")
    void formulaInjection() {
        String text = new CsvBuilder().row("=HYPERLINK(\"http://evil\")", "+1+1", "@SUM(A1)", "-5", "-2.5").asString();
        assertThat(text).startsWith("\"'=HYPERLINK(\"\"http://evil\"\")\",'+1+1,'@SUM(A1),-5,-2.5");
    }

    @Test
    @DisplayName("Nulls, dates and lists are formatted")
    void formatting() {
        String text = new CsvBuilder()
                .row(null, LocalDateTime.of(2026, 10, 28, 9, 5), List.of("Java", "React"), 3.0, 2.456)
                .asString();
        assertThat(text).isEqualTo(",2026-10-28 09:05,\"Java; React\",3,2.46\r\n");
    }
}
