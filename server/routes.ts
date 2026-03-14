import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
      const { image } = api.products.analyze.input.parse(req.body);

      // Analyze the image using OpenAI Vision
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `You are an expert product identifier and authenticator. Analyze the provided product image and return a JSON object with the following details:
            - name: The specific name of the product.
            - brand: The brand of the product.
            - description: A brief, detailed description of the product.
            - mrp: The typical Maximum Retail Price (format as a string, e.g., "$120.00").
            - marketPrice: The average current market price or street value (format as a string, e.g., "$95.00").
            - fakeRiskLevel: Estimate the risk of encountering fakes for this specific product or brand. Must be exactly one of: "Low", "Medium", or "High".
            - identificationTips: An array of strings, each being a specific tip on how to differentiate a genuine version of this product from a counterfeit.
            
            Be as accurate as possible based on the visual information. If you cannot identify the exact product, provide details for the closest match or general product category. Ensure the response is valid JSON.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this product and provide details." },
              { type: "image_url", image_url: { url: image } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiResultContent = response.choices[0]?.message?.content;
      if (!aiResultContent) {
        throw new Error("Failed to get a response from AI");
      }

      const aiData = JSON.parse(aiResultContent);

      // Validate the AI response format
      if (!aiData.name || !aiData.brand || !aiData.mrp || !aiData.marketPrice || !aiData.fakeRiskLevel || !Array.isArray(aiData.identificationTips)) {
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

      const response = await openai.chat.completions.create({
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

Be friendly, concise, and helpful. Use simple language. If someone asks about a specific product, give them practical fake-detection tips. Always encourage users to upload a product image for AI-powered analysis.

IMPORTANT: You MUST always respond in ${respondLang} language only, regardless of what language the user writes in. All your responses must be in ${respondLang}.`
          },
          ...messages
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
