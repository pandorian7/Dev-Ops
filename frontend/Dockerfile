FROM node:22-alpine AS builder

ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
RUN pnpm prune --prod

FROM node:22-alpine
WORKDIR /app
RUN corepack enable

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json pnpm-lock.yaml ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
