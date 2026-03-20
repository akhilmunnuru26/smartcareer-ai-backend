import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables!');
      throw new Error('GEMINI_API_KEY is required');
    }
    
    console.log('✅ Gemini API Key loaded');
    
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Resume Analysis
  async analyzeResume(resumeText: string, targetRole?: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Analyze this resume${targetRole ? ` for a ${targetRole} position` : ''}.

Resume:
${resumeText}

Provide analysis in JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "atsOptimization": ["tip 1", "tip 2", "tip 3"],
  "tailoredAdvice": "detailed paragraph of personalized career advice"
}

Be specific and actionable. No additional text, just the JSON.`;

    try {
      console.log('🤖 Calling Gemini API for resume analysis...');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanedText);

      console.log('✅ Successfully parsed analysis');
      return analysis;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  // Interview Question Generation
  async generateInterviewQuestions(role: string, difficulty: string): Promise<any[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Generate 5 interview questions for a ${role} position at ${difficulty} level.

Return the response as a JSON array with this exact structure:
[
  {
    "question": "the interview question",
    "category": "category name (e.g., Technical, Behavioral, System Design)"
  }
]

Make the questions realistic and relevant to the role. No additional text, just the JSON array.`;

    try {
      console.log('🤖 Calling Gemini API for interview questions...');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('📄 Raw response:', text.substring(0, 200));

      // Clean the response
      let cleanedText = text.trim();
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      cleanedText = cleanedText.trim();

      const questions = JSON.parse(cleanedText);

      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      console.log('✅ Successfully parsed questions:', questions.length);
      return questions;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  // Interview Answer Evaluation
  async evaluateInterviewAnswer(
    question: string,
    answer: string,
    role: string
  ): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer for a ${role} position.

Question: ${question}

Candidate's Answer: ${answer}

Evaluate this answer and provide feedback in JSON format:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "feedback": "detailed paragraph of feedback"
}

Be constructive and specific. No additional text, just the JSON.`;

    try {
      console.log('🤖 Calling Gemini API for answer evaluation...');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const evaluation = JSON.parse(cleanedText);

      console.log('✅ Successfully parsed evaluation, score:', evaluation.score);
      return evaluation;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  // Job Matching Analysis
  async analyzeJobMatch(resumeText: string, jobDescription: string): Promise<any> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Compare this resume with the job description and provide a match analysis.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide analysis in JSON format:
{
  "matchPercentage": <number 0-100>,
  "matchedSkills": ["skill 1", "skill 2", "skill 3"],
  "missingSkills": ["skill 1", "skill 2"],
  "matchedExperience": ["experience 1", "experience 2"],
  "missingExperience": ["experience 1", "experience 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "overallAssessment": "detailed paragraph explaining the match and what to improve"
}

Be specific and actionable. No additional text, just the JSON.`;

    try {
      console.log('🤖 Calling Gemini API for job match analysis...');
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const matchResult = JSON.parse(cleanedText);

      console.log('✅ Successfully parsed job match, score:', matchResult.matchPercentage);
      return matchResult;
    } catch (error) {
      console.error('❌ Gemini API error:', error);
      throw new Error('Failed to analyze job match');
    }
  }
}