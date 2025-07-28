import { RequestHandler } from "express";
import { z } from "zod";

// Request schema validation
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.string().optional()
});

interface ChatResponse {
  response: string;
  error?: string;
}

export const handleAIChat: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const validation = ChatRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid request. Message is required and must be between 1-1000 characters."
      } as ChatResponse);
    }

    const { message } = validation.data;
    
    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({
        response: `🤖 AI Assistant (Demo Mode)

I'm currently running in demo mode since the OpenAI API key isn't configured yet.

Based on your question: "${message}"

Here's what I can tell you:

• I'm a passionate full-stack developer with expertise in React, Node.js, and AI integration
• I love building interactive experiences like this terminal portfolio
• I have experience with modern web technologies and AI APIs
• I'm always excited to discuss technology and new projects

To enable full AI functionality:
1. Set up an OpenAI API key in environment variables
2. The AI will then provide personalized, context-aware responses

For now, try these commands to learn more:
• about - My background and experience  
• skills - Technical expertise
• projects - Featured work
• contact - Get in touch directly`
      } as ChatResponse);
    }

    // Portfolio context for AI
    const portfolioContext = `
You are an AI assistant representing a developer's portfolio terminal. Here's context about the developer:

Profile:
- Full Stack Developer & AI Enthusiast  
- Passionate about creating innovative solutions at the intersection of web development and AI
- Currently focused on building modern, user-centric applications using cutting-edge technologies
- Education: Computer Science
- Interests: AI, Web3, Open Source, Terminal UIs

Technical Skills:
Frontend: React/Next.js, TypeScript, Tailwind CSS, Three.js, Framer Motion, Vue.js
Backend: Node.js, Python, Express, FastAPI, PostgreSQL, MongoDB  
AI: OpenAI API, LangChain, TensorFlow, PyTorch, Hugging Face, Vector Databases
Tools: Git/GitHub, Docker, AWS/Vercel, Linux/Terminal, VS Code, Figma

Featured Projects:
1. AI Terminal Portfolio - Interactive terminal-style portfolio with AI integration (React, Three.js, OpenAI, TypeScript)
2. AI Chat Platform - Real-time chat application with AI assistance (Next.js, Socket.io, OpenAI, Prisma) 
3. Smart Task Manager - AI-powered productivity app with natural language processing (React, Python, FastAPI, PostgreSQL)

Contact: 
- Email: your.email@example.com
- GitHub: github.com/yourusername  
- LinkedIn: linkedin.com/in/yourusername
- Website: yourwebsite.com
- Twitter: @yourusername

Response Guidelines:
- Keep responses conversational but professional
- Use terminal/tech-style emojis and formatting when appropriate
- Reference specific skills/projects when relevant to the question
- If asked about topics outside your expertise, acknowledge limitations but stay helpful
- Encourage exploration of the portfolio commands (about, skills, projects, contact)
- Keep responses concise but informative (aim for 2-6 lines typically)
`;

    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: portfolioContext
          },
          {
            role: 'user', 
            content: message
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API Error:', errorData);
      
      return res.json({
        response: `🤖 AI temporarily unavailable

Sorry, I'm having trouble connecting to my AI brain right now. 

While I get that sorted out, you can still explore:
• about - Learn about my background
• skills - View my technical expertise
• projects - Check out my featured work  
• contact - Get in touch directly

Please try your AI question again in a moment!`
      } as ChatResponse);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    res.json({
      response: `🤖 ${aiResponse}`
    } as ChatResponse);

  } catch (error) {
    console.error('AI Chat Error:', error);
    
    res.json({
      response: `🤖 Oops! Something went wrong

I encountered an error while processing your question. 

In the meantime, you can explore my portfolio using:
• about - My background and experience
• skills - Technical skills and expertise  
• projects - Featured projects and work
• contact - Ways to get in touch

Please try asking again, or feel free to use the other commands!`
    } as ChatResponse);
  }
};
