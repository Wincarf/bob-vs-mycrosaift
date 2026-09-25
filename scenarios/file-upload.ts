import type { ScenarioScript } from '@/types'

export const fileUploadScenario: ScenarioScript = {
  challenge_id: 'file-upload',
  challenge_name: 'File Upload Endpoint',
  task_description: 'Add an API endpoint for file uploads with type validation and size limits.',
  rounds: [
    {
      round_number: 1,
      bob_phase: {
        summary: 'File upload endpoint implemented with multer. Basic type and size checks added.',
        events: [
          { agent: 'BOB', message: 'Analyzing repository...', type: 'info' },
          { agent: 'BOB', message: 'Implementing src/upload/upload.service.ts...', type: 'info' },
          { agent: 'BOB', message: 'Implementing src/upload/upload.routes.ts...', type: 'info' },
          { agent: 'BOB', message: 'Generating tests...', type: 'info' },
          { agent: 'BOB', message: '✓ PASS  test_valid_image_upload', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_file_too_large_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_invalid_mime_type_rejected', type: 'success' },
          { agent: 'BOB', message: 'All 3 tests passed. Build complete.', type: 'success' },
        ],
        diffs: [
          {
            filename: 'src/upload/upload.service.ts',
            language: 'typescript',
            description: 'File upload service with multer configuration',
            before: '// file did not exist',
            after: `import multer from 'multer';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      // BUG: uses original filename directly — path traversal risk
      cb(null, file.originalname);
    },
  }),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});`,
          },
        ],
        test_result: {
          total: 3,
          passed: 3,
          failed: 0,
          skipped: 0,
          duration_ms: 890,
          test_cases: [
            { name: 'test_valid_image_upload', status: 'pass', duration_ms: 312 },
            { name: 'test_file_too_large_rejected', status: 'pass', duration_ms: 288 },
            { name: 'test_invalid_mime_type_rejected', status: 'pass', duration_ms: 290 },
          ],
        },
      },
      mycrosaift_phase: {
        summary: 'Found 2 issues: path traversal via original filename (CRITICAL), MIME type spoofing (HIGH).',
        has_critical: true,
        reproduction_tests_created: ['test_path_traversal_via_filename', 'test_mime_type_spoofed'],
        findings: [
          {
            id: 'FINDING-01',
            round_discovered: 1,
            category: 'Security',
            severity: 'CRITICAL',
            title: 'Path traversal via original filename',
            description:
              'The upload service uses file.originalname directly as the stored filename without sanitization. An attacker can upload a file named "../../etc/passwd" to overwrite arbitrary system files.',
            affected_file: 'src/upload/upload.service.ts',
            affected_function: 'multer diskStorage.filename()',
            evidence: 'cb(null, file.originalname); // no sanitization\nPoC: POST /upload with filename="../../etc/cron.d/backdoor"',
            reproduction_test: `test('test_path_traversal_via_filename', async () => {
  const res = await request(app)
    .post('/upload')
    .attach('file', Buffer.from('malicious'), {
      filename: '../../etc/cron.d/backdoor',
      contentType: 'image/jpeg',
    });
  // File should be rejected or stored safely
  expect(res.status).toBe(400); // FAILS: returns 200
});`,
            recommended_fix: 'Use crypto.randomUUID() + sanitized extension as the stored filename:\nconst ext = path.extname(file.originalname).toLowerCase();\ncb(null, `${crypto.randomUUID()}${ext}`);',
            status: 'OPEN',
          },
          {
            id: 'FINDING-02',
            round_discovered: 1,
            category: 'Security',
            severity: 'HIGH',
            title: 'MIME type can be spoofed via Content-Type header',
            description:
              'The fileFilter only checks file.mimetype, which comes from the client\'s Content-Type header. An attacker can upload a PHP shell with Content-Type: image/jpeg and bypass the type check.',
            affected_file: 'src/upload/upload.service.ts',
            affected_function: 'multer fileFilter()',
            evidence: 'file.mimetype is client-controlled.\nPoC: upload shell.php with header Content-Type: image/jpeg — accepted.',
            reproduction_test: `test('test_mime_type_spoofed', async () => {
  const phpShell = Buffer.from('<?php system($_GET["cmd"]); ?>');
  const res = await request(app)
    .post('/upload')
    .attach('file', phpShell, {
      filename: 'shell.php',
      contentType: 'image/jpeg', // spoofed
    });
  expect(res.status).toBe(400); // FAILS: returns 200
});`,
            recommended_fix: 'Use the file-type library to inspect the actual magic bytes of the uploaded file, not the client-supplied MIME type.',
            status: 'OPEN',
          },
        ],
        events: [
          { agent: 'MYCROSAIFT', message: 'Starting adversarial analysis...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'Checking filename handling...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'FINDING-01: Path traversal via originalname!', type: 'error' },
          { agent: 'MYCROSAIFT', message: '✗ FAIL  test_path_traversal_via_filename — CRITICAL', type: 'error' },
          { agent: 'MYCROSAIFT', message: 'Checking MIME type validation...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'FINDING-02: MIME type is client-controlled header only', type: 'warning' },
          { agent: 'MYCROSAIFT', message: '✗ FAIL  test_mime_type_spoofed — File accepted', type: 'error' },
          { agent: 'MYCROSAIFT', message: '2 issues found (1 CRITICAL, 1 HIGH).', type: 'error' },
        ],
      },
    },
    {
      round_number: 2,
      bob_phase: {
        summary: 'Fixed path traversal with UUID filenames. Added magic-byte MIME validation. All 5 tests pass.',
        events: [
          { agent: 'BOB', message: 'Received 2 findings. Applying fixes...', type: 'info' },
          { agent: 'BOB', message: 'FINDING-01: Replacing originalname with UUID + sanitized ext', type: 'info' },
          { agent: 'BOB', message: 'FINDING-02: Adding file-type magic-byte validation', type: 'info' },
          { agent: 'BOB', message: 'Running full test suite (5 tests)...', type: 'info' },
          { agent: 'BOB', message: '✓ PASS  test_valid_image_upload', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_file_too_large_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_invalid_mime_type_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_path_traversal_via_filename', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_mime_type_spoofed', type: 'success' },
          { agent: 'BOB', message: 'All 5 tests passed.', type: 'success' },
        ],
        diffs: [
          {
            filename: 'src/upload/upload.service.ts',
            language: 'typescript',
            description: 'Fix path traversal and MIME spoofing',
            before: `    filename: (req, file, cb) => {
      // BUG: uses original filename directly — path traversal risk
      cb(null, file.originalname);
    },`,
            after: `    filename: (req, file, cb) => {
      // Fix FINDING-01: use random UUID + sanitized extension
      const ext = path.extname(file.originalname).replace(/[^.a-z0-9]/gi, '').slice(0, 5);
      cb(null, \`\${crypto.randomUUID()}.\${ext}\`);
    },`,
          },
        ],
        test_result: {
          total: 5,
          passed: 5,
          failed: 0,
          skipped: 0,
          duration_ms: 1420,
          test_cases: [
            { name: 'test_valid_image_upload', status: 'pass', duration_ms: 302 },
            { name: 'test_file_too_large_rejected', status: 'pass', duration_ms: 278 },
            { name: 'test_invalid_mime_type_rejected', status: 'pass', duration_ms: 288 },
            { name: 'test_path_traversal_via_filename', status: 'pass', duration_ms: 289 },
            { name: 'test_mime_type_spoofed', status: 'pass', duration_ms: 263 },
          ],
        },
      },
      mycrosaift_phase: {
        summary: 'Both findings confirmed fixed. No critical or high-severity issues. Implementation validated.',
        has_critical: false,
        reproduction_tests_created: [],
        findings: [],
        events: [
          { agent: 'MYCROSAIFT', message: 'Retesting...', type: 'info' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_path_traversal_via_filename — FINDING-01 VERIFIED', type: 'success' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_mime_type_spoofed — FINDING-02 VERIFIED', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'No additional vulnerabilities found.', type: 'success' },
          { agent: 'MYCROSAIFT', message: '🏆 IMPLEMENTATION VALIDATED.', type: 'success' },
        ],
      },
    },
  ],
}
