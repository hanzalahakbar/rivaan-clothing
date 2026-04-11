import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Phone, Mail } from "lucide-react";

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer Content */}
      <div className="container-fashion py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-background/10">
                <Image
                  src="/logo.png"
                  alt="Vestiti"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-semibold tracking-tight">
                Vestiti
              </span>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed mb-6">
              Modern fashion for girls. Try on outfits virtually before you buy with our AI-powered experience.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.tiktok.com/@vestiti.pk"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-background/10 hover:bg-primary transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-background/10 hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-background/10 hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/catalog"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?category=new"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Help
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  Size Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="https://wa.me/92XXXXXXXXXX"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a
                  href="mailto:hello@vestiti.pk"
                  className="text-sm text-background/60 hover:text-background transition-colors"
                >
                  hello@vestiti.pk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-fashion py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40">
            &copy; {currentYear} Vestiti. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-background/40 hover:text-background transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-xs text-background/40 hover:text-background transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
