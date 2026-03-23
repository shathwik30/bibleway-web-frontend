"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchAPI } from "../lib/api";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<{ users: any[]; products: any[] }>({ users: [], products: [] });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ users: [], products: [] });
      setLoading(false);
      return;
    }

    async function performSearch() {
      setLoading(true);
      try {
        const [usersRes, productsRes] = await Promise.allSettled([
          fetchAPI(`/accounts/users/search/?q=${encodeURIComponent(debouncedQuery)}`),
          fetchAPI(`/shop/products/search/?q=${encodeURIComponent(debouncedQuery)}`),
        ]);

        // Extract arrays from paginated responses safely
        let users = [];
        let products = [];

        if (usersRes.status === "fulfilled" && usersRes.value) {
           const val = usersRes.value;
           users = val.results || val.data?.results || (Array.isArray(val.data) ? val.data : []);
        }

        if (productsRes.status === "fulfilled" && productsRes.value) {
           const val = productsRes.value;
           products = val.results || val.data?.results || (Array.isArray(val.data) ? val.data : []);
        }

        setResults({ 
          users: Array.isArray(users) ? users.slice(0, 5) : [], 
          products: Array.isArray(products) ? products.slice(0, 5) : [] 
        });
      } catch (e) {
        console.error("Search failed:", e);
      }
      setLoading(false);
    }

    performSearch();
  }, [debouncedQuery]);

  const handleToggle = () => {
    setIsOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const hasResults = results.users.length > 0 || results.products.length > 0;
  const isSearching = loading || (query.trim() !== "" && query !== debouncedQuery);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button or Collapsed Input */}
      {!isOpen ? (
        <button 
          onClick={handleToggle}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-surface-container"
          aria-label="Search"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      ) : (
        <div className="flex items-center w-64 sm:w-80 bg-surface-container rounded-full px-3 py-1.5 transition-all outline outline-2 outline-primary">
          <span className="material-symbols-outlined text-on-surface-variant/70 text-sm">search</span>
          <input 
            ref={inputRef}
            type="text"
            className="bg-transparent border-none outline-none w-full px-2 text-sm text-on-surface placeholder-on-surface-variant/50"
            placeholder="Search Bibleway..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
             <button onClick={clearSearch} className="cursor-pointer text-on-surface-variant hover:text-on-surface">
               <span className="material-symbols-outlined text-sm">close</span>
             </button>
          )}
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-12 right-0 sm:right-auto sm:left-0 w-80 sm:w-96 bg-surface-container-lowest rounded-2xl editorial-shadow border border-outline-variant/20 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[min(calc(100vh-100px),500px)] overflow-y-auto custom-scrollbar">
            
            {isSearching ? (
              <div className="p-8 flex justify-center items-center flex-col gap-3 text-on-surface-variant">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                 <p className="text-sm">Searching...</p>
              </div>
            ) : !hasResults ? (
              <div className="p-8 flex justify-center items-center flex-col text-on-surface-variant text-center">
                 <span className="material-symbols-outlined text-4xl opacity-50 mb-2">search_off</span>
                 <p className="font-medium">No results found</p>
                 <p className="text-xs opacity-70 mt-1">Try a different keyword.</p>
              </div>
            ) : (
              <div className="py-2">
                {/* Users Section */}
                {results.users.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-4 py-2 text-xs font-bold text-primary uppercase tracking-wider bg-surface-container-low/50">People</h4>
                    <div className="divide-y divide-outline-variant/10">
                      {results.users.map(user => (
                        <Link
                          href={`/user/${user.id}`}
                          key={user.id}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                        >
                           <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20 flex items-center justify-center flex-shrink-0">
                             {user.profile_photo ? (
                               <img src={user.profile_photo} alt={user.full_name} className="w-full h-full object-cover" />
                             ) : (
                               <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                             )}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-on-surface leading-tight">{user.full_name}</span>
                           </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {results.products.length > 0 && (
                  <div>
                    <h4 className="px-4 py-2 text-xs font-bold text-secondary uppercase tracking-wider bg-surface-container-low/50">Shop</h4>
                    <div className="divide-y divide-outline-variant/10">
                      {results.products.map(product => (
                        <Link
                          href={`/shop/product/${product.id}`}
                          key={product.id}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                        >
                           <div className="w-12 h-12 bg-surface-container overflow-hidden rounded-md border border-outline-variant/20 flex items-center justify-center flex-shrink-0 relative">
                             {product.image ? (
                               <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                             ) : (
                               <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
                             )}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0">
                             <span className="text-sm font-bold text-on-surface truncate">{product.name}</span>
                             <span className="text-xs text-primary font-medium mt-0.5">${product.price}</span>
                           </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
          
          {hasResults && (
            <div className="p-3 border-t border-outline-variant/10 bg-surface-container-lowest text-center">
              <span className="text-xs text-on-surface-variant">Press Esc or click outside to close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
