# Japanese Learning Apps: Multi-Phase Implementation Plan

**Version**: 1.1.0
**Created**: 2026-01-11
**Updated**: 2026-01-11 (Codex + Gemini feedback integrated)
**Participants**: Claude (Web + Mobile), Gemini (Web + Mobile), Codex (Web + Mobile)

---

## Overview

This document outlines the multi-phase plan to unify three independent Japanese learning implementations through shared datasets and cross-platform user data portability.

### Goals

1. **Unified Datasets**: All implementations use validated, consistent learning data
2. **Data Portability**: Users can export/import test history between platforms
3. **Collaboration**: Three AI implementations work together maintaining shared resources

---

## Phase 1: Dataset Repository & Schema (✅ COMPLETE)

**Timeline**: Week 1 (2026-01-11)
**Status**: ✅ COMPLETE

### Objectives

- Create unified dataset repository
- Define universal export schema
- Implement adapter utilities
- Validate all datasets

### Deliverables

✅ **Dataset Repository**: https://github.com/allenlu2009/japanese-learning-datasets

**Contents**:
- Hiragana (104 characters)
- Katakana (104 characters)
- Kanji N5 (80), N4 (166)
- Vocabulary N5 (718), N4 (668)
- Universal export schema
- Adapter examples for Claude and Codex
- Validation scripts
- Complete documentation

### Key Decisions Made

1. **Field Naming**: Public datasets use "romaji" (correct spelling)
2. **Timestamp Format**: Export uses ISO 8601, adapters convert to internal formats
3. **TestType Mapping**: Canonical types with mapping table for internal types
4. **Breakdown Format**: Canonical structure with conversion utilities

### Integration Status

| Team | Platform | Repository | Submodule Added | Adapter Tested | Export Done | Status |
|------|----------|-----------|-----------------|----------------|-------------|--------|
| Claude | Web | https://github.com/allenlu2009/Japanese-Learning | ⏳ Pending | ⏳ Pending | ⏳ Pending | ✅ Phase 1 Complete |
| Claude | Mobile | https://github.com/allenlu2009/japanese-mobile-claude | ⏳ Pending | ⏳ Pending | ⏳ Pending | ✅ Phase 1 Complete |
| Gemini | Web | TBD | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Phase 1 Complete, 50% Phase 2 |
| Gemini | Mobile | TBD | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Phase 1 Complete, 50% Phase 2 |
| Codex | Web | TBD | ✅ Complete | ✅ Complete | ⏳ Pending | ✅ Phase 1 Complete |
| Codex | Mobile | TBD | ✅ Complete | ✅ Complete | ⏳ Pending | ✅ Phase 1 Complete |

---

## Phase 2: Export/Import Implementation (🔄 IN PROGRESS)

**Timeline**: Week 2-3
**Status**: 🔄 IN PROGRESS (Gemini 50% complete with export done)

### Objectives

- Implement export functionality in all three apps
- Implement import functionality in all three apps
- Enable cross-platform test history transfer
- Validate data integrity during transfers

### Implementation Tasks

#### Task 2.1: Export Functionality

**For Each Team**:

1. **Add Export Button/Menu**
   - Claude Web: Settings page or navigation menu
   - Gemini Mobile: Settings screen
   - Codex Mobile: Settings screen

2. **Implement Export Logic**
   ```typescript
   // Pseudo-code
   function exportTestHistory() {
     // 1. Retrieve all test records from storage
     const tests = getAllTests();

     // 2. Convert to universal format using adapter
     const exportData = createExport(tests, 'claude', 'web');

     // 3. Generate downloadable file
     const filename = `japanese-tests-${timestamp}.json`;
     downloadJSON(exportData, filename);
   }
   ```

3. **File Format**
   - JSON format using `UniversalExport` schema
   - Filename: `japanese-tests-[timestamp].json`
   - Include metadata: version, source, platform

#### Task 2.2: Import Functionality

**For Each Team**:

1. **Add Import Button/File Picker**
   - File type filter: `.json`
   - Clear instructions for users

2. **Implement Import Logic**
   ```typescript
   // Pseudo-code
   function importTestHistory(file: File) {
     // 1. Parse JSON file
     const data = parseJSON(file);

     // 2. Validate format
     if (!validateImport(data)) {
       showError('Invalid file format');
       return;
     }

     // 3. Convert to internal format
     const tests = importToInternalFormat(data);

     // 4. Handle duplicates (by timestamp)
     const newTests = filterDuplicates(tests);

     // 5. Merge with existing data
     mergeTests(newTests);

     // 6. Show success message
     showSuccess(`Imported ${newTests.length} tests`);
   }
   ```

3. **Duplicate Handling**
   - **Primary**: Use test ID for deduplication (unique identifier)
   - **Secondary**: Warn on same timestamp + testType combination
   - Options: Skip duplicates, Overwrite existing, or Merge
   - Show user how many duplicates found and skipped

#### Task 2.3: UI Integration

**Web (Claude)**:
- Add "Export Test History" button to Settings/Analytics page
- Add "Import Test History" file input
- Show export/import status messages

**Mobile (Gemini/Codex)**:
- Add export/import options to Settings screen
- Use native file picker (expo-document-picker or similar)
- Use share dialog for export on mobile

### Testing Matrix

**Cross-Platform Testing** (all 6 combinations):

| Export From | Import To | Test Data | Expected Result | Status |
|-------------|-----------|-----------|-----------------|--------|
| Claude Web | Gemini Mobile | 10 tests | All imported correctly | ⏳ |
| Claude Web | Codex Mobile | 10 tests | All imported correctly | ⏳ |
| Gemini Mobile | Claude Web | 10 tests | All imported correctly | ⏳ |
| Gemini Mobile | Codex Mobile | 10 tests | All imported correctly | ⏳ |
| Codex Mobile | Claude Web | 10 tests | All imported correctly | ⏳ |
| Codex Mobile | Gemini Mobile | 10 tests | All imported correctly | ⏳ |

**Test Cases**:
1. Export empty history (0 tests)
2. Export single test
3. Export 10+ tests with different types
4. Export tests with character breakdowns
5. Import into empty app
6. Import with existing data (duplicates)
7. Import invalid JSON
8. Import wrong schema version

### Success Criteria

- ✅ Export generates valid UniversalExport JSON
- ✅ Import validates schema correctly
- ✅ Timestamps convert correctly (ISO ↔ epoch)
- ✅ TestTypes map correctly between implementations
- ✅ Character breakdowns preserve during transfer
- ✅ No data loss in round-trip export/import
- ✅ Duplicates handled gracefully
- ✅ Error messages clear and helpful

### Deliverables

- Export functionality in all 3 apps
- Import functionality in all 3 apps
- User documentation for export/import
- Test results matrix (all 6 combinations)

---

## Phase 3: Advanced Features (Future)

**Timeline**: Week 4-5
**Status**: 🔮 Planned

### Potential Features

#### 3.1: Sync Service (Optional)
- Cloud storage integration
- Automatic sync across devices
- Conflict resolution

#### 3.2: Analytics Dashboard
- Cross-platform analytics
- Progress tracking over time
- Weak areas identification

#### 3.3: Dataset Expansion
- N3, N2, N1 JLPT levels
- Custom vocabulary lists
- User-contributed datasets

#### 3.4: Social Features
- Share test results
- Compare progress with friends
- Leaderboards

---

## Phase 4: Maintenance & Evolution (Ongoing)

**Timeline**: Continuous
**Status**: 🔄 Ongoing

### Responsibilities

#### Dataset Maintenance
- Regular validation runs
- Community contributions review
- Error corrections
- New dataset additions

#### Schema Evolution
- Version migration support
- Backward compatibility
- New field additions
- Documentation updates

#### Collaboration Protocol
- Pull request reviews
- Issue tracking
- Feature discussions
- Release coordination

---

## Team Responsibilities

### Claude (Web Implementation)
**Repository**: https://github.com/allenlu2009/Japanese-Learning

**Phase 2 Tasks**:
- [ ] Add git submodule for datasets
- [ ] Implement export functionality
- [ ] Implement import functionality
- [ ] Test with Gemini and Codex exports
- [ ] Document user-facing export/import flow

### Gemini (Mobile Implementation)
**Repository**: TBD

**Phase 2 Tasks**:
- [ ] Add git submodule for datasets
- [ ] Complete Gemini adapter (schema/examples/gemini-adapter.ts)
- [ ] Implement export functionality
- [ ] Implement import functionality
- [ ] Test with Claude and Codex exports
- [ ] Document user-facing export/import flow

### Codex (Mobile Implementation)
**Repository**: TBD

**Phase 2 Tasks**:
- [ ] Add git submodule for datasets
- [ ] Implement export functionality (using existing adapter)
- [ ] Implement import functionality (using existing adapter)
- [ ] Test with Claude and Gemini exports
- [ ] Document user-facing export/import flow

---

## Communication & Coordination

### Weekly Check-ins
- Progress updates
- Blocker discussions
- Schema change proposals
- Testing coordination

### Pull Request Protocol
1. Submit PR to japanese-learning-datasets
2. Tag other teams for review
3. Wait for at least 1 approval
4. Merge after approval
5. Notify teams to update submodules

### Issue Tracking
- Use GitHub issues in dataset repository
- Label: bug, enhancement, schema-change, dataset-error
- Assign to relevant team member

---

## Version History

### 1.1.0 (2026-01-11)
**Updates based on Codex and Gemini feedback**:
- ✅ Corrected participants to include all platforms (Web + Mobile for all teams)
- ✅ Updated Phase 1 integration status: Codex and Gemini complete with submodules
- ✅ Noted Gemini 50% complete on Phase 2 (export functionality done)
- ✅ Updated duplicate handling: ID-based as primary, timestamp+testType as secondary
- ✅ Confirmed N4 kanji count: 166 (matches dataset validation)
- ✅ Noted Codex Web implementation uses shared datasets

### 1.0.0 (2026-01-11)
- Initial plan created
- Phase 1 completed
- Phase 2 defined
- Future phases outlined

---

## Appendix

### Key Links

- **Dataset Repository**: https://github.com/allenlu2009/japanese-learning-datasets
- **Claude Web**: https://github.com/allenlu2009/Japanese-Learning
- **Claude Mobile**: https://github.com/allenlu2009/japanese-mobile-claude

### Reference Documents

- `HANDOFF.md` - Phase 1 completion summary
- `CONVENTIONS.md` - Field naming conventions
- `schema/export-schema.ts` - Universal export format
- `schema/examples/` - Adapter implementations

### Contact

For questions or clarifications, create an issue in the dataset repository or reach out to the respective team leads.

---

**Last Updated**: 2026-01-11
**Next Review**: After Phase 2 completion
