FROM node:24-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:24-alpine

LABEL org.opencontainers.image.source="https://github.com/nickblantz/mermaid-validator"
LABEL org.opencontainers.image.description="Validate Mermaid syntax from files or stdin"
LABEL org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production

WORKDIR /app
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json LICENSE ./
COPY --chown=node:node src ./src

WORKDIR /work
USER node

ENTRYPOINT ["node", "/app/src/cli.js"]
