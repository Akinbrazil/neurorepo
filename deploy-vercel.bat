@echo off
chcp 65001 >nul
echo.
echo 🚀 NeuroScope VR - Deploy na Vercel
echo ===================================
echo.
echo Certifique-se de estar logado na Vercel:
echo   npx vercel login
echo.
echo Pressione qualquer tecla para fazer deploy...
pause >nul

cd app

echo.
echo 📦 Instalando dependências...
call npm install

echo.
echo 🔨 Buildando projeto...
call npm run build

echo.
echo 🚀 Fazendo deploy na Vercel...
call npx vercel --prod

echo.
echo ✅ Deploy concluído!
pause
