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

  const separator = "=".repeat(80);
  const subseparator = "-".repeat(50);

  return `${separator}
                          SURAJ YADAV
                         ${about.role}
${separator}

PERSONAL INFORMATION
${subseparator}
Name:         ${about.name}
Role:         ${about.role}
Location:     ${about.location.replace("📍 ", "")}
Phone:        ${contact.phone.replace("📞 ", "")}
Email:        ${contact.email.replace("✉️ ", "")}
LinkedIn:     ${contact.linkedin}
GitHub:       ${contact.github}
Instagram:    ${contact.instagram}

PROFESSIONAL SUMMARY
${subseparator}
${about.bio.replace(/\n\n/g, "\n").trim()}

WORK EXPERIENCE
${subseparator}
${experience
  .map(
    (exp, index) => `${index + 1}. ${exp.company.toUpperCase()}
   Position: ${exp.position}
   Duration: ${exp.duration}

   Key Responsibilities:
   ${exp.description.split(". ").map(task => `   • ${task.trim()}`).join("\n")}
`
  )
  .join("\n")}

EDUCATION
${subseparator}
${education
  .map(
    (edu, index) => `${index + 1}. ${edu.institution.toUpperCase()}
   Degree:   ${edu.degree}
   Year:     ${edu.year}
   Status:   ${edu.status || "Completed"}
`
  )
  .join("\n")}

TECHNICAL SKILLS & EXPERTISE
${subseparator}
Programming Languages:
  ${skills.languages.map(lang => `• ${lang}`).join("\n  ")}

Libraries & Frameworks:
  ${skills.libraries.map(lib => `• ${lib}`).join("\n  ")}
  ${skills.frameworks.map(fw => `• ${fw}`).join("\n  ")}

Data Analysis Tools:
  ${skills.datatools.map(tool => `• ${tool}`).join("\n  ")}

Databases:
  ${skills.databases.map(db => `• ${db}`).join("\n  ")}

APIs & Integration:
  ${skills.apis.map(api => `• ${api}`).join("\n  ")}

Core Concepts:
  ${skills.concepts.map(concept => `• ${concept}`).join("\n  ")}

Version Control & Tools:
  ${skills.tools.map(tool => `• ${tool}`).join("\n  ")}

PROFESSIONAL CERTIFICATIONS
${subseparator}
${certifications.map((cert, index) => `${index + 1}. ${cert}`).join("\n")}

FEATURED PROJECTS
${subseparator}
${projects
  .map(
    (project, index) => `${index + 1}. ${project.name.toUpperCase()} ${project.status}

   Project Overview:
   ${project.description}

   Technologies Used:
   ${project.tech.map(tech => `   • ${tech}`).join("\n")}

   Key Details:
   ${project.details}
`
  )
  .join("\n")}

CONTACT INFORMATION
${subseparator}
Email:        ${contact.email.replace("✉️ ", "")}
Phone:        ${contact.phone.replace("📞 ", "")}
LinkedIn:     ${contact.linkedin}
GitHub:       ${contact.github}
Instagram:    ${contact.instagram}
Location:     ${contact.location.replace("📍 ", "")}

${separator}
Generated on: ${new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
${separator}
`;
};

const downloadResume = (content: string, format: 'txt' | 'pdf' = 'txt'): void => {
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'txt') {
    // Create a formatted text version for download
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Suraj_Yadav_Resume_${timestamp}.txt`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

const generateHTMLResume = (): string => {
  const {
    about,
    skills,
    experience,
    education,
    certifications,
    contact,
    projects,
  } = portfolioData;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suraj Yadav - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .resume-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        h2 {
            color: #2980b9;
            margin: 25px 0 15px 0;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        h3 { color: #34495e; margin: 15px 0 10px 0; }
        .contact-info {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .contact-info p { margin: 5px 0; }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        .skill-category {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .skill-category h4 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        ul { margin-left: 20px; }
        li { margin: 5px 0; }
        .project {
            background: #f8f9fa;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #e74c3c;
        }
        .project h3 { color: #c0392b; margin-bottom: 10px; }
        .tech-stack {
            background: #ecf0f1;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
        }
        .status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .status.completed { background: #d4edda; color: #155724; }
        .status.live { background: #cce5ff; color: #004085; }
        @media print {
            body { background: white; }
            .resume-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <h1>${about.name}</h1>
        <div class="contact-info">
            <p><strong>Role:</strong> ${about.role}</p>
            <p><strong>Location:</strong> ${about.location.replace("📍 ", "")}</p>
            <p><strong>Email:</strong> <a href="mailto:${contact.email.replace("✉️ ", "")}">${contact.email.replace("✉️ ", "")}</a></p>
            <p><strong>Phone:</strong> ${contact.phone.replace("📞 ", "")}</p>
            <p><strong>LinkedIn:</strong> <a href="${contact.linkedin}">${contact.linkedin}</a></p>
            <p><strong>GitHub:</strong> <a href="${contact.github}">${contact.github}</a></p>
        </div>

        <h2>Professional Summary</h2>
        <p>${about.bio.replace(/\n\n/g, "</p><p>").replace(/\n/g, " ")}</p>

        <h2>Work Experience</h2>
        ${experience.map(exp => `
            <h3>${exp.company} - ${exp.position}</h3>
            <p><em>${exp.duration}</em></p>
            <p>${exp.description}</p>
        `).join("")}

        <h2>Education</h2>
        ${education.map(edu => `
            <h3>${edu.institution}</h3>
            <p><strong>${edu.degree}</strong> | ${edu.year}</p>
            <p>Status: ${edu.status || "Completed"}</p>
        `).join("")}

        <h2>Technical Skills</h2>
        <div class="skills-grid">
            <div class="skill-category">
                <h4>Programming Languages</h4>
                <ul>${skills.languages.map(lang => `<li>${lang}</li>`).join("")}</ul>
            </div>
            <div class="skill-category">
                <h4>Libraries & Frameworks</h4>
                <ul>${skills.libraries.concat(skills.frameworks).map(item => `<li>${item}</li>`).join("")}</ul>
            </div>
            <div class="skill-category">
                <h4>Data Tools</h4>
                <ul>${skills.datatools.map(tool => `<li>${tool}</li>`).join("")}</ul>
            </div>
            <div class="skill-category">
                <h4>Databases</h4>
                <ul>${skills.databases.map(db => `<li>${db}</li>`).join("")}</ul>
            </div>
        </div>

        <h2>Certifications</h2>
        <ul>
            ${certifications.map(cert => `<li>${cert}</li>`).join("")}
        </ul>

        <h2>Featured Projects</h2>
        ${projects.map(project => `
            <div class="project">
                <h3>${project.name} <span class="status ${project.status.includes('✅') ? 'completed' : 'live'}">${project.status}</span></h3>
                <p>${project.description}</p>
                <div class="tech-stack">
                    <strong>Technologies:</strong> ${project.tech.join(", ")}
                </div>
                <p><strong>Details:</strong> ${project.details}</p>
            </div>
        `).join("")}

        <p style="text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 0.9em;">
            Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
        </p>
    </div>
</body>
</html>`;
};

const downloadHTMLResume = (): void => {
  const htmlContent = generateHTMLResume();
  const timestamp = new Date().toISOString().split('T')[0];

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Suraj_Yadav_Resume_${timestamp}.html`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const executeScraping = async (url: string): Promise<void> => {
  try {
    console.log(`🔄 Initiating scrape for: ${url}`);

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
      const blob = new Blob([result.csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `scraped_data_${new Date().toISOString().split("T")[0]}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Show success message in console
      console.log(`✅ Scraping completed successfully!`);
      console.log(`📊 Total items scraped: ${result.totalItems}`);
      console.log(
        `📥 CSV file downloaded: scraped_data_${new Date().toISOString().split("T")[0]}.csv`,
      );
      console.log(`📝 Preview of first few items:`, result.data?.slice(0, 3));
    } else {
      console.error(`❌ Scraping failed: ${result.error || "Unknown error"}`);
      console.log(
        `💡 Try a different URL or check if the website allows scraping`,
      );
    }
  } catch (error) {
    console.error(
      `❌ Network error during scraping: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    console.log(`💡 Please check your internet connection and try again`);
  }
};

export const portfolioData = {
  about: {
    name: "Suraj Yadav",
    role: "Data Analyst",
    location: "📍 Indore, India",
    phone: "📞 +91 8085546767",
    email: "✉�� 0816surajyadav@gmail.com",
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

📋 Portfolio Commands:
  about        - Learn about me and my background
  skills       - View my technical skills and expertise
  projects     - Explore my featured projects
  experience   - View my work experience
  education    - See my educational background
  certifications - View my certifications
  resume       - Download my resume
  contact      - Get my contact information (with clickable links)

🤖 AI & Interactive Commands:
  chat         - Start AI conversation (Groq AI powered)
  ask <msg>    - Ask me anything via AI
  snake        - Play snake game
  python       - Python code compiler
  scrape <url> - Web scraper tool

🛠️ System Commands:
  clear        - Clear the terminal screen
  help         - Show this help message
  exit         - Refresh the session

💡 Tips:
  - Use ↑/↓ arrow keys to navigate command history
  - Click commands in the header for quick access
  - All contact links are clickable!
  - Try "ask me about my data analysis experience"
  - Use "contact linkedin" for direct social media access`;
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
  ${databases.map((skill) => `�� ${skill}`).join("\n  ")}

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
      // Trigger both text and HTML resume downloads
      const resumeContent = generateResumeContent();
      downloadResume(resumeContent, 'txt');

      // Also generate HTML version
      setTimeout(() => {
        downloadHTMLResume();
      }, 500);

      return `Resume Download Package

📄 Your resume downloads have started!

Download Package Includes:
• Professional Text Resume (.txt) - ATS friendly
• Formatted HTML Resume (.html) - Web optimized

Resume Highlights:
• Data Analyst Trainee at Debugshala (Feb 2025 - Present)
• Expert in Python, SQL, and Data Analytics
• Experience with data scraping and preprocessing
• Strong background in data visualization with Power BI

Current Status:
✅ Text version downloaded
✅ HTML version downloaded
🗓️ Updated: ${new Date().toLocaleDateString()}

Format Benefits:
• .txt - Perfect for ATS systems and applicant tracking
• .html - Beautiful formatting for direct viewing
• Both include complete professional profile
• Timestamped filenames for organization

The resume includes:
• Professional experience and achievements
• Technical skills and certifications
• Educational background
• Featured projects and case studies
• Contact information with clickable links (HTML version)

Print-ready and web-optimized for all application needs!`;
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

📧 Email:     ${email}
📞 Phone:     ${phone}
📍 Location:  ${location}
🐙 GitHub:    ${github}
💼 LinkedIn:  ${linkedin}
📸 Instagram: ${instagram}

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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━��

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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━

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
  scrape https://jsonplaceholder.typicode.com/posts
  scrape https://api.github.com/users/octocat

Features:
• Extract data from websites and APIs
• Parse JSON responses automatically
• Export to CSV format with instant download
• AI-powered data cleaning and preprocessing
• Handle both HTML and JSON data sources

Download Options:
• Automatically downloads CSV file after scraping
• File named with current date: scraped_data_YYYY-MM-DD.csv
• Up to 100 records per scrape (performance optimized)

Try: "scrape https://jsonplaceholder.typicode.com/posts"
For AI data processing: "ask clean this scraped data"`;
    },
  },
  {
    name: "theme",
    description: "Toggle light/dark theme",
    handler: () => {
      return `TOGGLE_THEME`;
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
        return `Instagram: ${instagram}`;
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
Processing: Extracting and converting to CSV format

📥 Download will start automatically when complete
⏱️ This may take a few moments depending on the data size
📊 Results will be limited to first 100 records for performance`;
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
