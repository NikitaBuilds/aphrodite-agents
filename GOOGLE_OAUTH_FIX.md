# Fix: Google OAuth "Error 403: access_denied"

## 🚨 Problem

Getting "aphrodite has not completed the Google verification process" error when trying to connect Gmail.

## ✅ Solution: Add Test Users

Since your app is in **Testing mode** (not published), you need to add yourself as a test user.

### Steps:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Select your project** (the one with your OAuth credentials)

3. **Navigate to OAuth Consent Screen**:

   - Left sidebar → **APIs & Services** → **OAuth consent screen**

4. **Scroll to "Test users" section**

5. **Click "+ ADD USERS"**

6. **Enter your email address** (the one you're signing in with)

   - Example: `your-email@gmail.com`

7. **Click "SAVE"**

8. **Try connecting Gmail again** - It should work now! ✅

---

## 📋 OAuth Consent Screen Settings

Make sure you have:

### **Publishing Status**

- Status: **Testing** ✅ (This is fine for development)
- You can publish later for production

### **User Type**

- **External** ✅ (Allows any Google account)

### **App Information**

- App name: Workflow Automation Builder (or your name)
- User support email: your-email@gmail.com
- Developer contact: your-email@gmail.com

### **Scopes**

Click "ADD OR REMOVE SCOPES" and add:

- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`
- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/userinfo.email`

### **Test Users** ⭐ (THIS IS THE FIX)

- Add your email address(es)
- Add any other emails you want to test with
- Max 100 test users in testing mode

---

## 🚀 After Adding Test Users

1. **Refresh** your app at http://localhost:3000
2. **Click on MCP Agent node**
3. **Click "Connect Gmail"**
4. **You should now see** the Google authorization screen (not the error!)
5. **Click "Allow"**
6. **Done!** Gmail will be connected ✅

---

## 🔄 Alternative: Publish the App (For Production)

If you want **anyone** to be able to connect (not just test users):

1. Go to OAuth consent screen
2. Click **"PUBLISH APP"**
3. Submit for Google verification (takes 1-2 weeks)
4. Once approved, no test user restrictions

**For now, just add yourself as a test user - much faster!**

---

## ⚠️ Common Mistakes

❌ **Not adding test user** → 403 error  
❌ **Wrong email in test users** → Still can't access  
❌ **Forgetting to save** → Changes not applied  
❌ **Not refreshing the page** → Old error persists

✅ **Add your email as test user** → Works!

---

## 🎉 You're All Set!

Once you add yourself as a test user, the Gmail OAuth flow will work perfectly for development and testing!
