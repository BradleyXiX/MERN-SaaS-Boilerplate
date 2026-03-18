const rateLimit = require('express-rate-limit');
const express = require('express');

console.log('=== Rate Limiting Test ===\n');

// Create limiters (same configuration as in production)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  store: undefined // Use default in-memory store for testing
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  store: undefined
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again after 1 hour',
  skipFailedRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  store: undefined
});

// Create test app
const app = express();

// Test 1: Login Rate Limiting
console.log('Test 1: Login Rate Limiting (Max 5 requests per 15 minutes)');
console.log('---');

let loginTestCount = 0;
const loginRouter = express.Router();
loginRouter.post('/login', loginLimiter, (req, res) => {
  res.status(200).json({ message: 'Login successful' });
});

const loginApp = express();
loginApp.use(express.json());
loginApp.use('/api/auth', loginRouter);

// Simulate 7 login requests from same IP (127.0.0.1)
const loginServer = loginApp.listen(5001, async () => {
  for (let i = 1; i <= 7; i++) {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      const data = await response.json();
      console.log(`Request ${i}: Status ${response.status}`);
      console.log(`  Rate-Limit-Limit: ${response.headers.get('RateLimit-Limit')}`);
      console.log(`  Rate-Limit-Remaining: ${response.headers.get('RateLimit-Remaining')}`);
      console.log(`  Rate-Limit-Reset: ${response.headers.get('RateLimit-Reset')}`);
      console.log(`  Message: ${data.message}`);
      console.log('');
      
      if (i === 5) {
        console.log('⚠️  6th request will be rate limited...\n');
      }
    } catch (err) {
      console.log(`Request ${i}: Error - ${err.message}\n`);
    }
  }
  
  loginServer.close();
  
  // Test 2: Registration Rate Limiting
  console.log('\nTest 2: Registration Rate Limiting (Max 5 requests per 15 minutes)');
  console.log('---');
  
  const regRouter = express.Router();
  regRouter.post('/register', authLimiter, (req, res) => {
    res.status(201).json({ message: 'Registration successful' });
  });
  
  const regApp = express();
  regApp.use(express.json());
  regApp.use('/api/auth', regRouter);
  
  const regServer = regApp.listen(5002, async () => {
    for (let i = 1; i <= 6; i++) {
      try {
        const response = await fetch('http://localhost:5002/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: `user${i}@test.com`, 
            password: 'Test@1234',
            confirmPassword: 'Test@1234'
          })
        });
        
        const data = await response.json();
        console.log(`Request ${i}: Status ${response.status}`);
        console.log(`  Rate-Limit-Remaining: ${response.headers.get('RateLimit-Remaining')}`);
        console.log(`  Message: ${data.message}`);
        console.log('');
        
        if (i === 5) {
          console.log('⚠️  6th request will be rate limited...\n');
        }
      } catch (err) {
        console.log(`Request ${i}: Error - ${err.message}\n`);
      }
    }
    
    regServer.close();
    
    // Test 3: Password Reset Rate Limiting
    console.log('\nTest 3: Password Reset Rate Limiting (Max 3 requests per 1 hour)');
    console.log('---');
    
    const resetRouter = express.Router();
    resetRouter.post('/forgot-password', passwordResetLimiter, (req, res) => {
      res.status(200).json({ message: 'Password reset email sent' });
    });
    
    const resetApp = express();
    resetApp.use(express.json());
    resetApp.use('/api/auth', resetRouter);
    
    const resetServer = resetApp.listen(5003, async () => {
      for (let i = 1; i <= 4; i++) {
        try {
          const response = await fetch('http://localhost:5003/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com' })
          });
          
          const data = await response.json();
          console.log(`Request ${i}: Status ${response.status}`);
          console.log(`  Rate-Limit-Remaining: ${response.headers.get('RateLimit-Remaining')}`);
          console.log(`  Message: ${data.message}`);
          console.log('');
          
          if (i === 3) {
            console.log('⚠️  4th request will be rate limited...\n');
          }
        } catch (err) {
          console.log(`Request ${i}: Error - ${err.message}\n`);
        }
      }
      
      resetServer.close();
      console.log('=== Test Complete ===');
      process.exit(0);
    });
  });
});
