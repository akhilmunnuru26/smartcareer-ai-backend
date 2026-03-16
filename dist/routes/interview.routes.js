"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interview_controller_1 = require("../controllers/interview.controller");
const router = (0, express_1.Router)();
const interviewController = new interview_controller_1.InterviewController();
router.post('/generate', (req, res) => interviewController.generateQuestions(req, res));
router.post('/evaluate', (req, res) => interviewController.evaluateAnswer(req, res));
exports.default = router;
