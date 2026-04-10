import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY.");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all searched products
  app.get(api.products.list.path, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get a specific product by ID
  app.get(api.products.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Analyze a product image
  app.post(api.products.analyze.path, async (req, res) => {
    try {
      const { image, lang } = api.products.analyze.input.parse(req.body);

      // ── Single combined call: side-check + full analysis in English ──
      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert product identifier and authenticator with vision capabilities.

STEP 1 — Check image type:
- If the image is NOT a physical product package back side (e.g. it's a person, landscape, random object, front-side packaging with only logo/brand design, or non-product image), respond with ONLY: {"side":"front"}
- The BACK side has: barcode, QR code, ingredients, nutritional facts, MRP, manufacturing info, batch/expiry, usage text.
- The FRONT side has: large logo, brand name in decorative font, marketing imagery.

STEP 2 — If it IS a back side, return a single JSON with ALL of these fields (ALWAYS in English):
- side: "back"
- name: product name in English
- brand: brand name (keep original script)
- description: brief product description in English (max 2 sentences)
- mrp: Maximum Retail Price with currency symbol (e.g. "₹120.00")
- marketPrice: current market/street price with currency symbol
- fakeRiskLevel: EXACTLY one of "Low", "Medium", or "High"
- identificationTips: array of exactly 3 short tips to spot fakes in English (max 12 words each)

Return valid JSON only. No markdown. No explanation.`,
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image } },
              { type: "text", text: "Analyze this product image." },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const aiResultContent = response.choices[0]?.message?.content;
      if (!aiResultContent) {
        throw new Error("Failed to get a response from AI");
      }

      const aiData = JSON.parse(aiResultContent);

      // Front-side or non-product image detected
      if (aiData.side === "front" || !aiData.name) {
        return res.status(422).json({
          code: "FRONT_SIDE_IMAGE",
          message:
            "Please upload the back side of the product where the QR code, barcode, or product details are visible.",
        });
      }

      // Validate the AI response format
      if (!aiData.brand || !aiData.mrp || !aiData.marketPrice || !aiData.fakeRiskLevel || !Array.isArray(aiData.identificationTips)) {
        console.error("Invalid AI response structure:", aiData);
        throw new Error("AI returned malformed data");
      }

      // Save to database
      const product = await storage.createProduct({
        name: aiData.name,
        brand: aiData.brand,
        description: aiData.description || "No description provided.",
        mrp: aiData.mrp,
        marketPrice: aiData.marketPrice,
        fakeRiskLevel: ["Low", "Medium", "High"].includes(aiData.fakeRiskLevel) ? aiData.fakeRiskLevel : "Medium",
        identificationTips: aiData.identificationTips,
        imageUrl: image,
      });

      res.status(200).json(product);
    } catch (err) {
      console.error("Product analysis error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message || "Validation error",
          field: err.errors[0]?.path.join('.')
        });
      }
      res.status(500).json({ message: "Failed to analyze product. Please try another image." });
    }
  });

  // Translate product fields into a target language (no re-analysis)
  app.post("/api/products/:id/translate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

      const { lang } = req.body as { lang?: string };
      if (!lang || lang === "en") {
        // English is the stored language — return as-is
        const product = await storage.getProduct(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        return res.json({
          name: product.name,
          description: product.description,
          identificationTips: product.identificationTips,
        });
      }

      const langNames: Record<string, string> = {
        hi: "Hindi", mr: "Marathi", gu: "Gujarati",
        bn: "Bengali", pa: "Punjabi", te: "Telugu", ur: "Urdu",
      };
      const targetLang = langNames[lang] ?? "Hindi";

      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const prompt = `Translate the following product information from English to ${targetLang}.
Return ONLY a valid JSON object with these exact keys — no markdown, no explanation:
{
  "name": "<translated product name>",
  "description": "<translated description>",
  "identificationTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Original data:
name: ${product.name}
description: ${product.description}
identificationTips:
${product.identificationTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

      const aiRes = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 400,
      });

      const raw = aiRes.choices[0]?.message?.content ?? "{}";
      const translated = JSON.parse(raw);

      res.json({
        name: translated.name ?? product.name,
        description: translated.description ?? product.description,
        identificationTips: Array.isArray(translated.identificationTips)
          ? translated.identificationTips
          : product.identificationTips,
      });
    } catch (err) {
      console.error("Translation error:", err);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // Help AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, lang } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      const langNames: Record<string, string> = {
        en: "English", hi: "Hindi", mr: "Marathi", gu: "Gujarati",
        bn: "Bengali", pa: "Punjabi", te: "Telugu", ur: "Urdu",
      };
      const respondLang = langNames[lang] || "English";

      const formattedMessages = messages.map((m: any) => {
        if (m.mediaUrl && m.mediaType === "image") {
          return {
            role: m.role,
            content: [
              { type: "image_url", image_url: { url: m.mediaUrl } },
              { type: "text", text: m.content || "What can you tell me about this product image? Is it real or fake?" },
            ],
          };
        }
        return { role: m.role, content: m.content };
      });

      const response = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are "Help AI", a smart product authenticity assistant for an AI-powered fake product detection platform called "Identify Real vs Fake Products Instantly". 
            
Your purpose is to help users with:
- Identifying fake vs real products
- Understanding MRP (Maximum Retail Price) and why it matters
- Checking and comparing market prices
- Brand authenticity and verification tips
- Product safety tips
- Consumer protection advice
- How to use the platform (upload a product image to get instant analysis)
- Analyzing product images shared by users to detect authenticity

Be friendly, concise, and helpful. Use simple language. If someone asks about a specific product, give them practical fake-detection tips. Always encourage users to upload a product image for AI-powered analysis.

FORMATTING RULES — follow these strictly:
- Write each point or tip on its OWN separate line. Never run multiple points together in one line.
- Start each point with a bullet (•) or a number (1. 2. 3.).
- Highlight the most important word or phrase in each point by wrapping it in **double asterisks** like **this**.
- Add a blank line between sections or groups of points.
- Keep each line short and easy to read (max ~12 words per line).

IMPORTANT: You MUST always respond in ${respondLang} language only, regardless of what language the user writes in. All your responses must be in ${respondLang}.`
          },
          ...formattedMessages
        ],
        max_tokens: 500,
      });

      const reply = response.choices[0]?.message?.content;
      if (!reply) {
        throw new Error("No response from AI");
      }

      res.json({ message: reply });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ message: "Sorry, I couldn't process your request. Please try again." });
    }
  });

  // ── Ingredients & Chemical Analysis for a product ──
  app.get("/api/products/:id/ingredients", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const prompt = `You are a product composition expert. Based on the product information below, generate a realistic ingredients and chemical analysis.

Product Name: ${product.name}
Brand: ${product.brand}
Description: ${product.description}

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation:
{
  "ingredients": [
    { "name": "string", "percentage": number }
  ],
  "chemicals": [
    { "name": "string", "percentage": number, "safety": "Safe" | "Warning" | "Harmful" }
  ]
}

Rules:
- Provide 5–8 ingredients relevant to this product type. Percentages must add up to approximately 100.
- Provide 4–6 chemicals commonly found in this product type.
- For "safety": use "Safe" for benign/natural ingredients, "Warning" for moderate-concern chemicals, "Harmful" for potentially hazardous ones.
- Make the data realistic and appropriate for the specific product type (food, cosmetic, electronic, clothing, etc.).
- Ingredient and chemical names in English.`;

      const aiRes = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });

      const raw = aiRes.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);

      const ingredientsSchema = z.object({
        ingredients: z.array(z.object({ name: z.string(), percentage: z.number() })),
        chemicals: z.array(z.object({ name: z.string(), percentage: z.number(), safety: z.enum(["Safe", "Warning", "Harmful"]) })),
      });

      const result = ingredientsSchema.parse(parsed);
      res.json(result);
    } catch (err) {
      console.error("Ingredients analysis error:", err);
      res.status(500).json({ message: "Failed to analyze ingredients" });
    }
  });

  return httpServer;
}

// Seed function to provide some initial data
export async function seedDatabase() {
  try {
    const existing = await storage.getProducts();
    if (existing.length === 0) {
      console.log("Seeding initial products...");
      await storage.createProduct({
        name: "Air Jordan 1 Retro High OG",
        brand: "Nike",
        description: "The classic Air Jordan 1 silhouette in the iconic 'Chicago' colorway, featuring premium leather construction.",
        mrp: "$180.00",
        marketPrice: "$850.00",
        fakeRiskLevel: "High",
        identificationTips: [
          "Check the hourglass shape of the heel from the back.",
          "Verify the Nike Air logo on the tongue tag; the R should not touch the swoosh too thickly.",
          "Inspect the wings logo placement; it should point towards the top lace hole.",
          "Examine the toe box hole perforations; they should be perfectly aligned and cleanly punched."
        ],
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2EwYTBhMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNhbXBsZSBTbmVha2VyIEltYWdlPC90ZXh0Pjwvc3ZnPg==",
      });

      await storage.createProduct({
        name: "Submariner Date",
        brand: "Rolex",
        description: "Professional diver's watch featuring a unidirectional rotatable bezel and solid-link Oyster bracelet.",
        mrp: "$10,250.00",
        marketPrice: "$14,500.00",
        fakeRiskLevel: "High",
        identificationTips: [
          "Listen to the tick; genuine Rolex movements are extremely fast and smooth (virtually sweeping).",
          "Check the cyclops magnification over the date; it should accurately magnify 2.5x.",
          "Examine the micro-etching of the Rolex crown at the 6 o'clock position on the crystal.",
          "Weight test: Genuine models use solid 904L steel and are noticeably heavier than most fakes."
        ],
        imageUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2EwYTBhMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNhbXBsZSBXYXRjaCBJbWFnZTwvdGV4dD48L3N2Zz4=",
      });
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
