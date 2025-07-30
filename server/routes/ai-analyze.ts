import { RequestHandler } from "express";
import { z } from "zod";

// Request schema validation
const AnalyzeRequestSchema = z.object({
  content: z.string().min(1),
  url: z.string().url(),
  analysisType: z.enum(["summary", "entities", "insights", "keywords"]).optional().default("summary"),
});

interface AnalyzeResponse {
  success: boolean;
  analysis?: {
    summary: string;
    entities: string[];
    insights: string[];
    keywords: string[];
    relevanceScore: number;
    contentType: string;
  };
  error?: string;
}

export const handleAIAnalyze: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const validation = AnalyzeRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid content or URL provided.",
      } as AnalyzeResponse);
    }

    const { content, url, analysisType } = validation.data;

    // Simple AI-like analysis (enhanced heuristics)
    const analysis = await analyzeContent(content, url, analysisType);

    res.json({
      success: true,
      analysis,
    } as AnalyzeResponse);
  } catch (error) {
    console.error("AI Analysis Error:", error);

    res.json({
      success: false,
      error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    } as AnalyzeResponse);
  }
};

async function analyzeContent(content: string, url: string, analysisType: string) {
  // Enhanced content analysis using pattern matching and heuristics
  const words = content.toLowerCase().split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Extract entities (companies, technologies, locations)
  const entities = extractEntities(content);
  
  // Extract keywords
  const keywords = extractKeywords(words);
  
  // Generate insights based on content patterns
  const insights = generateInsights(content, url, entities);
  
  // Create summary
  const summary = generateSummary(sentences, entities, url);
  
  // Calculate relevance score
  const relevanceScore = calculateRelevanceScore(content, entities, keywords);
  
  // Determine content type
  const contentType = determineContentType(content, url);

  return {
    summary,
    entities: entities.slice(0, 10), // Top 10 entities
    insights: insights.slice(0, 5),  // Top 5 insights
    keywords: keywords.slice(0, 15), // Top 15 keywords
    relevanceScore,
    contentType
  };
}

function extractEntities(content: string): string[] {
  const entities = new Set<string>();
  
  // Technology patterns
  const techPatterns = [
    /\b(Python|JavaScript|React|Node\.js|MongoDB|SQL|PostgreSQL|MySQL|Docker|AWS|Azure|GCP|Kubernetes)\b/gi,
    /\b(AI|ML|Machine Learning|Data Science|Analytics|API|REST|GraphQL|JSON|XML)\b/gi,
    /\b(GitHub|GitLab|Slack|Teams|Zoom|Figma|VS Code|IntelliJ)\b/gi
  ];
  
  // Company patterns
  const companyPatterns = [
    /\b([A-Z][a-z]+ (?:Inc|LLC|Corp|Corporation|Ltd|Limited|Co|Company))\b/g,
    /\b(Google|Apple|Microsoft|Amazon|Meta|Tesla|Netflix|Spotify|Uber|Airbnb)\b/gi,
    /\b(Y Combinator|YC|Techstars|500 Startups)\b/gi
  ];
  
  // Location patterns
  const locationPatterns = [
    /\b(San Francisco|New York|London|Tokyo|Berlin|Sydney|Toronto|Mumbai|Bangalore)\b/gi,
    /\b(Silicon Valley|Bay Area|NYC|LA|Seattle)\b/gi
  ];
  
  // Apply all patterns
  [...techPatterns, ...companyPatterns, ...locationPatterns].forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => entities.add(match.trim()));
    }
  });
  
  return Array.from(entities);
}

function extractKeywords(words: string[]): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
      wordCount.set(cleanWord, (wordCount.get(cleanWord) || 0) + 1);
    }
  });
  
  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

function generateInsights(content: string, url: string, entities: string[]): string[] {
  const insights: string[] = [];
  
  // Insight 1: Content length and depth
  if (content.length > 5000) {
    insights.push("Rich, comprehensive content with detailed information");
  } else if (content.length > 1000) {
    insights.push("Moderate content depth with good coverage");
  } else {
    insights.push("Concise content, may need additional detail");
  }
  
  // Insight 2: Technology focus
  const techEntities = entities.filter(e => 
    /\b(Python|JavaScript|React|AI|ML|API|Data|Analytics)\b/i.test(e)
  );
  if (techEntities.length > 3) {
    insights.push("Strong technology focus with multiple tech stack mentions");
  }
  
  // Insight 3: Business context
  const businessTerms = content.match(/\b(startup|company|business|revenue|funding|growth|scale)\b/gi);
  if (businessTerms && businessTerms.length > 5) {
    insights.push("Business-oriented content with commercial focus");
  }
  
  // Insight 4: Educational content
  const educationalTerms = content.match(/\b(learn|tutorial|guide|how to|example|documentation)\b/gi);
  if (educationalTerms && educationalTerms.length > 3) {
    insights.push("Educational or instructional content detected");
  }
  
  // Insight 5: URL-based insights
  if (url.includes('github.com')) {
    insights.push("Code repository or developer-focused content");
  } else if (url.includes('linkedin.com')) {
    insights.push("Professional networking or career-related content");
  } else if (url.includes('ycombinator.com')) {
    insights.push("Startup ecosystem and entrepreneurship content");
  }
  
  return insights;
}

function generateSummary(sentences: string[], entities: string[], url: string): string {
  // Take first 2-3 most informative sentences
  const informativeness = sentences.map(sentence => {
    let score = 0;
    
    // Score based on entity mentions
    entities.forEach(entity => {
      if (sentence.toLowerCase().includes(entity.toLowerCase())) {
        score += 2;
      }
    });
    
    // Score based on sentence length (not too short, not too long)
    if (sentence.length > 50 && sentence.length < 200) {
      score += 1;
    }
    
    // Score based on informative words
    const infoWords = ['provides', 'offers', 'specializes', 'focuses', 'develops', 'creates', 'builds'];
    infoWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) {
        score += 1;
      }
    });
    
    return { sentence: sentence.trim(), score };
  });
  
  // Sort by score and take top sentences
  const topSentences = informativeness
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.sentence)
    .filter(s => s.length > 0);
  
  if (topSentences.length === 0) {
    return `Content analysis from ${new URL(url).hostname} - processed and summarized.`;
  }
  
  return topSentences.join(' ');
}

function calculateRelevanceScore(content: string, entities: string[], keywords: string[]): number {
  let score = 0;
  
  // Base score from content length
  score += Math.min(content.length / 1000, 10); // Max 10 points for length
  
  // Score from entities
  score += entities.length * 2; // 2 points per entity
  
  // Score from keyword diversity
  score += Math.min(keywords.length / 2, 15); // Max 15 points for keywords
  
  // Score from structured content indicators
  if (content.includes('<') || content.includes('{')) {
    score += 5; // Bonus for structured data
  }
  
  // Normalize to 0-100 scale
  return Math.min(Math.round(score), 100);
}

function determineContentType(content: string, url: string): string {
  // API endpoint
  if (url.includes('/api/') || content.startsWith('{') || content.startsWith('[')) {
    return "API Response";
  }
  
  // Company/startup directory
  if (url.includes('ycombinator.com') || content.includes('startup') || content.includes('company')) {
    return "Company Directory";
  }
  
  // Documentation
  if (content.includes('documentation') || content.includes('docs') || url.includes('/docs/')) {
    return "Documentation";
  }
  
  // News/Blog
  if (content.includes('published') || content.includes('author') || url.includes('/blog/')) {
    return "Article/Blog";
  }
  
  // Product page
  if (content.includes('product') || content.includes('features') || content.includes('pricing')) {
    return "Product Page";
  }
  
  return "General Web Content";
}
