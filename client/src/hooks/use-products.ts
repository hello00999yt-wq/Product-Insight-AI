import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProductResponse, type ProductListResponse } from "@shared/routes";
import { type AnalyzeProductRequest } from "@shared/schema";

export type Ingredient = { name: string; percentage: number };
export type Chemical   = { name: string; percentage: number; safety: "Safe" | "Warning" | "Harmful" };
export type IngredientsData = { ingredients: Ingredient[]; chemicals: Chemical[] };

// GET /api/products
export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/products/:id
export function useProduct(id: number) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      // Manually replace :id since we don't have the buildUrl helper in frontend scope yet,
      // but typically we'd import it. For now, manual replacement is safe here.
      const url = api.products.get.path.replace(':id', String(id));
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch product");
      return api.products.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

// POST /api/products/analyze
export function useAnalyzeProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AnalyzeProductRequest) => {
      // Validate input before sending (optional but good practice)
      const validated = api.products.analyze.input.parse(data);
      
      const res = await fetch(api.products.analyze.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || "Failed to analyze product",
          errorData.code
        );
      }

      return api.products.analyze.responses[200].parse(await res.json());
    },
    onSuccess: (newProduct) => {
      // Invalidate the list so the new product appears in history
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
    },
  });
}

// GET /api/products/:id/ingredients
export function useProductIngredients(id: number) {
  return useQuery<IngredientsData>({
    queryKey: ["/api/products", id, "ingredients"],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/ingredients`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ingredient data");
      return res.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // cache for 10 min — same product, same data
  });
}
