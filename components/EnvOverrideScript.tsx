// app/components/EnvOverrideScript.tsx
"use client";

import { useEffect } from 'react';

export function EnvOverrideScript() {
  useEffect(() => {
    // This script will run on the client side and override the environment variables
    // with values from localStorage if they exist
    const script = document.createElement('script');
    script.innerHTML = `
      try {
        // Check if we have an API key in localStorage
        const storedApiKey = localStorage.getItem('ANTHROPIC_API_KEY');
        if (storedApiKey) {
          // Override the environment variable
          window.process = window.process || {};
          window.process.env = window.process.env || {};
          window.process.env.ANTHROPIC_API_KEY = storedApiKey;
          console.log('Using custom Anthropic API key from localStorage');
        }
      } catch (e) {
        console.error('Error setting up environment override:', e);
      }
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
