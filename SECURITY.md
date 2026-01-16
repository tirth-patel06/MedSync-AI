# Security Policy for MedSync AI

Security is critical in a health app. This guide is concise—read it!

---

## Report Vulnerabilities

**DO NOT open public GitHub issues for security bugs.**

Email maintainers privately with:
- Description & steps to reproduce
- Impact assessment
- Suggested fix (optional)

**Timeline:** 48-hour acknowledgment, weekly updates.

---

## Secrets & Environment

### Never commit .env files
```bash
# Already in .gitignore
.env, .env.local
```

**Required variables:**
```env
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=min_32_char_random_string
GROQ_API_KEY=gsk_xxx
GEMINI_API_KEY=AIzaSyxxx
HUGGINGFACEHUB_API_KEY=hf_xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX_xxx
GOOGLE_REDIRECT_URI=http://localhost:8080/api/oauth/callback
REPORT_API=key
REPORT_TEMPLATE_ID=5b077b23e86a4726
```

### Access safely:
```javascript
// Good ✓
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Missing JWT_SECRET');

// Bad ✗
const secret = 'hardcoded-key';
console.log('Using key:', secret);
```

### If exposed:
1. Rotate immediately
2. Force push: `git reset HEAD~1`, remove .env, commit, `git push --force-with-lease`
3. Use BFG to scrub history

---

## Authentication

### Hash passwords:
```javascript
import bcryptjs from 'bcryptjs';
const hashed = await bcryptjs.hash(password, 10);
```

### Generate JWT tokens:
```javascript
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
```

### Verify tokens (authMiddleware):
```javascript
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

### Protect routes:
```javascript
router.get('/api/medicines', authMiddleware, getMedicines);
```

### Frontend check:
```jsx
const token = localStorage.getItem('token');
if (!token) return <Navigate to="/login" />;
```

---

## Database

### Always scope to user:
```javascript
// Good ✓
const medicines = await Medicine.find({ userId: req.user.id });

// Bad ✗
const medicines = await Medicine.find({ userId: req.body.userId });
```

### Validate input:
```javascript
import { body, validationResult } from 'express-validator';

app.post('/api/medicines',
  body('name').trim().notEmpty().escape(),
  body('dosage').isNumeric(),
  (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ errors: validationResult(req).array() });
    }
  }
);
```

### Never return passwords:
```javascript
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
```

### Use Mongoose safely (auto-sanitizes):
```javascript
// Safe - prevents NoSQL injection
const user = await User.findById(userId);
```

---

## API & Data

### CORS setup:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true
}));
```

### Rate limit auth:
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // 5 attempts per 15 min
});
app.post('/api/auth/login', loginLimiter, login);
```

### Socket.IO auth:
```javascript
io.use((socket, next) => {
  const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
  socket.userId = decoded.id;
  next();
});
// Send to specific user: io.to(`user_${userId}`).emit('notification', data);
```

### Secure uploads:
```javascript
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('PDF only'));
  }
});
```

### Hide errors from users:
```javascript
// Bad ✗
catch (error) { res.json({ error: error.message }); }

// Good ✓
catch (error) {
  console.error('Details:', error);
  res.status(500).json({ error: 'Operation failed' });
}
```

---

## Dependencies

### Check vulnerabilities:
```bash
npm audit           # Find issues
npm audit fix       # Auto-fix
npm outdated        # See old packages
npm update          # Update packages
```

### Before adding packages:
- Check GitHub repo reputation
- Verify recent updates
- Avoid unmaintained packages

**Safe packages:** express, jsonwebtoken, mongoose, bcryptjs, cors, socket.io, @langchain/*

---

## Git

### Prevent .env commits:
```bash
npm install husky --save-dev
npx husky install

# Create .husky/pre-commit
echo '#!/bin/sh
if git diff --cached --name-only | grep -E "\.env"; then
  echo "Error: .env detected"
  exit 1
fi' > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Always verify:
```bash
git diff --cached  # Check before committing
```

---

## Code Review Checklist

### Every PR needs:

**Frontend:**
- [ ] No API keys in code
- [ ] Routes protected with auth check
- [ ] Input validated before API calls
- [ ] No console.log of sensitive data
- [ ] Uses `https://` for APIs

**Backend:**
- [ ] authMiddleware on sensitive routes
- [ ] Queries filter by `userId`
- [ ] Input validated (express-validator)
- [ ] Passwords hashed
- [ ] JWT tokens signed & verified
- [ ] Rate limit on auth endpoints
- [ ] File uploads validated
- [ ] Socket.IO authenticated

**Both:**
- [ ] No secrets in commits
- [ ] No hardcoded keys/URLs
- [ ] Dependencies from trusted sources
- [ ] Good error handling

---

## Quick Reference

| Issue | Fix |
|-------|-----|
| Credential leak | Use `.env` + `.gitignore` |
| Injection attacks | Use `express-validator`, parameterized queries |
| Weak passwords | Hash with `bcryptjs` (10 rounds) |
| Data leaks | Filter queries by `userId` |
| Unauthorized access | Require JWT + authMiddleware |
| Brute force | Rate limit auth endpoints |
| Old packages | `npm audit`, `npm update` |
| Secrets in Git | Pre-commit hooks, .gitignore |

---

**For security issues:** Email maintainers privately  
**For questions:** See [CONTRIBUTING.md](CONTRIBUTING.md)

Last updated: December 2025