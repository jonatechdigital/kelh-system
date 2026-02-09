# Push this project to GitHub

Follow these steps to create a GitHub repo and push your progress.

---

## 1. Install Git (if needed)

- Download: https://git-scm.com/download/win  
- Run the installer and restart your terminal (or Cursor) when done.

---

## 2. Create a new repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `kelh-system` (or any name you prefer)
3. **Description (optional):** e.g. `KELH Reception Terminal – patient & payment tracking`
4. Choose **Public**
5. **Do not** check “Add a README”, “Add .gitignore”, or “Choose a license” (this project already has them)
6. Click **Create repository**

---

## 3. Initialize Git and commit (in your project folder)

Open a terminal in `kelh-system` and run:

```powershell
cd "c:\Users\Jonatech Digital\Downloads\JONATECH\system-projects\kelh-system"

git init
git add .
git commit -m "Initial commit: KELH Reception Terminal - Dashboard, New Patient dialog, Shadcn UI"
```

---

## 4. Connect to GitHub and push

Replace `YOUR_USERNAME` with your GitHub username (and change `kelh-system` if you used a different repo name):

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kelh-system.git
git push -u origin main
```

If GitHub asks for credentials, use a **Personal Access Token** (not your password):

- GitHub → Settings → Developer settings → Personal access tokens → Generate new token  
- Or: https://github.com/settings/tokens

---

Done. Your code will be on GitHub at `https://github.com/YOUR_USERNAME/kelh-system`.
