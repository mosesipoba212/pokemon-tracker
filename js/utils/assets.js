/* =========================================================
   ASSETS.JS — Centralized asset path management with debugging
   ========================================================= */
'use strict';

// Image load tracking for debugging
const imageLoadStats = {
  loaded: [],
  failed: [],
  pending: new Set()
};

/**
 * Get asset path with proper root-relative format for Vercel deployment
 * @param {string} path - Relative path from sprites/ folder (e.g., "sprites/pokemon/25.png")
 * @returns {string} - Absolute path from root (e.g., "/sprites/sprites/pokemon/25.png")
 */
function assetPath(path) {
  // Remove leading slash or "sprites/" if present
  const cleaned = path.replace(/^\/?(sprites\/)?/, '');
  const fullPath = `/sprites/${cleaned}`;
  
  if (window.DEBUG_ASSETS) {
    console.log(`[Asset Path] ${path} → ${fullPath}`);
  }
  
  return fullPath;
}

/**
 * Get sprite path specifically
 * @param {string} path - Path from sprites/sprites/ (e.g., "pokemon/25.png")
 * @returns {string} - Absolute path
 */
function spritePath(path) {
  const cleaned = path.replace(/^\/?(sprites\/sprites\/)?/, '');
  const fullPath = `/sprites/sprites/${cleaned}`;
  
  if (window.DEBUG_ASSETS) {
    console.log(`[Sprite Path] ${path} → ${fullPath}`);
  }
  
  return fullPath;
}

/**
 * Create an image element with error tracking
 * @param {string} src - Image source path
 * @param {string} alt - Alt text
 * @param {string} className - CSS class
 * @param {Function} onError - Optional error callback
 * @returns {HTMLImageElement}
 */
function createTrackedImage(src, alt = '', className = '', onError = null) {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  if (className) img.className = className;
  
  imageLoadStats.pending.add(src);
  
  img.addEventListener('load', () => {
    imageLoadStats.pending.delete(src);
    imageLoadStats.loaded.push(src);
    console.log(`✓ Image loaded: ${src}`);
  });
  
  img.addEventListener('error', (e) => {
    imageLoadStats.pending.delete(src);
    imageLoadStats.failed.push(src);
    console.error(`✗ Image FAILED to load: ${src}`);
    console.error(`  Alt text: ${alt}`);
    console.error(`  Element:`, img);
    
    if (onError) {
      onError(e, img);
    }
  });
  
  return img;
}

/**
 * Get image load statistics
 * @returns {object} - Load statistics
 */
function getImageStats() {
  return {
    loaded: imageLoadStats.loaded.length,
    failed: imageLoadStats.failed.length,
    pending: imageLoadStats.pending.size,
    failedPaths: [...imageLoadStats.failed],
    successRate: imageLoadStats.loaded.length / 
      (imageLoadStats.loaded.length + imageLoadStats.failed.length) * 100
  };
}

/**
 * Log image statistics to console
 */
function logImageStats() {
  const stats = getImageStats();
  console.group('📊 Image Load Statistics');
  console.log(`✓ Loaded: ${stats.loaded}`);
  console.log(`✗ Failed: ${stats.failed}`);
  console.log(`⏳ Pending: ${stats.pending}`);
  console.log(`📈 Success Rate: ${stats.successRate.toFixed(1)}%`);
  
  if (stats.failed > 0) {
    console.group('❌ Failed Images:');
    stats.failedPaths.forEach(path => console.log(`  - ${path}`));
    console.groupEnd();
  }
  
  console.groupEnd();
}

// Enable debug mode via console
window.enableAssetDebug = () => {
  window.DEBUG_ASSETS = true;
  console.log('🔍 Asset debugging ENABLED');
};

window.disableAssetDebug = () => {
  window.DEBUG_ASSETS = false;
  console.log('🔕 Asset debugging DISABLED');
};

window.getImageStats = getImageStats;
window.logImageStats = logImageStats;

// Global image error handler
window.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    const img = e.target;
    console.error('🚫 Global image error caught:');
    console.error(`  Path: ${img.src}`);
    console.error(`  Alt: ${img.alt}`);
    console.error(`  Parent:`, img.parentElement);
    
    // Try to identify which feature this image belongs to
    const nearestId = img.closest('[id]')?.id;
    if (nearestId) {
      console.error(`  Context: ${nearestId}`);
    }
  }
}, true);

// Log stats every 5 seconds in debug mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  setInterval(() => {
    if (window.DEBUG_ASSETS && imageLoadStats.pending.size === 0) {
      logImageStats();
    }
  }, 5000);
}

console.log('✓ Asset utilities loaded. Use enableAssetDebug() to enable detailed logging.');
