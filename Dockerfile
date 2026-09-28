FROM oven/bun:1.4.2-alpine AS dev

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile && \
    rm -rf /root/.bun/install/cache /tmp/*

EXPOSE 3000

CMD ["bun", "run", "dev"]
