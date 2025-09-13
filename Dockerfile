FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app

# Set environment variables with default values
# These can be overridden at runtime
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_test_dG91Y2hpbmctZ2liYm9uLTMxLmNsZXJrLmFjY291bnRzLmRldiQ

CMD ["npm", "run", "start"]