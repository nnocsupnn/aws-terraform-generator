/**
 * Terraform syntax highlighter utility
 */

export class TerraformSyntaxHighlighter {
  /**
   * Apply syntax highlighting to Terraform code
   * @param {string} code - Raw Terraform code
   * @returns {string} HTML with syntax highlighting
   */
  highlight(code) {
    console.log('Original code:', code);
    
    if (!code || typeof code !== 'string') {
      return '';
    }
    
    // Extremely simple test - just wrap "resource" in a span with inline styles
    const result = code.replace(/\bresource\b/g, '<span style="color: #ff6b6b; font-weight: bold;">resource</span>');
    
    console.log('Highlighted result:', result);
    return result;
  }
}

export default TerraformSyntaxHighlighter;