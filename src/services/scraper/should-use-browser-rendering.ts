// Check for common phrases that indicate the page requires JavaScript to render content.

export function shouldUseBrowserRendering(html: string): boolean {
    
    const lowerHtml = html.toLowerCase();
  
    // Direct hints that the page requires JavaScript to function properly.
    const directBrowserHints = [
      "javascript must be enabled",
      "your browser does not support javascript",
      "enable javascript",
      "please enable javascript",
      "requires javascript",
    ];
  
    // If any of these phrases are present, it's a strong signal that the page needs browser rendering.
    const hasDirectHint = directBrowserHints.some((hint) =>
      lowerHtml.includes(hint)
    );
  
    if (hasDirectHint) {
      return true;
    }
  
    // Check for signs of a modern JavaScript framework (like React, Vue, Angular)
    // that often serve an app shell with minimal content before client-side rendering.
    const appShellHints = [
      'id="root"',
      "id='root'",
      'id="app"',
      "id='app'",
      "__next_data__",
      "data-reactroot",
      "ng-version",
    ];
  
    // If the HTML contains these markers but has very little readable text content,
    // it's likely an app shell that requires browser rendering.
    const hasAppShellHint = appShellHints.some((hint) =>
      lowerHtml.includes(hint)
    );
  
    // If the HTML looks like a React/Vue/Angular shell but has very little
    // readable content, it probably needs browser rendering.
    const bodyTextApprox = lowerHtml
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  
    // If we see app shell hints but the body text is very short,
    // it's likely that the page relies on client-side rendering to populate content.
    if (hasAppShellHint && bodyTextApprox.length < 800) {
      return true;
    }
  
    return false;
  }