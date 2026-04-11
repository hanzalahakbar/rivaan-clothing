"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { History, Loader2, Trash2, X, ChevronDown, Download } from "lucide-react";
import {
  getUserTryOnHistoryPaginated,
  deleteHistoryEntry,
  type TryOnHistoryItem
} from "@/lib/services/tryon.service";
import { downloadImage } from "@/lib/services/download.service";
import { Button, useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

interface TryOnHistoryProps {
  onSelectItem?: (jobId: string) => void;
  className?: string;
}

const PAGE_SIZE = 12;

export function TryOnHistory({ onSelectItem, className }: TryOnHistoryProps) {
  const [history, setHistory] = useState<TryOnHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const loadHistory = useCallback(async (offset = 0, append = false) => {
    try {
      const result = await getUserTryOnHistoryPaginated({ offset, limit: PAGE_SIZE });
      if (append) {
        setHistory(prev => [...prev, ...result.items]);
      } else {
        setHistory(result.items);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await loadHistory(0, false);
      setIsLoading(false);
    }
    init();
  }, [loadHistory]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await loadHistory(history.length, true);
    setIsLoadingMore(false);
  };

  const handleDelete = async (jobId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteHistoryEntry(jobId);
      if (result.success) {
        setHistory(prev => prev.filter(item => item.id !== jobId));
        setDeleteConfirm(null);
      } else {
        console.error("Delete failed:", result.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async (item: TryOnHistoryItem) => {
    if (downloadingId) return;

    setDownloadingId(item.id);
    const result = await downloadImage(item.result_image_url, {
      productName: item.product?.name,
      productSlug: item.product?.slug,
      jobId: item.id,
    });
    setDownloadingId(null);

    if (result.success) {
      success(`Downloaded ${result.filename}`);
    } else {
      error(result.error || "Download failed");
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <History className="w-5 h-5" />
          Recent Try-Ons
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-muted rounded-lg animate-skeleton"
            />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No try-ons yet
        </h3>
        <p className="text-muted-foreground mb-4">
          Start trying on clothes to see your history here
        </p>
        <Link
          href="/catalog"
          className="text-primary hover:underline text-sm"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
        <History className="w-5 h-5" />
        Recent Try-Ons
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {history.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => onSelectItem?.(item.id)}
              className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <Image
                src={item.result_image_url}
                alt={`Try-on: ${item.product?.name || "Unknown product"}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {item.product?.name || "Product unavailable"}
                  </p>
                  <p className="text-white/70 text-xs">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                disabled={downloadingId === item.id}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-50"
                aria-label="Download try-on"
              >
                {downloadingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirm(item.id);
                }}
                className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Delete try-on"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Delete confirmation overlay */}
            {deleteConfirm === item.id && (
              <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center p-4 z-10">
                <p className="text-white text-sm text-center mb-4">
                  Delete this try-on?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                    className="bg-transparent border-white/50 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="gap-2"
          >
            {isLoadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

// Skeleton component for loading state
export function TryOnHistorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-muted rounded w-40 animate-skeleton" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-muted rounded-lg animate-skeleton"
          />
        ))}
      </div>
    </div>
  );
}
