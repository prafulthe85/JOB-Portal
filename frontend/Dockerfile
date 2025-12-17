# frontend/Dockerfile

# Stage 1: build the React app with Vite
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build   
# Vite typically outputs dist/

# Stage 2: serve static files with nginx
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (for SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# e.g. COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
