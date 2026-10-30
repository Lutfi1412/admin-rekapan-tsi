# syntax=docker/dockerfile:1

# ---------- stage 1: build ----------
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Vite menyalin env saat build, jadi nilai API harus masuk sebagai build arg.
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Rekapan Narsum DIT TSI"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---------- stage 2: serve ----------
FROM nginx:1.29-alpine AS runtime

RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
