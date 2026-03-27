import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Schema ---

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  mrp: text("mrp").notNull(),
  marketPrice: text("market_price").notNull(),
  fakeRiskLevel: text("fake_risk_level").notNull(), // 'Low', 'Medium', 'High'
  identificationTips: text("identification_tips").array().notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ 
  id: true, 
  createdAt: true 
});

// --- Types ---

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// For API responses
export type ProductResponse = Product;
export type ProductListResponse = Product[];

// For image upload and analysis
export const analyzeProductSchema = z.object({
  image: z.string().describe("Base64 encoded image data starting with data:image/..."),
  lang: z.string().optional().default("en"),
});
export type AnalyzeProductRequest = z.infer<typeof analyzeProductSchema>;

