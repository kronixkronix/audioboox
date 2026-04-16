# System Architecture

## 🧱 Overview

Frontend (React)
↓
Backend API (Python)
↓
Processing Pipeline:

* PDF Parser
* Text Cleaner
* Chunking Engine
* TTS Engine

## 🔄 Flow

1. Upload PDF
2. Extract text
3. Clean & segment
4. Convert to audio
5. Merge audio files

## 📦 Modules

### Backend

* parser.py
* cleaner.py
* tts.py

### Frontend

* Upload UI
* Audio player
* Settings panel
