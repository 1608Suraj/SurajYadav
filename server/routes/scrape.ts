import { RequestHandler } from "express";
import { z } from "zod";

// Request schema validation
const ScrapeRequestSchema = z.object({
  url: z.string().url(),
  dataType: z.enum(["html", "api", "json"]).optional().default("html"),
});

interface ScrapeResponse {
  success: boolean;
  data?: any[];
  error?: string;
  downloadUrl?: string;
}

export const handleScrape: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const validation = ScrapeRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid URL provided. Please provide a valid URL.",
      } as ScrapeResponse);
    }

    const { url, dataType } = validation.data;

    // Basic URL safety check
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return res.status(400).json({
        success: false,
        error: "URL must start with http:// or https://",
      } as ScrapeResponse);
    }

    let scrapedData: any[] = [];

    if (
      dataType === "api" ||
      dataType === "json" ||
      url.includes("api") ||
      url.includes(".json")
    ) {
      // Handle API/JSON scraping
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; DataScrapingBot/1.0)",
            Accept: "application/json, text/plain, */*",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different JSON structures
        if (Array.isArray(data)) {
          scrapedData = data.slice(0, 100); // Limit to 100 items
        } else if (data && typeof data === "object") {
          // Try to find array properties in the response
          const arrayKeys = Object.keys(data).filter((key) =>
            Array.isArray(data[key]),
          );
          if (arrayKeys.length > 0) {
            scrapedData = data[arrayKeys[0]].slice(0, 100);
          } else {
            scrapedData = [data];
          }
        }
      } catch (error) {
        return res.json({
          success: false,
          error: `Failed to fetch API data: ${error instanceof Error ? error.message : "Unknown error"}`,
        } as ScrapeResponse);
      }
    } else {
      // Handle HTML scraping (simplified for demo)
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; DataScrapingBot/1.0)",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Enhanced HTML parsing to extract actual content
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "No title found";

        // Extract meta description
        const descMatch = html.match(
          /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
        );
        const description = descMatch
          ? descMatch[1].trim()
          : "No description found";

        // Extract headings
        const headings = [];
        const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
        const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
        const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi);

        if (h1Matches)
          headings.push(
            ...h1Matches.map((h) => h.replace(/<[^>]*>/g, "").trim()),
          );
        if (h2Matches)
          headings.push(
            ...h2Matches.map((h) => h.replace(/<[^>]*>/g, "").trim()),
          );
        if (h3Matches)
          headings.push(
            ...h3Matches.map((h) => h.replace(/<[^>]*>/g, "").trim()),
          );

        // Extract paragraph content with improved parsing
        const paragraphs = [];
        const pMatches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi);
        if (pMatches) {
          paragraphs.push(
            ...pMatches
              .map((p) => {
                // Remove HTML tags and decode entities
                let text = p.replace(/<[^>]*>/g, "").trim();
                text = text
                  .replace(/&nbsp;/g, " ")
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&quot;/g, '"');
                return text;
              })
              .filter(
                (p) =>
                  p.length > 20 &&
                  !p.includes("Click here") &&
                  !p.includes("Read more"),
              )
              .slice(0, 15),
          );
        }

        // Universal content extraction patterns
        const extractedCards = [];

        // Extract company/product cards (universal patterns)
        const cardPatterns = [
          // YC and startup directories
          /<div[^>]*class[^>]*(?:company|startup|card|item)[^>]*>[\s\S]*?<\/div>/gi,
          // E-commerce products
          /<div[^>]*class[^>]*(?:product|listing|tile)[^>]*>[\s\S]*?<\/div>/gi,
          // Blog posts and articles
          /<article[^>]*>[\s\S]*?<\/article>/gi,
          // News items
          /<div[^>]*class[^>]*(?:news|post|story)[^>]*>[\s\S]*?<\/div>/gi,
          // Profile/person cards
          /<div[^>]*class[^>]*(?:profile|person|member|user)[^>]*>[\s\S]*?<\/div>/gi,
          // General content cards
          /<div[^>]*class[^>]*(?:card|panel|box|container)[^>]*>[\s\S]*?<\/div>/gi,
        ];

        cardPatterns.forEach((pattern, patternIndex) => {
          const matches = html.match(pattern);
          if (matches) {
            matches.slice(0, 8).forEach((match, matchIndex) => {
              const cardData = extractCardData(match, patternIndex);
              if (cardData.title || cardData.description) {
                extractedCards.push({
                  ...cardData,
                  id: `${patternIndex}_${matchIndex}`,
                  extractionMethod: getExtractionMethodName(patternIndex),
                });
              }
            });
          }
        });

        // AI-powered content analysis for additional insights
        const fullTextContent = html
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const aiInsights = await generateContentInsights(fullTextContent, url);

        // Extract article content
        const articles = [];
        const articleMatches = html.match(
          /<article[^>]*>[\s\S]*?<\/article>/gi,
        );
        if (articleMatches) {
          articleMatches.slice(0, 5).forEach((article) => {
            const text = article.replace(/<[^>]*>/g, "").trim();
            if (text.length > 50) {
              articles.push(
                text.substring(0, 500) + (text.length > 500 ? "..." : ""),
              );
            }
          });
        }

        // Extract list items
        const listItems = [];
        const liMatches = html.match(/<li[^>]*>[\s\S]*?<\/li>/gi);
        if (liMatches) {
          listItems.push(
            ...liMatches
              .map((li) => li.replace(/<[^>]*>/g, "").trim())
              .filter((li) => li.length > 10 && li.length < 200)
              .slice(0, 20),
          );
        }

        // Extract div content with meaningful classes
        const contentDivs = [];
        const meaningfulClasses = [
          "content",
          "article",
          "post",
          "description",
          "summary",
          "text",
          "body",
        ];
        meaningfulClasses.forEach((className) => {
          const regex = new RegExp(
            `<div[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\/div>`,
            "gi",
          );
          const matches = html.match(regex);
          if (matches) {
            matches.slice(0, 3).forEach((match) => {
              const text = match.replace(/<[^>]*>/g, "").trim();
              if (text.length > 50) {
                contentDivs.push(
                  text.substring(0, 300) + (text.length > 300 ? "..." : ""),
                );
              }
            });
          }
        });

        // Extract links
        const links = [];
        const linkMatches = html.match(
          /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi,
        );
        if (linkMatches) {
          linkMatches.slice(0, 20).forEach((link) => {
            const hrefMatch = link.match(/href="([^"]*)"/);
            const textMatch = link.match(/>([^<]+)</);
            if (hrefMatch && textMatch) {
              links.push({
                url: hrefMatch[1],
                text: textMatch[1].trim(),
              });
            }
          });
        }

        // Extract images
        const images = [];
        const imgMatches = html.match(/<img[^>]*src="([^"]*)"[^>]*>/gi);
        if (imgMatches) {
          imgMatches.slice(0, 10).forEach((img) => {
            const srcMatch = img.match(/src="([^"]*)"/);
            const altMatch = img.match(/alt="([^"]*)"/);
            if (srcMatch) {
              images.push({
                src: srcMatch[1],
                alt: altMatch ? altMatch[1] : "No alt text",
              });
            }
          });
        }

        // Extract main text content using multiple strategies
        const mainContent = [];

        // Strategy 1: Extract from main, section, article tags
        const mainTags = html.match(
          /<(main|section|article)[^>]*>[\s\S]*?<\/(main|section|article)>/gi,
        );
        if (mainTags) {
          mainTags.slice(0, 3).forEach((tag) => {
            const text = tag.replace(/<[^>]*>/g, "").trim();
            if (text.length > 100) {
              mainContent.push(
                text.substring(0, 500) + (text.length > 500 ? "..." : ""),
              );
            }
          });
        }

        // Extract structured data (JSON-LD)
        const structuredData = [];
        const jsonLdMatches = html.match(
          /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
        );
        if (jsonLdMatches) {
          jsonLdMatches.slice(0, 3).forEach((match) => {
            try {
              const jsonContent = match.replace(/<[^>]*>/g, "").trim();
              const parsed = JSON.parse(jsonContent);
              if (parsed.name || parsed.headline || parsed.description) {
                structuredData.push({
                  type: parsed["@type"] || "Unknown",
                  name: parsed.name || parsed.headline,
                  description: parsed.description,
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          });
        }

        // Create detailed scraped data with enhanced content
        const baseData = {
          url: url,
          title: title,
          description: description,
          headings: headings.slice(0, 15),
          paragraphs: paragraphs.slice(0, 10),
          articles: articles,
          listItems: listItems.slice(0, 15),
          contentDivs: contentDivs,
          mainContent: mainContent,
          links: links.slice(0, 20),
          images: images.slice(0, 10),
          aiInsights: aiInsights,
          scrapedAt: new Date().toISOString(),
          contentLength: html.length,
          totalHeadings: headings.length,
          totalParagraphs: paragraphs.length,
          totalLinks: links.length,
          totalImages: images.length,
          totalArticles: articles.length,
          totalListItems: listItems.length,
          totalStructuredItems: extractedCards.length,
          contentQuality: {
            hasStructuredData: extractedCards.length > 0,
            hasMainContent: mainContent.length > 0,
            hasArticles: articles.length > 0,
            hasAIInsights: aiInsights.keywords.length > 0,
            contentRichness:
              headings.length +
              paragraphs.length +
              articles.length +
              listItems.length +
              extractedCards.length,
            relevanceScore: aiInsights.relevanceScore,
            contentType: aiInsights.contentType,
          },
        };

        // If we found structured data, create separate entries for each item
        if (extractedCards.length > 0) {
          scrapedData = extractedCards.map((item, index) => ({
            ...baseData,
            id: index + 1,
            itemTitle: item.title,
            itemDescription: item.description,
            itemTags: item.tags.join(", "),
            itemPrice: item.price || "",
            itemLocation: item.location || "",
            extractionMethod: item.extractionMethod,
            type: "structured_item",
          }));
        } else {
          scrapedData = [{ ...baseData, type: "website_summary" }];
        }
      } catch (error) {
        return res.json({
          success: false,
          error: `Failed to scrape HTML: ${error instanceof Error ? error.message : "Unknown error"}`,
        } as ScrapeResponse);
      }
    }

    // Generate CSV content
    if (scrapedData.length === 0) {
      return res.json({
        success: false,
        error: "No data found to scrape from the provided URL",
      } as ScrapeResponse);
    }

    // Convert to CSV
    const csvContent = convertToCSV(scrapedData);

    res.json({
      success: true,
      data: scrapedData.slice(0, 5), // Return first 5 items for preview
      csvContent: csvContent,
      totalItems: scrapedData.length,
    } as ScrapeResponse & { csvContent: string; totalItems: number });
  } catch (error) {
    console.error("Scraping Error:", error);

    res.json({
      success: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    } as ScrapeResponse);
  }
};

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  // Flatten and process the data for better CSV output
  const processedData = data.map((item) => {
    const processed: any = {};

    Object.keys(item).forEach((key) => {
      const value = item[key];

      if (Array.isArray(value)) {
        // Handle arrays - join with | separator
        if (value.length === 0) {
          processed[key] = "";
        } else if (typeof value[0] === "object") {
          // For object arrays, extract key information
          processed[key] = value
            .map(
              (obj) =>
                obj.name ||
                obj.text ||
                obj.title ||
                obj.type ||
                JSON.stringify(obj),
            )
            .join(" | ");
        } else {
          processed[key] = value.join(" | ");
        }
      } else if (typeof value === "object" && value !== null) {
        // Handle objects - convert to readable string
        if (value.hasStructuredData !== undefined) {
          // Handle contentQuality object specifically
          processed[`${key}_hasStructuredData`] = value.hasStructuredData;
          processed[`${key}_hasMainContent`] = value.hasMainContent;
          processed[`${key}_hasArticles`] = value.hasArticles;
          processed[`${key}_contentRichness`] = value.contentRichness;
        } else {
          processed[key] = JSON.stringify(value);
        }
      } else {
        processed[key] = value;
      }
    });

    return processed;
  });

  // Get all unique keys from processed data
  const allKeys = new Set<string>();
  processedData.forEach((item) => {
    Object.keys(item).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);

  // Create CSV header
  const csvHeaders = headers.map((header) => `"${header}"`).join(",");

  // Create CSV rows
  const csvRows = processedData.map((item) => {
    return headers
      .map((header) => {
        const value = item?.[header] ?? "";
        // Handle different data types
        let stringValue = "";
        if (typeof value === "boolean") {
          stringValue = value.toString();
        } else if (typeof value === "number") {
          stringValue = value.toString();
        } else {
          stringValue = String(value);
        }

        // Escape quotes and wrap in quotes, limit length for readability
        const truncatedValue =
          stringValue.length > 500
            ? stringValue.substring(0, 500) + "..."
            : stringValue;
        const escapedValue = truncatedValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}

// Helper function to extract data from content cards
function extractCardData(html: string, patternIndex: number): any {
  const cardData: any = {
    title: "",
    description: "",
    tags: [],
    price: "",
    location: "",
    url: "",
    image: "",
  };

  // Extract title/heading
  const titlePatterns = [
    /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i,
    /<div[^>]*class[^>]*(?:title|name|heading)[^>]*>([^<]+)<\/div>/i,
    /<span[^>]*class[^>]*(?:title|name|heading)[^>]*>([^<]+)<\/span>/i,
    /<a[^>]*class[^>]*(?:title|name|link)[^>]*>([^<]+)<\/a>/i,
  ];

  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match) {
      cardData.title = match[1].trim();
      break;
    }
  }

  // Extract description
  const descPatterns = [
    /<p[^>]*>([^<]+)<\/p>/i,
    /<div[^>]*class[^>]*(?:description|summary|excerpt)[^>]*>([^<]+)<\/div>/i,
    /<span[^>]*class[^>]*(?:description|summary)[^>]*>([^<]+)<\/span>/i,
  ];

  for (const pattern of descPatterns) {
    const match = html.match(pattern);
    if (match) {
      cardData.description = match[1].trim();
      break;
    }
  }

  // Extract tags/categories
  const tagPatterns = [
    /class[^>]*(?:tag|category|label|badge)[^>]*>([^<]+)</gi,
    /<span[^>]*class[^>]*(?:tag|category)[^>]*>([^<]+)<\/span>/gi,
  ];

  tagPatterns.forEach((pattern) => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const tag = match.replace(/<[^>]*>/g, "").trim();
        if (tag && tag.length < 50) {
          cardData.tags.push(tag);
        }
      });
    }
  });

  // Extract price (for e-commerce)
  const pricePatterns = [
    /\$[\d,]+\.?\d*/g,
    /[\d,]+\.?\d*\s*(?:USD|EUR|GBP|₹|¥)/g,
    /class[^>]*price[^>]*>([^<]*[\d]+[^<]*)<\/[^>]*>/i,
  ];

  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      cardData.price = match[0].trim();
      break;
    }
  }

  // Extract location
  const locationPatterns = [
    /class[^>]*(?:location|address|city)[^>]*>([^<]+)</i,
    /\b(?:San Francisco|New York|London|Tokyo|Berlin|Sydney|Toronto|Mumbai|Bangalore)\b/i,
  ];

  for (const pattern of locationPatterns) {
    const match = html.match(pattern);
    if (match) {
      cardData.location = match[1] ? match[1].trim() : match[0].trim();
      break;
    }
  }

  // Extract URL
  const urlMatch = html.match(/href="([^"]+)"/i);
  if (urlMatch) {
    cardData.url = urlMatch[1];
  }

  // Extract image
  const imgMatch = html.match(/src="([^"]+)"/i);
  if (imgMatch) {
    cardData.image = imgMatch[1];
  }

  return cardData;
}

// Helper function to get extraction method name
function getExtractionMethodName(patternIndex: number): string {
  const methods = [
    "Company/Startup Directory",
    "E-commerce Product",
    "Article/Blog Post",
    "News Item",
    "Profile/Person",
    "General Content Card",
  ];
  return methods[patternIndex] || "Unknown";
}

// AI-powered content insights
async function generateContentInsights(content: string, url: string) {
  try {
    // Simple pattern-based analysis (simulating AI)
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = words.length;

    // Extract keywords using frequency analysis
    const wordFreq = new Map<string, number>();
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ]);

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
      if (cleanWord.length > 2 && !stopWords.has(cleanWord)) {
        wordFreq.set(cleanWord, (wordFreq.get(cleanWord) || 0) + 1);
      }
    });

    const keywords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Generate summary
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 30);
    const summary = sentences.slice(0, 2).join(". ") + ".";

    // Calculate relevance score
    const relevanceScore = Math.min(
      Math.round(
        wordCount / 100 + keywords.length * 2 + sentences.length * 0.5,
      ),
      100,
    );

    // Determine content type
    let contentType = "General Content";
    if (url.includes("api") || content.includes('{"')) {
      contentType = "API/JSON Data";
    } else if (content.includes("company") || content.includes("startup")) {
      contentType = "Business/Company";
    } else if (content.includes("product") || content.includes("buy")) {
      contentType = "E-commerce/Product";
    } else if (content.includes("blog") || content.includes("article")) {
      contentType = "Blog/Article";
    }

    return {
      summary: summary.substring(0, 300),
      keywords,
      relevanceScore,
      contentType,
      wordCount,
      readabilityScore: Math.min(
        Math.round((sentences.length / wordCount) * 1000),
        100,
      ),
    };
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      summary: "Content analysis completed",
      keywords: [],
      relevanceScore: 50,
      contentType: "Unknown",
      wordCount: 0,
      readabilityScore: 50,
    };
  }
}
