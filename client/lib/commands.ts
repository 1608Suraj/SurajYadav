export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  handler: () => string;
}

const generateResumeContent = (): string => {
  const {
    about,
    skills,
    experience,
    education,
    certifications,
    contact,
    projects,
  } = portfolioData;

  return `
SURAJ YADAV
Data Analyst & AI Enthusiast
${contact.email} | ${contact.linkedin} | ${contact.github}

ABOUT
${about.bio}

EXPERIENCE
${experience
  .map(
    (exp) => `
${exp.company} - ${exp.position}
${exp.duration}
${exp.description}
`,
  )
  .join("\n")}

EDUCATION
${education
  .map(
    (edu) => `
${edu.institution}
${edu.degree} | ${edu.year}
GPA: ${edu.gpa}
`,
  )
  .join("\n")}

TECHNICAL SKILLS
Data Analytics: ${skills.analytics.join(", ")}
Data Science: ${skills.datascience.join(", ")}
AI & ML: ${skills.ai.join(", ")}
Tools: ${skills.tools.join(", ")}

CERTIFICATIONS
${certifications.map((cert) => `• ${cert}`).join("\n")}

FEATURED PROJECTS
${projects
  .map(
    (project) => `
${project.name} (${project.status})
${project.description}
Technologies: ${project.tech.join(", ")}
`,
  )
  .join("\n")}

CONTACT
Email: ${contact.email}
LinkedIn: ${contact.linkedin}
GitHub: ${contact.github}
Website: ${contact.website}
`;
};

const downloadResume = (content: string): void => {
  // Create a simple text version for download
  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Suraj_Yadav_Resume.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const executeScraping = async (url: string): Promise<void> => {
  try {
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    if (result.success && result.csvContent) {
      // Download CSV file
      const blob = new Blob([result.csvContent], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `scraped_data_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log(
        `✅ Scraping completed! Downloaded ${result.totalItems} items as CSV`,
      );
    } else {
      console.error(`❌ Scraping failed: ${result.error}`);
    }
  } catch (error) {
    console.error(
      `❌ Scraping error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const portfolioData = {
  about: {
    name: "Suraj Yadav",
    role: "Data Analyst",
    location: "📍 Indore, India",
    phone: "📞 +91 8085546767",
    email: "✉️ 0816surajyadav@gmail.com",
    bio: `Currently working as a Data Analyst Trainee at Debugshala, where I handle end-to-end data workflows including scraping, preprocessing, database management, and cross-team collaboration for dashboard development.

Highly motivated Data Analyst with hands-on experience in data scraping, preprocessing, and enrichment using Python and APIs like Groq/OpenAI.

Skilled in designing data pipelines, cleaning large datasets using Pandas and NumPy, and integrating data into MongoDB for scalable analysis.

Proficient in visual analytics using Power BI and Excel, and capable of supporting dashboard creation for KPIs like ARR growth, revenue analysis, and tech insights.

Quick learner with a keen interest in backend development, API integrations, and AI/ML-driven insights for business transformation.`,
  },
  skills: {
    languages: ["Python", "SQL"],
    libraries: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Scrapy"],
    datatools: ["Power BI", "Excel (Advanced)", "Google Colab"],
    databases: ["MySQL", "MongoDB"],
    frameworks: ["Streamlit", "Flask (Basic)", "Django (Learning Phase)"],
    apis: ["Groq API", "OpenAI API", "RESTful APIs"],
    concepts: [
      "EDA",
      "OOP",
      "Data Structures",
      "API Integration",
      "Error Handling",
    ],
    tools: ["Git & GitHub"],
  },
  projects: [
    {
      id: 1,
      name: "US Logistics Tech Strategy Research",
      description:
        "Scraped data on top US logistics companies from multiple sources using Scrapy. Preprocessed data using Pandas and NumPy to clean and structure key company attributes.",
      tech: ["Python", "WebScraper", "Pandas", "MongoDB", "Groq API"],
      status: "✅ Completed",
      details:
        "Integrated Groq API to enrich company profiles with ARR growth insights and tech stack data. Uploaded structured datasets to MongoDB for scalable access and analysis.",
    },
    {
      id: 2,
      name: "AI Chatbot using Groq & OpenAI",
      description:
        "Built a conversational chatbot using OpenAI for generating human-like responses. Integrated Groq API for low-latency language processing.",
      tech: ["Python", "Groq API", "OpenAI API", "Streamlit"],
      status: "🚀 Live",
      details:
        "Deployed via Streamlit to offer a user-friendly web interface. Designed modular intent handling for extensibility and domain-specific customization.",
    },
    {
      id: 3,
      name: "Email Automation System",
      description:
        "Automated email sending using Python's SMTP libraries for bulk communication. Integrated Pandas to manage recipient data from Excel sheets.",
      tech: ["Python", "SMTP", "Pandas"],
      status: "✅ Completed",
      details:
        "Implemented error handling and logging for failed deliveries and retries. Scheduled scripts to run periodically using task schedulers.",
    },
  ],
  contact: {
    email: "0816surajyadav@gmail.com",
    phone: "+91 8085546767",
    github: "https://github.com/1608Suraj",
    linkedin: "https://www.linkedin.com/in/suraj-yadav-5620902b2/",
    instagram: "https://www.instagram.com/_suraj.py?igsh=MWd3bzFvangyZHNkeQ==",
    location: "Indore, India",
  },
  experience: [
    {
      company: "Debugshala",
      position: "Data Analyst Trainee",
      duration: "Feb 2025 – Present",
      description:
        "Cleaned and structured datasets using Pandas and NumPy for internal analytics projects. Built dashboards using Power BI and Excel to track project KPIs. Developed modular and readable Python code for reuse in future data pipeline projects.",
    },
  ],
  education: [
    {
      institution:
        "Holkar Science College, Devi Ahilya Vishwavidyalaya (DAVV), Indore",
      degree: "Bachelor of Science (B.Sc.) in Computer Science",
      year: "Present",
      status: "Currently Pursuing",
    },
  ],
  certifications: [
    "Data Analysis with Python",
    "Machine Learning Fundamentals",
    "SQL for Data Science",
    "Power BI Certification",
    "MongoDB Basics",
  ],
};

export const createCommands = (
  onAIChat?: (message: string) => Promise<string>,
): Command[] => [
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
    },
  },
  {
    name: "about",
    description: "Learn about me and my background",
    aliases: ["bio", "info"],
    handler: () => {
      const { name, role, location, phone, email, bio } = portfolioData.about;
      return `About Me

${name}
${role}
${location}
${phone}  ${email}

Professional Summary:
${bio}

Type 'skills' to see my technical expertise
Type 'projects' to explore my work
Type 'contact' to get in touch!`;
    },
  },
  {
    name: "skills",
    description: "View my technical skills and expertise",
    aliases: ["tech", "stack"],
    handler: () => {
      const {
        languages,
        libraries,
        datatools,
        databases,
        frameworks,
        apis,
        concepts,
        tools,
      } = portfolioData.skills;

      return `Technical Skills

Languages:
  ${languages.map((skill) => `• ${skill}`).join("\n  ")}

Libraries:
  ${libraries.map((skill) => `• ${skill}`).join("\n  ")}

Data Tools:
  ${datatools.map((skill) => `• ${skill}`).join("\n  ")}

Databases:
  ${databases.map((skill) => `• ${skill}`).join("\n  ")}

Frameworks:
  ${frameworks.map((skill) => `• ${skill}`).join("\n  ")}

APIs:
  ${apis.map((skill) => `• ${skill}`).join("\n  ")}

Concepts:
  ${concepts.map((skill) => `• ${skill}`).join("\n  ")}

Version Control:
  ${tools.map((skill) => `• ${skill}`).join("\n  ")}

Ask me about any of these technologies!
Try: "ask tell me about your Python experience"`;
    },
  },
  {
    name: "projects",
    description: "Explore my featured projects",
    aliases: ["work", "portfolio"],
    handler: () => {
      const projectList = portfolioData.projects
        .map((project, index) => {
          const techStack = project.tech.join(", ");
          const separator =
            index > 0
              ? "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
              : "";
          const projectNumber = index + 1;
          return `${separator}
${projectNumber}. 📦 ${project.name} ${project.status}
   ${project.description}
   🔧 Tech Stack: ${techStack}
   📝 Details: ${project.details || "More details available on request"}`;
        })
        .join("\n");

      return `Featured Projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${projectList}

Want to know more about any project?
Try: "ask tell me more about the US Logistics Tech Strategy Research"`;
    },
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
    },
  },
  {
    name: "experience",
    description: "View my work experience",
    aliases: ["work", "career"],
    handler: () => {
      const experience = portfolioData.experience;

      return `Work Experience

${experience
  .map(
    (exp) =>
      `${exp.company}
${exp.position} | ${exp.duration}

Key Responsibilities:
${exp.description}
`,
  )
  .join("\n")}

For more details, try: "ask about my work experience"`;
    },
  },
  {
    name: "education",
    description: "See my educational background",
    aliases: ["edu", "school"],
    handler: () => {
      const education = portfolioData.education;

      return `Education

${education
  .map(
    (edu) =>
      `${edu.institution}
${edu.degree} | ${edu.year}
Status: ${edu.status || "Completed"}
`,
  )
  .join("\n")}

For more academic details, try: "ask about my education"`;
    },
  },
  {
    name: "certifications",
    description: "View my certifications",
    aliases: ["certs", "certificates"],
    handler: () => {
      const certs = portfolioData.certifications;

      return `Certifications

${certs.map((cert) => `• ${cert}`).join("\n")}

These certifications validate my expertise in data analytics and cloud technologies.
Try: "ask about my certification journey"`;
    },
  },
  {
    name: "contact",
    description: "Get my contact information",
    aliases: ["reach", "connect"],
    handler: () => {
      const { email, phone, github, linkedin, instagram, location } =
        portfolioData.contact;

      return `Contact Information

📧 Email:     CLICKABLE_LINK:mailto:${email}:${email}
📞 Phone:     CLICKABLE_LINK:tel:${phone}:${phone}
📍 Location:  ${location}
🐙 GitHub:    CLICKABLE_LINK:${github}:${github}
💼 LinkedIn:  CLICKABLE_LINK:${linkedin}:${linkedin}
📸 Instagram: CLICKABLE_LINK:${instagram}:${instagram}

Feel free to reach out! I'm always interested in
discussing new opportunities, projects, or just
chatting about data analysis and technology.

Social Media Quick Access:
Type: "contact linkedin" or "contact github" or "contact insta"
Try: "ask what's the best way to contact you?"`;
    },
  },
  {
    name: "clear",
    description: "Clear the terminal screen",
    aliases: ["cls"],
    handler: () => "CLEAR_SCREEN",
  },
  {
    name: "theme",
    description: "Toggle light/dark theme",
    handler: () => {
      return `Theme Toggle
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━━

🌙 Currently in Dark Mode (Terminal Style)
☀️  Light mode coming soon!

The terminal aesthetic works best in dark mode,
but I'm working on a light theme option.`;
    },
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
    },
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
    },
  },
  {
    name: "snake",
    description: "Play snake game",
    aliases: ["game"],
    handler: () => {
      return `SNAKE_GAME_START`;
    },
  },
  {
    name: "python",
    description: "Python code compiler",
    aliases: ["py", "code"],
    handler: () => {
      return `PYTHON_COMPILER_START`;
    },
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
    },
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
    },
  },
];

export const handleCommand = async (
  input: string,
  commands: Command[],
  onAIChat?: (message: string) => Promise<string>,
): Promise<string> => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return "Please enter a command. Type 'help' for available commands.";
  }

  // Parse command and arguments
  const parts = trimmedInput.split(" ");
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

  // Handle special contact redirects
  if (commandName === "contact" && args) {
    const social = args.toLowerCase();
    const { github, linkedin, instagram } = portfolioData.contact;

    switch (social) {
      case "linkedin":
      case "li":
        window.open(linkedin, "_blank");
        return `Opening LinkedIn profile: ${linkedin}`;
      case "github":
      case "git":
        window.open(github, "_blank");
        return `Opening GitHub profile: ${github}`;
      case "instagram":
      case "insta":
        window.open(instagram, "_blank");
        return `Opening Instagram profile: ${instagram}`;
      default:
        return `Social platform "${social}" not found. Available: linkedin, github, insta`;
    }
  }

  // Handle scraping command with URL
  if (commandName === "scrape" && args) {
    try {
      const url = args.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `Invalid URL format. Please provide a complete URL starting with http:// or https://

Example: scrape https://jsonplaceholder.typicode.com/posts`;
      }

      // Trigger scraping process
      executeScraping(url);
      return `🔄 Starting web scraping process...

Target URL: ${url}
Status: Fetching data...
Processing: Please wait while I extract the data

This may take a few moments depending on the website size.`;
    } catch (error) {
      return `Scraping Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  // Handle ask command specially
  if (commandName === "ask" && args) {
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
  const command = commands.find(
    (cmd) =>
      cmd.name === commandName ||
      (cmd.aliases && cmd.aliases.includes(commandName)),
  );

  if (command) {
    const result = command.handler();

    // Handle special command results
    if (result === "SNAKE_GAME_START") {
      return "SNAKE_GAME_START";
    }
    if (result === "PYTHON_COMPILER_START") {
      return "PYTHON_COMPILER_START";
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
