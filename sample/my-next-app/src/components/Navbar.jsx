"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

// Import the CSS file


export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef(null);

  // Responsive & UI State
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Data State
  const [q, setQ] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // 1. Detect Scroll for Glass Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Responsive Check
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // 3. Sync Search Param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    setQ(url.searchParams.get("search") || "");
  }, [pathname]);

  // 4. Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // 5. Fetch Data (User & Cart)
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) { setUser(null); } 
    finally { setAuthLoading(false); }
  }, []);

  const loadCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) { setCartCount(0); return; }
      const data = await res.json();
      const count = (data.items || []).reduce((acc, it) => acc + (it.qty || 0), 0);
      setCartCount(count);
    } catch (e) { setCartCount(0); }
  }, []);

  useEffect(() => {
    loadUser();
    loadCartCount();
  }, [loadUser, loadCartCount, pathname]);

  // Listen for global cart updates
  useEffect(() => {
    const handleUpdate = () => loadCartCount();
    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, [loadCartCount]);

  // Handlers
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setCartCount(0);
    router.refresh();
    router.push("/");
  };

  const onSearch = (e) => {
    e.preventDefault();
    if(q.trim()) router.push(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  // --- RENDER HELPERS ---

  const NavLink = ({ href, children, mobile = false }) => {
    const active = pathname === href;
    return (
      <Link 
        href={href} 
        className={`nav-link ${active ? "active" : ""} ${mobile ? "mobile-link" : ""}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        
        {/* LEFT: Logo */}
        <Link href="/" className="nav-logo">
          <div className="logo-icon">M</div>
          <span>MiniStore</span>
        </Link>

        {/* CENTER: Desktop Search */}
        {!isMobile && (
          <div className="nav-search-wrapper">
            <Search size={16} className="search-icon" />
            <form onSubmit={onSearch}>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>
          </div>
        )}

        {/* RIGHT: Actions */}
        <div className="nav-actions">
          
          {/* Desktop Links */}
          {!isMobile && (
            <div className="desktop-links">
              <NavLink href="/products">Store</NavLink>
              {/* <NavLink href="/about">About</NavLink> */}
            </div>
          )}

          {/* Cart */}
          <Link href="/cart" className="action-btn cart-btn">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {/* User Menu (Desktop) */}
          {!isMobile && (
            <div className="user-dropdown-container">
              {authLoading ? (
                <div className="skeleton-avatar" />
              ) : user ? (
                <div className="relative">
                  <button 
                    className="user-btn" 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="avatar">
                      {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                    </div>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <p className="user-name">{user.displayName || "User"}</p>
                        <p className="user-role">{user.role}</p>
                      </div>
                      <div className="dropdown-divider" />
                      <Link href="/profile" className="dropdown-item">
                        <User size={16} /> Profile
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link href="/admin" className="dropdown-item">
                          <LayoutDashboard size={16} /> Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="dropdown-item danger">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link href="/login" className="btn-text">Log in</Link>
                  <Link href="/signup" className="btn-primary">
                    Get started <ChevronRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Mobile Toggle */}
          {isMobile && (
            <button 
              className="mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobile && menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <Search size={18} className="icon" />
            <form onSubmit={onSearch} style={{flex:1}}>
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Search..." 
                autoFocus
              />
            </form>
          </div>

          <div className="mobile-links">
            <NavLink href="/" mobile>Home</NavLink>
            <NavLink href="/products" mobile>All Products</NavLink>
            <NavLink href="/cart" mobile>Cart ({cartCount})</NavLink>
          </div>

          <div className="mobile-footer">
            {!authLoading && user ? (
              <div className="mobile-user-section">
                  <div className="mobile-user-info">
                    <div className="avatar small">
                      {user.displayName ? user.displayName[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <span className="name">{user.displayName}</span>
                      <span className="role">{user.role}</span>
                    </div>
                  </div>
                  <div className="mobile-user-actions">
                    <Link href="/profile" className="btn-mobile-secondary">Profile</Link>
                    {user.role === "ADMIN" && (
                        <Link href="/admin" className="btn-mobile-secondary">Admin</Link>
                    )}
                    <button onClick={handleLogout} className="btn-mobile-danger">Logout</button>
                  </div>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link href="/login" className="btn-mobile-outline">Log in</Link>
                <Link href="/signup" className="btn-mobile-primary">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}