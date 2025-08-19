# Node.js Installation Help

## 🚨 Issue: Node.js not recognized in terminal

Even though you mentioned having Node.js installed, both `node` and `npm` commands are not being recognized in your PowerShell terminal.

## 🔧 **Fix Steps:**

### Step 1: Download and Install Node.js Properly
1. **Go to:** https://nodejs.org/
2. **Download:** LTS version (Long Term Support) - currently Node.js 20.x
3. **Important:** Choose the **Windows Installer (.msi)** for your system:
   - **64-bit**: `node-v20.x.x-x64.msi` (most common)
   - **32-bit**: `node-v20.x.x-x86.msi` (older systems)

### Step 2: Install with Proper Settings
1. **Run the installer** as Administrator (right-click → "Run as administrator")
2. **Follow the setup wizard:**
   - ✅ Accept the license agreement
   - ✅ Choose default installation directory: `C:\Program Files\nodejs\`
   - ✅ **IMPORTANT:** Check "Add to PATH" option
   - ✅ Install npm package manager (should be checked by default)
   - ✅ Install tools for native modules (optional but recommended)

### Step 3: Restart Terminal
1. **Close all PowerShell windows**
2. **Open a NEW PowerShell window**
3. **Test installation:**
   ```powershell
   node --version
   npm --version
   ```

### Step 4: Alternative - Use Chocolatey (Advanced)
If you prefer a package manager approach:
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install Node.js
choco install nodejs
```

## 🎯 **Expected Result:**
After proper installation, these commands should work:
```powershell
node --version
# Should show: v20.x.x

npm --version  
# Should show: 10.x.x
```

## 🚀 **Once Node.js Works:**
Come back and we'll run:
```powershell
npm install
```

This will install all the authentication, billing, and UI dependencies for your Cairns Prospect Finder.

## 🔍 **Troubleshooting:**

**If commands still don't work after installation:**
1. **Check PATH manually:**
   - Open "Environment Variables" in Windows settings
   - Look for `C:\Program Files\nodejs\` in System PATH
   - Add it manually if missing

2. **Try Windows Command Prompt** instead of PowerShell:
   ```cmd
   node --version
   npm --version
   ```

3. **Restart your computer** (last resort)

## 💡 **Alternative: Use Cursor Terminal**
If you're using Cursor IDE, try using the integrated terminal instead of external PowerShell.
