#!/bin/bash
#
# Build both Chrome and Firefox extension ZIP files using the name and version specified in the manifest.
# The script first builds the Chrome extension ZIP and then takes the browser_specific_settings for Firefox
# from the firefox.json file and appends/merges with the extension manifest.json prior to generating the 
# Firefox extension ZIP.
#
# ZIP archives are generated in the `dist` folder.
#
# Usage: sh make.sh
#
#
echo "Building extensions..."

cd chrome-extension || { echo "Error: Failed to change to chrome-extension directory"; exit 1; }

# Get extension name and version
EXTENSION_NAME=$(grep "name" manifest.json | sed 's/^.*"name"://g' | sed 's/[",]//g' | sed 's/ //') || { echo "Error: Failed to extract extension name"; exit 1; }
VERSION=$(grep "\"version" manifest.json | sed 's/^.*"version"://g' | sed 's/[",]//g' | sed 's/ //') || { echo "Error: Failed to extract version"; exit 1; }

# Create dist directory
mkdir -p ../dist || { echo "Error: Failed to create dist directory"; exit 1; }

# Build Chrome extension
echo "Building Chrome extension..."
zip -r "../dist/$EXTENSION_NAME-$VERSION-chrome.zip" . -x '*.git*' \*.sh '*dist*' \README.md '*test*' \package.json \images/a* \images/favicon.ico \images/g* '*.DS_Store' || { echo "Error: Failed to create Chrome extension ZIP"; exit 1; }

# Create temporary directory for Firefox extension
temp_dir="../dist/firefox_temp"
mkdir -p "$temp_dir" || { echo "Error: Failed to create temporary directory"; exit 1; }

# Extract Chrome extension to temporary directory
unzip -q "../dist/$EXTENSION_NAME-$VERSION-chrome.zip" -d "$temp_dir" || { echo "Error: Failed to extract Chrome extension"; exit 1; }

# Modify manifest for Firefox
echo "Generating Firefox manifest..."
cd .. || { echo "Error: Failed to change to parent directory"; exit 1; }
node generate-firefox-manifest.js || { echo "Error: Failed to generate Firefox manifest"; exit 1; }
cd chrome-extension || { echo "Error: Failed to change back to chrome-extension directory"; exit 1; }

# Build Firefox extension
echo "Building Firefox extension..."
cd $temp_dir || { echo "Error: Failed to change to temporary directory"; exit 1; }
zip -r "$EXTENSION_NAME-$VERSION-firefox.zip" . -x '*.git*' \*.sh '*dist*' \README.md '*test*' \package.json \images/a* \images/favicon.ico \images/g* '*.DS_Store' || { echo "Error: Failed to create Firefox extension ZIP"; exit 1; }
mv "$EXTENSION_NAME-$VERSION-firefox.zip" ../ || { echo "Error: Failed to move Firefox ZIP"; exit 1; }
cd .. || { echo "Error: Failed to change to parent directory"; exit 1; }
rm -rf "$temp_dir" || { echo "Error: Failed to remove temporary directory"; exit 1; }

echo "Build completed."
