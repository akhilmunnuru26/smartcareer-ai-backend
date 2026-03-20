import rateLimit from 'express-rate-limit';

// Strict rate limiter for AI endpoints (10 requests per hour)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 AI requests per hour
  message: {
    error: 'You have reached the maximum number of AI analyses per hour. Please try again later.',
    limit: 10,
    windowMs: 3600000,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

// Auth rate limiter (5 attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 



// Rate limiter for resume analysis (10 requests per hour per IP)
export const resumeAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many resume analyses from this IP, please try again in an hour',
    remainingTime: '1 hour',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.log('⚠️ Rate limit exceeded for IP:', req.ip);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      message: 'You have exceeded the maximum number of analyses per hour (10). Please wait before trying again.',
      retryAfter: '1 hour',
    });
  },
});

// Rate limiter for interview questions (15 requests per hour per IP)
export const interviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: {
    error: 'Too many interview requests from this IP, please try again in an hour',
  },
  handler: (req, res) => {
    console.log('⚠️ Rate limit exceeded for IP:', req.ip);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      message: 'You have exceeded the maximum number of interview sessions per hour (15).',
      retryAfter: '1 hour',
    });
  },
});

// Rate limiter for job matching (10 requests per hour per IP)
export const jobMatchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many job match requests from this IP, please try again in an hour',
  },
  handler: (req, res) => {
    console.log('⚠️ Rate limit exceeded for IP:', req.ip);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      message: 'You have exceeded the maximum number of job matches per hour (10).',
      retryAfter: '1 hour',
    });
  },
});

// General API rate limiter (100 requests per 15 minutes per IP)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later',
  },
  handler: (req, res) => {
    console.log('⚠️ General rate limit exceeded for IP:', req.ip);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please slow down.',
    });
  },
});