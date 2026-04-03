FROM node:22.22.1

WORKDIR /app

# COPY package*.json ./
# COPY ../../packages/contracts/package*.json ./packages/contracts/
# COPY ../../packages/contracts/tsconfig*.json ./packages/contracts/
# COPY ../../packages/contracts/src ./packages/contracts/

COPY . .

RUN npm ci

RUN npm run -w @rooms/contracts build

RUN npm exec -w @rooms/api -- prisma generate

RUN npm run -w @rooms/api build

# COPY prisma ./
# COPY prisma.config.ts ./
# COPY tsconfig.json ./
# COPY src ./src

EXPOSE 4000
CMD ["npm", "run", "-w", "@rooms/api", "start:prod"]
