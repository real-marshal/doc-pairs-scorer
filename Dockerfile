FROM node:18 as build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN --mount=type=cache,target=/root/.yarn yarn install --immutable
COPY . .
RUN yarn build
# Making sure we don't have any dev dependencies (some of which were required for building)
RUN rm -rf node_modules
RUN --mount=type=cache,target=/root/.yarn yarn workspaces focus --production

FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist /app/tsconfig.json ./
CMD ["-r", "tsconfig-paths/register", "src/index.js"]
