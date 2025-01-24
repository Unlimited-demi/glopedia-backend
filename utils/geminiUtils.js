const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-1219" });

const defaultPrompt = `You are a friendly, supportive, and understanding career advisor.
Analyze the given resume data to identify key skills, strengths, and areas for professional development. Provide 2-3 suggestions for potential career paths based on their skills and experience. Be specific, clear and brief.
Return the response in a valid JSON format with the following structure your response should be step by step from ground zero remeber your job:
{
  "skills": ["skill1", "skill2", "skill3"], these skills are the ones needed to achieve their goal, they are the skills the user needs to acquire to achieve their goal
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "development_areas": ["area1", "area2"], this should be skills they already have but need to improve on to achieve their goal
  "potential_paths": ["path1", "path2"],
  "skillGaps": ["gap1", "gap2"] ---should be like, based on your goal and your current self, improved sos os skill gap , like make everything conversational, so you can relate with users better 
}as for urls you willl provide make sure they are not dead 
  the skill gap is gotten by analysis the users present skills and the skillsthey need to acoomplish their goal
If the user does not have a resume, provide a general analysis based on common starting points.
Also in areas for developmentt , actually tell me how to develop those areas like area1 : do this and that by this to improve that to achieve that 
The resume data is here: q
a aQ  



`;

const recommendationPrompt = `You are a friendly, supportive, and understanding career advisor.
Analyze the following resume data and the user's career goal. Provide 2-3 specific, clear, and actionable recommendations to help them achieve their career goal.
Resume Data:
--RESUME_DATA--

User's Goal:
--GOAL--

Return the response in a valid JSON format with the following structure:
{
  "recommendations": [
    {
      "title": "Recommendation 1",
      "description": "Description of recommendation 1",
      "link": "Optional link for more information"
    },
    {
      "title": "Recommendation 2",
      "description": "Description of recommendation 2",
      "link": "Optional link for more information"
    }
  ],
 -"smart_tips": ["tip1", "tip2", "tip3"],
  "projects": [
    {
      "title": "title1",
      "reason" : "skills to gain from oroject or reason this project" let it just be a reason for the project and the skills they will get from it
      "skills to gain": ["skill1", "skill2", "skill3"],
      "resource": "resource1",
      "description": "description1",
      "link": "link1"
    },
    {
      "title": "title2",
      "resource": "resource2",
      "description": "description2",
      "link": "link2"
    },
    {
      "title": "title3",
      "resource": "resource3",
      "description": "description3",
      "link": "link3"
    }
  ]
}
Ensure the response is only valid JSON, no extra text or code fences.`;

const cleanJsonString = (str) => {
  let cleaned = str.trim().replace(/^```(json)?/, '').replace(/```$/, '');
  cleaned = cleaned.replace(/\*/g, ''); 
  cleaned = cleaned.trim();
  return cleaned;
};

const parseGeminiResponse = (text) => {
  try {
    const cleanedText = cleanJsonString(text);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.warn('Failed to parse Gemini response as JSON:', text);
    return {
      error: 'Failed to parse Gemini response',
      raw: text,
    };
  }
};

const cleanJsonStringThinkingModel = (str) => {
  let cleaned = str.trim();
  cleaned = cleaned.replace(/^[^{]*{/, '{');
  let lastCurly = cleaned.lastIndexOf('}');
  if (lastCurly !== -1) {
    cleaned = cleaned.substring(0, lastCurly + 1);
  }
  return cleaned;
};

const parseGeminiResponseThinkingModel = (text) => {
  try {
    const cleanedText = cleanJsonStringThinkingModel(text);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.warn('Failed to parse Gemini response as JSON:', text);
    return {
      error: 'Failed to parse Gemini response',
      raw: text,
    };
  }
};

const generateSkills = async (resumeData, careerGoal) => {
  try {
    const prompt = defaultPrompt + JSON.stringify(resumeData) + (careerGoal ? `\nThe user's career goal is: ${careerGoal}\n` : '');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsedResponse = parseGeminiResponseThinkingModel(text);
    
    if (parsedResponse.error) {
      return parsedResponse;
    
    }
    console.log('Skills', parsedResponse);  
    return {
      skills: parsedResponse.skills || [],
      strengths: parsedResponse.strengths || [],
      development_areas: parsedResponse.development_areas || [],
      potential_paths: parsedResponse.potential_paths || [],
      skillGaps: parsedResponse.skillGaps || [],
      weaknesses: parsedResponse.weaknesses || []
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      error: 'Error processing with the Gemini API',
      message: error.message
    };
  }
};

const generateRecommendations = async (userData) => {
  try {
    const prompt = recommendationPrompt
      .replace('--RESUME_DATA--', userData.resumeData?.text || '')
      .replace('--GOAL--', userData.careerGoal ? userData.careerGoal : '');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsedResponse = parseGeminiResponseThinkingModel(text);
    
    if (parsedResponse.recommendations) {
      parsedResponse.recommendations = parsedResponse.recommendations.map(r => ({
        title: r.title || 'No title',
        description: r.description || 'No description',
        link: r.link || '',
      }));
    }
    
    if (parsedResponse.error) {
      return parsedResponse;
    }
    
    console.log('Recommendations', parsedResponse);
    return {
      recommendations: parsedResponse.recommendations || [],
      smart_tips: parsedResponse.smart_tips || [],
      projects: parsedResponse.projects || []
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      error: 'Error processing with the Gemini API',
      message: error.message
    };
  }
};

module.exports = { generateSkills, generateRecommendations };