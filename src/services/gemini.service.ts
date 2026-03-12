// import { anthropic, anthropicModel } from '../config/gemini';

// interface ResumeAnalysisResult {
//   overallScore: number;
//   strengths: string[];
//   improvements: string[];
//   atsOptimization: string[];
//   tailoredAdvice: string;
// }

// export class ClaudeService {
//   async analyzeResume(resumeText: string, targetRole?: string): Promise<ResumeAnalysisResult> {
//     const prompt = `You are an expert technical recruiter and career coach. Analyze this resume ${targetRole ? `for a ${targetRole} role` : ''}.

// RESUME:
// ${resumeText}

// Provide a structured analysis in JSON format with:
// 1. overallScore (0-100): How strong is this resume?
// 2. strengths (array): Top 3-5 strong points
// 3. improvements (array): Top 3-5 areas to improve
// 4. atsOptimization (array): 3-5 specific ATS (Applicant Tracking System) tips
// 5. tailoredAdvice (string): 2-3 paragraph personalized career advice

// Return ONLY valid JSON, no markdown formatting.`;

//     try {
//       console.log('🤖 Calling Claude API...');
      
//       const message = await anthropic.messages.create({
//         model: anthropicModel,
//         max_tokens: 2000,
//         messages: [
//           {
//             role: 'user',
//             content: prompt,
//           },
//         ],
//       });

//       console.log('✅ Claude API Response received');
//       console.log('Response:', JSON.stringify(message, null, 2));

//       const responseText = message.content[0].type === 'text' 
//         ? message.content[0].text 
//         : '';

//       console.log('📝 Response Text:', responseText);

//       // Parse Claude's JSON response
//       const analysis: ResumeAnalysisResult = JSON.parse(responseText);
//       return analysis;
//     } catch (error) {
//       console.error('❌ Claude API Error:', error);
//       if (error instanceof Error) {
//         console.error('Error message:', error.message);
//         console.error('Error stack:', error.stack);
//       }
//       throw new Error('Failed to analyze resume with AI');
//     }
//   }
// }


import { genAI, MODEL_NAME } from '../config/gemini';

interface ResumeAnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  atsOptimization: string[];
  tailoredAdvice: string;
}

export class GeminiService {
  async analyzeResume(resumeText: string, targetRole?: string): Promise<ResumeAnalysisResult> {
    const prompt = `You are an expert technical recruiter and career coach. Analyze this resume ${targetRole ? `for a ${targetRole} role` : ''}.

RESUME:
${resumeText}

Provide a structured analysis in JSON format with:
1. overallScore (0-100): How strong is this resume?
2. strengths (array): Top 3-5 strong points
3. improvements (array): Top 3-5 areas to improve
4. atsOptimization (array): 3-5 specific ATS (Applicant Tracking System) tips
5. tailoredAdvice (string): 2-3 paragraph personalized career advice

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or extra text. Just the raw JSON object.`;

    try {
      console.log('🤖 Calling Gemini API...');
      
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('✅ Gemini API Response received');
      console.log('📝 Raw Response:', text.substring(0, 200) + '...');

      // Clean up the response (remove markdown code blocks if present)
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      // Parse the JSON response
      const analysis: ResumeAnalysisResult = JSON.parse(cleanedText);
      
      console.log('✅ Successfully parsed analysis');
      return analysis;
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      throw new Error('Failed to analyze resume with AI');
    }
  }
  async generateInterviewQuestions(role: string, difficulty: string) {
    const prompt = `Generate 5 technical interview questions for a ${difficulty} ${role} position.

Return a JSON array of questions with this structure:
[
  {
    "question": "the interview question",
    "difficulty": "${difficulty}",
    "category": "category name (e.g., JavaScript, React, System Design, etc.)"
  }
]

Make questions realistic, role-specific, and appropriate for the ${difficulty} level.
Return ONLY valid JSON, no markdown formatting.`;

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const questions = JSON.parse(cleanedText);
      return questions;
    } catch (error) {
      console.error('❌ Generate questions error:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async evaluateInterviewAnswer(question: string, answer: string, role?: string) {
    const prompt = `Evaluate this interview answer ${role ? `for a ${role} position` : ''}.

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

Provide evaluation in JSON format:
{
  "score": (0-100),
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "suggestion": "A model answer or key points they should have mentioned (2-3 sentences)"
}

Be constructive and specific. Return ONLY valid JSON, no markdown formatting.`;

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const feedback = JSON.parse(cleanedText);
      return feedback;
    } catch (error) {
      console.error('❌ Evaluate answer error:', error);
      throw new Error('Failed to evaluate answer');
    }
  }
  async analyzeJobMatch(resumeText: string, jobDescription: string) {
    const prompt = `Analyze how well this resume matches the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed match analysis in JSON format:
{
  "matchPercentage": (0-100),
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "matchedExperience": ["experience1", "experience2", ...],
  "missingExperience": ["experience1", "experience2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "overallAssessment": "2-3 paragraph detailed assessment"
}

Be thorough and specific. Return ONLY valid JSON, no markdown formatting.`;

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      const matchResult = JSON.parse(cleanedText);
      return matchResult;
    } catch (error) {
      console.error('❌ Job match error:', error);
      throw new Error('Failed to analyze job match');
    }
  }
}

