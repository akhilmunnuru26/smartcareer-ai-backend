"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const resume_routes_1 = __importDefault(require("./routes/resume.routes"));
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, helmet_1.default)());
app.set('trust proxy', 1);
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter_1.generalLimiter);
app.get("/health", (request, response) => {
    return response.status(200).json({ status: "ok", timeStamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // Only show stack trace in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});
app.use("/api/resume", resume_routes_1.default);
app.use('/api/interview', interview_routes_1.default);
app.use('/api/job', job_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log("Environment:", process.env.NODE_ENV);
});
