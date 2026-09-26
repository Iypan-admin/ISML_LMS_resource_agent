# ISML Resource Platform — Bulk Resource Importer

This CLI importer processes raw tutor-contributed resource datasets (`german.json`, `french.json`, `japanese.json`) and safely imports them into the ISML Resource Platform via Prisma and Supabase PostgreSQL.

---

## 🚀 Usage

### 1. Dry-Run Mode (Simulation & Validation)
Runs full validation, master data resolution, and URL deduplication **without writing to the database**:
```bash
npm run import:resources -- --dry-run
```

### 2. Production Live Import
Executes transactional writes to Supabase PostgreSQL:
```bash
npm run import:resources
```

---

## 🔒 Governance & Idempotency Rules
1. **Deduplication**: Reuses `urlHash` (SHA-256 fingerprint) to prevent duplicate `Resource` creation.
2. **Multiple Tutor Attribution**: Reuses existing resources while attaching missing `Contributor` / `ResourceContribution` relations.
3. **Status Governance**: All imported items default to `status: PENDING_REVIEW`.
4. **Verbatim Preservation**: Preserves exact titles, original URLs (including Google Share links), and purpose text.
