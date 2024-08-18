const fs = require('fs');

function mergeJson(sourceFile, targetFile) {
  try {
    const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    const targetData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

    Object.assign(targetData, sourceData);

    fs.writeFileSync(firefoxExtensionManifestFile, JSON.stringify(targetData, null, 2));
  } catch (err) {
    console.error('Error merging JSON files:', err);
  }
}

// Make firefox manifest file from firefox.json browser_specific_settings
const firefoxBrowserSpecificSettingsFile = 'firefox.json';
const chromeExtensionManifestFile = 'chrome-extension/manifest.json';
const firefoxExtensionManifestFile = 'dist/firefox_temp/manifest.json';

mergeJson(firefoxBrowserSpecificSettingsFile, chromeExtensionManifestFile);

