import React, { useState } from 'react';
import { TerraformParser } from '../utils/TerraformParser';
import TerraformSyntaxHighlighter from '../utils/TerraformSyntaxHighlighter';

const TerraformGenerator = () => {
  const [formData, setFormData] = useState({
    endpoint: '',
    method: 'GET',
    backendUri: '',
    apiKeyRequired: false
  });
  
  const [terraformOutput, setTerraformOutput] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);

  const highlighter = new TerraformSyntaxHighlighter();

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    try {
      // Validation
      if (!formData.endpoint.trim()) {
        throw new Error('Please enter an endpoint path');
      }
      
      if (!formData.backendUri.trim()) {
        throw new Error('Please enter a backend URI');
      }

      // Validate URI format
      try {
        new URL(formData.backendUri);
      } catch {
        throw new Error('Please enter a valid backend URI (e.g., https://api.example.com/path)');
      }

      const parser = new TerraformParser();
      const terraformConfig = parser.generateCompleteForMultipleEndpoints([{
        endpoint: formData.endpoint.trim(),
        method: formData.method,
        backendUri: formData.backendUri.trim(),
        apiKeyRequired: formData.apiKeyRequired
      }]);
      
      setTerraformOutput(terraformConfig);
      setError('');
      
      // Debug: log the highlighted output
      if (syntaxHighlighting) {
        console.log('Original:', terraformConfig);
        console.log('Highlighted:', highlighter.highlight(terraformConfig));
      }
    } catch (err) {
      setError(err.message);
      setTerraformOutput('');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(terraformOutput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLoadExample = () => {
    setFormData({
      endpoint: '/person/users/api/auth',
      method: 'POST',
      backendUri: 'https://personapi.api.com/person/users/api/auth'
    });
    setError('');
  };

  return (
    <div className="main-content">
      <div className="form-card">
        <div style={{ marginBottom: '25px' }}>
          <div className="single-endpoint-header">
            <h2 style={{ margin: 0, color: '#333' }}>Configuration</h2>
            <button 
              type="button" 
              onClick={handleLoadExample}
              style={{
                padding: '8px 16px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              Load Example
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label htmlFor="endpoint">API Endpoint</label>
            <input
              type="text"
              id="endpoint"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleInputChange}
              placeholder="/person/users/api/auth"
              required
            />
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px', display: 'block' }}>
              Enter the API endpoint path (e.g., /person/users/api/auth)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="method">HTTP Method</label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              required
            >
              {httpMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="backendUri">Backend Integration URI</label>
            <input
              type="url"
              id="backendUri"
              name="backendUri"
              value={formData.backendUri}
              onChange={handleInputChange}
              placeholder="https://personapi.api.com/person/users/api/auth"
              required
            />
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px', display: 'block' }}>
              Enter the full backend URI for integration
            </small>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="apiKeyRequired"
                checked={formData.apiKeyRequired}
                onChange={handleInputChange}
                style={{ transform: 'scale(1.2)' }}
              />
              <span>API Key Required</span>
            </label>
            <small style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px', display: 'block' }}>
              Check this if the API endpoint requires an API key for access
            </small>
          </div>

          <button type="submit" className="generate-btn">
            Generate Terraform
          </button>
        </form>
      </div>

      <div className="output-card">
        <div className="output-header">
          <h3>Generated Terraform Configuration</h3>
          <div className="syntax-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.9rem', color: '#666' }}>
                <input
                  type="checkbox"
                  checked={syntaxHighlighting}
                  onChange={(e) => setSyntaxHighlighting(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Syntax Highlighting
              </label>
              {syntaxHighlighting && (
                <label style={{ fontSize: '0.9rem', color: '#666' }}>
                  <input
                    type="checkbox"
                    checked={darkTheme}
                    onChange={(e) => setDarkTheme(e.target.checked)}
                    style={{ marginRight: '5px' }}
                  />
                  Dark Theme
                </label>
              )}
            </div>
            {terraformOutput && (
              <button 
                onClick={handleCopy} 
                className={`copy-btn ${copySuccess ? 'copied' : ''}`}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>
        
        <div 
          className={`terraform-output ${syntaxHighlighting ? 'syntax-highlighted' : ''} ${syntaxHighlighting && !darkTheme ? 'light-theme' : ''}`}
        >
          {syntaxHighlighting && terraformOutput ? (
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                Debug: Syntax highlighting enabled
              </div>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: highlighter.highlight(terraformOutput) 
                }} 
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>
          ) : (
            <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
              {terraformOutput || 'Generated Terraform configuration will appear here...'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerraformGenerator;