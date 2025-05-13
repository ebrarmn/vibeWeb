import React from 'react';

export default function Logo() {
    return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="vibe-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2196f3" />
                    <stop offset="1" stopColor="#a259f7" />
                </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#vibe-gradient)" />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Segoe UI, Roboto, Helvetica, Arial, sans-serif"
                fontWeight="bold"
                fontSize="22"
                fill="#fff"
                letterSpacing="2"
            >
                V
            </text>
        </svg>
    );
} 