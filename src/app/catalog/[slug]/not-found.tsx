import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui";

export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <PackageX className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Product Not Found
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          The product you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/catalog">
          <Button>Browse Catalog</Button>
        </Link>
      </div>
    </main>
  );
}
