# JWT Authentication Issue #79 - Testing & Verification Guide

## Pre-Deployment Testing Checklist

Complete these tests before considering the fix ready for production.

---

## Phase 1: Unit Testing

### Step 1: Install Dependencies
- [ ] Navigate to server directory: `cd server`
- [ ] Run: `npm install`
- [ ] Run: `npm install --save-dev vitest supertest`
- [ ] Verify installation: `npm list vitest supertest`

### Step 2: Run Test Suite
- [ ] Run all tests: `npm test`
- [ ] Verify all tests pass
- [ ] Check test output for failures
- [ ] Review coverage report: `npm test:coverage`

### Step 3: Test Structure
- [ ] Verify test file exists: `server/test/jwt-auth.test.js`
- [ ] Verify integration tests exist: `server/test/jwt-integration.test.js`
- [ ] Check test count: Should have 40+ tests
- [ ] All tests in "passing" state

---

## Phase 2: Manual Token Testing

### Test 2.1: Valid Token Acceptance
```bash
# Generate a test token
TOKEN=$(node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({id:'507f1f77bcf86cd799439011'}, 'test-secret-key', {expiresIn:'1d'}))")

# Make request with token
curl -X GET http://localhost:8080/api/health \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```
- [ ] Status: 200 OK
- [ ] Response contains profile data or expected response

### Test 2.2: Missing Token Rejection
```bash
# Make request without token
curl -X GET http://localhost:8080/api/health \
  -H "Content-Type: application/json"
```
- [ ] Status: 401 Unauthorized
- [ ] Message: "No authorization header, authorization denied"

### Test 2.3: Malformed Token Rejection
```bash
# Make request with invalid token
curl -X GET http://localhost:8080/api/health \
  -H "Authorization: Bearer invalid-token-format" \
  -H "Content-Type: application/json"
```
- [ ] Status: 401 Unauthorized
- [ ] Message contains "malformed" or "invalid"

### Test 2.4: Wrong Format Token
```bash
# Token without "Bearer" prefix
curl -X GET http://localhost:8080/api/health \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json"
```
- [ ] Status: 401 Unauthorized
- [ ] Message: "No token, authorization denied"

---

## Phase 3: Frontend Integration Testing

### Test 3.1: Login Flow
- [ ] Open application in browser
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Click "Login"
- [ ] Wait for navigation
- [ ] Verify redirected to dashboard
- [ ] Open DevTools → Application → LocalStorage
- [ ] Verify "token" key exists
- [ ] Verify "user" key exists
- [ ] Token should be long alphanumeric string

### Test 3.2: Sign Up Flow
- [ ] Navigate to signup page
- [ ] Fill in details (name, email, password)
- [ ] Click "Sign Up"
- [ ] Receive OTP in email (or see OTP input)
- [ ] Enter OTP
- [ ] Click "Verify"
- [ ] Verify redirected to dashboard
- [ ] Check localStorage for token and user

### Test 3.3: API Requests with Token
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to dashboard
- [ ] Observe API requests being made
- [ ] Click on API request (e.g., GET /api/health)
- [ ] Check "Request Headers" section
- [ ] Verify "Authorization" header contains: `Bearer <token>`
- [ ] Verify response status is 200 or expected status
- [ ] Verify response contains expected data

### Test 3.4: Protected Route Access
- [ ] Login successfully
- [ ] Navigate to dashboard (protected route)
- [ ] Dashboard should load with data
- [ ] Try to access dashboard without login:
  - [ ] Open DevTools → Application → Clear all storage
  - [ ] Refresh page
  - [ ] Should be redirected to login
  - [ ] Dashboard should NOT load

### Test 3.5: Medication Status Update
- [ ] Login successfully
- [ ] Navigate to medications section
- [ ] Click "Mark as Taken" on a medication
- [ ] Open DevTools → Network tab
- [ ] Observe request to `/api/medicine/status`
- [ ] Verify "Authorization" header present
- [ ] Verify status code is 200
- [ ] Verify medication status updated on UI

---

## Phase 4: WebSocket/Socket.IO Testing

### Test 4.1: Socket Connection with Token
- [ ] Login successfully
- [ ] Open DevTools → Console
- [ ] Look for Socket.IO connection logs
- [ ] Should see: "Connected to WebSocket server: socket_id"
- [ ] Should see: "Socket authenticated for user: user_id" (in server logs)
- [ ] No authentication errors in logs

### Test 4.2: Socket Connection Without Token
- [ ] Open DevTools → Application → Clear storage
- [ ] Refresh page
- [ ] Open DevTools → Console
- [ ] Look for Socket.IO connection
- [ ] Should NOT see successful connection
- [ ] Should see error or connection attempt

### Test 4.3: Real-time Notifications
- [ ] Login successfully
- [ ] Open DevTools → Console
- [ ] Trigger an action that sends notification (e.g., add medication)
- [ ] Wait a moment
- [ ] Check console for: "Received notification: ..."
- [ ] Verify notification appears in UI
- [ ] Verify toast/notification message displays

### Test 4.4: Socket Reconnection
- [ ] Login successfully
- [ ] Open DevTools → Network tab
- [ ] Filter for "Socket.IO"
- [ ] Simulate offline: DevTools → Network → Offline
- [ ] Wait 5 seconds
- [ ] Resume online: DevTools → Network → Online
- [ ] Should see "reconnection" in logs
- [ ] Socket should reconnect automatically
- [ ] "Socket authenticated..." should appear again

---

## Phase 5: Error Handling Testing

### Test 5.1: Missing Token Header
- [ ] Send API request without Authorization header
- [ ] Expect status: 401
- [ ] Expect message: "No authorization header, authorization denied"

### Test 5.2: Expired Token (Simulated)
- [ ] Use token with expiration set to past date
- [ ] Send API request
- [ ] Expect status: 401
- [ ] Expect message: "Token expired"

### Test 5.3: Token Tampering
- [ ] Valid token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] Modify one character in payload
- [ ] Send request with modified token
- [ ] Expect status: 401
- [ ] Expect message containing "malformed" or "invalid"

### Test 5.4: No Authorization Header
- [ ] Send request without any Authorization header
- [ ] Expect status: 401
- [ ] Expect message: "No authorization header, authorization denied"

---

## Phase 6: All Protected Endpoints Testing

### Test Each Protected Route

#### Medicine Routes
- [ ] POST /api/medicine/add - with token ✓, without token ✗
- [ ] POST /api/medicine/bulk - with token ✓, without token ✗
- [ ] POST /api/medicine/today - with token ✓, without token ✗
- [ ] POST /api/medicine/status - with token ✓, without token ✗

#### Health Routes
- [ ] GET /api/health - with token ✓, without token ✗
- [ ] POST /api/health - with token ✓, without token ✗

#### Analytics Route
- [ ] GET /api/analytics - with token ✓, without token ✗

#### Translation Routes
- [ ] POST /api/translate - with token ✓, without token ✗
- [ ] POST /api/translate/batch - with token ✓, without token ✗
- [ ] GET /api/translate/supported - public (no token needed) ✓

#### Language Routes
- [ ] GET /api/languages/user - with token ✓, without token ✗
- [ ] PUT /api/languages/user - with token ✓, without token ✗
- [ ] GET /api/languages/supported - public (no token needed) ✓

#### Agent Routes
- [ ] POST /api/agents/medical - with token ✓, without token ✗
- [ ] POST /api/agents/emergency - with token ✓, without token ✗
- [ ] POST /api/agents/medicine - with token ✓, without token ✗
- [ ] POST /api/agents/personal-health - with token ✓, without token ✗
- [ ] POST /api/agents/upload - with token ✓, without token ✗
- [ ] POST /api/agents/chat - with token ✓, without token ✗
- [ ] POST /api/agents/reports - with token ✓, without token ✗

#### Report Routes
- [ ] POST /api/report - with token ✓, without token ✗
- [ ] POST /api/report/analyze - with token ✓, without token ✗
- [ ] POST /api/report/chat - with token ✓, without token ✗
- [ ] GET /api/report/:id/translate/:language - with token ✓, without token ✗
- [ ] GET /api/report/:id/readability - with token ✓, without token ✗

#### Notification Routes
- [ ] POST /api/notification/regular-notify - with token ✓, without token ✗
- [ ] POST /api/notification/today - with token ✓, without token ✗

#### Calendar Routes (Already protected)
- [ ] POST /api/calendar/sync - with token ✓, without token ✗
- [ ] POST /api/calendar/status - with token ✓, without token ✗

---

## Phase 7: Browser DevTools Verification

### Network Tab Checks
For each authenticated request:
- [ ] Authorization header visible in request
- [ ] Header format: `Authorization: Bearer eyJ...`
- [ ] No plaintext token stored in cookies
- [ ] Response status matches expectation (200 for success, 401 for auth failure)
- [ ] Response time reasonable (no excessive delays)

### Application Tab Checks
- [ ] localStorage contains "token" key after login
- [ ] localStorage contains "user" key after login
- [ ] Token value is long string (JWT format)
- [ ] After logout/clear: both keys removed

### Console Tab Checks
- [ ] No JWT-related errors
- [ ] No "undefined token" errors
- [ ] Socket.IO connection logs present
- [ ] No repeated 401 errors (would indicate token not being sent)

---

## Phase 8: Stress Testing

### Test 8.1: Concurrent Requests
- [ ] Make 10 simultaneous API requests
- [ ] All should succeed with valid token
- [ ] All should include token in headers
- [ ] All should receive expected responses

### Test 8.2: Token Persistence
- [ ] Login
- [ ] Make several API requests
- [ ] Close browser tab
- [ ] Open new tab to application
- [ ] Application should still work if session not expired
- [ ] If logged out, should require login again

### Test 8.3: Long Running Session
- [ ] Login
- [ ] Keep application open for 5+ minutes
- [ ] Make periodic API requests
- [ ] All requests should still work
- [ ] WebSocket should remain connected
- [ ] No authentication errors

### Test 8.4: Multiple Tabs
- [ ] Login in Tab 1
- [ ] Open application in Tab 2
- [ ] Both tabs should work with same token
- [ ] Both should have same user ID
- [ ] Close Tab 1
- [ ] Tab 2 should continue working

---

## Phase 9: Mobile/Responsive Testing

### Test 9.1: Mobile Login
- [ ] Open on mobile device
- [ ] Complete login flow
- [ ] Navigate to protected pages
- [ ] Make API requests
- [ ] All should work

### Test 9.2: Mobile Notifications
- [ ] Login on mobile
- [ ] WebSocket should connect
- [ ] Notifications should be received
- [ ] App should be responsive

---

## Phase 10: Security Verification

### Test 10.1: Token Not in URLs
- [ ] Token should NEVER appear in URL
- [ ] All requests should use headers
- [ ] Check DevTools Network tab
- [ ] Verify no tokens in query strings

### Test 10.2: HTTPS (Production)
- [ ] In production, verify HTTPS is used
- [ ] Token should never be transmitted over HTTP
- [ ] WebSocket should use WSS (secure) not WS

### Test 10.3: Token Not in Code
- [ ] Verify token not logged in console
- [ ] Verify token not stored in plain text
- [ ] Verify JWT_SECRET not exposed in client code
- [ ] Verify JWT_SECRET only in server env variables

### Test 10.4: Error Message Safety
- [ ] No sensitive info in error messages
- [ ] No database errors exposed
- [ ] No file paths exposed
- [ ] No API structure exposed

---

## Phase 11: Regression Testing

### Test 11.1: Existing Features Still Work
- [ ] Login/Signup still works
- [ ] Dashboard loads
- [ ] Medication tracking works
- [ ] Health profile works
- [ ] Reports work
- [ ] Notifications work
- [ ] Calendar sync works
- [ ] Preferences work

### Test 11.2: Error Handling
- [ ] Wrong password shows error
- [ ] Invalid email shows error
- [ ] Duplicate email shows error on signup
- [ ] Network errors handled gracefully

---

## Phase 12: Documentation Verification

### Test 12.1: Documentation Completeness
- [ ] jwt-auth.test.js exists and has 20+ tests
- [ ] jwt-integration.test.js exists and has 15+ tests
- [ ] JWT_AUTHENTICATION_FIX.md exists and is detailed
- [ ] JWT_ISSUE_79_RESOLUTION.md exists and is comprehensive
- [ ] JWT_QUICK_REFERENCE.md exists and is helpful
- [ ] CHANGES_SUMMARY.md exists and lists all changes

### Test 12.2: Test Instructions Clear
- [ ] Anyone can follow test instructions
- [ ] Test instructions are accurate
- [ ] All required tools listed
- [ ] All commands work as documented

---

## Final Verification Checklist

Complete ALL tests above, then verify:

### Functionality
- [ ] Login/signup works without JWT errors
- [ ] Token stored in localStorage
- [ ] API requests include token in headers
- [ ] Protected routes reject without token
- [ ] WebSocket connects with token
- [ ] Notifications work in real-time
- [ ] All dashboard features load

### Security
- [ ] Token not in URLs
- [ ] Token not in console logs
- [ ] Error messages don't expose info
- [ ] JWT_SECRET not exposed
- [ ] 401 errors proper

### Testing
- [ ] `npm test` passes all tests
- [ ] 40+ test cases pass
- [ ] No failing tests
- [ ] Coverage is comprehensive
- [ ] Integration tests pass

### Documentation
- [ ] 4 documentation files created
- [ ] Detailed explanations provided
- [ ] Examples included
- [ ] Troubleshooting guides exist
- [ ] API reference complete

---

## Sign-Off

When all tests pass, sign off:

- [ ] All unit tests pass (npm test)
- [ ] All integration tests pass
- [ ] All manual tests pass
- [ ] All endpoints tested
- [ ] Security verified
- [ ] Documentation verified
- [ ] Ready for deployment

**Tested By**: _______________  
**Date**: _______________  
**Status**: ✅ READY FOR PRODUCTION

---

## Rollback Procedure (If Issues Found)

If issues are discovered:

1. Stop the server
2. Identify the specific issue
3. Check server logs
4. Review the specific change
5. Revert the change if needed: `git revert <commit>`
6. Run tests again: `npm test`
7. Address root cause
8. Re-test before re-deployment

---

## Additional Testing Resources

- **Test Files**: `server/test/jwt-*.test.js`
- **Auth Middleware**: `server/src/middlewares/authMiddleware.js`
- **Auth Routes**: `server/src/routes/auth.js`
- **Protected Routes**: All files in `server/src/routes/*`
- **API Client**: `client/src/services/api/client.ts`
- **Socket Service**: `client/src/services/socketService.js`

---

## Notes

- Ensure JWT_SECRET is set and consistent
- Ensure MongoDB is running and accessible
- Ensure all environment variables are set
- Test in clean environment when possible
- Save test results for reference

---

## Support

For issues during testing:
1. Review error message carefully
2. Check the JWT_QUICK_REFERENCE.md guide
3. Review test examples
4. Check server logs
5. Review environment variables
6. Open detailed GitHub issue
