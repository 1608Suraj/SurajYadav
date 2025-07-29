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
    
    // Check if Groq API key is configured
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.json({
        response: `🤖 AI Assistant (Demo Mode)

I'm currently running in demo mode since the Groq API key isn't configured yet.

Based on your question: "${message}"

Here's what I can tell you:

• I'm a passionate data analyst with expertise in Python, SQL, and machine learning
• I love building interactive data experiences like this terminal portfolio
• I have experience with modern analytics tools and AI APIs
• I'm always excited to discuss data science and analytical projects

To enable full AI functionality:
1. Set up a Groq API key in environment variables
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
You are an AI assistant representing Suraj Yadav's portfolio terminal. Here's context about Suraj:

Profile:
- Data Analyst & AI Enthusiast
- Passionate about extracting insights from complex datasets and building intelligent solutions
- Currently focused on leveraging AI and machine learning for data-driven decisions
- Education: Data Science & Analytics
- Interests: Data Science, AI, Python, Visualization, Terminal UIs

Technical Skills:
Analytics: Python/Pandas, SQL/PostgreSQL, Power BI, Tableau, Excel/VBA, R Programming
Data Science: Machine Learning, Scikit-learn, TensorFlow, Statistical Analysis, Data Visualization, Feature Engineering
AI: Groq AI, OpenAI API, Natural Language Processing, Computer Vision, Deep Learning, MLOps
Tools: Jupyter Notebooks, Git/GitHub, Docker, AWS/Azure, Linux/Terminal, VS Code

Featured Projects:
1. AI Terminal Portfolio - Interactive terminal-style portfolio with AI integration and data tools (React, Three.js, Groq AI, TypeScript)
2. Sales Analytics Dashboard - Real-time business intelligence dashboard with predictive analytics (Python, Pandas, Power BI, SQL)
3. Web Scraping & Data Pipeline - Automated data collection and processing system with AI enhancement (Python, BeautifulSoup, Scrapy, PostgreSQL)

Experience:
- TechCorp Analytics - Senior Data Analyst (2022-Present)
- DataSolutions Inc - Data Analyst (2020-2022)

Contact:
- Email: suraj.yadav@example.com
- GitHub: github.com/surajyadav
- LinkedIn: linkedin.com/in/surajyadav
- Website: surajyadav.dev
- Twitter: @surajyadav

Response Guidelines:
- Keep responses conversational but professional
- Use data/analytics focused examples when relevant
- Reference specific skills/projects when relevant to the question
- If asked about topics outside your expertise, acknowledge limitations but stay helpful
- Encourage exploration of the portfolio commands (about, skills, projects, experience, education, contact)
- Keep responses concise but informative (aim for 2-6 lines typically)
`;

    // Make request to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
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
      console.error('Groq API Error:', errorData);

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
