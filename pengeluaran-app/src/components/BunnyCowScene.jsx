import { useEffect, useState } from 'react'

export default function BunnyCowScene({ color = '#F45B9E', piggyProp = '✨', cowProp = '✨' }) {
  const [isNarrow, setIsNarrow] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : true)

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <svg
      viewBox="0 0 380 320"
      className="bunnycow-scene-svg"
      preserveAspectRatio={isNarrow ? 'xMidYMid meet' : 'xMidYMid slice'}
    >
      <defs>
        <linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.25" />
        </linearGradient>
        <style>{`
          .bc-bounce-a { animation: bcBounceA 2.2s ease-in-out infinite; transform-origin: 100px 200px; }
          .bc-bounce-b { animation: bcBounceB 2.5s ease-in-out infinite; transform-origin: 280px 200px; }
          @keyframes bcBounceA { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-9px) rotate(2deg); } }
          @keyframes bcBounceB { 0%,100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-9px) rotate(-2deg); } }
          .bc-confetti { animation: bcFall 3s linear infinite; }
          @keyframes bcFall { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(30px); opacity: 0; } }
          .bc-badge { animation: bcFloat 2.6s ease-in-out infinite; }
          @keyframes bcFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        `}</style>
      </defs>

      <rect x="0" y="0" width="380" height="320" fill="url(#bcg)" />

      <circle className="bc-confetti" cx="55" cy="45" r="4" fill="#FFB648" />
      <circle className="bc-confetti" cx="320" cy="55" r="4" fill="#FFFFFF" style={{ animationDelay: '0.6s' }} />
      <circle className="bc-confetti" cx="340" cy="20" r="3" fill="#FFFFFF" style={{ animationDelay: '1.1s' }} />
      <circle className="bc-confetti" cx="35" cy="90" r="3" fill="#FFB648" style={{ animationDelay: '1.6s' }} />

      {/* Bunny (girl) */}
      <g className="bc-bounce-a">
        <ellipse cx="100" cy="240" rx="34" ry="30" fill="#E86FA0" />
        <ellipse cx="76" cy="249" rx="10" ry="16" fill="#FFFAFA" />
        <ellipse cx="124" cy="249" rx="10" ry="16" fill="#FFFAFA" />
        <path d="M85 60 Q78 4 60 0 Q52 2 56 16 Q62 54 80 84 Z" fill="#FFFAFA" stroke="#F0B8CE" strokeWidth="2.5" />
        <path d="M84 55 Q80 18 66 12 Q62 18 66 28 Q70 50 82 70 Z" fill="#FFC9DB" />
        <path d="M115 60 Q122 4 140 0 Q148 2 144 16 Q138 54 120 84 Z" fill="#FFFAFA" stroke="#F0B8CE" strokeWidth="2.5" />
        <path d="M116 55 Q120 18 134 12 Q138 18 134 28 Q130 50 118 70 Z" fill="#FFC9DB" />
        <circle cx="100" cy="140" r="58" fill="#FFFAFA" stroke="#F0B8CE" strokeWidth="2.5" />
        <path d="M66 124 Q74 116 84 122" stroke="#8A6B78" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <path d="M134 124 Q126 116 116 122" stroke="#8A6B78" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="80" cy="140" rx="11" ry="14" fill="#4A3540" />
        <ellipse cx="120" cy="140" rx="11" ry="14" fill="#4A3540" />
        <circle cx="84" cy="133" r="3.5" fill="#FFFFFF" />
        <circle cx="124" cy="133" r="3.5" fill="#FFFFFF" />
        <circle cx="70" cy="157" r="10" fill="#FFC0D6" opacity="0.85" />
        <circle cx="130" cy="157" r="10" fill="#FFC0D6" opacity="0.85" />
        <polygon points="100,153 91,164 109,164" fill="#F08FA8" />
        <path d="M89 167 Q100 176 111 167" stroke="#C97C93" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <polygon points="58,50 68,63 49,67" fill="#E8548C" />
        <polygon points="58,50 48,63 67,67" fill="#F281A9" />
        <circle cx="58" cy="57" r="5.5" fill="#E8548C" />
      </g>

      {/* Cow (boy) */}
      <g className="bc-bounce-b">
        <ellipse cx="283" cy="243" rx="36" ry="30" fill="#4FA8E0" />
        <ellipse cx="257" cy="251" rx="10" ry="16" fill="#FFFFFF" />
        <ellipse cx="309" cy="251" rx="10" ry="16" fill="#FFFFFF" />
        <ellipse cx="256" cy="86" rx="15" ry="20" fill="#FFFFFF" stroke="#B9D8F0" strokeWidth="2.5" />
        <ellipse cx="310" cy="86" rx="15" ry="20" fill="#FFFFFF" stroke="#B9D8F0" strokeWidth="2.5" />
        <polygon points="248,80 240,58 260,70" fill="#DCEEFB" stroke="#B9D8F0" strokeWidth="2.5" />
        <polygon points="318,80 326,58 306,70" fill="#DCEEFB" stroke="#B9D8F0" strokeWidth="2.5" />
        <circle cx="283" cy="142" r="60" fill="#FFFFFF" stroke="#C7E1F5" strokeWidth="2.5" />
        <path d="M245 120 Q253 110 265 118" stroke="#4A3540" strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.55" />
        <ellipse cx="255" cy="122" rx="16" ry="20" fill="#BFDDF2" />
        <ellipse cx="270" cy="158" rx="33" ry="25" fill="#FBD3DD" />
        <ellipse cx="264" cy="142" rx="11" ry="14" fill="#3A3238" />
        <ellipse cx="304" cy="142" rx="11" ry="14" fill="#3A3238" />
        <circle cx="268" cy="135" r="3.5" fill="#FFFFFF" />
        <circle cx="308" cy="135" r="3.5" fill="#FFFFFF" />
        <circle cx="262" cy="166" r="8.5" fill="#F6A9C4" opacity="0.85" />
        <circle cx="278" cy="166" r="8.5" fill="#F6A9C4" opacity="0.85" />
        <path d="M255 180 Q270 194 285 180" stroke="#D48098" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <polygon points="264,186 276,186 270,197" fill="#F26E8C" />
        <polygon points="266,212 286,212 276,228" fill="#4FA8E0" />
      </g>

      {/* Floating activity badges */}
      <g className="bc-badge" style={{ animationDelay: '0.2s' }}>
        <circle cx="52" cy="200" r="22" fill="rgba(255,255,255,0.85)" />
        <text x="52" y="209" textAnchor="middle" fontSize="24">{piggyProp}</text>
      </g>
      <g className="bc-badge" style={{ animationDelay: '0.7s' }}>
        <circle cx="330" cy="200" r="22" fill="rgba(255,255,255,0.85)" />
        <text x="330" y="209" textAnchor="middle" fontSize="24">{cowProp}</text>
      </g>
    </svg>
  )
}
