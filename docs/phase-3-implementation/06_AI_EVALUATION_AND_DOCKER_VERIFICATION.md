# 06. AI Model Evaluation, CV Edge-Case Parsing & Docker Verification

> **Document Version:** 1.0 (Week 12 Implementation & Audit)  
> **Scope:** Quantitative evaluation of the Fine-tuned Multilingual MiniLM-L12-v2 Two-Tower + Cross-Attention AI Engine, edge-case CV document parsing, bilingual search synonym expansion, and 4-service Docker Compose orchestration.

---

## 1. Two-Tower Neural Bi-Encoder + Cross-Attention Evaluation

### 1.1 Model Architecture Summary
- **Backbone:** Fine-tuned `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (50+ languages including Vietnamese and English, `384`-dim dense embeddings).
- **Hybrid Scoring Head (`TalentBridgeTransformerHead`):**
  - Dual-tower residual projections (`CV Tower` & `JD Tower`) with LayerNorm, GELU, and L2-normalized Cosine Similarity.
  - 4-head Multi-Head Cross-Attention fusing `[u, v, |u - v|, u * v]` with `7`-dimensional structural features (required/optional skill coverage, experience ratio, seniority deficit, token Jaccard).
  - Multi-task regression heads predicting `overall_score`, `skill_score`, `experience_score`, and `keyword_score`.
- **Total Parameters:** `118,399,236` (`~118.4M` parameters; `model.safetensors` + `talentbridge_MatchNet.pt`).

### 1.2 Quantitative Comparison: Fine-Tuned Transformer vs. Subword Baseline

Metrics extracted from `talentbridge-ai-engine/artifacts/evaluation_metrics.json` on the held-out validation (`720` pairs) and test (`720` pairs) splits:

| Metric | Subword TF-IDF + SVD Baseline (`v1`) | Fine-Tuned MiniLM-L12-v2 + Cross-Attention (`v2.0.0`, Val) | Fine-Tuned MiniLM-L12-v2 + Cross-Attention (`v2.0.0`, Test) |
| :--- | :---: | :---: | :---: |
| **R² Score** | `0.9412` | `0.9963` | **`0.9963`** |
| **MAE (Score 0–100)** | `3.84` | `1.19` | **`1.15`** |
| **RMSE (Score 0–100)** | `4.92` | `1.54` | **`1.49`** |
| **Pearson $r$** | `0.9715` | `0.9985` | **`0.9984`** |
| **Spearman $\rho$** | `0.9680` | `0.9970` | **`0.9970`** |
| **Accuracy ($\pm 8\%$ tolerance)** | `94.20%` | `100.00%` | **`100.00%`** |
| **Binary F1-Score (Match $\ge 65\%$)** | `0.9340` | `0.9852` | **`0.9855`** |
| **ROC-AUC** | `0.9890` | `0.9999` | **`0.9999`** |
| **NDCG@3 (Ranking Quality)** | `0.9740` | `0.9999` | **`1.0000`** |
| **NDCG@5 (Ranking Quality)** | `0.9810` | `0.9999` | **`0.9999`** |

---

## 2. Real-World CV Parsing & Search Edge Cases Resolved

### 2.1 Multi-Column PDF & DOCX Layout Preservation (`AiService.java`)
- **PDF Spatial Sorting:** Enabled `PDFTextStripper.setSortByPosition(true)` so two-column PDF resumes read in deterministic spatial order.
- **DOCX Paragraph & Table Row Line Breaks:** Updated `.docx` XML extraction (`word/document.xml`) to translate `</w:p>`, `</w:tr>`, and `<w:br/>` into `\n` line breaks and `</w:tc>` into column separators instead of collapsing the entire `.docx` into a single line.
- **Two-Column Contact vs. Education Disambiguation:** Updated `extractFullName`, `extractHeadlineFromCvText`, and `detectCityWithSource` to split two-column rows (`\s{3,}|\t`), skip generic headers (`CURRICULUM VITAE`, `CONTACT`, `RESUME`, `LIÊN HỆ`), and detect contact-column cities (`CV_HEADER`) even when the adjacent column on the same row contains a university name.

### 2.2 Decomposed Vietnamese Unicode (NFD $\rightarrow$ NFC) & Reverse Experience Formats
- **Unicode Normalization:** Added `AiService.normalizeUnicodeNfc(String)` (`Normalizer.Form.NFC`) across all CV text extraction and skill/experience matchers so PDFs exported from Canva, macOS, or Word using decomposed NFD diacritics (`sinh vie\u0302n`, `thu\u031B\u0323c ta\u0302\u0323p`, `kinh nghie\u0302\u0323m`) match identically to precomposed NFC strings.
- **Bidirectional Experience Expressions:** Extended `extractExperienceYearsFromCvText` and `isInternOrFresherText` to parse both forward (`"3 năm kinh nghiệm"`, `"4+ years of experience"`) and reverse (`"Kinh nghiệm: 4 năm"`, `"Kinh nghiệm làm việc: hơn 3 năm"`, `"Experience: 2+ years"`) formats.
- **Bilingual Domain Search Expansion (`JobServiceImpl.java`):** Added `expandBilingualSearchKeywords(String)` so Vietnamese category/keyword searches (`Kinh doanh`, `Tài chính`, `Kế toán`, `Thiết kế`, `Nhân sự`, `Lập trình`) expand to match English seed job titles/descriptions (`sales`, `b2b`, `financial`, `accounting`, `ui/ux`, `designer`, `talent acquisition`, `recruiter`, `developer`) and vice versa.

---

## 3. Multi-Container Docker Compose Orchestration

The root [`docker-compose.yml`](../../docker-compose.yml) orchestrates 4 services:
1. **`mysql` (`mysql:8.0`, port `3306`)**: Initializes `ai_recruitment_db` with `docs/phase-2-design/02_DATABASE_SCHEMA_DDL.sql` and `03_SEED_DATA.sql`.
2. **`ai-engine` (`../talentbridge-ai-engine`, port `8000`)**: Serves the PyTorch FastAPI inference API (`/health`, `/api/v1/ai/health`, `/api/v1/ai-engine/predict`, `/api/v1/ai-engine/metrics`).
3. **`backend` (`./backend`, port `8080`)**: Spring Boot 3.3 service connected to `mysql:3306/ai_recruitment_db` and `http://ai-engine:8000`, persisting uploaded CVs/avatars in `backend_uploads:/app/uploads`.
4. **`frontend` (`./frontend`, port `5173:80`)**: Nginx reverse proxy serving the Vite production bundle and proxying `/api/`, `/uploads/`, and `/ws` to `http://backend:8080`.
