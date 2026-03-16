"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.aiLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// General API rate limiter (100 requests per 15 minutes)
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limiter for AI endpoints (10 requests per hour)
exports.aiLimiter = (0, express_rate_limit_1.default)({
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
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: {
        error: 'Too many login attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
