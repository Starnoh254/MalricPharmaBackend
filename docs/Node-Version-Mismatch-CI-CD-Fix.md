# 🐛 Node.js Version Mismatch in CI/CD - Issue & Solution

## 📋 **Issue Summary**

**Problem**: GitHub Actions deployment was failing with Node.js compatibility errors, even though the server had the correct Node.js version when checked manually.

**Root Cause**: Different Node.js versions between interactive SSH sessions (manual) and non-interactive SSH sessions (GitHub Actions CI/CD).

---

## 🔍 **Detailed Problem Analysis**

### **Symptoms**

- ✅ Manual SSH: `node --version` showed `v22.14.0`
- ❌ GitHub Actions: `node --version` showed `v10.19.0`
- npm install failed with "Unsupported engine" errors
- Packages requiring Node.js 16+ couldn't install

### **Error Messages**

```bash
npm verb notsup Required: {"node":"^14.18.0 || >=16.0.0"}
npm verb notsup Actual:   {"npm":"6.14.4","node":"10.19.0"}
npm WARN notsup Unsupported engine for @prisma/engines@6.11.0
```

### **Environment Differences**

| Context        | Shell Type      | Node.js Version | npm Version | nvm Status    |
| -------------- | --------------- | --------------- | ----------- | ------------- |
| Manual SSH     | Interactive     | v22.14.0        | v10.9.2     | ✅ Loaded     |
| GitHub Actions | Non-interactive | v10.19.0        | v6.14.4     | ❌ Not loaded |

---

## 🔧 **Root Cause Explanation**

### **Why This Happened**

1. **Server Setup**: Had both system Node.js (v10.19.0) and nvm-managed Node.js (v22.14.0)
2. **nvm Behavior**: Only loads in **interactive shells** by default
3. **GitHub Actions**: Uses **non-interactive SSH** sessions
4. **PATH Priority**: System Node.js took precedence in non-interactive mode

### **Technical Details**

- **Interactive SSH**: Sources `~/.bashrc`, loads nvm, uses correct Node.js
- **Non-Interactive SSH**: Doesn't source `~/.bashrc`, uses system Node.js
- **CI/CD Impact**: Automated deployments use non-interactive shells

---

## ✅ **Solution Implementation**

### **1. Updated Deployment Script**

Modified `.github/workflows/deploy.yml` to explicitly load nvm in non-interactive mode:

```bash
# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Load nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # Load nvm bash_completion

# Use nvm default if available, otherwise use system node
if command -v nvm &> /dev/null; then
    nvm use default || echo "⚠️ nvm default not set, using current version"
fi
```

### **2. Version Validation**

Added Node.js version checking with clear error messages:

```bash
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️ Node.js version is too old (v$NODE_VERSION)"
    echo "❌ Current Node.js version is incompatible"
    exit 1
fi
```

---

## 🎯 **Key Lessons Learned**

### **1. Shell Environment Differences**

- Interactive vs non-interactive shells behave differently
- CI/CD systems typically use non-interactive shells
- Environment variables and PATH can differ between shell types

### **2. nvm Limitations**

- nvm doesn't load automatically in non-interactive shells
- Manual nvm loading required for CI/CD systems
- System Node.js can interfere with nvm-managed versions

### **3. Deployment Best Practices**

- Always verify Node.js version in deployment scripts
- Test deployment scripts in non-interactive mode
- Use explicit environment loading for CI/CD

---

## 🛠️ **Alternative Solutions**

### **Option A: System Node.js Symlinks** (Alternative approach)

```bash
# Create system symlinks to nvm Node.js
sudo ln -sf $(which node) /usr/local/bin/node
sudo ln -sf $(which npm) /usr/local/bin/npm
export PATH="/usr/local/bin:$PATH"
```

### **Option B: Update System Node.js** (Not recommended if using nvm)

```bash
# Replace system Node.js entirely
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### **Option C: Docker Deployment** (Modern approach)

```dockerfile
FROM node:20-alpine
# Eliminates version conflicts entirely
```

### **Option D: Prisma Migration Issues** (Common follow-up problem)

```bash
# If you get P3009 migration errors after Node.js fix
npx prisma migrate resolve --rolled-back 20250626223539_initial
npx prisma migrate deploy
```

---

## 🔍 **Debugging Commands**

### **Test Node.js Versions**

```bash
# Interactive shell (manual SSH)
ssh user@server
node --version  # Should show nvm version

# Non-interactive shell (simulates CI/CD)
ssh user@server 'node --version'  # Might show system version

# Test nvm loading
ssh user@server 'source ~/.bashrc && node --version'
```

### **Environment Inspection**

```bash
# Check which Node.js binaries exist
which -a node
whereis node

# Check nvm status
nvm list
nvm current

# Check PATH
echo $PATH
```

---

## 📋 **Prevention Checklist**

### **Before Setting Up CI/CD**

- [ ] Verify Node.js version in both interactive and non-interactive shells
- [ ] Test deployment script manually via SSH
- [ ] Ensure nvm loads correctly in non-interactive mode
- [ ] Document expected Node.js version requirements

### **Deployment Script Requirements**

- [ ] Explicit nvm loading
- [ ] Node.js version validation
- [ ] Clear error messages for version mismatches
- [ ] Fallback handling for missing nvm

### **Server Setup Best Practices**

- [ ] Use consistent Node.js installation method (nvm OR system, not both)
- [ ] Configure nvm for non-interactive shells if needed
- [ ] Document Node.js installation method for team

---

## 🎯 **Final Solution Status**

✅ **Fixed**: GitHub Actions deployment now uses correct Node.js version
✅ **Tested**: Both interactive and non-interactive shells use nvm Node.js
✅ **Documented**: Clear process for future troubleshooting
✅ **Preventive**: Version checking prevents similar issues

---

## 📞 **Quick Reference**

### **If You See This Error Again**

1. Check Node.js version: `ssh server 'node --version'`
2. Verify nvm loading in deployment script
3. Test non-interactive shell: `ssh server 'source ~/.bashrc && node --version'`
4. Update deployment script to load nvm explicitly

### **Key Files Modified**

- `.github/workflows/deploy.yml` - Added nvm loading and version checking
- Server environment - Ensured nvm compatibility with CI/CD

---

**Issue Type**: Environment Configuration  
**Severity**: High (Blocked deployments)  
**Resolution Time**: ~2 hours  
**Prevention**: Use explicit environment loading in CI/CD scripts

This issue is common in projects using nvm with automated deployment systems! 🎯
