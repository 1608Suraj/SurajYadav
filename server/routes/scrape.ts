import { RequestHandler } from "express";
import { z } from "zod";

// Request schema validation
const ScrapeRequestSchema = z.object({
  url: z.string().url(),
  dataType: z.enum(['html', 'api', 'json']).optional().default('html')
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
        error: "Invalid URL provided. Please provide a valid URL."
      } as ScrapeResponse);
    }

    const { url, dataType } = validation.data;
    
    // Basic URL safety check
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        error: "URL must start with http:// or https://"
      } as ScrapeResponse);
    }

    let scrapedData: any[] = [];

    if (dataType === 'api' || dataType === 'json' || url.includes('api') || url.includes('.json')) {
      // Handle API/JSON scraping
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DataScrapingBot/1.0)',
            'Accept': 'application/json, text/plain, */*',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle different JSON structures
        if (Array.isArray(data)) {
          scrapedData = data.slice(0, 100); // Limit to 100 items
        } else if (data && typeof data === 'object') {
          // Try to find array properties in the response
          const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
          if (arrayKeys.length > 0) {
            scrapedData = data[arrayKeys[0]].slice(0, 100);
          } else {
            scrapedData = [data];
          }
        }
      } catch (error) {
        return res.json({
          success: false,
          error: `Failed to fetch API data: ${error instanceof Error ? error.message : 'Unknown error'}`
        } as ScrapeResponse);
      }
    } else {
      // Handle HTML scraping (simplified for demo)
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DataScrapingBot/1.0)',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        
        // Enhanced HTML parsing to extract actual content
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'No title found';

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
        const description = descMatch ? descMatch[1].trim() : 'No description found';

        // Extract headings
        const headings = [];
        const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
        const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi);
        const h3Matches = html.match(/<h3[^>]*>([^<]+)<\/h3>/gi);

        if (h1Matches) headings.push(...h1Matches.map(h => h.replace(/<[^>]*>/g, '').trim()));
        if (h2Matches) headings.push(...h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()));
        if (h3Matches) headings.push(...h3Matches.map(h => h.replace(/<[^>]*>/g, '').trim()));

        // Extract paragraph content
        const paragraphs = [];
        const pMatches = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
        if (pMatches) {
          paragraphs.push(...pMatches
            .map(p => p.replace(/<[^>]*>/g, '').trim())
            .filter(p => p.length > 20)
            .slice(0, 10)
          );
        }

        // Extract links
        const links = [];
        const linkMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/gi);
        if (linkMatches) {
          linkMatches.slice(0, 20).forEach(link => {
            const hrefMatch = link.match(/href="([^"]*)"/);
            const textMatch = link.match(/>([^<]+)</);
            if (hrefMatch && textMatch) {
              links.push({
                url: hrefMatch[1],
                text: textMatch[1].trim()
              });
            }
          });
        }

        // Extract images
        const images = [];
        const imgMatches = html.match(/<img[^>]*src="([^"]*)"[^>]*>/gi);
        if (imgMatches) {
          imgMatches.slice(0, 10).forEach(img => {
            const srcMatch = img.match(/src="([^"]*)"/);
            const altMatch = img.match(/alt="([^"]*)"/);
            if (srcMatch) {
              images.push({
                src: srcMatch[1],
                alt: altMatch ? altMatch[1] : 'No alt text'
              });
            }
          });
        }

        // Create detailed scraped data
        scrapedData = [{
          url: url,
          title: title,
          description: description,
          headings: headings.slice(0, 10),
          paragraphs: paragraphs.slice(0, 5),
          links: links.slice(0, 15),
          images: images.slice(0, 8),
          scrapedAt: new Date().toISOString(),
          contentLength: html.length,
          totalHeadings: headings.length,
          totalParagraphs: paragraphs.length,
          totalLinks: links.length,
          totalImages: images.length
        }];
      } catch (error) {
        return res.json({
          success: false,
          error: `Failed to scrape HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
        } as ScrapeResponse);
      }
    }

    // Generate CSV content
    if (scrapedData.length === 0) {
      return res.json({
        success: false,
        error: "No data found to scrape from the provided URL"
      } as ScrapeResponse);
    }

    // Convert to CSV
    const csvContent = convertToCSV(scrapedData);
    
    res.json({
      success: true,
      data: scrapedData.slice(0, 5), // Return first 5 items for preview
      csvContent: csvContent,
      totalItems: scrapedData.length
    } as ScrapeResponse & { csvContent: string; totalItems: number });

  } catch (error) {
    console.error('Scraping Error:', error);
    
    res.json({
      success: false,
      error: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    } as ScrapeResponse);
  }
};

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  data.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });
  
  const headers = Array.from(allKeys);
  
  // Create CSV header
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  
  // Create CSV rows
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item?.[header] ?? '';
      // Escape quotes and wrap in quotes
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}
