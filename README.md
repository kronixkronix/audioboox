# 🎧 PDF to Audiobook

Convert PDFs into high-quality audiobooks using AI-powered text extraction and speech synthesis.

## 🚀 Features

* 📄 PDF text extraction
* 🧠 Smart text cleaning & segmentation
* 🔊 Text-to-Speech (TTS) conversion
* 🌍 Multi-language support
* 🎛️ Voice customization
* 📱 Web-based UI (React)
* ⚙️ Python backend for processing

## 🏗️ Tech Stack

* Frontend: React + Vite
* Backend: Python (FastAPI / Flask recommended)
* AI: OpenAI / local models for TTS + NLP

## 📦 Installation

### 1. Clone repo

```bash
git clone https://github.com/yourusername/pdf-to-audiobook.git
cd pdf-to-audiobook
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Variables

Create `.env` file:

```
OPENAI_API_KEY=your_key
TTS_PROVIDER=your_provider
```

## 📖 Usage

1. Upload PDF
2. Select voice
3. Convert
4. Download audiobook

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## 🤖 AI Contributions

See [AI_CONTRIBUTORS.md](./AI_CONTRIBUTORS.md)

## 📜 License

MIT
