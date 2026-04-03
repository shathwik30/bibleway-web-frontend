"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import { fetchAPI } from "../../lib/api";
import Shimmer from "../../components/Shimmer";

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAPI("/shop/purchases/list/");
        setPurchases(res?.data?.results || res?.results || res?.data || []);
      } catch { /* failed to load */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDownload(productId: string) {
    try {
      const res = await fetchAPI(`/shop/downloads/${productId}/`);
      const url = res.data?.url || res.url || res.data?.download_url || res.download_url;
      if (url) {
        window.open(url, "_blank");
      } else {
        alert("Download not available.");
      }
    } catch {
      alert("Download failed.");
    }
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4">
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="text-sm font-medium">Back to Shop</span>
            </Link>
            <h1 className="text-4xl font-headline text-on-surface">My Purchases</h1>
            <p className="text-on-surface-variant mt-2">Your purchased digital content.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col">
                <Shimmer className="aspect-[4/3] mb-4 w-full rounded-xl" />
                <Shimmer className="h-6 w-3/4 mb-2" />
                <Shimmer className="h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : purchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchases.map((purchase) => {
              const product = purchase.product || purchase;
              return (
                <div key={purchase.id} className="bg-surface-container-lowest rounded-xl overflow-hidden editorial-shadow border border-outline-variant/10">
                  <div className="aspect-[4/3] bg-surface-container-low flex items-center justify-center overflow-hidden">
                    {product.cover_image ? (
                      <img src={product.cover_image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/10">description</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-headline text-lg text-on-surface mb-1">{product.title}</h3>
                    <p className="text-xs text-on-surface-variant mb-4">
                      Purchased {new Date(purchase.created_at || purchase.purchased_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDownload(product.id)}
                      className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">download</span>
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-surface-container-low rounded-2xl">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 block">shopping_bag</span>
            <p className="text-on-surface-variant text-lg mb-4">No purchases yet.</p>
            <Link href="/shop" className="text-primary font-bold hover:underline">Browse the Shop</Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
