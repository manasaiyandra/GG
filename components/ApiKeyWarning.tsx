import React, { useState } from 'react';
import { testApiConnection } from '../services/geminiService';

const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const ApiKeyWarning: React.FC = () => {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        
        try {
            const isConnected = await testApiConnection();
            if (isConnected) {
                setTestResult('✅ API connection successful! You can now use the app.');
            } else {
                setTestResult('❌ API connection failed. Please check your API key and try again.');
            }
        } catch (error) {
            setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
            <div className="max-w-2xl w-full bg-slate-800 rounded-lg border border-yellow-500/50 shadow-2xl shadow-yellow-500/10">
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
                        <WarningIcon className="w-8 h-8" />
                        API Key Required
                    </h2>
                    <p className="text-slate-300 text-lg mb-6">
                        This application requires a Google Gemini API key to function. The key has not been configured.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                        <p className="font-semibold text-slate-300 mb-2">How to set your API key:</p>
                        <p className="text-sm text-slate-400">
                           The application is configured to read the key from an environment variable named <code className="font-mono bg-slate-700 text-cyan-300 px-1 py-0.5 rounded">API_KEY</code>.
                           For local development, create a file named <code className="font-mono text-cyan-300">.env.local</code> in the project's root directory and add the following line:
                        </p>
                        <pre className="bg-slate-900 text-slate-300 p-3 rounded-md text-sm block mt-2 overflow-x-auto">
                            <code>
                                API_KEY=your_api_key_here
                            </code>
                        </pre>
                        <p className="text-sm text-slate-400 mt-2">
                           Alternatively, you can also use <code className="font-mono bg-slate-700 text-cyan-300 px-1 py-0.5 rounded">GEMINI_API_KEY</code> as the environment variable name.
                        </p>
                         <p className="text-xs text-slate-500 mt-3">After adding the key, you may need to restart your development server for the change to take effect.</p>
                    </div>
                    
                    <div className="mt-6 p-4 bg-slate-900/50 rounded-md border border-slate-700">
                        <p className="font-semibold text-slate-300 mb-3">Test API Connection:</p>
                        <button
                            onClick={handleTestConnection}
                            disabled={isTesting}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-md font-medium transition-colors"
                        >
                            {isTesting ? 'Testing...' : 'Test Connection'}
                        </button>
                        {testResult && (
                            <p className={`mt-3 text-sm ${testResult.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                                {testResult}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
