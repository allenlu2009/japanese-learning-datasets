# Data Synchronization Strategy

## Current State ✅

**All implementations have:**
- ✅ Web version with import/export (Universal v1.0)
- ✅ Mobile version with import/export (Universal v1.0)
- ✅ Cross-platform compatibility
- ✅ Non-destructive import with deduplication

**Current Limitation:**
- ⚠️ Manual sync only (download file → transfer → import)
- ⚠️ No automatic synchronization
- ⚠️ No cloud storage

---

## Next Steps - Sync Options

### Option 1: Manual File-Based Sync (Current - Keep as Fallback)

**How it works:**
1. Export from Device A → JSON file
2. Transfer file (email, drive, airdrop, etc.)
3. Import to Device B

**Pros:**
- ✅ Already working
- ✅ No server needed
- ✅ Full user control
- ✅ Works offline
- ✅ No costs

**Cons:**
- ❌ Manual process
- ❌ Easy to forget
- ❌ File management overhead

**Status:** Keep as backup option

---

### Option 2: Cloud Storage Integration (Recommended for MVP)

**Providers:**
- Google Drive
- Dropbox
- iCloud (Apple only)

**How it works:**
1. User connects their cloud storage account
2. App auto-exports to cloud folder on changes
3. Other devices auto-import from cloud folder
4. Conflict resolution for simultaneous edits

**Implementation:**

#### Web Version:
```typescript
// Google Drive API integration
import { gapi } from 'gapi-script';

async function autoExportToGoogleDrive() {
  const exportData = exportToUniversalFormat();

  await gapi.client.drive.files.create({
    resource: {
      name: 'japanese-learning-sync.json',
      parents: ['appDataFolder'] // Hidden app folder
    },
    media: {
      mimeType: 'application/json',
      body: exportData
    }
  });
}

async function autoImportFromGoogleDrive() {
  const response = await gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    q: "name='japanese-learning-sync.json'"
  });

  if (response.result.files.length > 0) {
    const fileId = response.result.files[0].id;
    const file = await gapi.client.drive.files.get({
      fileId,
      alt: 'media'
    });

    importFromUniversalFormat(file.body);
  }
}
```

#### Mobile Version:
```typescript
// React Native Google Drive
import RNGoogleDrive from '@robinbobin/react-native-google-drive-api-wrapper';

async function autoExportToGoogleDrive() {
  const gdrive = new RNGoogleDrive();
  await gdrive.accessToken = await getAccessToken();

  const exportData = await exportToFile();

  await gdrive.files.createFileMultipart(
    exportData,
    'application/json',
    {
      parents: ['appDataFolder'],
      name: 'japanese-learning-sync.json'
    }
  );
}
```

**Pros:**
- ✅ Automatic sync
- ✅ No backend server needed
- ✅ Users already have accounts
- ✅ Free tier sufficient
- ✅ Cross-platform (Google Drive)

**Cons:**
- ⚠️ Requires OAuth setup
- ⚠️ User must grant permissions
- ⚠️ Conflict resolution needed

**Cost:** Free

---

### Option 3: Firebase/Supabase Backend (Best Long-term Solution)

**How it works:**
1. User creates account
2. Data syncs to cloud database
3. Real-time sync across all devices
4. Proper conflict resolution

**Firebase Realtime Database:**
```typescript
// Structure
/users/{userId}/tests/{testId}
/users/{userId}/attempts/{attemptId}
/users/{userId}/lastSync

// Auto-sync on write
const db = getDatabase();
const testsRef = ref(db, `users/${userId}/tests`);

onValue(testsRef, (snapshot) => {
  const tests = snapshot.val();
  // Merge with local data
  mergeTests(tests);
});

// Write test
await set(ref(db, `users/${userId}/tests/${testId}`), testData);
```

**Pros:**
- ✅ Real-time sync
- ✅ Proper multi-device support
- ✅ Built-in auth
- ✅ Offline support
- ✅ Conflict resolution
- ✅ Analytics & monitoring

**Cons:**
- ❌ Backend infrastructure needed
- ❌ User accounts required
- ❌ More complex implementation
- ❌ Potential costs at scale

**Cost:**
- Firebase: Free tier (1GB storage, 10GB/month transfer)
- Supabase: Free tier (500MB DB, 2GB transfer)

---

### Option 4: Hybrid Approach (Recommended)

Combine manual + cloud storage:

**Phase 1 (Immediate - 1-2 weeks):**
- ✅ Keep manual export/import (already working)
- ✅ Add "Auto-sync with Google Drive" toggle in settings
- ✅ Implement background sync (every 5 minutes when connected)
- ✅ Show sync status indicator

**Phase 2 (Future - 1-2 months):**
- 🔄 Add conflict resolution UI
- 🔄 Support Dropbox/iCloud
- 🔄 Sync history/version control

**Phase 3 (Long-term - 3-6 months):**
- 🔮 Optional Firebase backend for users who want it
- 🔮 User accounts & authentication
- 🔮 Real-time collaboration features

---

## Recommended Implementation Plan

### Immediate (This Week)

1. **Add Sync Settings Page**
   - Toggle: "Auto-sync with Google Drive"
   - Status: Last synced time
   - Manual "Sync Now" button

2. **Implement Google Drive Sync (Web)**
   ```bash
   npm install gapi-script
   ```
   - OAuth setup
   - Auto-export on test completion
   - Auto-import on app start
   - Background sync every 5 minutes

3. **Implement Google Drive Sync (Mobile)**
   ```bash
   npm install @robinbobin/react-native-google-drive-api-wrapper
   ```
   - Same logic as web
   - Background sync when app is active

### Next Week

4. **Conflict Resolution**
   - Last-write-wins for simple cases
   - Merge strategy: Import keeps both if IDs differ
   - Show warning if major conflicts detected

5. **Sync Indicator**
   - Green: Synced
   - Yellow: Syncing...
   - Red: Sync failed
   - Gray: Sync disabled

### Testing Strategy

1. Test on same device (web ↔ mobile)
2. Test cross-device (Device A ↔ Device B)
3. Test offline → online sync
4. Test conflict scenarios

---

## File Structure for Cloud Sync

```
/Google Drive/AppData/japanese-learning/
├── sync.json                    # Main sync file (Universal v1.0)
├── metadata.json                # Sync metadata
└── backups/
    ├── sync-2026-01-17.json    # Daily backups
    └── sync-2026-01-16.json
```

**sync.json** (Universal v1.0 format):
```json
{
  "version": "1.0",
  "exportedAt": "2026-01-17T10:00:00Z",
  "lastSyncedBy": "web",  // or "mobile"
  "deviceId": "uuid",
  "tests": [...],
  "attempts": [...],
  "settings": {...},
  "meta": {...}
}
```

**metadata.json**:
```json
{
  "lastSyncTime": "2026-01-17T10:00:00Z",
  "devicesSynced": ["web-device-1", "mobile-device-1"],
  "syncVersion": "1.0",
  "conflictHistory": []
}
```

---

## Implementation Checklist

### Google Drive Integration (Web)

- [ ] Set up Google Cloud Project
- [ ] Enable Google Drive API
- [ ] Create OAuth 2.0 credentials
- [ ] Add OAuth consent screen
- [ ] Implement Google Sign-In
- [ ] Implement file upload/download
- [ ] Add sync logic
- [ ] Add UI indicators
- [ ] Test sync flow

### Google Drive Integration (Mobile)

- [ ] Install React Native Google Drive library
- [ ] Configure OAuth for mobile
- [ ] Implement authentication flow
- [ ] Implement file operations
- [ ] Add background sync
- [ ] Add UI indicators
- [ ] Test sync flow

### Conflict Resolution

- [ ] Detect conflicts (same ID, different data)
- [ ] Implement merge strategy
- [ ] Add conflict resolution UI
- [ ] Test conflict scenarios

### Settings Page

- [ ] Add sync toggle
- [ ] Add sync status display
- [ ] Add "Sync Now" button
- [ ] Add "Last synced" timestamp
- [ ] Add connected account display

---

## Alternative: Shared Folder Approach

**Simpler option without OAuth:**

1. User manually shares a folder between devices
2. App writes to that folder
3. App reads from that folder

**Pros:**
- ✅ No OAuth complexity
- ✅ User controls where data lives

**Cons:**
- ❌ Still requires manual setup
- ❌ Less automatic than OAuth approach

---

## Security Considerations

1. **Encryption at Rest**
   - Encrypt sync file before uploading
   - User provides encryption key (or derive from password)

2. **Privacy**
   - Use appDataFolder (hidden from user's main Drive)
   - Don't store PII

3. **Authentication**
   - OAuth 2.0 for Drive access
   - Refresh tokens for persistent auth

---

## Cost Estimate

**Google Drive Sync (Recommended):**
- Development time: 2-3 weeks
- Ongoing cost: $0 (free tier)
- User cost: $0

**Firebase Backend:**
- Development time: 4-6 weeks
- Ongoing cost: $0-25/month (depending on users)
- User cost: $0

---

## Recommendation

**Start with Google Drive Integration (Option 2 / Phase 1):**

1. Implement auto-sync with Google Drive for web and mobile
2. Keep manual export/import as fallback
3. Add conflict detection and simple merge strategy
4. Monitor usage and user feedback

**Then evaluate:**
- If sync works well → stay with Google Drive
- If more features needed → migrate to Firebase

This gives you automatic sync without backend infrastructure, while keeping the door open for a full backend solution later.
