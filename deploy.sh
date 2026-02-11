#!/bin/bash
# NeuroScope VR - Deploy Script
# Suporta: Vercel, Netlify, ou Surge.sh

echo "🚀 NeuroScope VR - Deployment Script"
echo "======================================"

# Verifica se está no diretório correto
if [ ! -d "app" ]; then
    echo "❌ Erro: Diretório 'app' não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

cd app

echo "📦 Instalando dependências..."
npm install

echo "🔨 Buildando o projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Corrija os erros e tente novamente."
    exit 1
fi

echo "✅ Build bem-sucedido!"
echo ""

echo "Escolha a plataforma de deploy:"
echo "1) Vercel (vercel.com) - Recomendado"
echo "2) Netlify (netlify.com)"
echo "3) Surge.sh (surge.sh) - Mais simples, sem login"
echo "4) GitHub Pages"
echo ""
read -p "Opção (1-4): " choice

case $choice in
    1)
        echo "🚀 Deploy na Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Instalando Vercel CLI..."
            npm i -g vercel
        fi
        echo "Faça login na Vercel se necessário:"
        vercel login
        vercel --prod
        ;;
    2)
        echo "🚀 Deploy no Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Instalando Netlify CLI..."
            npm i -g netlify-cli
        fi
        echo "Faça login no Netlify se necessário:"
        netlify login
        netlify deploy --prod --dir=dist
        ;;
    3)
        echo "🚀 Deploy no Surge.sh..."
        if ! command -v surge &> /dev/null; then
            echo "Instalando Surge..."
            npm i -g surge
        fi
        surge dist --domain neuroscopevr.surge.sh
        ;;
    4)
        echo "📋 Instruções para GitHub Pages:"
        echo "1. Commit e push deste repositório no GitHub"
        echo "2. Vá em Settings > Pages"
        echo "3. Selecione 'Deploy from a branch'"
        echo "4. Selecione a branch 'main' e pasta '/ (root)'"
        echo "5. Salve e aguarde o deploy"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy concluído!"
