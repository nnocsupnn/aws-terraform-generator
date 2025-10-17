# Terraform API Gateway Generator

A React-based frontend application that generates AWS API Gateway Terraform configurations from endpoint specifications. Supports both single and multiple endpoint configurations with intelligent resource sharing.

## Features

- **Dual Mode Operation**: 
  - Single Endpoint Mode: Generate configuration for one endpoint
  - Multiple Endpoints Mode: Generate connected resources for multiple endpoints
- **Resource Optimization**: Automatically shares common path segments across endpoints
- **Interactive Form**: Easy-to-use interface for entering endpoint details
- **Real-time Generation**: Instant Terraform configuration generation
- **Copy to Clipboard**: One-click copying of generated configurations
- **Validation**: Input validation and error handling
- **Example Loading**: Quick example data loading for testing
- **Responsive Design**: Works on desktop and mobile devices

## Multiple Endpoints Feature

The application now supports multiple endpoints and automatically creates connected resources. When you have endpoints that share common path segments, the generator will:

1. **Detect Shared Paths**: Identify common segments across different endpoints
2. **Optimize Resources**: Create shared AWS API Gateway resources for common paths
3. **Connect Dependencies**: Ensure proper parent-child relationships between resources
4. **Generate Unique Methods**: Create separate methods and integrations for each endpoint

### Example with Connected Resources

**Input Endpoints:**
1. `/person/users/api/auth` (POST)
2. `/person/users/api/profile` (GET)
3. `/person/users/api/profile` (PUT)
4. `/orders/api/create` (POST)
5. `/orders/api/status` (GET)

**Generated Result:**
- Shared `/person` resource
- Shared `/person/users` resource  
- Shared `/person/users/api` resource
- Individual `/person/users/api/auth` and `/person/users/api/profile` resources
- Separate `/orders` and `/orders/api` resources
- Individual methods for each endpoint with their specific HTTP methods
- Unique integrations for each backend URI

## Usage

### Multiple Endpoints Mode (Recommended)

1. **Add Endpoints**: Click "Add Endpoint" to add multiple API endpoints
2. **Configure Each Endpoint**:
   - **API Endpoint**: The REST API endpoint path (e.g., `/person/users/api/auth`)
   - **HTTP Method**: Select from GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
   - **Backend Integration URI**: The backend service URI for integration
3. **Generate**: Click "Generate Terraform" to create optimized, connected resources
4. **Copy**: Use the copy button to copy the generated configuration

### Single Endpoint Mode

For simple single-endpoint configurations, switch to the "Single Endpoint" tab and follow the original workflow.

### Input Fields

1. **API Endpoint**: The REST API endpoint path (e.g., `/person/users/api/auth`)
2. **HTTP Method**: Select from GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
3. **Backend Integration URI**: The backend service URI for integration

### Example

**Input:**
- Endpoint: `/person/users/api/auth`
- Method: `POST`
- Backend URI: `https://personapi.api.com/person/users/api/auth`

**Generated Output:**
```hcl
# AWS API Gateway Resources

resource "aws_api_gateway_resource" "person" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "person"
}

resource "aws_api_gateway_resource" "person_users" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.person.id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "person_users_api" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.person_users.id
  path_part   = "api"
}

resource "aws_api_gateway_resource" "person_users_api_auth" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.person_users_api.id
  path_part   = "auth"
}

resource "aws_api_gateway_method" "person_users_api_auth_post" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.person_users_api_auth.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "person_users_api_auth_post_integration" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.person_users_api_auth.id
  http_method = aws_api_gateway_method.person_users_api_auth_post.http_method

  integration_http_method = "POST"
  type                    = "HTTP_PROXY"
  uri                     = "https://personapi.api.com/person/users/api/auth"
}
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd terraform-parser
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Architecture

### Components

- **App.js**: Main application component
- **TerraformGenerator.js**: Main form and output component
- **TerraformParser.js**: Utility class for parsing endpoints and generating Terraform

### Key Features

1. **Endpoint Parsing**: Splits endpoint paths into individual segments
2. **Resource Generation**: Creates nested AWS API Gateway resources
3. **Method Configuration**: Generates method configurations for the endpoint
4. **Integration Setup**: Creates HTTP_PROXY integrations to backend services

## Terraform Resources Generated

The application generates three types of AWS API Gateway resources:

1. **Resources**: Nested path resources for each segment of the endpoint
2. **Methods**: HTTP method configuration for the final resource
3. **Integrations**: Backend integration configuration with HTTP_PROXY type

## Customization

The application can be extended to support:

- Different authorization types
- Request/response transformations
- CORS configuration
- Custom integrations types
- Validation models
- API documentation generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.