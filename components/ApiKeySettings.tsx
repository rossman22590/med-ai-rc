// components/ApiKeySettings.tsx
import { useState, useEffect } from 'react';

export default function ApiKeySettings() {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Load existing API key from localStorage on component mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('ANTHROPIC_API_KEY');
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  }, []);

  const handleSaveApiKey = async () => {
    try {
      setIsSaving(true);
      
      // Validate API key format (basic check)
      if (apiKey && !apiKey.startsWith('sk-ant-')) {
        setMessage({
          type: 'error',
          text: "Invalid API Key. Anthropic API keys should start with 'sk-ant-'"
        });
        return;
      }

      // Save to localStorage
      if (apiKey) {
        localStorage.setItem('ANTHROPIC_API_KEY', apiKey);
        
        // Set up a global variable that can be accessed by the application
        if (typeof window !== 'undefined') {
          // Create a global variable for the Anthropic SDK to use
          // @ts-ignore - Adding to window object
          window.__ANTHROPIC_API_KEY__ = apiKey;
        }
        
        // Create a script element to patch the environment
        const script = document.createElement('script');
        script.id = 'anthropic-api-key-override';
        script.innerHTML = `
          (function() {
            // Set process.env for any code that might use it
            window.process = window.process || {};
            window.process.env = window.process.env || {};
            window.process.env.ANTHROPIC_API_KEY = "${apiKey}";
            console.log('API key environment override applied');
          })();
        `;
        
        // Remove any existing script
        const existingScript = document.getElementById('anthropic-api-key-override');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
        
        // Add the script to the page
        document.head.appendChild(script);
        
        setMessage({
          type: 'success',
          text: "Your API key has been saved. Please reload the page for changes to take effect."
        });
      } else {
        localStorage.removeItem('ANTHROPIC_API_KEY');
        
        // Remove the global variable
        if (typeof window !== 'undefined') {
          // @ts-ignore - Removing from window object
          delete window.__ANTHROPIC_API_KEY__;
        }
        
        // Remove the script
        const existingScript = document.getElementById('anthropic-api-key-override');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
        
        setMessage({
          type: 'success',
          text: "API key removed. You'll now use the default API key. Please reload the page for changes to take effect."
        });
      }
      
      // Recommend a page reload
      setTimeout(() => {
        if (confirm("A page reload is required to apply the API key changes. Reload now?")) {
          window.location.reload();
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage({
        type: 'error',
        text: "Error saving settings. Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('ANTHROPIC_API_KEY');
    
    // Remove from window object
    if (typeof window !== 'undefined') {
      // @ts-ignore - Removing from window object
      delete window.__ANTHROPIC_API_KEY__;
      
      // Also remove from process.env if it exists
      if (window.process && window.process.env) {
        delete window.process.env.ANTHROPIC_API_KEY;
      }
    }
    
    // Remove the script
    const existingScript = document.getElementById('anthropic-api-key-override');
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }
    
    setMessage({
      type: 'success',
      text: "API key removed. You'll now use the default API key. Please reload the page for changes to take effect."
    });
    
    // Recommend a page reload
    setTimeout(() => {
      if (confirm("A page reload is required to apply the API key changes. Reload now?")) {
        window.location.reload();
      }
    }, 1500);
  };

  // Add initialization script on component mount
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;
    
    // Check if we have a saved API key
    const savedApiKey = localStorage.getItem('ANTHROPIC_API_KEY');
    if (!savedApiKey) return;
    
    // Set up the global variable
    // @ts-ignore - Adding to window object
    window.__ANTHROPIC_API_KEY__ = savedApiKey;
    
    // Create a script to set up the environment
    const initScript = document.createElement('script');
    initScript.id = 'anthropic-api-key-init';
    initScript.innerHTML = `
      (function() {
        // Set process.env for any code that might use it
        window.process = window.process || {};
        window.process.env = window.process.env || {};
        window.process.env.ANTHROPIC_API_KEY = "${savedApiKey}";
        
        console.log('Anthropic API key initialized from localStorage');
      })();
    `;
    
    // Add the script to the page
    document.head.appendChild(initScript);
    
    return () => {
      // Clean up the script when component unmounts
      const script = document.getElementById('anthropic-api-key-init');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Basic styling for a simple form
  const containerStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  };

  const headerStyle = {
    marginTop: '0',
    marginBottom: '16px',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    marginBottom: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const outlineButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#0070f3',
    border: '1px solid #0070f3',
  };

  const messageStyle = {
    padding: '10px',
    marginBottom: '16px',
    borderRadius: '4px',
    backgroundColor: message?.type === 'success' ? '#d4edda' : '#f8d7da',
    color: message?.type === 'success' ? '#155724' : '#721c24',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>API Settings</h2>
      <p>Enter your own Anthropic API key to use with Claude models</p>
      
      {message && (
        <div style={messageStyle}>
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="apiKey">Anthropic API Key</label>
        <input
          id="apiKey"
          style={inputStyle}
          placeholder="sk-ant-..."
          value={apiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
          type="password"
        />
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
          Your API key is stored locally in your browser and never sent to our servers.
        </p>
      </div>
      
      <div>
        <button 
          style={outlineButtonStyle}
          onClick={handleClearApiKey} 
          disabled={!apiKey || isSaving}
        >
          Clear
        </button>
        <button 
          style={buttonStyle}
          onClick={handleSaveApiKey} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
