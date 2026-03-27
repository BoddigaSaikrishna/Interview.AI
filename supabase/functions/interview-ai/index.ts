import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: Message[];
  interviewType: 'technical' | 'hr' | 'full';
  programmingLanguage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  action: 'chat' | 'evaluate';
  currentPhase?: 'technical' | 'hr';
}

const getSystemPrompt = (interviewType: string, programmingLanguage: string | undefined, difficulty: string, currentPhase?: string) => {
  const difficultyDescriptions = {
    beginner: 'entry-level, focusing on fundamentals and basic concepts',
    intermediate: 'mid-level, including practical scenarios and moderate complexity',
    advanced: 'senior-level, with complex problems and in-depth technical knowledge'
  };

  const difficultyLevel = difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions] || difficultyDescriptions.intermediate;

  if (interviewType === 'technical' || currentPhase === 'technical') {
    return `You are an experienced technical interviewer conducting a ${difficultyLevel} interview for a ${programmingLanguage || 'software development'} position.

Your role:
- Ask one focused technical question at a time
- Cover topics like: syntax, OOP concepts, data structures, algorithms, problem-solving, and real-world scenarios specific to ${programmingLanguage || 'programming'}
- Adapt your questions based on the candidate's responses - if they struggle, ask simpler follow-ups; if they excel, increase difficulty
- Be professional but encouraging
- After receiving an answer, provide brief feedback and ask the next question
- Keep track of the interview flow and don't repeat questions
- Ask exactly 15 technical questions before concluding the technical portion

Start by introducing yourself briefly and ask your first technical question.`;
  } else if (interviewType === 'hr' || currentPhase === 'hr') {
    return `You are an experienced HR interviewer conducting a ${difficultyLevel} behavioral interview.

Your role:
- Ask behavioral and situational questions one at a time
- Cover topics like: self-introduction, strengths and weaknesses, conflict resolution, teamwork, leadership, career goals, and problem-solving approaches
- Use the STAR method to probe for specifics when appropriate
- Be warm, professional, and encouraging
- After receiving an answer, acknowledge their response naturally and transition to the next question
- Ask exactly 10 HR/behavioral questions before concluding the HR portion

Evaluate candidates on:
- Communication clarity
- Confidence and composure
- Logical structure in responses
- Emotional intelligence
- Relevance of examples

Start by warmly greeting the candidate and asking them to introduce themselves.`;
  } else {
    return `You are an experienced technical interviewer conducting a ${difficultyLevel} interview for a ${programmingLanguage || 'software development'} position.

This is the technical portion of a comprehensive interview. Your role:
- Ask one focused technical question at a time
- Cover: syntax, OOP, data structures, algorithms, and real-world scenarios for ${programmingLanguage || 'programming'}
- Adapt difficulty based on responses
- Be professional but encouraging
- Ask exactly 15 technical questions in this portion before concluding

Start by introducing yourself and ask your first technical question.`;
  }
};

const getEvaluationPrompt = (interviewType: string) => {
  return `You are an expert interview evaluator. Analyze the interview conversation and provide a comprehensive evaluation.

For each interview type, score out of 100 using these criteria:

TECHNICAL SCORING:
- Concept Correctness (30%): How well did they understand and explain technical concepts?
- Problem-Solving (25%): Did they approach problems methodically?
- Code Logic (25%): Were their solutions logically sound?
- Time Efficiency (20%): Did they respond promptly with well-structured answers?

HR SCORING:
- Communication (25%): Clarity, articulation, and expression
- Confidence (20%): Composure and self-assurance
- Logic & Structure (20%): Organized and coherent responses
- Emotional Intelligence (15%): Self-awareness and interpersonal skills
- Relevance (10%): Appropriate and on-topic examples
- Response Quality (10%): Depth and thoughtfulness

Provide your evaluation in the following JSON format ONLY (no other text):
{
  "technicalScore": <number 0-100 or null if not applicable>,
  "hrScore": <number 0-100 or null if not applicable>,
  "finalScore": <number 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "readinessLevel": "<Beginner|Intermediate|Job-Ready>",
  "detailedFeedback": "A comprehensive paragraph summarizing performance"
}`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, interviewType, programmingLanguage, difficulty, action, currentPhase } = await req.json() as RequestBody;
    const HF_API_KEY = Deno.env.get('HF_API_KEY');
    
    if (!HF_API_KEY) {
      console.error('HF_API_KEY is not configured');
      throw new Error('AI service is not configured');
    }

    let systemPrompt: string;
    let shouldStream = true;

    if (action === 'evaluate') {
      systemPrompt = getEvaluationPrompt(interviewType);
      shouldStream = false;
    } else {
      systemPrompt = getSystemPrompt(interviewType, programmingLanguage, difficulty, currentPhase);
    }

    // Format messages for Hugging Face
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log(`Processing ${action} request for ${interviewType} interview`);

    // Use Hugging Face Router API with Llama 3.2 (OpenAI-compatible)
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        messages: formattedMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Please check your Hugging Face API key.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI service error: ' + errorText);
    }

    const data = await response.json();
    
    // Handle OpenAI-compatible chat completions response format
    let content = '';
    if (data.choices && data.choices[0]?.message?.content) {
      content = data.choices[0].message.content;
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
    } else if (data.generated_text) {
      content = data.generated_text;
    } else if (typeof data === 'string') {
      content = data;
    } else {
      console.error('Unexpected response format:', JSON.stringify(data).substring(0, 500));
      throw new Error('Unexpected AI response format');
    }

    // Clean up the response
    content = content.trim();
    
    if (!content || content.length === 0) {
      console.error('AI returned empty content');
      return new Response(JSON.stringify({ error: 'AI returned empty response. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI response:', content.substring(0, 200) + '...');

    if (action === 'evaluate') {
      return new Response(JSON.stringify({ result: content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // For chat, simulate streaming format that frontend expects
      const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`;
      return new Response(sseData, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

  } catch (error) {
    console.error('Error in interview-ai function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
