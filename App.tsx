
import React, { useState, useCallback } from 'react';
import Input from './components/Input';
import Button from './components/Button';
import { LinkIcon } from './components/icons/LinkIcon';
import { CopyIcon } from './components/icons/CopyIcon';
import { CheckIcon } from './components/icons/CheckIcon';

const App: React.FC = () => {
  const [serverUrl, setServerUrl] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGeneratedUrl(null);
    setIsCopied(false); // Reset copy status on new generation

    const trimmedServerUrl = serverUrl.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedServerUrl || !trimmedUsername || !trimmedPassword) {
      setError('All fields are required.');
      return;
    }

    if (!/^https?:\/\//i.test(trimmedServerUrl)) {
      setError('Invalid URL. Please include the protocol (e.g., http:// or https://).');
      return;
    }

    try {
      // The URL constructor will throw an error for fundamentally invalid URLs.
      const url = new URL(trimmedServerUrl);
      
      // Add a simple check for a valid-looking hostname.
      if (!url.hostname || (url.hostname.indexOf('.') === -1 && url.hostname !== 'localhost')) {
         throw new Error('Invalid hostname.');
      }

      const m3uUrl = `${url.protocol}//${url.host}/get.php?username=${encodeURIComponent(trimmedUsername)}&password=${encodeURIComponent(trimmedPassword)}&type=m3u_plus&output=ts`;
      setGeneratedUrl(m3uUrl);
    } catch (err) {
       if (err instanceof Error && err.message === 'Invalid hostname.') {
        setError('The server URL appears to have an invalid hostname.');
      } else {
        setError('Invalid server URL format. Please check for typos or invalid characters.');
      }
    }
  }, [serverUrl, username, password]);

  const handleCopy = useCallback(() => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  }, [generatedUrl]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-500/10 text-blue-400 p-3 rounded-full mb-4 border border-blue-500/20">
            <LinkIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Xtreme Codes M3U Converter</h1>
          <p className="text-gray-400 mt-2">Easily convert your credentials to a playlist link.</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="serverUrl"
              label="Server URL"
              type="text"
              placeholder="http://your-server.com:8080"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              aria-required="true"
              aria-invalid={!!error && error.toLowerCase().includes('url')}
              aria-describedby={error && error.toLowerCase().includes('url') ? 'url-error' : undefined}
            />
            <Input
              id="username"
              label="Username"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-required="true"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
            />

            {error && <p id="url-error" className="text-red-400 text-sm text-center" role="alert">{error}</p>}

            <Button type="submit">
              Generate M3U Link
            </Button>
          </form>
        </main>

        {generatedUrl && (
          <section className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700/50 animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">Your M3U Link:</h2>
            <div className="flex items-center space-x-4 bg-gray-900 p-4 rounded-lg">
              <p className="flex-1 text-green-400 break-all text-sm font-mono">{generatedUrl}</p>
              <button
                onClick={handleCopy}
                className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                aria-label="Copy to clipboard"
              >
                {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-300" />}
              </button>
            </div>
            {isCopied && <p className="text-center text-green-400 mt-3 text-sm animate-pulse" role="status">Copied to clipboard!</p>}
          </section>
        )}

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} M3U Converter. All rights reserved.</p>
        </footer>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default App;
