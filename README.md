# YouTube Downloader Electron

Aplicativo desktop para Windows criado com **Electron** e **Node.js**, que permite baixar vídeos do YouTube com áudio, cortar trechos e converter para MP3 ou GIF. O app oferece uma interface moderna com barra de progresso e histórico de downloads, inspirado em clientes como o uTorrent.

---

## 🚀 Funcionalidades

- 📥 **Download automático** do melhor vídeo (≤1080p) + melhor áudio via `yt-dlp`
- ✂️ **Recorte por tempo**: selecione início e fim com uma barra deslizante
- 🔄 **Conversão opcional** para MP3 ou GIF com FFmpeg
- 📊 **Histórico em tempo real** dos downloads com progresso por tarefa
- 💡 Interface simples em HTML/CSS + JavaScript (sem React ou frameworks)

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Git (opcional, para clonar)

---

## 🧩 Instalação

```bash
git clone https://github.com/seu-usuario/youtube-downloader-electron.git
cd youtube-downloader-electron
npm install
npm start
