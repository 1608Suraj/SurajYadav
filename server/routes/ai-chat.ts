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
- Data Analyst at Debugshala (Feb 2025 – Present)
- Location: Indore, India
- Phone: +91 8085546767
- Email: 0816surajyadav@gmail.com
- Currently working as a Data Analyst Trainee handling end-to-end data workflows including scraping, preprocessing, database management, and cross-team collaboration for dashboard development

Technical Skills:
Languages: Python, SQL
Libraries: Pandas, NumPy, Matplotlib, Seaborn, Scrapy
Data Tools: Power BI, Excel (Advanced), Google Colab
Databases: MySQL, MongoDB
Frameworks: Streamlit, Flask (Basic), Django (Learning Phase)
APIs: Groq API, OpenAI API, RESTful APIs
Concepts: EDA, OOP, Data Structures, API Integration, Error Handling
Version Control: Git & GitHub

Featured Projects:
1. US Logistics Tech Strategy Research - Scraped data on top US logistics companies using Scrapy, preprocessed with Pandas/NumPy, integrated Groq API for enrichment, uploaded to MongoDB (Python, WebScraper, Pandas, MongoDB, Groq API)
2. AI Chatbot using Groq & OpenAI - Built conversational chatbot with OpenAI and Groq API for low-latency processing, deployed via Streamlit (Python, Groq API, OpenAI API, Streamlit)
3. Email Automation System - Automated email sending using Python SMTP, integrated Pandas for recipient management, implemented error handling and logging (Python, SMTP, Pandas)

Experience:
- Debugshala - Data Analyst Trainee (Feb 2025 – Present): Cleaned and structured datasets using Pandas and NumPy for internal analytics projects. Built dashboards using Power BI and Excel to track project KPIs. Developed modular and readable Python code for reuse in future data pipeline projects.

Education:
- Holkar Science College, Devi Ahilya Vishwavidyalaya (DAVV), Indore - Bachelor of Science (B.Sc.) in Computer Science (Currently Pursuing)

Contact:
- Email: 0816surajyadav@gmail.com
- Phone: +91 8085546767
- GitHub: https://github.com/1608Suraj
- LinkedIn: https://www.linkedin.com/in/suraj-yadav-5620902b2/
- Instagram: https://www.instagram.com/_suraj.py
- Location: Indore, India

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
