/**
 * Parses endpoint paths and generates Terraform resource configurations
 * for AWS API Gateway resources and methods with support for multiple endpoints
 */

export class TerraformParser {
  constructor() {
    this.resourceCounter = 0;
    this.generatedResources = new Set();
    this.resourceTree = new Map();
  }

  /**
   * Parse endpoint path into individual segments
   * @param {string} endpoint - The API endpoint path (e.g., "/person/users/api/auth")
   * @returns {Array} Array of path segments
   */
  parseEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Endpoint must be a non-empty string');
    }

    // Remove leading/trailing slashes and split by '/'
    const segments = endpoint.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
    
    if (segments.length === 0) {
      throw new Error('Endpoint must contain at least one path segment');
    }

    return segments;
  }

  /**
   * Parse multiple endpoints and build resource tree
   * @param {Array} endpoints - Array of endpoint objects {endpoint, method, backendUri}
   * @returns {Map} Resource tree mapping
   */
  buildResourceTree(endpoints) {
    const tree = new Map();
    
    endpoints.forEach(({endpoint}) => {
      const segments = this.parseEndpoint(endpoint);
      
      // Build tree structure
      for (let i = 0; i < segments.length; i++) {
        const currentPath = '/' + segments.slice(0, i + 1).join('/');
        const parentPath = i === 0 ? '/' : '/' + segments.slice(0, i).join('/');
        
        if (!tree.has(currentPath)) {
          tree.set(currentPath, {
            segments: segments.slice(0, i + 1),
            pathPart: segments[i],
            parentPath: parentPath,
            resourceName: this.generateResourceName(segments.slice(0, i + 1)),
            children: new Set()
          });
        }
        
        // Add to parent's children
        if (parentPath !== '/' && tree.has(parentPath)) {
          tree.get(parentPath).children.add(currentPath);
        }
      }
    });
    
    return tree;
  }

  /**
   * Generate resource name from path segments
   * @param {Array} segments - Path segments up to current position
   * @returns {string} Terraform resource name
   */
  generateResourceName(segments) {
    return segments.join('_').toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Generate parent resource reference
   * @param {Array} segments - All segments up to current position
   * @param {number} index - Current segment index
   * @returns {string} Parent resource reference
   */
  getParentReference(segments, index) {
    if (index === 0) {
      return 'aws_api_gateway_rest_api.this.root_resource_id';
    }
    
    const parentSegments = segments.slice(0, index);
    const parentName = this.generateResourceName(parentSegments);
    return `aws_api_gateway_resource.${parentName}.id`;
  }

  /**
   * Generate AWS API Gateway resource blocks for multiple endpoints
   * @param {Array} endpoints - Array of endpoint objects {endpoint, method, backendUri}
   * @returns {string} Terraform resource configuration
   */
  generateResourcesForMultipleEndpoints(endpoints) {
    const resourceTree = this.buildResourceTree(endpoints);
    let terraformConfig = '';
    
    // Sort resources by depth to ensure proper dependency order
    const sortedResources = Array.from(resourceTree.entries())
      .sort(([,a], [,b]) => a.segments.length - b.segments.length);
    
    sortedResources.forEach(([path, resource]) => {
      if (this.generatedResources.has(resource.resourceName)) {
        return; // Skip if already generated
      }
      
      const parentReference = resource.parentPath === '/' 
        ? 'aws_api_gateway_rest_api.this.root_resource_id'
        : `aws_api_gateway_resource.${resourceTree.get(resource.parentPath).resourceName}.id`;

      terraformConfig += `resource "aws_api_gateway_resource" "${resource.resourceName}" {\n`;
      terraformConfig += `  rest_api_id = aws_api_gateway_rest_api.this.id\n`;
      terraformConfig += `  parent_id   = ${parentReference}\n`;
      terraformConfig += `  path_part   = "${resource.pathPart}"\n`;
      
      // Add depends_on for child resources (not root-level resources)
      if (resource.parentPath !== '/') {
        const parentResourceName = resourceTree.get(resource.parentPath).resourceName;
        terraformConfig += `  depends_on  = [aws_api_gateway_resource.${parentResourceName}]\n`;
      }
      
      terraformConfig += `}\n\n`;
      
      this.generatedResources.add(resource.resourceName);
    });

    return terraformConfig;
  }

  /**
   * Generate AWS API Gateway method configurations for multiple endpoints
   * @param {Array} endpoints - Array of endpoint objects {endpoint, method, backendUri, apiKeyRequired}
   * @returns {string} Terraform method configurations
   */
  generateMethodsForMultipleEndpoints(endpoints) {
    let terraformConfig = '';
    
    endpoints.forEach(({endpoint, method, apiKeyRequired = false}) => {
      const segments = this.parseEndpoint(endpoint);
      const resourceName = this.generateResourceName(segments);
      const methodName = `${resourceName}_${method.toLowerCase()}`;

      terraformConfig += `resource "aws_api_gateway_method" "${methodName}" {\n`;
      terraformConfig += `  rest_api_id   = aws_api_gateway_rest_api.this.id\n`;
      terraformConfig += `  resource_id   = aws_api_gateway_resource.${resourceName}.id\n`;
      terraformConfig += `  http_method   = "${method.toUpperCase()}"\n`;
      terraformConfig += `  authorization = "NONE"\n`;
      terraformConfig += `  api_key_required = ${apiKeyRequired}\n`;
      terraformConfig += `  depends_on    = [aws_api_gateway_resource.${resourceName}]\n`;
      terraformConfig += `}\n\n`;
    });

    return terraformConfig;
  }

  /**
   * Generate AWS API Gateway integration configurations for multiple endpoints
   * @param {Array} endpoints - Array of endpoint objects {endpoint, method, backendUri, apiKeyRequired}
   * @returns {string} Terraform integration configurations
   */
  generateIntegrationsForMultipleEndpoints(endpoints) {
    let terraformConfig = '';
    
    endpoints.forEach(({endpoint, method, backendUri}) => {
      const segments = this.parseEndpoint(endpoint);
      const resourceName = this.generateResourceName(segments);
      const integrationName = `${resourceName}_${method.toLowerCase()}_integration`;
      const methodName = `${resourceName}_${method.toLowerCase()}`;

      terraformConfig += `resource "aws_api_gateway_integration" "${integrationName}" {\n`;
      terraformConfig += `  rest_api_id = aws_api_gateway_rest_api.this.id\n`;
      terraformConfig += `  resource_id = aws_api_gateway_resource.${resourceName}.id\n`;
      terraformConfig += `  http_method = aws_api_gateway_method.${methodName}.http_method\n`;
      terraformConfig += `\n`;
      terraformConfig += `  integration_http_method = "${method.toUpperCase()}"\n`;
      terraformConfig += `  type                    = "HTTP_PROXY"\n`;
      terraformConfig += `  uri                     = "${backendUri}"\n`;
      terraformConfig += `  depends_on              = [aws_api_gateway_method.${methodName}]\n`;
      terraformConfig += `}\n\n`;
    });

    return terraformConfig;
  }

  /**
   * Generate complete Terraform configuration for multiple endpoints
   * @param {Array} endpoints - Array of endpoint objects {endpoint, method, backendUri, apiKeyRequired}
   * @returns {string} Complete Terraform configuration
   */
  generateCompleteForMultipleEndpoints(endpoints) {
    try {
      // Reset state for new generation
      this.generatedResources.clear();
      
      let config = '# AWS API Gateway Resources\n\n';
      
      // Generate shared resources first
      config += this.generateResourcesForMultipleEndpoints(endpoints);
      
      // Generate methods for each endpoint
      config += this.generateMethodsForMultipleEndpoints(endpoints);
      
      // Generate integrations for each endpoint
      config += this.generateIntegrationsForMultipleEndpoints(endpoints);

      return config;
    } catch (error) {
      throw new Error(`Failed to generate Terraform configuration: ${error.message}`);
    }
  }

  /**
   * Generate complete Terraform configuration (backward compatibility)
   * @param {string} endpoint - API endpoint path
   * @param {string} method - HTTP method
   * @param {string} backendUri - Backend integration URI
   * @returns {string} Complete Terraform configuration
   */
  generateComplete(endpoint, method, backendUri) {
    const endpoints = [{endpoint, method, backendUri}];
    return this.generateCompleteForMultipleEndpoints(endpoints);
  }
}

export default TerraformParser;