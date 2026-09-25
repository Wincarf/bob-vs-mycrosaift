import type { ScenarioScript } from '@/types'

export const passwordResetScenario: ScenarioScript = {
  challenge_id: 'password-reset',
  challenge_name: 'Password Reset Endpoint',
  task_description: 'Build a password reset endpoint with email verification, secure token generation, and expiration handling.',
  rounds: [
    // ═══════════════════════════════════════════════════════════════════════
    // ROUND 1 — Bob builds the initial implementation
    // ═══════════════════════════════════════════════════════════════════════
    {
      round_number: 1,
      bob_phase: {
        summary: 'Initial password reset endpoint implemented with token generation and email dispatch.',
        events: [
          { agent: 'BOB', message: 'Analyzing repository structure...', type: 'info' },
          { agent: 'BOB', message: 'Found: src/auth/, src/users/, src/email/, tests/', type: 'info' },
          { agent: 'BOB', message: 'Existing auth pattern: JWT + bcrypt, Express routes', type: 'info' },
          { agent: 'BOB', message: 'Planning implementation...', type: 'info' },
          { agent: 'BOB', message: 'Plan: POST /auth/forgot-password → generate token → send email', type: 'info' },
          { agent: 'BOB', message: 'Plan: POST /auth/reset-password → validate token → update hash', type: 'info' },
          { agent: 'BOB', message: 'Implementing src/auth/passwordReset.service.ts...', type: 'info' },
          { agent: 'BOB', message: 'Implementing src/auth/passwordReset.routes.ts...', type: 'info' },
          { agent: 'BOB', message: 'Implementing src/email/resetEmail.template.ts...', type: 'info' },
          { agent: 'BOB', message: 'Generating unit tests...', type: 'info' },
          { agent: 'BOB', message: 'Running test suite...', type: 'info' },
          { agent: 'BOB', message: '✓ PASS  test_forgot_password_sends_email', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_reset_password_updates_hash', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_invalid_token_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_nonexistent_email_returns_200', type: 'success' },
          { agent: 'BOB', message: 'All 4 tests passed. Build complete.', type: 'success' },
        ],
        diffs: [
          {
            filename: 'src/auth/passwordReset.service.ts',
            language: 'typescript',
            description: 'Password reset service — token generation and validation',
            before: '// file did not exist',
            after: `import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { sendEmail } from '../email/emailService';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.users.findByEmail(email);
  // Return 200 even if user not found (security: don't leak emails)
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await db.resetTokens.create({
    userId: user.id,
    token,
    expiresAt,
  });

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    body: \`Click to reset: https://app.example.com/reset?token=\${token}\`,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await db.resetTokens.findByToken(token);

  if (!record) {
    throw new Error('Invalid or expired token');
  }

  if (record.expiresAt < new Date()) {
    throw new Error('Token has expired');
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await db.users.updatePassword(record.userId, hash);

  // BUG: token is never invalidated after use
}`,
          },
          {
            filename: 'src/auth/passwordReset.routes.ts',
            language: 'typescript',
            description: 'Express routes for password reset endpoints',
            before: '// file did not exist',
            after: `import { Router } from 'express';
import { requestPasswordReset, resetPassword } from './passwordReset.service';

const router = Router();

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  await requestPasswordReset(email);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await resetPassword(token, newPassword);
    res.json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    // BUG: leaks internal error message directly to client
    res.status(400).json({ error: err.message });
  }
});

export default router;`,
          },
          {
            filename: 'tests/passwordReset.test.ts',
            language: 'typescript',
            description: 'Initial unit tests for password reset',
            before: '// file did not exist',
            after: `import { requestPasswordReset, resetPassword } from '../src/auth/passwordReset.service';

describe('Password Reset', () => {
  test('test_forgot_password_sends_email', async () => {
    const mockUser = { id: '1', email: 'user@example.com' };
    // ... mock setup
    await expect(requestPasswordReset('user@example.com')).resolves.not.toThrow();
  });

  test('test_reset_password_updates_hash', async () => {
    // ... uses a valid token
    await expect(resetPassword('valid-token', 'NewP@ssw0rd!')).resolves.not.toThrow();
  });

  test('test_invalid_token_rejected', async () => {
    await expect(resetPassword('bad-token', 'pass')).rejects.toThrow('Invalid or expired token');
  });

  test('test_nonexistent_email_returns_200', async () => {
    await expect(requestPasswordReset('nobody@example.com')).resolves.not.toThrow();
  });
});`,
          },
        ],
        test_result: {
          total: 4,
          passed: 4,
          failed: 0,
          skipped: 0,
          duration_ms: 1340,
          test_cases: [
            { name: 'test_forgot_password_sends_email', status: 'pass', duration_ms: 312 },
            { name: 'test_reset_password_updates_hash', status: 'pass', duration_ms: 288 },
            { name: 'test_invalid_token_rejected', status: 'pass', duration_ms: 401 },
            { name: 'test_nonexistent_email_returns_200', status: 'pass', duration_ms: 339 },
          ],
        },
      },
      mycrosaift_phase: {
        summary: 'Found 3 issues: token reuse (CRITICAL), missing rate limiting (HIGH), error message leakage (LOW).',
        has_critical: true,
        reproduction_tests_created: [
          'test_token_can_be_reused_after_reset',
          'test_brute_force_reset_endpoint',
        ],
        findings: [
          {
            id: 'FINDING-01',
            round_discovered: 1,
            category: 'Security',
            severity: 'CRITICAL',
            title: 'Password reset token reuse after successful reset',
            description:
              'The resetPassword() function validates the token and updates the password, but never invalidates the token record. An attacker who intercepts a used reset token can reuse it to change the password again at any time.',
            affected_file: 'src/auth/passwordReset.service.ts',
            affected_function: 'resetPassword()',
            evidence:
              'Line 38: await db.users.updatePassword(record.userId, hash);\n// No call to db.resetTokens.invalidate() or db.resetTokens.delete()\n// Token remains VALID and REUSABLE indefinitely after use.',
            reproduction_test: `test('test_token_can_be_reused_after_reset', async () => {
  const token = await generateResetToken('victim@example.com');
  
  // First reset — legitimate
  await resetPassword(token, 'NewPassword1!');
  
  // Second reset using the SAME token — should throw, but doesn't
  await expect(
    resetPassword(token, 'AttackerPassword!')
  ).rejects.toThrow(); // FAILS: resolves instead
});`,
            recommended_fix:
              'After updating the password, immediately delete or invalidate the token:\nawait db.resetTokens.deleteByToken(token);\nAlso consider deleting all tokens for that user to invalidate parallel sessions.',
            status: 'OPEN',
          },
          {
            id: 'FINDING-02',
            round_discovered: 1,
            category: 'Security',
            severity: 'HIGH',
            title: 'No rate limiting on password reset endpoint',
            description:
              'POST /forgot-password has no rate limiting. An attacker can submit thousands of requests per second to the same email address, flooding the victim\'s inbox and exhausting token storage. This is a classic account harassment and DoS vector.',
            affected_file: 'src/auth/passwordReset.routes.ts',
            affected_function: 'POST /forgot-password handler',
            evidence:
              'No rate-limit middleware present in passwordReset.routes.ts.\nNo IP-based throttle.\nNo per-email cooldown period.\nStress test: 1000 req/s sustained with no throttling.',
            reproduction_test: `test('test_brute_force_reset_endpoint', async () => {
  const requests = Array.from({ length: 100 }, () =>
    fetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'victim@example.com' }),
    })
  );
  const responses = await Promise.all(requests);
  const allOk = responses.every(r => r.status === 200);
  // All 100 requests succeed — no throttling
  expect(allOk).toBe(true); // Should be false after fix
});`,
            recommended_fix:
              'Add express-rate-limit middleware:\n- 5 requests per 15 minutes per IP\n- 3 requests per hour per email address\nReturn HTTP 429 with Retry-After header on breach.',
            status: 'OPEN',
          },
          {
            id: 'FINDING-03',
            round_discovered: 1,
            category: 'Security',
            severity: 'LOW',
            title: 'Internal error messages leaked to client',
            description:
              'The reset-password route catches errors and returns err.message directly in the JSON response. This can expose internal implementation details like database error messages, stack traces, or token structure information.',
            affected_file: 'src/auth/passwordReset.routes.ts',
            affected_function: 'POST /reset-password handler',
            evidence:
              'Line 17: res.status(400).json({ error: err.message });\nIf db throws: "relation \\"reset_tokens\\" does not exist" — leaked.\nIf bcrypt throws: "data and salt arguments required" — leaked.',
            reproduction_test: `test('test_db_error_not_leaked', async () => {
  // Simulate a DB failure
  mockDb.resetTokens.findByToken.mockRejectedValue(
    new Error('FATAL: connection to database lost at 192.168.1.5:5432')
  );
  const res = await request(app)
    .post('/auth/reset-password')
    .send({ token: 'any', newPassword: 'pass' });
  
  // Should return generic message, not internal DB error
  expect(res.body.error).not.toContain('192.168.1.5');
  expect(res.body.error).toBe('An error occurred. Please try again.');
});`,
            recommended_fix:
              'Replace err.message with a generic safe error message:\nres.status(400).json({ error: \'Invalid or expired reset link.\' })\nLog the full error server-side only.',
            status: 'OPEN',
          },
        ],
        events: [
          { agent: 'MYCROSAIFT', message: 'Starting adversarial analysis of Bob\'s implementation...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'Reading src/auth/passwordReset.service.ts', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'Reading src/auth/passwordReset.routes.ts', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'Checking token lifecycle... suspicious.', type: 'warning' },
          { agent: 'MYCROSAIFT', message: 'FINDING-01: Token not invalidated after use! Creating reproduction test...', type: 'warning' },
          { agent: 'MYCROSAIFT', message: '✗ FAIL  test_token_can_be_reused_after_reset — VULNERABILITY CONFIRMED', type: 'error' },
          { agent: 'MYCROSAIFT', message: 'Checking rate limiting on /forgot-password...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'FINDING-02: No rate limiting. Sending 100 concurrent requests...', type: 'warning' },
          { agent: 'MYCROSAIFT', message: '✗ FAIL  test_brute_force_reset_endpoint — All 100 requests accepted', type: 'error' },
          { agent: 'MYCROSAIFT', message: 'Checking error handling...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'FINDING-03: err.message leaked directly to client', type: 'warning' },
          { agent: 'MYCROSAIFT', message: 'Analysis complete. 3 issues found (1 CRITICAL, 1 HIGH, 1 LOW).', type: 'error' },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ROUND 2 — Bob fixes all 3 issues; Mycrosaift finds 1 more
    // ═══════════════════════════════════════════════════════════════════════
    {
      round_number: 2,
      bob_phase: {
        summary: 'Fixed token invalidation, added rate limiting, sanitized error messages. 3 new tests added.',
        events: [
          { agent: 'BOB', message: 'Received 3 findings from Mycrosaift. Reviewing...', type: 'info' },
          { agent: 'BOB', message: 'FINDING-01 [CRITICAL] — Token reuse. Fixing now...', type: 'warning' },
          { agent: 'BOB', message: 'Updating resetPassword() to delete token after use', type: 'info' },
          { agent: 'BOB', message: 'FINDING-02 [HIGH] — No rate limiting. Adding express-rate-limit...', type: 'warning' },
          { agent: 'BOB', message: 'Adding IP + email-level rate limiting middleware', type: 'info' },
          { agent: 'BOB', message: 'FINDING-03 [LOW] — Error message leak. Sanitizing responses...', type: 'info' },
          { agent: 'BOB', message: 'Replacing err.message with generic safe message', type: 'info' },
          { agent: 'BOB', message: 'Adding 3 new tests for fixed behavior...', type: 'info' },
          { agent: 'BOB', message: 'Running full test suite (7 tests)...', type: 'info' },
          { agent: 'BOB', message: '✓ PASS  test_forgot_password_sends_email', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_reset_password_updates_hash', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_invalid_token_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_nonexistent_email_returns_200', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_token_cannot_be_reused_after_reset', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_rate_limit_triggers_on_excess_requests', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_generic_error_returned_on_failure', type: 'success' },
          { agent: 'BOB', message: 'All 7 tests passed. Fixes applied.', type: 'success' },
        ],
        diffs: [
          {
            filename: 'src/auth/passwordReset.service.ts',
            language: 'typescript',
            description: 'Fix FINDING-01: invalidate token after successful reset',
            before: `  const hash = await bcrypt.hash(newPassword, 12);
  await db.users.updatePassword(record.userId, hash);

  // BUG: token is never invalidated after use
}`,
            after: `  const hash = await bcrypt.hash(newPassword, 12);
  await db.users.updatePassword(record.userId, hash);

  // Fix FINDING-01: invalidate the token immediately after use
  await db.resetTokens.deleteByToken(token);
  // Also clear any other pending tokens for this user
  await db.resetTokens.deleteByUserId(record.userId);
}`,
          },
          {
            filename: 'src/auth/passwordReset.routes.ts',
            language: 'typescript',
            description: 'Fix FINDING-02 and FINDING-03: add rate limiting and sanitize errors',
            before: `import { Router } from 'express';
import { requestPasswordReset, resetPassword } from './passwordReset.service';

const router = Router();

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  await requestPasswordReset(email);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await resetPassword(token, newPassword);
    res.json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    // BUG: leaks internal error message directly to client
    res.status(400).json({ error: err.message });
  }
});

export default router;`,
            after: `import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requestPasswordReset, resetPassword } from './passwordReset.service';
import { logger } from '../logger';

const router = Router();

// Fix FINDING-02: rate limit — 5 requests per 15 minutes per IP
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/forgot-password', resetLimiter, async (req, res) => {
  const { email } = req.body;
  await requestPasswordReset(email);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    await resetPassword(token, newPassword);
    res.json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    // Fix FINDING-03: log internally, return generic message
    logger.error('Password reset failed', { error: err.message });
    res.status(400).json({ error: 'Invalid or expired reset link.' });
  }
});

export default router;`,
          },
        ],
        test_result: {
          total: 7,
          passed: 7,
          failed: 0,
          skipped: 0,
          duration_ms: 2180,
          test_cases: [
            { name: 'test_forgot_password_sends_email', status: 'pass', duration_ms: 298 },
            { name: 'test_reset_password_updates_hash', status: 'pass', duration_ms: 312 },
            { name: 'test_invalid_token_rejected', status: 'pass', duration_ms: 389 },
            { name: 'test_nonexistent_email_returns_200', status: 'pass', duration_ms: 287 },
            { name: 'test_token_cannot_be_reused_after_reset', status: 'pass', duration_ms: 356 },
            { name: 'test_rate_limit_triggers_on_excess_requests', status: 'pass', duration_ms: 278 },
            { name: 'test_generic_error_returned_on_failure', status: 'pass', duration_ms: 260 },
          ],
        },
      },
      mycrosaift_phase: {
        summary: 'FINDING-01/02/03 confirmed fixed. Found 1 new issue: missing password complexity validation (MEDIUM).',
        has_critical: true,
        reproduction_tests_created: ['test_weak_password_accepted'],
        findings: [
          {
            id: 'FINDING-04',
            round_discovered: 2,
            category: 'Functional',
            severity: 'MEDIUM',
            title: 'No password complexity validation on reset',
            description:
              'The resetPassword() function accepts any string as a new password, including single-character passwords like "a" or empty strings. This undermines the purpose of having authentication at all.',
            affected_file: 'src/auth/passwordReset.service.ts',
            affected_function: 'resetPassword()',
            evidence:
              'No validation of newPassword before hashing.\nbcrypt.hash("a", 12) succeeds silently.\nUser account is now protected by a 1-character password.',
            reproduction_test: `test('test_weak_password_accepted', async () => {
  const token = await generateResetToken('user@example.com');
  
  // Single character password — should be rejected
  await expect(
    resetPassword(token, 'a')
  ).rejects.toThrow('Password does not meet complexity requirements');
  // FAILS: resolves instead, sets password to 'a'
});`,
            recommended_fix:
              'Add password complexity validation before hashing:\n- Minimum 8 characters\n- At least 1 uppercase, 1 lowercase, 1 number\n- Reject previously used passwords (optional, recommended)\nThrow a descriptive error if validation fails.',
            status: 'OPEN',
          },
        ],
        events: [
          { agent: 'MYCROSAIFT', message: 'Retesting Round 1 findings...', type: 'info' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_token_cannot_be_reused_after_reset — FINDING-01 FIXED', type: 'success' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_rate_limit_triggers_on_excess_requests — FINDING-02 FIXED', type: 'success' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_generic_error_returned_on_failure — FINDING-03 FIXED', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'Probing deeper... checking password validation...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'FINDING-04: Attempting to set password to "a"...', type: 'warning' },
          { agent: 'MYCROSAIFT', message: '✗ FAIL  test_weak_password_accepted — Single-char password accepted!', type: 'error' },
          { agent: 'MYCROSAIFT', message: 'Analysis complete. 1 new issue found (MEDIUM). 3 fixed.', type: 'warning' },
        ],
      },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ROUND 3 — Bob fixes final issue; Mycrosaift clears all
    // ═══════════════════════════════════════════════════════════════════════
    {
      round_number: 3,
      bob_phase: {
        summary: 'Added password complexity validation with clear requirements. 2 new tests. All 9 tests pass.',
        events: [
          { agent: 'BOB', message: 'Received 1 finding from Mycrosaift. Reviewing...', type: 'info' },
          { agent: 'BOB', message: 'FINDING-04 [MEDIUM] — No password complexity check.', type: 'warning' },
          { agent: 'BOB', message: 'Adding validatePassword() utility...', type: 'info' },
          { agent: 'BOB', message: 'Integrating validation in resetPassword()...', type: 'info' },
          { agent: 'BOB', message: 'Adding 2 new tests for complexity rules...', type: 'info' },
          { agent: 'BOB', message: 'Running full test suite (9 tests)...', type: 'info' },
          { agent: 'BOB', message: '✓ PASS  test_forgot_password_sends_email', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_reset_password_updates_hash', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_invalid_token_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_nonexistent_email_returns_200', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_token_cannot_be_reused_after_reset', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_rate_limit_triggers_on_excess_requests', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_generic_error_returned_on_failure', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_weak_password_rejected', type: 'success' },
          { agent: 'BOB', message: '✓ PASS  test_strong_password_accepted', type: 'success' },
          { agent: 'BOB', message: 'All 9 tests passed. Implementation complete.', type: 'success' },
        ],
        diffs: [
          {
            filename: 'src/auth/passwordReset.service.ts',
            language: 'typescript',
            description: 'Fix FINDING-04: add password complexity validation',
            before: `export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await db.resetTokens.findByToken(token);

  if (!record) {
    throw new Error('Invalid or expired token');
  }

  if (record.expiresAt < new Date()) {
    throw new Error('Token has expired');
  }

  const hash = await bcrypt.hash(newPassword, 12);`,
            after: `const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$/;

function validatePassword(password: string): void {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
    );
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // Fix FINDING-04: validate complexity before any DB operation
  validatePassword(newPassword);

  const record = await db.resetTokens.findByToken(token);

  if (!record) {
    throw new Error('Invalid or expired token');
  }

  if (record.expiresAt < new Date()) {
    throw new Error('Token has expired');
  }

  const hash = await bcrypt.hash(newPassword, 12);`,
          },
        ],
        test_result: {
          total: 9,
          passed: 9,
          failed: 0,
          skipped: 0,
          duration_ms: 2740,
          test_cases: [
            { name: 'test_forgot_password_sends_email', status: 'pass', duration_ms: 302 },
            { name: 'test_reset_password_updates_hash', status: 'pass', duration_ms: 318 },
            { name: 'test_invalid_token_rejected', status: 'pass', duration_ms: 278 },
            { name: 'test_nonexistent_email_returns_200', status: 'pass', duration_ms: 299 },
            { name: 'test_token_cannot_be_reused_after_reset', status: 'pass', duration_ms: 345 },
            { name: 'test_rate_limit_triggers_on_excess_requests', status: 'pass', duration_ms: 265 },
            { name: 'test_generic_error_returned_on_failure', status: 'pass', duration_ms: 271 },
            { name: 'test_weak_password_rejected', status: 'pass', duration_ms: 388 },
            { name: 'test_strong_password_accepted', status: 'pass', duration_ms: 274 },
          ],
        },
      },
      mycrosaift_phase: {
        summary: 'All 4 findings confirmed fixed. No critical or high-severity issues remaining. Implementation validated.',
        has_critical: false,
        reproduction_tests_created: [],
        findings: [],
        events: [
          { agent: 'MYCROSAIFT', message: 'Running final adversarial validation...', type: 'info' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_token_cannot_be_reused_after_reset — FINDING-01 VERIFIED', type: 'success' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_rate_limit_triggers_on_excess_requests — FINDING-02 VERIFIED', type: 'success' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_generic_error_returned_on_failure — FINDING-03 VERIFIED', type: 'success' },
          { agent: 'MYCROSAIFT', message: '✓ PASS  test_weak_password_rejected — FINDING-04 VERIFIED', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'Probing for additional attack vectors...', type: 'info' },
          { agent: 'MYCROSAIFT', message: 'Token generation: crypto.randomBytes(32) — entropy sufficient', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'Token expiration: 1 hour TTL enforced', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'Email enumeration: non-existent emails return 200', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'Password hashing: bcrypt with cost factor 12', type: 'success' },
          { agent: 'MYCROSAIFT', message: 'No critical or high-severity issues found.', type: 'success' },
          { agent: 'MYCROSAIFT', message: '🏆 IMPLEMENTATION VALIDATED — adversarial review passed.', type: 'success' },
        ],
      },
    },
  ],
}
