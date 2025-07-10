import React from 'react';
import { Github, Download, Upload, Rocket } from 'lucide-react';

export default function GitHubSetup() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <Github className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">GitHub Setup Guide</h1>
        <p className="text-gray-600">
          Since Git is not available in this environment, follow these steps to get your code to GitHub
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Option 1: Download and Push */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Download className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-semibold">Download & Push</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Download the project files and push them to GitHub from your local machine.
          </p>
          <div className="space-y-2 text-sm">
            <p>1. Download project files</p>
            <p>2. Extract to local folder</p>
            <p>3. Initialize Git locally</p>
            <p>4. Push to GitHub</p>
          </div>
        </div>

        {/* Option 2: Web Upload */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Upload className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-xl font-semibold">Web Upload</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Use GitHub's web interface to upload your project files directly.
          </p>
          <div className="space-y-2 text-sm">
            <p>1. Go to your GitHub repo</p>
            <p>2. Click "Upload files"</p>
            <p>3. Drag and drop files</p>
            <p>4. Commit changes</p>
          </div>
        </div>

        {/* Option 3: Direct Deploy */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Rocket className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-xl font-semibold">Direct Deploy</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Deploy directly to Vercel or Netlify without GitHub first.
          </p>
          <div className="space-y-2 text-sm">
            <p>1. Download project</p>
            <p>2. Run locally</p>
            <p>3. Deploy with CLI</p>
            <p>4. Connect to GitHub later</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Project Ready for GitHub!</h4>
        <p className="text-blue-700 text-sm">
          Your project now includes updated README.md, package.json with repository info, 
          deployment guides, and proper environment variable handling.
        </p>
      </div>

      <div className="mt-6 text-center">
        <a
          href="https://github.com/Pranjul1650/Email"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Github className="w-5 h-5 mr-2" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}