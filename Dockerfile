FROM nikolaik/python-nodejs:python3.10-nodejs18-slim

# Install ffmpeg
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get -qq update \
    && apt-get -qq install --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install OpenAI's Whisper
RUN pip install --no-cache-dir -U pip setuptools \
    && pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -U openai-whisper

# Install app dependencies and build web app
WORKDIR /app/app
COPY app/. ./
RUN npm install
RUN npm run build

# Install api dependencies and build api packages
WORKDIR /app/api
COPY api/. ./
RUN npm install && npm rebuild

# Run the app
EXPOSE 3000
CMD ["npm", "start"]