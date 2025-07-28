export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  handler: () => string;
}

export const portfolioData = {
  about: {
    name: "Suraj Yadav",
    role: "Data Analyst & AI Enthusiast",
    bio: `I'm a passionate data analyst who loves extracting insights from complex datasets
and building intelligent solutions using modern analytics tools.
Currently focused on leveraging AI and machine learning for data-driven decisions.

Education: Data Science & Analytics
Location: India
Interests: Data Science, AI, Python, Visualization, Terminal UIs
Always learning, always analyzing.`,
  },
  skills: {
    analytics: [
      "Python/Pandas",
      "SQL/PostgreSQL",
      "Power BI",
      "Tableau",
      "Excel/VBA",
      "R Programming"
    ],
    datascience: [
      "Machine Learning",
      "Scikit-learn",
      "TensorFlow",
      "Statistical Analysis",
      "Data Visualization",
      "Feature Engineering"
    ],
    ai: [
      "OpenAI API",
      "Groq AI",
      "Natural Language Processing",
      "Computer Vision",
      "Deep Learning",
      "MLOps"
    ],
    tools: [
      "Jupyter Notebooks",
      "Git/GitHub",
      "Docker",
      "AWS/Azure",
      "Linux/Terminal",
      "VS Code"
    ]
  },
  projects: [
    {
      id: 1,
      name: "AI Terminal Portfolio",
      description: "Interactive terminal-style portfolio with AI integration and data tools",
      tech: ["React", "Three.js", "Groq AI", "TypeScript"],
      status: "🚀 Live",
      link: "#"
    },
    {
      id: 2,
      name: "Sales Analytics Dashboard",
      description: "Real-time business intelligence dashboard with predictive analytics",
      tech: ["Python", "Pandas", "Power BI", "SQL"],
      status: "✅ Completed",
      link: "#"
    },
    {
      id: 3,
      name: "Web Scraping & Data Pipeline",
      description: "Automated data collection and processing system with AI enhancement",
      tech: ["Python", "BeautifulSoup", "Scrapy", "PostgreSQL"],
      status: "🚀 Live",
      link: "#"
    }
  ],
  contact: {
    email: "suraj.yadav@example.com",
    github: "github.com/surajyadav",
    linkedin: "linkedin.com/in/surajyadav",
    website: "surajyadav.dev",
    twitter: "@surajyadav",
    instagram: "instagram.com/surajyadav"
  },
  experience: [
    {
      company: "TechCorp Analytics",
      position: "Senior Data Analyst",
      duration: "2022 - Present",
      description: "Leading data-driven insights for business strategy and optimization."
    },
    {
      company: "DataSolutions Inc",
      position: "Data Analyst",
      duration: "2020 - 2022",
      description: "Developed predictive models and automated reporting systems."
    }
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "Master of Science in Data Science",
      year: "2020",
      gpa: "3.8/4.0"
    },
    {
      institution: "Technical Institute",
      degree: "Bachelor of Science in Computer Science",
      year: "2018",
      gpa: "3.6/4.0"
    }
  ],
  certifications: [
    "AWS Certified Data Analytics",
    "Microsoft Azure Data Scientist Associate",
    "Google Analytics Certified",
    "Tableau Desktop Specialist",
    "Python for Data Science (IBM)"
  ]
};

export const createCommands = (onAIChat?: (message: string) => Promise<string>): Command[] => [
  {
    name: "help",
    description: "Show available commands",
    aliases: ["h", "?"],
    handler: () => {
      return `Available Commands:

Portfolio Commands:
  about        - Learn about me and my background
  skills       - View my technical skills and expertise
  projects     - Explore my featured projects
  experience   - View my work experience
  education    - See my educational background
  resume       - Download my resume
  contact      - Get my contact information

AI & Interactive Commands:
  chat         - Start AI conversation
  ask <msg>    - Ask me anything via AI
  snake        - Play snake game
  python       - Python code compiler
  scrape <url> - Web scraper tool

System Commands:
  clear        - Clear the terminal screen
  help         - Show this help message
  exit         - Refresh the session

Tips:
  - Use ↑/↓ arrow keys to navigate command history
  - Click commands in the header for quick access
  - Try "ask me about my data analysis experience"`;
    }
  },
  {
    name: "about",
    description: "Learn about me and my background",
    aliases: ["bio", "info"],
    handler: () => {
      const { name, role, bio } = portfolioData.about;
      return `About Me

${name}
${role}

${bio}

Type 'skills' to see my technical expertise
Type 'projects' to explore my work
Type 'contact' to get in touch!`;
    }
  },
  {
    name: "skills",
    description: "View my technical skills and expertise",
    aliases: ["tech", "stack"],
    handler: () => {
      const { analytics, datascience, ai, tools } = portfolioData.skills;

      return `Technical Skills

Data Analytics:
  ${analytics.map(skill => `• ${skill}`).join('\n  ')}

Data Science & ML:
  ${datascience.map(skill => `• ${skill}`).join('\n  ')}

AI & Advanced Analytics:
  ${ai.map(skill => `• ${skill}`).join('\n  ')}

Tools & Platforms:
  ${tools.map(skill => `• ${skill}`).join('\n  ')}

Ask me about any of these technologies!
Try: "ask tell me about your Python experience"`;
    }
  },
  {
    name: "projects",
    description: "Explore my featured projects",
    aliases: ["work", "portfolio"],
    handler: () => {
      const projectList = portfolioData.projects.map(project => {
        const techStack = project.tech.join(', ');
        return `
📦 ${project.name} ${project.status}
   ${project.description}
   🔧 Tech: ${techStack}
   🔗 Link: ${project.link}`;
      }).join('\n');

      return `Featured Projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${projectList}

Want to know more about any project?
Try: "ask tell me more about the AI Chat Platform"`;
    }
  },
  {
    name: "resume",
    description: "View/download my resume",
    aliases: ["cv"],
    handler: () => {
      // Trigger resume download
      const resumeContent = generateResumeContent();
      downloadResume(resumeContent);

      return `Resume Download

📄 Your resume download has started!

Resume Highlights:
• Data Analyst with 4+ years experience
• Expert in Python, SQL, and Machine Learning
• Proven track record in business intelligence
• Strong background in data visualization

Current Status:
✅ Download initiated
📊 Format: PDF
📈 Updated: December 2024

The resume includes:
• Professional experience and achievements
• Technical skills and certifications
• Educational background
• Featured projects and case studies

If download doesn't start automatically, try refreshing the page.`;
    }
  },
  {
    name: "experience",
    description: "View my work experience",
    aliases: ["work", "career"],
    handler: () => {
      const experience = portfolioData.experience;

      return `Work Experience

${experience.map(exp =>
`${exp.company}
${exp.position} | ${exp.duration}
${exp.description}
`).join('\n')}

For more details, try: "ask about my work experience"`;
    }
  },
  {
    name: "education",
    description: "See my educational background",
    aliases: ["edu", "school"],
    handler: () => {
      const education = portfolioData.education;

      return `Education

${education.map(edu =>
`${edu.institution}
${edu.degree} | ${edu.year}
GPA: ${edu.gpa}
`).join('\n')}

For more academic details, try: "ask about my education"`;
    }
  },
  {
    name: "certifications",
    description: "View my certifications",
    aliases: ["certs", "certificates"],
    handler: () => {
      const certs = portfolioData.certifications;

      return `Certifications

${certs.map(cert => `• ${cert}`).join('\n')}

These certifications validate my expertise in data analytics and cloud technologies.
Try: "ask about my certification journey"`;
    }
  },
  {
    name: "contact",
    description: "Get my contact information",
    aliases: ["reach", "connect"],
    handler: () => {
      const { email, github, linkedin, website, twitter, instagram } = portfolioData.contact;

      return `Contact Information

Email:     ${email}
GitHub:    ${github}
LinkedIn:  ${linkedin}
Website:   ${website}
Twitter:   ${twitter}
Instagram: ${instagram}

Feel free to reach out! I'm always interested in
discussing new opportunities, projects, or just
chatting about data and technology.

Social Media Quick Access:
Type: "contact linkedin" or "contact github" or "contact insta"
Try: "ask what's the best way to contact you?"`;
    }
  },
  {
    name: "clear",
    description: "Clear the terminal screen",
    aliases: ["cls"],
    handler: () => "CLEAR_SCREEN"
  },
  {
    name: "theme",
    description: "Toggle light/dark theme",
    handler: () => {
      return `Theme Toggle
━━━━━━━━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌙 Currently in Dark Mode (Terminal Style)
☀️  Light mode coming soon!

The terminal aesthetic works best in dark mode,
but I'm working on a light theme option.`;
    }
  },
  {
    name: "exit",
    description: "Refresh the session",
    aliases: ["quit", "logout"],
    handler: () => {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return `Goodbye! 👋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thanks for exploring my terminal portfolio!

🔄 Refreshing session in 2 seconds...
💡 Bookmark this page to return anytime!`;
    }
  },
  {
    name: "chat",
    description: "Start AI conversation",
    aliases: ["ai"],
    handler: () => {
      return `AI Chat Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 AI Assistant activated!

You can now ask me anything about:
• My experience and skills
• Technical questions
• Project details
• Career advice
• Or just have a casual chat!

Usage:
  ask <your question>
  
Example:
  ask what programming languages do you prefer?
  ask tell me about your most challenging project
  ask what's your experience with React?

💡 The AI has context about my portfolio and experience!`;
    }
  },
  {
    name: "snake",
    description: "Play snake game",
    aliases: ["game"],
    handler: () => {
      return `SNAKE_GAME_START`;
    }
  },
  {
    name: "python",
    description: "Python code compiler",
    aliases: ["py", "code"],
    handler: () => {
      return `PYTHON_COMPILER_START`;
    }
  },
  {
    name: "scrape",
    description: "Web scraper tool",
    aliases: ["webscrape"],
    handler: () => {
      return `Web Scraping Tool

Usage: scrape <url>

Examples:
  scrape https://example.com
  scrape https://api.example.com/data

Features:
• Extract data from websites
• Parse APIs and JSON responses
• Export to CSV format
• AI-powered data cleaning
• Automated data preprocessing

Try: "scrape https://jsonplaceholder.typicode.com/posts"
For AI data processing: "ask clean this scraped data"`;
    }
  },
  {
    name: "ask",
    description: "Ask me anything via AI",
    handler: () => {
      return `Ask Command Usage

Usage: ask <your question>

Examples:
  ask what technologies do you specialize in?
  ask tell me about your background
  ask what's your favorite project?
  ask how did you get into data analysis?

I'll use AI to give you personalized responses!`;
    }
  }
];

export const handleCommand = async (
  input: string,
  commands: Command[],
  onAIChat?: (message: string) => Promise<string>
): Promise<string> => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return "Please enter a command. Type 'help' for available commands.";
  }

  // Parse command and arguments
  const parts = trimmedInput.split(' ');
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  // Handle special contact redirects
  if (commandName === 'contact' && args) {
    const social = args.toLowerCase();
    const { github, linkedin, instagram, twitter, website } = portfolioData.contact;

    switch(social) {
      case 'linkedin':
      case 'li':
        window.open(`https://${linkedin}`, '_blank');
        return `Opening LinkedIn profile: ${linkedin}`;
      case 'github':
      case 'git':
        window.open(`https://${github}`, '_blank');
        return `Opening GitHub profile: ${github}`;
      case 'instagram':
      case 'insta':
        window.open(`https://${instagram}`, '_blank');
        return `Opening Instagram profile: ${instagram}`;
      case 'twitter':
        window.open(`https://${twitter}`, '_blank');
        return `Opening Twitter profile: ${twitter}`;
      case 'website':
      case 'web':
        window.open(`https://${website}`, '_blank');
        return `Opening website: ${website}`;
      default:
        return `Social platform "${social}" not found. Available: linkedin, github, insta, twitter, website`;
    }
  }

  // Handle scraping command with URL
  if (commandName === 'scrape' && args) {
    return `SCRAPE_URL:${args}`;
  }

  // Handle ask command specially
  if (commandName === 'ask' && args) {
    if (onAIChat) {
      try {
        return await onAIChat(args);
      } catch (error) {
        return `AI Error: Unable to process your question right now. Please try again later.`;
      }
    } else {
      return `AI Chat not available. The AI integration is currently being set up.

In the meantime, try these commands:
• about - Learn about my background
• skills - View my technical skills
• projects - Explore my work
• contact - Get in touch directly`;
    }
  }

  // Find matching command
  const command = commands.find(cmd =>
    cmd.name === commandName ||
    (cmd.aliases && cmd.aliases.includes(commandName))
  );

  if (command) {
    const result = command.handler();

    // Handle special command results
    if (result === 'SNAKE_GAME_START') {
      return 'SNAKE_GAME_START';
    }
    if (result === 'PYTHON_COMPILER_START') {
      return 'PYTHON_COMPILER_START';
    }

    return result;
  }

  // Command not found - suggest AI or help
  return `Command not found: "${commandName}"

Did you mean to ask me something? Try:
   ask ${trimmedInput}

Or type 'help' to see all available commands.

The AI can answer questions about my experience,
skills, projects, and much more!`;
};
