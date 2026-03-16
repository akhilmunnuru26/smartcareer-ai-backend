"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const router = (0, express_1.Router)();
const jobController = new job_controller_1.JobController();
router.post('/match', (req, res) => jobController.analyzeMatch(req, res));
exports.default = router;
