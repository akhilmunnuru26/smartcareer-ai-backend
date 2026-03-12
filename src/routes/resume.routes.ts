import { Router } from "express";
import { ResumeController} from "../controllers/resume.controller";

const router = Router();
const resumeController = new ResumeController();

router.post("/analyze", (req,res) => resumeController.analyzeResume(req,res));

export default router;