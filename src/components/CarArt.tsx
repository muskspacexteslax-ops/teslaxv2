import React, { useId } from "react";
import { VEHICLES } from "@/data/vehicles";

export const CAR_PHOTOS: Record<string, string> = {
  "model-3": "/images/cars/model-3.jpg",
  "model-y": "/images/cars/model-y.jpg",
  cybertruck: "/images/cars/cybertruck.jpg",
  "roadster-2": "/images/cars/roadster-2.jpg",
  "roadster-flying": "/images/cars/roadster-flying.jpg",
  cybercab: "/images/cars/cybercab.jpg",
  "model-s": "/images/cars/model-s.jpg",
  "model-s-plaid": "/images/cars/model-s-plaid.jpg",
  "model-x": "/images/cars/model-x.jpg",
  "tesla-semi": "/images/cars/tesla-semi.jpg",
  "original-roadster": "/images/cars/original-roadster.jpg",
};

interface CarArtProps {
  slug: string;
  glow?: boolean;
  className?: string;
  mode?: "photo" | "blueprint";
}

export const CarArt: React.FC<CarArtProps> = ({
  slug,
  glow = false,
  className = "car-art",
  mode = "photo",
}) => {
  const uniqueId = useId().replace(/:/g, "");
  const vehicle = VEHICLES.find((v) => v.slug === slug) || VEHICLES[0];
  const color = vehicle.color;
  const body = vehicle.body;

  const photo = CAR_PHOTOS[slug];
  if (photo && mode !== "blueprint") {
    return (
      <div
        className={`car-photo-container ${className}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          borderRadius: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={photo}
          alt={vehicle.name}
          className="car-photo-img"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "inherit",
            transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          loading="lazy"
        />
        {/* Subtle dark gradient overlay so text/card contrast is crisp */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(5,6,8,0.08) 0%, rgba(5,6,8,0) 45%, rgba(5,6,8,0.65) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  }

  const bodyGradId = `body-${slug}-${uniqueId}`;
  const glassGradId = `glass-${slug}-${uniqueId}`;
  const floorGradId = `floor-${slug}-${uniqueId}`;
  const glowFilterId = `glow-${slug}-${uniqueId}`;

  // Cybertruck
  if (body === "truck" || slug === "cybertruck") {
    return (
      <svg className={className} viewBox="0 0 400 160" role="img" aria-label={`${vehicle.name} illustration`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.98" />
            <stop offset="58%" stopColor={color} stopOpacity="0.72" />
            <stop offset="100%" stopColor={color} stopOpacity="0.30" />
          </linearGradient>
          <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={floorGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="200" cy="150" rx="176" ry="5" fill={`url(#${floorGradId})`} />

        <g filter={glow ? `url(#${glowFilterId})` : undefined}>
          <path d="M18 116 L18 92 L112 44 L268 44 L330 70 L382 100 L382 116 Z" fill={`url(#${bodyGradId})`} />
          <path d="M18 116 L18 92 L112 44 L268 44 L330 70 L382 100 L382 116 Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M124 52 L258 52 L308 70 L124 70 Z" fill={`url(#${glassGradId})`} stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />
        </g>

        <g>
          <circle cx="96" cy="116" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="96" cy="116" r="21" fill="#111215" />
          <circle cx="96" cy="116" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="96" cy="116" r="3.36" fill="rgba(255,255,255,0.35)" />
        </g>
        <g>
          <circle cx="312" cy="116" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="312" cy="116" r="21" fill="#111215" />
          <circle cx="312" cy="116" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="312" cy="116" r="3.36" fill="rgba(255,255,255,0.35)" />
        </g>

        <path d="M22 122 L378 122" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      </svg>
    );
  }

  // Semi
  if (body === "semi" || slug === "tesla-semi") {
    return (
      <svg className={className} viewBox="0 0 400 160" role="img" aria-label={`${vehicle.name} illustration`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.98" />
            <stop offset="58%" stopColor={color} stopOpacity="0.72" />
            <stop offset="100%" stopColor={color} stopOpacity="0.30" />
          </linearGradient>
          <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={floorGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="200" cy="150" rx="176" ry="5" fill={`url(#${floorGradId})`} />

        <g filter={glow ? `url(#${glowFilterId})` : undefined}>
          <path d="M18 116 L18 74 C18 56 30 44 48 40 L108 30 C126 26 140 34 142 52 L146 74 L182 74 L182 116 Z" fill={`url(#${bodyGradId})`} />
          <path d="M18 116 L18 74 C18 56 30 44 48 40 L108 30 C126 26 140 34 142 52 L146 74 L182 74 L182 116 Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M32 66 L32 46 C32 38 38 34 46 32 L126 22 L134 44 L134 66 Z" fill={`url(#${glassGradId})`} stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />
        </g>

        <g>
          <circle cx="64" cy="116" r="25" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="64" cy="116" r="20" fill="#111215" />
          <circle cx="64" cy="116" r="10.4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="64" cy="116" r="3.2" fill="rgba(255,255,255,0.35)" />
        </g>
        <g>
          <circle cx="130" cy="116" r="25" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="130" cy="116" r="20" fill="#111215" />
          <circle cx="130" cy="116" r="10.4" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="130" cy="116" r="3.2" fill="rgba(255,255,255,0.35)" />
        </g>

        <path d="M22 122 L378 122" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      </svg>
    );
  }

  // SUV (Model X, Model Y)
  if (body === "suv" || slug === "model-x" || slug === "model-y") {
    return (
      <svg className={className} viewBox="0 0 400 160" role="img" aria-label={`${vehicle.name} illustration`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.98" />
            <stop offset="58%" stopColor={color} stopOpacity="0.72" />
            <stop offset="100%" stopColor={color} stopOpacity="0.30" />
          </linearGradient>
          <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={floorGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="200" cy="150" rx="176" ry="5" fill={`url(#${floorGradId})`} />

        <g filter={glow ? `url(#${glowFilterId})` : undefined}>
          <path d="M20 116 L20 100 C24 84 42 74 70 70 L104 44 C130 30 214 28 244 42 L282 66 L344 70 C366 74 378 88 380 104 L380 116 Z" fill={`url(#${bodyGradId})`} />
          <path d="M20 116 L20 100 C24 84 42 74 70 70 L104 44 C130 30 214 28 244 42 L282 66 L344 70 C366 74 378 88 380 104 L380 116 Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M112 58 L140 38 C160 30 204 30 222 40 L250 60 L112 60 Z" fill={`url(#${glassGradId})`} stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />
        </g>

        <g>
          <circle cx="102" cy="116" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="102" cy="116" r="21" fill="#111215" />
          <circle cx="102" cy="116" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="102" cy="116" r="3.36" fill="rgba(255,255,255,0.35)" />
        </g>
        <g>
          <circle cx="310" cy="116" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="310" cy="116" r="21" fill="#111215" />
          <circle cx="310" cy="116" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="310" cy="116" r="3.36" fill="rgba(255,255,255,0.35)" />
        </g>

        <path d="M22 122 L378 122" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      </svg>
    );
  }

  // Roadster (Original Roadster, Roadster 2026)
  if (body === "roadster" || slug === "original-roadster" || slug === "roadster-2") {
    return (
      <svg className={className} viewBox="0 0 400 160" role="img" aria-label={`${vehicle.name} illustration`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.98" />
            <stop offset="58%" stopColor={color} stopOpacity="0.72" />
            <stop offset="100%" stopColor={color} stopOpacity="0.30" />
          </linearGradient>
          <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={floorGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="200" cy="150" rx="176" ry="5" fill={`url(#${floorGradId})`} />

        <g filter={glow ? `url(#${glowFilterId})` : undefined}>
          <path d="M22 118 L22 106 C28 92 46 82 74 76 L118 58 C148 44 196 42 228 54 L286 74 C328 82 364 96 378 110 L378 118 Z" fill={`url(#${bodyGradId})`} />
          <path d="M22 118 L22 106 C28 92 46 82 74 76 L118 58 C148 44 196 42 228 54 L286 74 C328 82 364 96 378 110 L378 118 Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M126 66 L160 54 C182 48 206 48 222 56 L246 68 L126 68 Z" fill={`url(#${glassGradId})`} stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />
        </g>

        <g>
          <circle cx="104" cy="118" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="104" cy="118" r="21" fill="#111215" />
          <circle cx="104" cy="118" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="104" cy="118" r="3.36" fill="rgba(255,255,255,0.35)" />
        </g>
        <g>
          <circle cx="302" cy="118" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
          <circle cx="302" cy="118" r="21" fill="#111215" />
          <circle cx="302" cy="118" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
          <circle cx="302" cy="118" r="3.36" fill="rgba(255,255,255,0.35)" />
        </g>

        <path d="M22 122 L378 122" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      </svg>
    );
  }

  // Sedan (Model 3, Model S, Model S Plaid)
  return (
    <svg className={className} viewBox="0 0 400 160" role="img" aria-label={`${vehicle.name} illustration`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.98" />
          <stop offset="58%" stopColor={color} stopOpacity="0.72" />
          <stop offset="100%" stopColor={color} stopOpacity="0.30" />
        </linearGradient>
        <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={floorGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={glowFilterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="200" cy="150" rx="176" ry="5" fill={`url(#${floorGradId})`} />

      <g filter={glow ? `url(#${glowFilterId})` : undefined}>
        <path d="M20 118 L20 104 C26 88 48 78 78 72 L124 48 C152 34 212 32 248 46 L302 70 C344 78 372 92 378 108 L378 118 Z" fill={`url(#${bodyGradId})`} />
        <path d="M20 118 L20 104 C26 88 48 78 78 72 L124 48 C152 34 212 32 248 46 L302 70 C344 78 372 92 378 108 L378 118 Z" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" strokeLinejoin="round" />
        <path d="M132 62 L164 44 C186 36 216 36 234 46 L262 64 L132 64 Z" fill={`url(#${glassGradId})`} stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />
      </g>

      <g>
        <circle cx="104" cy="118" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <circle cx="104" cy="118" r="21" fill="#111215" />
        <circle cx="104" cy="118" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
        <circle cx="104" cy="118" r="3.36" fill="rgba(255,255,255,0.35)" />
      </g>
      <g>
        <circle cx="306" cy="118" r="26" fill="#0a0a0b" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        <circle cx="306" cy="118" r="21" fill="#111215" />
        <circle cx="306" cy="118" r="10.92" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" />
        <circle cx="306" cy="118" r="3.36" fill="rgba(255,255,255,0.35)" />
      </g>

      <path d="M22 122 L378 122" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    </svg>
  );
};
