import React from 'react';
import DatabaseEmailDemo from './components/DatabaseEmailDemo';
import GitHubSetup from './components/GitHubSetup';

function App() {
  const showGitHubSetup = new URLSearchParams(window.location.search).get('setup') === 'github';
  
  if (showGitHubSetup) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <GitHubSetup />
      </div>
    );
  }
  
  return <DatabaseEmailDemo />;
}

export default App;