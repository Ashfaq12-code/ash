"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Reusable Football Kit Vector Graphic Component for Realistic Jerseys
interface KitProps {
  primary: string;
  secondary: string;
  accent: string;
  pattern?: "stripes" | "hoops" | "collar" | "none";
  sponsor: string;
  brand: "nike" | "adidas" | "puma";
}

function FootballKitSVG({ primary, secondary, accent, pattern = "none", sponsor, brand }: KitProps) {
  return (
    <svg viewBox="0 0 200 220" className="w-48 h-52 drop-shadow-lg filter hover:brightness-105 transition-all">
      {/* Short sleeves */}
      <path d="M 25,60 L 5,90 L 35,110 L 50,85 Z" fill={secondary} stroke={accent} strokeWidth="1.5" />
      <path d="M 175,60 L 195,90 L 165,110 L 150,85 Z" fill={secondary} stroke={accent} strokeWidth="1.5" />
      
      {/* Sleeve Trim */}
      <path d="M 5,90 L 15,97 L 35,110 M 195,90 L 185,97 L 165,110" stroke={accent} strokeWidth="3" strokeLinecap="round" />

      {/* Main Body */}
      <path d="M 50,50 L 150,50 L 160,200 L 40,200 Z" fill={primary} stroke={accent} strokeWidth="2" />
      
      {/* Stripes or hoops pattern */}
      {pattern === "stripes" && (
        <>
          <rect x="65" y="50" width="12" height="150" fill={secondary} />
          <rect x="94" y="50" width="12" height="150" fill={secondary} />
          <rect x="123" y="50" width="12" height="150" fill={secondary} />
        </>
      )}

      {pattern === "hoops" && (
        <>
          <rect x="43" y="80" width="114" height="20" fill={secondary} />
          <rect x="42" y="125" width="116" height="20" fill={secondary} />
          <rect x="41" y="170" width="118" height="20" fill={secondary} />
        </>
      )}

      {/* Brand logo */}
      {brand === "adidas" && (
        <g transform="translate(60, 75) scale(0.65)" fill={accent}>
          <path d="M0,15 L5,15 L15,0 L10,0 Z" />
          <path d="M8,15 L13,15 L23,0 L18,0 Z" />
          <path d="M16,15 L21,15 L31,0 L26,0 Z" />
        </g>
      )}
      {brand === "nike" && (
        <path d="M 60,78 Q 75,78 85,70 Q 75,85 62,83 Q 58,82 60,78" fill={accent} />
      )}
      {brand === "puma" && (
        <path d="M 60,72 Q 65,70 70,72 Q 72,75 75,70 Q 68,66 60,72" fill={accent} stroke={accent} strokeWidth="1" />
      )}

      {/* Team Crest / Badge */}
      <circle cx="135" cy="77" r="10" fill={accent} />
      <polygon points="135,70 142,77 135,84 128,77" fill={primary} />
      <circle cx="135" cy="77" r="3" fill={accent} />

      {/* Collar */}
      <path d="M 80,50 Q 100,70 120,50 Z" fill={secondary} stroke={accent} strokeWidth="1.5" />
      <path d="M 80,50 L 100,65 L 120,50" fill="none" stroke={accent} strokeWidth="2" />

      {/* Sponsor Name */}
      <text x="100" y="130" textAnchor="middle" fill={accent} fontFamily="sans-serif" fontWeight="900" fontSize="14" letterSpacing="1">
        {sponsor}
      </text>

      {/* Inner collar detail */}
      <path d="M 85,50 Q 100,55 115,50" fill="none" stroke={accent} strokeWidth="1" />
    </svg>
  );
}

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto swiper setup (3 slides)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + 3) % 3);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % 3);
  };

  const handleAddToCart = (jerseyName: string, price: number, sizeKey: string) => {
    const size = selectedSizes[sizeKey];
    if (!size) {
      alert("Please select a size first!");
      return;
    }
    setCart(prev => [...prev, { name: jerseyName, price, size }]);
    alert(`Added ${jerseyName} (Size: ${size}) to Cart!`);
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#0b2b1a] text-white text-xs font-semibold py-2 px-4 text-center flex justify-between items-center px-8 md:px-16">
        <span className="hidden md:inline">🚚 FREE ISLANDWIDE DELIVERY ON ORDERS OVER LKR 10,000</span>
        <span className="mx-auto md:mx-0 font-bold text-yellow-400">🔥 2024/25 CUSTOM KITS AVAILABLE NOW</span>
        <span className="hidden md:inline">💬 WHATSAPP SUPPORT: +94 77 123 4567</span>
      </div>

      {/* 2. HERO SWIPER & TRANSPARENT HEADER WRAPPER (Full Height Image Cover) */}
      <div className="relative w-full min-h-[85vh] md:min-h-[90vh] bg-black text-white flex flex-col justify-between overflow-hidden border-b-4 border-yellow-400">
        
        {/* Full Cover Background Images with Radial Overlay */}
        <div className="absolute inset-0 z-0">
          
          {/* Slide 1 Background */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Image 
              src="/hero_panels.png" 
              alt="Football Squad Collage" 
              fill 
              sizes="100vw"
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0f5231]/75 to-[#0b2b1a]" />
          </div>

          {/* Slide 2 Background */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 1 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Image 
              src="/barca_sheeran.png" 
              alt="Barca Sheeran Collaboration" 
              fill 
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0f5231]/75 to-[#0b2b1a]" />
          </div>

          {/* Slide 3 Background */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === 2 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Image 
              src="/rewind_game.png" 
              alt="Retro Icons Collage" 
              fill 
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#0f5231]/75 to-[#0b2b1a]" />
          </div>

        </div>

        {/* 2a. Transparent Navigation Header (Aligned precisely with max-w-6xl for hero content) */}
        <header className="relative z-30 max-w-6xl w-full mx-auto px-6 pt-8 md:pt-10 grid grid-cols-3 items-center">
          
          {/* Left Menu Links - BOLD, LARGER, spaced nicely */}
          <div className="flex items-center gap-6 md:gap-8 justify-start text-sm sm:text-base md:text-lg font-black uppercase tracking-wider">
            <a href="#" className="hover:text-yellow-400 transition-colors border-b-2 border-yellow-400 pb-0.5">Home</a>
            <a href="#shop" className="hover:text-yellow-400 transition-colors">Shop</a>
            <a href="#about" className="hover:text-yellow-400 transition-colors">About Us</a>
          </div>

          {/* Center Logo Placeholder - perfectly centered and ready for new logo */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center border-2 border-white/20 p-2.5 rounded-xl bg-[#0d3a22]/50 backdrop-blur-md hover:border-yellow-400 transition-all w-20 h-12">
              <svg className="w-14 h-8 fill-none stroke-white" strokeWidth="2.5" viewBox="0 0 100 60">
                <rect x="5" y="5" width="90" height="50" rx="3" />
                <line x1="50" y1="5" x2="50" y2="55" />
                <circle cx="50" cy="30" r="10" />
                <text x="50" y="37" textAnchor="middle" fill="white" fontSize="18" fontFamily="sans-serif" fontWeight="950">FG</text>
              </svg>
            </div>
          </div>

          {/* Right Area - FAQ & Large Custom SVG Icons matching link size */}
          <div className="flex items-center gap-6 md:gap-8 justify-end text-sm sm:text-base md:text-lg font-black uppercase tracking-wider">
            <a href="#faq" className="hover:text-yellow-400 transition-colors">FAQ</a>
            
            {/* Search Icon only - Big sized */}
            <button className="opacity-90 hover:opacity-100 hover:scale-105 transition-all text-white w-6 h-6 md:w-7 h-7">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Shopping Cart Icon - Big sized */}
            <button className="relative opacity-90 hover:opacity-100 hover:scale-105 transition-all text-white w-6 h-6 md:w-7 h-7">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

        </header>

        {/* 2b. Hero Slider Main Content Centered inside max-w-6xl relative container */}
        <div className="relative z-10 flex-grow w-full max-w-6xl mx-auto px-6 flex items-center justify-center text-center">
          
          {/* Swiper Arrow Left Button (aligned with max-w-6xl left boundary) */}
          <button 
            onClick={handlePrevSlide} 
            className="absolute left-0 z-30 w-12 h-12 rounded-full border border-white/20 bg-black/35 hover:bg-black/60 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-5 h-5 stroke-white fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Swiper Arrow Right Button (aligned with max-w-6xl right boundary) */}
          <button 
            onClick={handleNextSlide} 
            className="absolute right-0 z-30 w-12 h-12 rounded-full border border-white/20 bg-black/35 hover:bg-black/60 flex items-center justify-center text-white transition-all"
          >
            <svg className="w-5 h-5 stroke-white fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide 1 Content */}
          <div className={`transition-all duration-700 w-full space-y-6 ${currentSlide === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"}`}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-bebas tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.75)]">
              YOUR CLUB. YOUR COLORS.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-yellow-400 font-bold uppercase tracking-wider drop-shadow-md">
              THE OFFICIAL 25/26 JERSEYS ARE JUST A CLICK AWAY.
            </p>
            <div className="pt-2">
              <a href="#shop" className="bg-white hover:bg-yellow-400 text-black text-xs md:text-sm font-extrabold uppercase py-3 px-6 rounded tracking-widest transition-all">
                SHOP NOW →
              </a>
            </div>
          </div>

          {/* Slide 2 Content */}
          <div className={`transition-all duration-700 w-full space-y-6 ${currentSlide === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"}`}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-bebas tracking-tight leading-none text-yellow-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.75)]">
              BARÇA X ED SHEERAN
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-white font-bold uppercase tracking-wider drop-shadow-md">
              LIMITED EDITION MUSIC COLLABORATION KITS.
            </p>
            <div className="pt-2">
              <button onClick={() => alert("Loading Collabs...")} className="bg-white hover:bg-yellow-400 text-black text-xs md:text-sm font-extrabold uppercase py-3 px-6 rounded tracking-widest transition-all">
                SHOP COLLAB →
              </button>
            </div>
          </div>

          {/* Slide 3 Content */}
          <div className={`transition-all duration-700 w-full space-y-6 ${currentSlide === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute pointer-events-none"}`}>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-bebas tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.75)]">
              REWIND THE GAME.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-yellow-400 font-bold uppercase tracking-wider drop-shadow-md">
              LOOK GOOD MORE THAN HOW YOU CAN PLAY.
            </p>
            <div className="pt-2">
              <a href="#retro" className="bg-white hover:bg-yellow-400 text-black text-xs md:text-sm font-extrabold uppercase py-3 px-6 rounded tracking-widest transition-all">
                SHOP RETRO →
              </a>
            </div>
          </div>

        </div>

        {/* Small slide position indicators */}
        <div className="relative z-20 pb-8 flex justify-center gap-2">
          {[0, 1, 2].map(idx => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? "bg-yellow-400 w-8" : "bg-white/40"}`}
            />
          ))}
        </div>

      </div>

      {/* 3. INTRO & QUICK CATEGORIES SECTION */}
      <section id="about" className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-12 gap-8 items-start mb-12">
          <div className="md:col-span-5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f5231] tracking-tight leading-tight">
              Football Jerseys Sri Lanka – Premium Club & National Kits
            </h2>
          </div>
          <div className="md:col-span-7 text-gray-600 leading-relaxed text-sm md:text-base">
            We offer premium replica and authentic player-issue football jerseys in Colombo, Kandy, and islandwide in Sri Lanka. Shop from a curated selection of home kits, away kits, hoodies, retro classics, and complete tracksuits. All kits are sourced with authentic details, heavy embroidery, active-dry technology fabrics, and official brand branding.
          </div>
        </div>

        {/* 4 Category Cards */}
        <div id="categories" className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Jerseys", img: "⚽", desc: "Clubs & National teams", gradient: "from-blue-600 to-sky-400" },
            { title: "Tracksuits", img: "🧥", desc: "Premium matching sets", gradient: "from-teal-600 to-emerald-400" },
            { title: "Retro", img: "🏆", desc: "90s & 2000s classics", gradient: "from-amber-600 to-orange-400" },
            { title: "Hoodies", img: "🧣", desc: "Fan wear & outerwear", gradient: "from-indigo-600 to-violet-400" },
          ].map((cat, i) => (
            <div key={i} className="group relative h-48 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-tr ${cat.gradient} opacity-90`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white z-10">
                <span className="text-4xl mb-2 filter drop-shadow-md">{cat.img}</span>
                <h3 className="text-xl font-bold font-bebas tracking-wide uppercase">{cat.title}</h3>
                <p className="text-white/80 text-xs mt-0.5">{cat.desc}</p>
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LATEST LINEUP SECTION */}
      <section id="shop" className="py-16 bg-[#f9f9f9] border-t border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#0f5231] tracking-widest uppercase bg-green-100 px-3 py-1 rounded-full">New Drop</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f5231] font-bebas mt-3 tracking-wide">
              LATEST LINEUP
            </h2>
            <div className="w-16 h-1 bg-[#0f5231] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Liverpool 24/25 Home */}
            <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
              <span className="absolute top-4 left-4 bg-[#c8102e] text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                Home Kit
              </span>
              <FootballKitSVG primary="#c8102e" secondary="#f6eb61" accent="#ffffff" pattern="none" sponsor="Standard" brand="nike" />
              <div className="mt-4 w-full">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Liverpool FC</p>
                <h3 className="text-lg font-bold text-gray-800 mt-1">Liverpool 24/25 Home Jersey Authentic Detail</h3>
                <p className="text-xs text-green-600 font-medium mt-1">In Stock – Colombo Store</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-gray-400 text-xs">(4.9/5)</span>
                </div>
                
                {/* Size select */}
                <div className="flex justify-center gap-2 mt-4">
                  {["S", "M", "L", "XL"].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSizes(prev => ({ ...prev, liv: size }))}
                      className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                        selectedSizes.liv === size 
                          ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <span className="text-xl font-extrabold text-gray-900">LKR 4,950.00</span>
                  <button 
                    onClick={() => handleAddToCart("Liverpool 24/25 Home Jersey", 4950, "liv")}
                    className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Real Madrid 24/25 Third */}
            <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
              <span className="absolute top-4 left-4 bg-gray-700 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                Third Kit
              </span>
              <FootballKitSVG primary="#222222" secondary="#8a9ba8" accent="#ffffff" pattern="none" sponsor="Emirates" brand="adidas" />
              <div className="mt-4 w-full">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Real Madrid</p>
                <h3 className="text-lg font-bold text-gray-800 mt-1">Real Madrid 24/25 Third Jersey Authentic Detail</h3>
                <p className="text-xs text-green-600 font-medium mt-1">In Stock – Colombo Store</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-gray-400 text-xs">(4.8/5)</span>
                </div>
                
                {/* Size select */}
                <div className="flex justify-center gap-2 mt-4">
                  {["S", "M", "L", "XL"].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSizes(prev => ({ ...prev, rm3: size }))}
                      className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                        selectedSizes.rm3 === size 
                          ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <span className="text-xl font-extrabold text-gray-900">LKR 4,950.00</span>
                  <button 
                    onClick={() => handleAddToCart("Real Madrid 24/25 Third Jersey", 4950, "rm3")}
                    className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Man Utd 24/25 Home */}
            <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
              <span className="absolute top-4 left-4 bg-[#da291c] text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                Home Kit
              </span>
              <FootballKitSVG primary="#da291c" secondary="#000000" accent="#ffffff" pattern="none" sponsor="Snapdragon" brand="adidas" />
              <div className="mt-4 w-full">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Manchester United</p>
                <h3 className="text-lg font-bold text-gray-800 mt-1">Manchester United 24/25 Home Jersey Authentic Detail</h3>
                <p className="text-xs text-green-600 font-medium mt-1">In Stock – Colombo Store</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="text-yellow-500">★★★★★</span>
                  <span className="text-gray-400 text-xs">(4.7/5)</span>
                </div>
                
                {/* Size select */}
                <div className="flex justify-center gap-2 mt-4">
                  {["S", "M", "L", "XL"].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSizes(prev => ({ ...prev, mu: size }))}
                      className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                        selectedSizes.mu === size 
                          ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <span className="text-xl font-extrabold text-gray-900">LKR 4,950.00</span>
                  <button 
                    onClick={() => handleAddToCart("Manchester United 24/25 Home Jersey", 4950, "mu")}
                    className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TOP PICKS SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0f5231] tracking-widest uppercase bg-green-100 px-3 py-1 rounded-full">Top Choices</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f5231] font-bebas mt-3 tracking-wide">
            TOP PICKS
          </h2>
          <div className="w-16 h-1 bg-[#0f5231] mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Real Madrid Away */}
          <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
            <span className="absolute top-4 left-4 bg-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              Away Kit
            </span>
            <FootballKitSVG primary="#cc5200" secondary="#1a1a1a" accent="#ffffff" pattern="none" sponsor="Emirates" brand="adidas" />
            <div className="mt-4 w-full">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Real Madrid</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">Real Madrid 24/25 Away Orange Jersey</h3>
              <p className="text-xs text-green-600 font-medium mt-1">In Stock</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {["S", "M", "L", "XL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, rma: size }))}
                    className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                      selectedSizes.rma === size 
                        ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xl font-extrabold text-gray-900">LKR 4,950.00</span>
                <button 
                  onClick={() => handleAddToCart("Real Madrid 24/25 Away Orange Jersey", 4950, "rma")}
                  className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Real Madrid Home */}
          <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
            <span className="absolute top-4 left-4 bg-gray-100 text-black border border-gray-200 text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              Home Kit
            </span>
            <FootballKitSVG primary="#ffffff" secondary="#000000" accent="#d4af37" pattern="none" sponsor="Emirates" brand="adidas" />
            <div className="mt-4 w-full">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Real Madrid</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">Real Madrid 24/25 Home Gold Trim Jersey</h3>
              <p className="text-xs text-green-600 font-medium mt-1">In Stock</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {["S", "M", "L", "XL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, rmh: size }))}
                    className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                      selectedSizes.rmh === size 
                        ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xl font-extrabold text-gray-900">LKR 4,950.00</span>
                <button 
                  onClick={() => handleAddToCart("Real Madrid 24/25 Home Jersey", 4950, "rmh")}
                  className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Arsenal Away */}
          <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
            <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              Away Kit
            </span>
            <FootballKitSVG primary="#111111" secondary="#009c3b" accent="#ef0107" pattern="none" sponsor="Emirates" brand="adidas" />
            <div className="mt-4 w-full">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Arsenal FC</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">Arsenal 24/25 Away Green Stripe Jersey</h3>
              <p className="text-xs text-green-600 font-medium mt-1">In Stock</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {["S", "M", "L", "XL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, arsa: size }))}
                    className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                      selectedSizes.arsa === size 
                        ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xl font-extrabold text-gray-900">LKR 4,950.00</span>
                <button 
                  onClick={() => handleAddToCart("Arsenal 24/25 Away Jersey", 4950, "arsa")}
                  className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. TIMELESS ICONS SECTION */}
      <section id="retro" className="py-16 max-w-7xl mx-auto px-4 md:px-8 bg-gray-50 border-t border-b border-gray-200/50">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0f5231] tracking-widest uppercase bg-green-100 px-3 py-1 rounded-full">Classic Era</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f5231] font-bebas mt-3 tracking-wide">
            TIMELESS ICONS
          </h2>
          <div className="w-16 h-1 bg-[#0f5231] mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Classic Real Madrid Teka */}
          <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
            <span className="absolute top-4 left-4 bg-yellow-600 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              1999 Classic
            </span>
            <FootballKitSVG primary="#111111" secondary="#ffffff" accent="#d4af37" pattern="collar" sponsor="TEKA" brand="adidas" />
            <div className="mt-4 w-full">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Real Madrid</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">Real Madrid 1999/00 Black Teka Retro</h3>
              <p className="text-xs text-green-600 font-medium mt-1">Retro Quality</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {["S", "M", "L", "XL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, rmt: size }))}
                    className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                      selectedSizes.rmt === size 
                        ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xl font-extrabold text-gray-900">LKR 5,200.00</span>
                <button 
                  onClick={() => handleAddToCart("Real Madrid 1999/00 Teka Retro", 5200, "rmt")}
                  className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Classic Italy 2006 */}
          <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
            <span className="absolute top-4 left-4 bg-blue-700 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              2006 National
            </span>
            <FootballKitSVG primary="#0f5c9e" secondary="#ffffff" accent="#ffffff" pattern="none" sponsor="ITALIA" brand="puma" />
            <div className="mt-4 w-full">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Italy National</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">Italy 2006 World Cup Champions Retro</h3>
              <p className="text-xs text-green-600 font-medium mt-1">Retro Quality</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {["S", "M", "L", "XL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, ita: size }))}
                    className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                      selectedSizes.ita === size 
                        ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xl font-extrabold text-gray-900">LKR 5,200.00</span>
                <button 
                  onClick={() => handleAddToCart("Italy 2006 World Cup Retro", 5200, "ita")}
                  className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Classic AC Milan Opel */}
          <div className="product-card bg-white rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center relative">
            <span className="absolute top-4 left-4 bg-red-700 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              1996 Classic
            </span>
            <FootballKitSVG primary="#cc0000" secondary="#000000" accent="#ffffff" pattern="stripes" sponsor="OPEL" brand="adidas" />
            <div className="mt-4 w-full">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">AC Milan</p>
              <h3 className="text-lg font-bold text-gray-800 mt-1">AC Milan 1996/97 Red Stripe Retro</h3>
              <p className="text-xs text-green-600 font-medium mt-1">Retro Quality</p>
              
              <div className="flex justify-center gap-2 mt-4">
                {["S", "M", "L", "XL"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSizes(prev => ({ ...prev, ac: size }))}
                    className={`w-9 h-9 text-xs font-bold border rounded-md transition-all ${
                      selectedSizes.ac === size 
                        ? "border-[#0f5231] bg-green-50 text-[#0f5231]" 
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-xl font-extrabold text-gray-900">LKR 5,200.00</span>
                <button 
                  onClick={() => handleAddToCart("AC Milan 1996/97 Opel Retro", 5200, "ac")}
                  className="btn-green-fill text-xs py-2.5 px-4 rounded-lg uppercase tracking-wider"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. TOP LEAGUES SECTION */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Shop By Leagues</h3>
          </div>
          <div className="flex flex-wrap items-center justify-around gap-8 opacity-70">
            <span className="font-bebas text-xl md:text-3xl text-indigo-900 flex items-center gap-2">🦁 PREMIER LEAGUE</span>
            <span className="font-bebas text-xl md:text-3xl text-red-700 flex items-center gap-2">⚽ LALIGA</span>
            <span className="font-bebas text-xl md:text-3xl text-blue-900 flex items-center gap-2">🇮🇹 SERIE A</span>
            <span className="font-bebas text-xl md:text-3xl text-red-900 flex items-center gap-2">🛡️ BUNDESLIGA</span>
            <span className="font-bebas text-xl md:text-3xl text-teal-800 flex items-center gap-2">🦅 MLS</span>
            <span className="font-bebas text-xl md:text-3xl text-emerald-950 flex items-center gap-2">🇫🇷 LIGUE 1</span>
          </div>
        </div>
      </section>

      {/* 8. REVIEWS SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-8 mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Reviews</h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-black text-gray-800">4.9</span>
              <div className="text-yellow-500 text-lg">★★★★★</div>
              <span className="text-gray-500 text-sm">(Based on 1,482 buyer feedback)</span>
            </div>
          </div>
          <button 
            onClick={() => alert("Thank you for choosing to review!")}
            className="mt-4 md:mt-0 bg-[#0f5231] hover:bg-[#0d3a22] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-lg shadow-md transition-all"
          >
            Write A Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Review 1 */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-yellow-500 mb-3">★★★★★</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                &ldquo;Absolutely brilliant collection of jerseys. Fabric quality is amazing and fits perfectly. Sourced with official player issue tags. Fully recommended for Sri Lankan football fans!&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-4 border-t border-gray-200/50 pt-4">
              <div className="w-10 h-10 bg-[#0f5231]/10 rounded-full flex items-center justify-center font-bold text-[#0f5231]">
                CS
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Chamika Senevirathne</h4>
                <p className="text-xs text-green-600">Verified Buyer – Colombo</p>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-yellow-500 mb-3">★★★★★</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                &ldquo;Delivery was extremely fast to Kandy. The shirt feels light and breathable. Real high-quality printing done for the player number. Will definitely buy again!&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-4 border-t border-gray-200/50 pt-4">
              <div className="w-10 h-10 bg-[#0f5231]/10 rounded-full flex items-center justify-center font-bold text-[#0f5231]">
                D
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Dilantha</h4>
                <p className="text-xs text-green-600">Verified Buyer – Kandy</p>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="text-yellow-500 mb-3">★★★★★</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                &ldquo;Best place to buy football kits in Sri Lanka. Exceptional response times on WhatsApp, great package sizing advice. Fabric is excellent.&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-4 border-t border-gray-200/50 pt-4">
              <div className="w-10 h-10 bg-[#0f5231]/10 rounded-full flex items-center justify-center font-bold text-[#0f5231]">
                R
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Ruwan</h4>
                <p className="text-xs text-green-600">Verified Buyer – Gampaha</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. JOIN THE COMMUNITY SECTION */}
      <section className="bg-[#18181c] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-yellow-400 font-bebas tracking-wide">
                Join The Community
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Tag us wearing your premium jerseys and get featured on our feed! Use #FootballJerseysSL
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-[#0f5231] hover:bg-[#0d3a22] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded border border-yellow-400/20">
              Follow Us
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "@kasun_football", emoji: "⚽ Outdoor Football Pitch" },
              { label: "@shan_lk", emoji: "🏆 Stadium Stands View" },
              { label: "@dilshani_sports", emoji: "⚡ Streetwear Jersey Fit" },
            ].map((feed, idx) => (
              <div key={idx} className="relative h-72 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden border border-white/5 cursor-pointer group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                <span className="text-7xl group-hover:scale-110 transition-transform filter drop-shadow-md">👕</span>
                <div className="absolute bottom-6 left-6 right-6 text-left z-20">
                  <span className="text-xs text-yellow-400 font-extrabold">{feed.label}</span>
                  <p className="text-sm font-semibold mt-1">{feed.emoji}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-16 bg-white max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="w-12 h-1 bg-[#0f5231] mx-auto mt-2" />
        </div>

        <div className="space-y-4">
          {[
            {
              q: "What is your return & exchange policy?",
              a: "We offer a 7-day exchange window for sizing mismatches, provided the jersey tags remain intact, and there are no signs of washing or wear. Custom name/number prints cannot be exchanged."
            },
            {
              q: "How long does delivery take inside Sri Lanka?",
              a: "Orders inside Colombo take 1-2 business days. Outstation locations (Kandy, Galle, Jaffna, etc.) take 2-4 business days via domestic courier partners."
            },
            {
              q: "Are these authentic player-issue jerseys?",
              a: "We import premium grade fan-version (embellished crests, comfortable cut) and player-version (heat-transferred badges, compression fit, active breathable materials) kits matching maximum quality specs."
            },
            {
              q: "Can I customize the jersey with my name and favorite number?",
              a: "Yes! We offer official font custom numbers and letters printing on the back of any selected club or national jersey for an additional fee."
            },
            {
              q: "Do you offer Cash on Delivery (COD)?",
              a: "Yes, we support Cash on Delivery islandwide, as well as Bank Transfers and secure Online Card Payments."
            }
          ].map((item, idx) => (
            <div key={idx} className="border-b border-gray-200 pb-4">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left py-3 text-gray-800 font-bold hover:text-[#0f5231] transition-colors"
              >
                <span>{item.q}</span>
                <span className="text-lg font-black">{faqOpen[idx] ? "−" : "+"}</span>
              </button>
              <div className={`accordion-content ${faqOpen[idx] ? "open" : ""}`}>
                <p className="text-sm text-gray-500 leading-relaxed py-2">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-[#0d3a22] text-white border-t border-yellow-400/25">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-yellow-400/20 pb-2">
              <svg className="w-8 h-8 fill-none stroke-yellow-400" strokeWidth="2" viewBox="0 0 100 60">
                <rect x="5" y="5" width="90" height="50" rx="3" />
                <line x1="50" y1="5" x2="50" y2="55" />
                <circle cx="50" cy="30" r="12" />
              </svg>
              <span className="text-lg font-black tracking-tight text-white uppercase font-bebas">
                Football Jerseys SL
              </span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              We provide the highest quality football shirts, tracksuits, retro apparel, and training wear imported with authentic specifications.
            </p>
            <div className="flex gap-4 text-lg">
              <a href="#" className="hover:text-yellow-400 transition-colors">📘</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">📸</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">📺</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-yellow-400 text-sm uppercase tracking-wider mb-4">Shop Collections</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#shop" className="hover:underline hover:text-white transition-all">Latest Season Club Kits</a></li>
              <li><a href="#retro" className="hover:underline hover:text-white transition-all">Timeless Retro Collections</a></li>
              <li><a href="#categories" className="hover:underline hover:text-white transition-all">Official Tracksuits</a></li>
              <li><a href="#categories" className="hover:underline hover:text-white transition-all">Fan-Wear Hoodies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-yellow-400 text-sm uppercase tracking-wider mb-4">Customer Support</h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li><a href="#" className="hover:underline hover:text-white transition-all">Custom Printing Pricing</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-all">Size Chart Guide</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-all">Shipping & Return Terms</a></li>
              <li><a href="#" className="hover:underline hover:text-white transition-all">Track My Order</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-yellow-400 text-sm uppercase tracking-wider mb-4">Store Address</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Football Jerseys Sri Lanka Showroom,<br />
              Galle Road, Colombo 03,<br />
              Sri Lanka.<br />
              <span className="font-bold text-white block mt-3">🕒 Open: Mon - Sun (9AM - 8PM)</span>
            </p>
          </div>

        </div>

        <div className="bg-[#0b2b1a] py-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <span>© 2026 Football Jerseys Sri Lanka. All Rights Reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:underline hover:text-white transition-all">Terms of Service</a>
              <a href="#" className="hover:underline hover:text-white transition-all">Privacy Policy</a>
              <a href="#" className="hover:underline hover:text-white transition-all">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
