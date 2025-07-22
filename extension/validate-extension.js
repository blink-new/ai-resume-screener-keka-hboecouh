// Simple validation script for the Chrome extension
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Chrome Extension Structure...\n');

// Required files
const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'styles.css',
    'ai-widget.html',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png'
];

let allValid = true;

// Check if all required files exist
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} (${stats.size} bytes)`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allValid = false;
    }
});

// Validate manifest.json
try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('\n📋 Manifest Validation:');
    console.log(`✅ Manifest version: ${manifest.manifest_version}`);
    console.log(`✅ Extension name: ${manifest.name}`);
    console.log(`✅ Version: ${manifest.version}`);
    
    // Check if all icon files referenced in manifest exist
    if (manifest.icons) {
        Object.entries(manifest.icons).forEach(([size, iconPath]) => {
            const fullPath = path.join(__dirname, iconPath);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ Icon ${size}x${size}: ${iconPath}`);
            } else {
                console.log(`❌ Icon ${size}x${size}: ${iconPath} - MISSING`);
                allValid = false;
            }
        });
    }
    
} catch (error) {
    console.log(`❌ Manifest validation failed: ${error.message}`);
    allValid = false;
}

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 Extension validation PASSED! Ready to load in Chrome.');
    console.log('\n📖 To install:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode" (top right toggle)');
    console.log('3. Click "Load unpacked" and select this extension folder');
} else {
    console.log('❌ Extension validation FAILED! Please fix the issues above.');
}
console.log('='.repeat(50));