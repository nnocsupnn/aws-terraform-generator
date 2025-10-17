import React, { useState } from 'react';
import { TerraformParser } from '../utils/TerraformParser';
import TerraformSyntaxHighlighter from '../utils/TerraformSyntaxHighlighter';
import Tooltip from './Tooltip';

const MultiEndpointGenerator = () => {
  const [endpoints, setEndpoints] = useState([
    { id: 1, endpoint: '', method: 'GET', backendUri: '', apiKeyRequired: false }
  ]);
  
  const [terraformOutput, setTerraformOutput] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [allApiKeyRequired, setAllApiKeyRequired] = useState(false);

  const highlighter = new TerraformSyntaxHighlighter();

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  const addEndpoint = () => {
    const newId = Math.max(...endpoints.map(e => e.id)) + 1;
    setEndpoints([...endpoints, { id: newId, endpoint: '', method: 'GET', backendUri: '', apiKeyRequired: false }]);
  };

  const removeEndpoint = (id) => {
    if (endpoints.length > 1) {
      setEndpoints(endpoints.filter(e => e.id !== id));
    }
  };

  const updateEndpoint = (id, field, value) => {
    setEndpoints(endpoints.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
    
    if (error) {
      setError('');
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    try {
      // Validation
      const validEndpoints = endpoints.filter(ep => 
        ep.endpoint.trim() && ep.backendUri.trim()
      );
      
      if (validEndpoints.length === 0) {
        throw new Error('Please add at least one valid endpoint with both endpoint path and backend URI');
      }

      // Validate each endpoint
      validEndpoints.forEach((ep, index) => {
        if (!ep.endpoint.trim()) {
          throw new Error(`Endpoint ${index + 1}: Please enter an endpoint path`);
        }
        
        if (!ep.backendUri.trim()) {
          throw new Error(`Endpoint ${index + 1}: Please enter a backend URI`);
        }

        // Validate URI format
        try {
          new URL(ep.backendUri);
        } catch {
          throw new Error(`Endpoint ${index + 1}: Please enter a valid backend URI (e.g., https://api.example.com/path)`);
        }
      });

      const parser = new TerraformParser();
      const terraformConfig = parser.generateCompleteForMultipleEndpoints(
        validEndpoints.map(ep => ({
          endpoint: ep.endpoint.trim(),
          method: ep.method,
          backendUri: ep.backendUri.trim(),
          apiKeyRequired: ep.apiKeyRequired
        }))
      );
      
      setTerraformOutput(terraformConfig);
      setError('');
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

  const clearAllEndpoints = () => {
    setEndpoints([{ id: 1, endpoint: '', method: 'GET', backendUri: '', apiKeyRequired: false }]);
    setError('');
    setAllApiKeyRequired(false);
  };

  const toggleAllApiKeyRequired = () => {
    const newValue = !allApiKeyRequired;
    setAllApiKeyRequired(newValue);
    setEndpoints(endpoints.map(ep => ({ ...ep, apiKeyRequired: newValue })));
  };

  const duplicateEndpoint = (endpoint) => {
    const newId = Math.max(...endpoints.map(e => e.id)) + 1;
    const duplicated = { ...endpoint, id: newId };
    setEndpoints([...endpoints, duplicated]);
  };

  const loadExampleEndpoints = () => {
    setEndpoints([
      {
        id: 1,
        endpoint: '/person/users/api/auth',
        method: 'POST',
        backendUri: 'https://personapi.api.com/person/users/api/auth',
        apiKeyRequired: true
      },
      {
        id: 2,
        endpoint: '/person/users/api/profile',
        method: 'GET',
        backendUri: 'https://personapi.api.com/person/users/api/profile',
        apiKeyRequired: true
      },
      {
        id: 3,
        endpoint: '/person/users/api/profile',
        method: 'PUT',
        backendUri: 'https://personapi.api.com/person/users/api/profile',
        apiKeyRequired: true
      },
      {
        id: 4,
        endpoint: '/orders/api/create',
        method: 'POST',
        backendUri: 'https://orderapi.api.com/orders/api/create',
        apiKeyRequired: false
      },
      {
        id: 5,
        endpoint: '/orders/api/status',
        method: 'GET',
        backendUri: 'https://orderapi.api.com/orders/api/status',
        apiKeyRequired: false
      }
    ]);
    setError('');
  };

  return (
    <div className="main-content">
      <div className="form-card">
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ margin: 0, color: '#e8e8e8ff' }}>Multiple Endpoints Configuration</h2>
          <p style={{ margin: '10px 0 0 0', color: '#dededeff', fontSize: '0.95rem' }}>
            Add multiple API endpoints to generate connected Terraform resources with shared path optimization.
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          {/* Quick Actions Toolbar */}
          <div className="quick-actions-toolbar" style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '15px',
            padding: '10px',
            background: '#2d2c55', 
            borderRadius: '6px',
            // border: '1px solid #e9ecef'
          }}>
            <button
              type="button"
              onClick={addEndpoint}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>+</span> Add Endpoint
            </button>
            
            <button
              type="button"
              onClick={loadExampleEndpoints}
              style={{
                padding: '8px 16px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Load Examples
            </button>
            
            <button
              type="button"
              onClick={clearAllEndpoints}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear All
            </button>
            
            <div style={{ marginLeft: 'auto', color: '#d7d7d7ff', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }} className="endpoint-counter">
              Total Endpoints: <strong style={{ marginLeft: '5px' }}>{endpoints.length}</strong>
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="endpoints-table-container" style={{
            border: '1px solid #444',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #2c2c54 0%, #40407a 100%)'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '15px 20px',
              borderBottom: '1px solid #555',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, color: '#f1f3f4', fontWeight: '600' }}>API Endpoints Configuration</h4>
            </div>

            <div className="table-scroll" style={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              overflowX: 'auto'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                minWidth: '750px'
              }} className="responsive-table">
                <thead style={{ 
                  background: 'rgba(0, 0, 0, 0.3)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  <tr>
                    <th style={{ 
                      padding: '12px 15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #555',
                      width: '32%',
                      color: '#f1f3f4',
                      fontWeight: '600'
                    }}>
                      API Endpoint
                    </th>
                    <th style={{ 
                      padding: '12px 15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #555',
                      width: '12%',
                      color: '#f1f3f4',
                      fontWeight: '600'
                    }}>
                      Method
                    </th>
                    <th style={{ 
                      padding: '12px 15px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #555',
                      width: '38%',
                      color: '#f1f3f4',
                      fontWeight: '600'
                    }}>
                      Backend URI
                    </th>
                    <th style={{ 
                      padding: '12px 15px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #555',
                      width: '8%',
                      color: '#f1f3f4',
                      fontWeight: '600'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span>API Key</span>
                        <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="checkbox"
                            checked={allApiKeyRequired}
                            onChange={toggleAllApiKeyRequired}
                            style={{ margin: 0 }}
                          />
                          All
                        </label>
                      </div>
                    </th>
                    <th style={{ 
                      padding: '12px 15px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #555',
                      width: '10%',
                      color: '#f1f3f4',
                      fontWeight: '600'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((endpoint, index) => (
                    <tr key={endpoint.id} style={{
                      borderBottom: index === endpoints.length - 1 ? 'none' : '1px solid #555'
                    }}>
                      <td style={{ padding: '8px 15px' }}>
                        <Tooltip 
                          content={endpoint.endpoint || "Enter API endpoint path (e.g., /api/users)"} 
                          type="endpoint"
                          position="top"
                        >
                          <input
                            type="text"
                            value={endpoint.endpoint}
                            onChange={(e) => updateEndpoint(endpoint.id, 'endpoint', e.target.value)}
                            placeholder="/person/users/api/auth"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #666',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              background: '#2a2a2a',
                              color: '#f1f3f4',
                              fontWeight: '400'
                            }}
                          />
                        </Tooltip>
                      </td>
                      <td style={{ padding: '8px 15px' }}>
                        <Tooltip 
                          content={endpoint.method} 
                          position='top'
                          type="method"
                        >
                          <select
                            value={endpoint.method}
                            onChange={(e) => updateEndpoint(endpoint.id, 'method', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 2px',
                              border: '1px solid #666',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              background: '#2a2a2a',
                              color: '#f1f3f4',
                              fontWeight: '400'
                            }}
                          >
                            {httpMethods.map(method => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                        </Tooltip>
                      </td>
                      <td style={{ padding: '8px 15px' }}>
                        <Tooltip 
                          content={endpoint.backendUri || "Enter backend integration URI (e.g., https://api.example.com/endpoint)"} 
                          type="url"
                          position="top"
                        >
                          <input
                            type="url"
                            value={endpoint.backendUri}
                            onChange={(e) => updateEndpoint(endpoint.id, 'backendUri', e.target.value)}
                            placeholder="https://api.example.com/endpoint"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #666',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              background: '#2a2a2a',
                              color: '#f1f3f4',
                              fontWeight: '400'
                            }}
                          />
                        </Tooltip>
                      </td>
                      <td style={{ padding: '8px 15px', textAlign: 'center' }}>
                        <Tooltip content="Check if this endpoint requires an API key for access">
                          <input
                            type="checkbox"
                            checked={endpoint.apiKeyRequired}
                            onChange={(e) => updateEndpoint(endpoint.id, 'apiKeyRequired', e.target.checked)}
                            style={{
                              cursor: 'pointer',
                              transform: 'scale(1.2)'
                            }}
                          />
                        </Tooltip>
                      </td>
                      <td style={{ padding: '8px 15px', textAlign: 'center' }}>
                        <div className="action-buttons">
                          <Tooltip content="Duplicate this endpoint configuration">
                            <button
                              type="button"
                              onClick={() => duplicateEndpoint(endpoint)}
                              className="duplicate-btn"
                              style={{
                                background: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                minWidth: '24px',
                                height: '28px'
                              }}
                            >
                              ⧉
                            </button>
                          </Tooltip>
                          {endpoints.length > 1 && (
                            <Tooltip content="Remove this endpoint">
                              <button
                                type="button"
                                onClick={() => removeEndpoint(endpoint.id)}
                                className="remove-endpoint-btn"
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 8px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  minWidth: '24px',
                                  height: '28px'
                                }}
                              >
                                ×
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button type="submit" className="generate-btn">
            Generate Terraform Configuration
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
            <div 
              dangerouslySetInnerHTML={{ 
                __html: highlighter.highlight(terraformOutput) 
              }} 
            />
          ) : (
            <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>
              {terraformOutput || 'Generated Terraform configuration will appear here...\n\nConnected resources will be automatically optimized - shared path segments will reuse the same AWS API Gateway resources.'}
            </pre>
          )}
        </div>

        {terraformOutput && (
          <div className="optimization-info" style={{ 
            marginTop: '15px', 
            padding: '15px', 
            borderRadius: '6px', 
            color: '#f1f3f4',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            border: '1px solid #c3e6c3'
          }}>
            <strong>🔗 Resource Optimization:</strong> The generator automatically detects shared path segments across endpoints and creates connected resources. For example, endpoints like `/person/users/api/auth` and `/person/users/api/profile` will share the same `/person`, `/person/users`, and `/person/users/api` resources.
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiEndpointGenerator;