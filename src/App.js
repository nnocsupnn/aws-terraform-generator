import React, { useState } from 'react';
import TerraformGenerator from './components/TerraformGenerator';
import MultiEndpointGenerator from './components/MultiEndpointGenerator';

function App() {
  const [activeTab, setActiveTab] = useState('multiple'); // Default to multiple endpoints

  return (
    <div className="container">
      <div className="header">
        <h1>Terraform API Gateway Generator</h1>
        <p>Generate AWS API Gateway Terraform resources from endpoint configurations</p>
        
        <div className="tab-container" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginTop: '20px' 
        }}>
          <button
            onClick={() => setActiveTab('single')}
            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              background: activeTab === 'single' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              color: activeTab === 'single' ? '#333' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            Single Endpoint
          </button>
          <button
            onClick={() => setActiveTab('multiple')}
            className={`tab-btn ${activeTab === 'multiple' ? 'active' : ''}`}
            style={{
              padding: '10px 20px',
              background: activeTab === 'multiple' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              color: activeTab === 'multiple' ? '#333' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            Multiple Endpoints
          </button>
        </div>
      </div>
      
      {activeTab === 'single' ? <TerraformGenerator /> : <MultiEndpointGenerator />}
    </div>
  );
}

export default App;