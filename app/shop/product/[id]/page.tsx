"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../../components/MainLayout";
import { fetchAPI } from "../../../lib/api";
import Shimmer from "../../../components/Shimmer";
import { useToast } from "../../../components/Toast";

export default function ProductDetailPage() {
  const { showToast } = useToast();
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    async function load() {
      try {
        const res = await fetchAPI(`/shop/products/${productId}/`);
        setProduct(res.data || res);
      } catch { /* failed to load */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  async function handlePurchase() {
    setPurchasing(true);
    try {
      await fetchAPI("/shop/purchases/", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      setPurchased(true);
      setShowConfirm(false);
    } catch (err: any) {
      showToast("error", "Purchase Failed", err.message || "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetchAPI(`/shop/downloads/${productId}/`);
      const url = res.data?.url || res.url || res.data?.download_url || res.download_url;
      if (url) {
        window.open(url, "_blank");
      } else {
        showToast("error", "Download Error", "Download not available.");
      }
    } catch {
      showToast("error", "Download Error", "Download failed.");
    } finally {
      setDownloading(false);
    }
  }

  function handlePurchaseClick() {
    if (product.is_free) {
      handlePurchase();
    } else {
      setShowConfirm(true);
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <Shimmer className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Shimmer className="aspect-[3/4] w-full rounded-xl" />
            <div className="space-y-4">
              <Shimmer className="h-10 w-3/4" />
              <Shimmer className="h-6 w-1/4" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-full" />
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-14 w-full mt-8" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl font-headline mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-primary font-bold">Back to Shop</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/shop" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-sm font-medium">Back to Shop</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center editorial-shadow">
            {product.cover_image ? (
              <img src={product.cover_image} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-8xl text-on-surface-variant/10">description</span>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-tertiary-fixed/20 text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-widest w-fit">
              {product.category || "Digital"}
            </div>
            <h1 className="text-4xl font-headline text-on-surface mb-4">{product.title}</h1>
            <p className="text-2xl font-headline text-primary mb-6">
              {product.is_free ? "FREE" : product.price_tier || `$${product.price || "Paid"}`}
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-8">{product.description}</p>

            {purchased ? (
              <div className="space-y-4">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium text-center">
                  Purchase successful! You can now download this item.
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full py-4 rounded-xl bg-linear-to-br from-primary to-primary-container text-on-primary font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">{downloading ? "hourglass_empty" : "download"}</span>
                  {downloading ? "Preparing..." : "Download"}
                </button>
              </div>
            ) : (
              <button
                onClick={handlePurchaseClick}
                className="w-full py-4 rounded-xl bg-linear-to-br from-primary to-primary-container text-on-primary font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined">{product.is_free ? "download" : "shopping_bag"}</span>
                {product.is_free ? "Download Free" : "Purchase"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-2xl p-8 editorial-shadow text-center" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined text-4xl text-primary mb-4 block">shopping_bag</span>
            <h3 className="font-headline text-2xl mb-2">Confirm Purchase</h3>
            <p className="text-on-surface-variant mb-6">
              Are you sure you want to purchase <strong>{product.title}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl bg-surface-container-low text-on-surface-variant font-semibold hover:bg-surface-container-high transition-all">
                Cancel
              </button>
              <button onClick={handlePurchase} disabled={purchasing} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-all disabled:opacity-50">
                {purchasing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
