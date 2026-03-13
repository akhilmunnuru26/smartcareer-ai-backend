import express, {Express, Request,Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan'
import resumeRoutes from './routes/resume.routes';
import { time, timeStamp } from 'node:console';
import interviewRoutes from './routes/interview.routes';
import jobRoutes from './routes/job.routes';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';



dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    }
))

app.use(morgan('dev'))
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

app.get("/health", (request: Request, response: Response) => {
    return response.status(200).json({status: "ok", timeStamp: new Date().toISOString() });
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(`[Error] ${err.message}`);
    
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // Only show stack trace in development mode for security
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});

app.use("/api/resume", resumeRoutes);
app.use('/api/interview', interviewRoutes); 
app.use('/api/job', jobRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); 



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log("Environment:", process.env.NODE_ENV);
})



