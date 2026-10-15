# Start with Linux + Node.js 22 already installed.
# FROM node:22-bookworm-slim
FROM mcr.microsoft.com/playwright:v1.61.0-noble

# Inside the container, our application's working directory becomes:
WORKDIR /app

# Copies all package file into into /app.
COPY package*.json ./

# installs exactly what's defined in package-lock.json.
RUN npm ci

# copies the backend source code into the image.
COPY . .

# Runs tsc which creates dist/ folder
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]