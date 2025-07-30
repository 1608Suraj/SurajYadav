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
                text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
                return text;
              })
              .filter((p) => p.length > 20 && !p.includes("Click here") && !p.includes("Read more"))
              .slice(0, 15),
          );
        }

        // Universal content extraction patterns
        const structuredData = [];

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
          /<div[^>]*class[^>]*(?:card|panel|box|container)[^>]*>[\s\S]*?<\/div>/gi
        ];

        cardPatterns.forEach((pattern, patternIndex) => {
          const matches = html.match(pattern);
          if (matches) {
            matches.slice(0, 8).forEach((match, matchIndex) => {
              const cardData = extractCardData(match, patternIndex);
              if (cardData.title || cardData.description) {
                structuredData.push({
                  ...cardData,
                  id: `${patternIndex}_${matchIndex}`,
                  extractionMethod: getExtractionMethodName(patternIndex)
                });
              }
            });
          }
        });

        // AI-powered content analysis for additional insights
        const fullTextContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const aiInsights = await generateContentInsights(fullTextContent, url);

        // Extract article content
        const articles = [];
        const articleMatches = html.match(/<article[^>]*>[\s\S]*?<\/article>/gi);
        if (articleMatches) {
          articleMatches.slice(0, 5).forEach((article) => {
            const text = article.replace(/<[^>]*>/g, "").trim();
            if (text.length > 50) {
              articles.push(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
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
              .slice(0, 20)
          );
        }

        // Extract div content with meaningful classes
        const contentDivs = [];
        const meaningfulClasses = ["content", "article", "post", "description", "summary", "text", "body"];
        meaningfulClasses.forEach(className => {
          const regex = new RegExp(`<div[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\/div>`, 'gi');
          const matches = html.match(regex);
          if (matches) {
            matches.slice(0, 3).forEach(match => {
              const text = match.replace(/<[^>]*>/g, "").trim();
              if (text.length > 50) {
                contentDivs.push(text.substring(0, 300) + (text.length > 300 ? "..." : ""));
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
        const mainTags = html.match(/<(main|section|article)[^>]*>[\s\S]*?<\/(main|section|article)>/gi);
        if (mainTags) {
          mainTags.slice(0, 3).forEach(tag => {
            const text = tag.replace(/<[^>]*>/g, "").trim();
            if (text.length > 100) {
              mainContent.push(text.substring(0, 500) + (text.length > 500 ? "..." : ""));
            }
          });
        }

        // Extract structured data (JSON-LD)
        const structuredData = [];
        const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
        if (jsonLdMatches) {
          jsonLdMatches.slice(0, 3).forEach(match => {
            try {
              const jsonContent = match.replace(/<[^>]*>/g, "").trim();
              const parsed = JSON.parse(jsonContent);
              if (parsed.name || parsed.headline || parsed.description) {
                structuredData.push({
                  type: parsed['@type'] || 'Unknown',
                  name: parsed.name || parsed.headline,
                  description: parsed.description
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
          totalStructuredItems: structuredData.length,
          contentQuality: {
            hasStructuredData: structuredData.length > 0,
            hasMainContent: mainContent.length > 0,
            hasArticles: articles.length > 0,
            hasAIInsights: aiInsights.keywords.length > 0,
            contentRichness: (headings.length + paragraphs.length + articles.length + listItems.length + structuredData.length),
            relevanceScore: aiInsights.relevanceScore,
            contentType: aiInsights.contentType
          }
        };

        // If we found structured data, create separate entries for each item
        if (structuredData.length > 0) {
          scrapedData = structuredData.map((item, index) => ({
            ...baseData,
            id: index + 1,
            itemTitle: item.title,
            itemDescription: item.description,
            itemTags: item.tags.join(", "),
            itemPrice: item.price || "",
            itemLocation: item.location || "",
            extractionMethod: item.extractionMethod,
            type: "structured_item"
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
  const processedData = data.map(item => {
    const processed: any = {};

    Object.keys(item).forEach(key => {
      const value = item[key];

      if (Array.isArray(value)) {
        // Handle arrays - join with | separator
        if (value.length === 0) {
          processed[key] = "";
        } else if (typeof value[0] === 'object') {
          // For object arrays, extract key information
          processed[key] = value.map(obj =>
            obj.name || obj.text || obj.title || obj.type || JSON.stringify(obj)
          ).join(" | ");
        } else {
          processed[key] = value.join(" | ");
        }
      } else if (typeof value === 'object' && value !== null) {
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
        if (typeof value === 'boolean') {
          stringValue = value.toString();
        } else if (typeof value === 'number') {
          stringValue = value.toString();
        } else {
          stringValue = String(value);
        }

        // Escape quotes and wrap in quotes, limit length for readability
        const truncatedValue = stringValue.length > 500 ?
          stringValue.substring(0, 500) + "..." : stringValue;
        const escapedValue = truncatedValue.replace(/"/g, '""');
        return `"${escapedValue}"`;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}
