"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, ChevronDown, Search } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { CartIcon } from "./CartIcon";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export function Header({ variant = "solid" }: HeaderProps) {
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/catalog" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        variant === "transparent"
          ? "bg-transparent"
          : "bg-background/80 backdrop-blur-xl border-b border-border/50"
      }`}
    >
      {/* Main Navigation */}
      <nav className="container-fashion">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Logo - Center */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden shadow-md">
              <Image
                src="/logo.png"
                alt="Vestiti"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                    className="w-32 lg:w-48 px-3 py-1.5 text-sm bg-muted border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-2 text-foreground/70 hover:text-foreground transition-colors"
                    aria-label="User menu"
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3.5 w-3.5 hidden lg:block" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-xl rounded-xl shadow-xl border border-border/50 z-50 py-2 overflow-hidden">
                        <Link
                          href="/profile"
                          className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <hr className="my-2 border-border/50" />
                        <button
                          onClick={() => {
                            signOut();
                            setUserMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted/50 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/signin"
                  className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Sign in"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Cart */}
            <CartIcon />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 py-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-2 py-3 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <>
                  <hr className="my-2 border-border/50" />
                  <Link
                    href="/signin"
                    className="px-2 py-3 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-2 py-3 text-base font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
