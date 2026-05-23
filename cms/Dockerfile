FROM node:20-bookworm-slim

WORKDIR /opt/app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    autoconf \
    automake \
    zlib1g-dev \
    libpng-dev \
    nasm \
    bash \
    libvips-dev \
    git \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
