"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Document;
const document_1 = require("next/document");
function Document() {
    return (<document_1.Html lang="en">
      <document_1.Head>
        {/* Preconnect to font sources */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
        <link rel="manifest" href="/site.webmanifest"/>
        
        {/* Meta tags */}
        <meta name="description" content="Ghana Oil Marketing Company (OMC) Enterprise Resource Planning System"/>
        <meta name="keywords" content="Ghana, OMC, ERP, Oil Marketing, Fuel, UPPF, Pricing"/>
        <meta name="author" content="Ghana OMC ERP Team"/>
        
        {/* Theme colors */}
        <meta name="theme-color" content="#DC2626"/>
        <meta name="msapplication-TileColor" content="#DC2626"/>
        
        {/* PWA meta tags */}
        <meta name="application-name" content="Ghana OMC ERP"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Ghana OMC ERP"/>
        <meta name="format-detection" content="telephone=no"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        
        {/* Performance hints */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com"/>
        <link rel="dns-prefetch" href="//fonts.gstatic.com"/>
      </document_1.Head>
      <body>
        <document_1.Main />
        <document_1.NextScript />
        
        {/* Prevent FOUC (Flash of Unstyled Content) - Theme System */}
        <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Get stored theme mode from localStorage
                  const storedMode = localStorage.getItem('omc-erp-theme') || 'system';
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  let actualTheme;
                  if (storedMode === 'system') {
                    actualTheme = systemPrefersDark ? 'dark' : 'light';
                  } else {
                    actualTheme = storedMode;
                  }
                  
                  // Apply theme to document
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(actualTheme);
                  
                  // Update meta theme-color
                  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                  if (metaThemeColor) {
                    metaThemeColor.setAttribute('content', actualTheme === 'dark' ? '#0C0C0F' : '#FFFFFF');
                  }
                } catch (e) {
                  // Fallback to dark theme if there's an error
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
        }}/>
      </body>
    </document_1.Html>);
}
//# sourceMappingURL=_document.js.map