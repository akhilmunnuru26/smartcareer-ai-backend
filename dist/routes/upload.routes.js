"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_1 = require("../config/upload");
const router = (0, express_1.Router)();
const uploadController = new upload_controller_1.UploadController();
router.post('/extract', upload_1.upload.single('file'), (req, res) => uploadController.extractText(req, res));
exports.default = router;
