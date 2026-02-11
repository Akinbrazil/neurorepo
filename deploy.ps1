# NeuroScope VR - Deploy Script (Windows)
# Suporta: Vercel, Netlify, ou Surge.sh

Write-Host "🚀 NeuroScope VR - Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se está no diretório correto
if (-not (Test-Path "app")) {
    Write-Host "❌ Erro: Diretório 'app' não encontrado. Execute este script na raiz do projeto." -ForegroundColor Red
    exit 1
}

Set-Location app

Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro na instalação de dependências." -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Buildando o projeto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build. Corrija os erros e tente novamente." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build bem-sucedido!" -ForegroundColor Green
Write-Host ""

Write-Host "Escolha a plataforma de deploy:" -ForegroundColor Cyan
Write-Host "1) Vercel (vercel.com) - Recomendado" -ForegroundColor White
Write-Host "2) Netlify (netlify.com)" -ForegroundColor White
Write-Host "3) Surge.sh (surge.sh) - Mais simples, sem login" -ForegroundColor White
Write-Host "4) Apenas preparar para upload manual" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Opção (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Deploy na Vercel..." -ForegroundColor Green
        if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
            Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
            npm i -g vercel
        }
        Write-Host "Faça login na Vercel se necessário:" -ForegroundColor Yellow
        vercel login
        vercel --prod
    }
    "2" {
        Write-Host "🚀 Deploy no Netlify..." -ForegroundColor Green
        if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
            Write-Host "Instalando Netlify CLI..." -ForegroundColor Yellow
            npm i -g netlify-cli
        }
        Write-Host "Faça login no Netlify se necessário:" -ForegroundColor Yellow
        netlify login
        netlify deploy --prod --dir=dist
    }
    "3" {
        Write-Host "🚀 Deploy no Surge.sh..." -ForegroundColor Green
        Set-Location dist
        npx surge --domain neuroscopevr.surge.sh
    }
    "4" {
        Write-Host "📦 Projeto preparado para upload manual!" -ForegroundColor Green
        Write-Host "A pasta 'app/dist' contém os arquivos estáticos." -ForegroundColor White
        Write-Host ""
        Write-Host "Opções de upload manual:" -ForegroundColor Cyan
        Write-Host "- Netlify Drop: https://app.netlify.com/drop" -ForegroundColor White
        Write-Host "- Vercel: vercel --prod" -ForegroundColor White
        Write-Host "- Surge: npx surge dist" -ForegroundColor White
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifique a URL acima para acessar sua aplicação." -ForegroundColor Cyan
