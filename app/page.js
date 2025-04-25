'use client';
import { useState, useEffect } from 'react';
import SettingsPanel from '@/components/SettingsPanel';
import { generateImageWithOpenAI } from '@/lib/openaiService';
import { generateImageWithStableDiffusion } from '@/lib/stableDiffusionService';

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI DALL-E' },
  { id: 'replicate', name: 'Stable Diffusion' }
];

export default function Home() {
  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [artistic, setArtistic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({ openai: '', replicate: '' });
  const [provider, setProvider] = useState('openai');
  const [progress, setProgress] = useState({
    status: '',
    percentage: 0,
    estimatedTime: null
  });

  useEffect(() => {
    const storedKeys = {
      openai: localStorage.getItem('openai_api_key') || '',
      replicate: localStorage.getItem('replicate_api_key') || ''
    };
    setApiKeys(storedKeys);
  }, []);

  const generateImage = async () => {
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }
    
    if (!apiKeys[provider]) {
      setError(`Please add your ${PROVIDERS.find(p => p.id === provider).name} API key in Settings`);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      setProgress({
        status: provider === 'openai' ? 'Generating...' : 'Starting generation...',
        percentage: 0,
        estimatedTime: provider === 'openai' ? '10-30 seconds' : '1-2 minutes'
      });

      const enhancedPrompt = artistic ? 
        `${prompt}, highly detailed digital art` : 
        prompt;

      let imageUrl;
      if (provider === 'openai') {
        imageUrl = await generateImageWithOpenAI(enhancedPrompt, apiKeys.openai, size);
        setProgress({ status: 'Processing...', percentage: 100 });
      } else {
        const [width, height] = size.split('x').map(Number);
        
        const onProgress = (status, percentage) => {
          setProgress({
            status,
            percentage,
            estimatedTime: percentage > 50 ? 'Less than a minute' : '1-2 minutes'
          });
        };
        
        imageUrl = await generateImageWithStableDiffusion(
          enhancedPrompt, 
          apiKeys.replicate,
          { width, height },
          onProgress
        );
      }

      setImages(prev => [{
        id: Date.now(),
        url: imageUrl,
        prompt: enhancedPrompt,
        size,
        artistic,
        provider
      }, ...prev]);
    } catch (err) {
      setError(err.message || 'Failed to generate image');
      console.error(err);
    } finally {
      setIsLoading(false);
      setProgress({ status: '', percentage: 0, estimatedTime: null });
    }
  };

  const downloadImage = async (imageUrl, promptText) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${promptText.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
      console.error(err);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Image Generator</h1>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          {showSettings ? 'Close Settings' : 'Settings'}
        </button>
      </div>

      {showSettings && (
        <SettingsPanel 
          onSave={(key, provider) => {
            setApiKeys(prev => ({ ...prev, [provider]: key }));
            localStorage.setItem(`${provider}_api_key`, key);
          }} 
          initialApiKeys={apiKeys} 
        />
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="mb-4 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-primary">
                {progress.status}
              </span>
              <span className="text-sm text-gray-500">
                {progress.estimatedTime}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="1024x1024">Large (1024x1024)</option>
              <option value="512x512">Medium (512x512)</option>
              <option value="256x256">Small (256x256)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="artistic"
              checked={artistic}
              onChange={(e) => setArtistic(e.target.checked)}
              className="h-5 w-5 text-primary rounded focus:ring-primary"
            />
            <label htmlFor="artistic" className="ml-2 text-sm text-gray-700">
              Artistic Style
            </label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && generateImage()}
          />
          <button
            onClick={generateImage}
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : 'Generate'}
          </button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-xl shadow-md overflow-hidden group relative">
              <img 
                src={image.url} 
                alt={image.prompt} 
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => downloadImage(image.url, image.prompt)}
                  className="px-3 py-1 bg-white text-primary rounded-lg hover:bg-gray-100 transition"
                >
                  Download
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 truncate">{image.prompt}</p>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{image.size}</span>
                  <span>{image.artistic ? 'Artistic' : 'Standard'}</span>
                  <span>{image.provider}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-500">No images generated yet. Enter a prompt and click Generate!</p>
        </div>
      )}
      {progress.status && (
        <div className="bg-gray-50 rounded-xl p-8 text-center mt-4">
          <p className="text-gray-500">{progress.status}</p>
          <p className="text-gray-500">{progress.percentage}%</p>
          <p className="text-gray-500">Estimated time: {progress.estimatedTime}</p>
        </div>
      )}
    </main>
  );
}
