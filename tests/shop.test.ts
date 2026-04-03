import { describe, it, expect, vi, beforeEach } from "vitest";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _setStore(s: Record<string, string>) { store = { ...s }; },
  };
})();

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("location", { href: "" });

function mockFetch(status: number, body: any, ok?: boolean) {
  return vi.fn().mockResolvedValue({
    status,
    ok: ok !== undefined ? ok : status >= 200 && status < 300,
    statusText: status === 200 ? "OK" : "Error",
    json: vi.fn().mockResolvedValue(body),
  });
}

let fetchAPI: (endpoint: string, options?: RequestInit) => Promise<any>;

beforeEach(async () => {
  localStorageMock.clear();
  localStorageMock._setStore({ access_token: "valid-token" });
  vi.restoreAllMocks();
  vi.stubGlobal("localStorage", localStorageMock);
  vi.stubGlobal("location", { href: "" });
  const mod = await import("../app/lib/api");
  fetchAPI = mod.fetchAPI;
});

describe("Shop - Products", () => {
  it("lists products", async () => {
    const products = [
      { id: "prod1", title: "Bible Study Guide", price_tier: "tier_1", is_free: false },
      { id: "prod2", title: "Free Devotional", price_tier: null, is_free: true },
    ];
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: products } }));

    const res = await fetchAPI("/shop/products/");
    expect(res.data.results).toHaveLength(2);
    expect(res.data.results[1].is_free).toBe(true);
  });

  it("fetches single product detail", async () => {
    const product = { id: "prod1", title: "Bible Study Guide", description: "Comprehensive guide", category: "Study" };
    vi.stubGlobal("fetch", mockFetch(200, { data: product }));

    const res = await fetchAPI("/shop/products/prod1/");
    expect(res.data.title).toBe("Bible Study Guide");
    expect(res.data.category).toBe("Study");
  });

  it("searches products", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "prod1", title: "Bible Themes" }] } }));

    const res = await fetchAPI("/shop/products/search/?q=theme");
    expect(res.data.results[0].title).toContain("Theme");
  });
});

describe("Shop - Purchases", () => {
  it("creates a purchase", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "purchase1", product: { id: "prod1" } } }));

    const res = await fetchAPI("/shop/purchases/", {
      method: "POST",
      body: JSON.stringify({ product_id: "prod1" }),
    });
    expect(res.data.id).toBe("purchase1");
  });

  it("lists user purchases", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { results: [{ id: "purchase1", product: { title: "Bible Guide" } }] } }));

    const res = await fetchAPI("/shop/purchases/list/");
    expect(res.data.results[0].product.title).toBe("Bible Guide");
  });

  it("handles purchase of free product", async () => {
    vi.stubGlobal("fetch", mockFetch(201, { data: { id: "purchase2" } }));

    await fetchAPI("/shop/purchases/", {
      method: "POST",
      body: JSON.stringify({ product_id: "free-prod" }),
    });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.product_id).toBe("free-prod");
  });
});

describe("Shop - Downloads", () => {
  it("gets download URL for purchased product", async () => {
    vi.stubGlobal("fetch", mockFetch(200, { data: { url: "https://cdn.example.com/file.pdf" } }));

    const res = await fetchAPI("/shop/downloads/prod1/");
    expect(res.data.url).toContain("file.pdf");
  });

  it("returns error for non-purchased product", async () => {
    vi.stubGlobal("fetch", mockFetch(403, { message: "Product not purchased" }, false));

    await expect(fetchAPI("/shop/downloads/prod2/")).rejects.toThrow("Product not purchased");
  });
});
