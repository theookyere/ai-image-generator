'use client';
import { useState } from 'react';

export default function SettingsPanel({ onSave, initialKeys = {} }) {
  const [apiKeys, setApiKeys] = useState({
    openai: initialKeys.openai || '',
    replicate: initialKeys.replicate || ''
  });
  const [showKey, setShowKey] = useState({
    openai: false,
    replicate: false
  });

  const handleSave = () => {
    if (!apiKeys.openai && !apiKeys.replicate) {
      alert('Please enter at least one API key');
      return;
    }
    onSave(apiKeys);
  };

  const toggleKeyVisibility = (provider) => {
    setShowKey(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">API Settings</h2>
      
      <div className="space-y-6">
        {['openai', 'replicate'].map((provider) => (
          <div key={provider}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {provider === 'openai' ? 'OpenAI' : 'Replicate (Stable Diffusion)'} API Key
            </label>
            <div className="relative">
              <input
                type={showKey[provider] ? 'text' : 'password'}
                value={apiKeys[provider]}
                onChange={(e) => setApiKeys({
                  ...apiKeys,
                  [provider]: e.target.value
                })}
                placeholder={provider === 'openai' ? 'sk-...' : 'r8_...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button 
                onClick={() => toggleKeyVisibility(provider)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                {showKey[provider] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {provider === 'openai' 
                ? 'For DALL-E image generation' 
                : 'For Stable Diffusion image generation'}
            </p>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
