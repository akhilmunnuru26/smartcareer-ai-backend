// // import {Request, Response} from 'express';
// // import { ClaudeService } from '../services/gemini.service';

// // const claudeService = new ClaudeService();

// // export class ResumeController {
// //     async analyzeResume(req: Request, res: Response): Promise<void>{
// //         try{
// //             const {resumeText, targetRole} = req.body;
// //             if (!resumeText || resumeText.trim().length < 100) {
// //                 res.status(400).json({ success: false, message: 'Invalid resume text' });
// //                 return; 
// //             }

// //             console.log("Analyzing Resume ......")
// //             const analysis = await claudeService.analyzeResume(resumeText, targetRole);
// //             res.status(200).json({success:true, data: analysis})

// //         }catch(error){
// //             console.error('Resume Analysis Error:', error);
// //             res.status(500).json({ success: false, message: 'Failed to analyze resume' });
// //         }
// //     }
// // }


// import { Request, Response } from 'express';
// import { GeminiService } from '../services/gemini.service';

// const geminiService = new GeminiService();

// export class ResumeController {
//   async analyzeResume(req: Request, res: Response): Promise<void> {
//     try {
//       const { resumeText, targetRole } = req.body;

//       // Validation
//       if (!resumeText || resumeText.trim().length < 100) {
//         res.status(400).json({ 
//           error: 'Resume text is required and must be at least 100 characters' 
//         });
//         return;
//       }

//       console.log('🔍 Analyzing resume...');
//       const analysis = await geminiService.analyzeResume(resumeText, targetRole);

//       res.status(200).json({
//         success: true,
//         data: analysis,
//       });
//     } catch (error) {
//       console.error('Resume analysis error:', error);
//       res.status(500).json({
//         error: 'Failed to analyze resume',
//         message: error instanceof Error ? error.message : 'Unknown error',
//       });
//     }
//   }
// }

import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';

const geminiService = new GeminiService();

export class ResumeController {
  async analyzeResume(req: Request, res: Response): Promise<void> {
    try {
      const { resumeText, targetRole } = req.body;

      // Validation
      if (!resumeText || resumeText.trim().length < 100) {
        res.status(400).json({ 
          error: 'Resume text is required and must be at least 100 characters' 
        });
        return;
      }

      console.log('🔍 Analyzing resume with Gemini AI...');
      const analysis = await geminiService.analyzeResume(resumeText, targetRole);

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Resume analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze resume',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}