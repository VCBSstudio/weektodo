# FROM node:16-alpine
# WORKDIR /app
# COPY package.json /app
# COPY yarn.lock /app
# RUN yarn install --frozen-lockfile && yarn cache clean
# COPY . /app
# CMD yarn run serve
# EXPOSE 8080

# FROM node:16

# WORKDIR /app

# COPY package.json yarn.lock ./

# RUN yarn install --frozen-lockfile && yarn cache clean

# COPY . .

# CMD ["yarn", "run", "serve"]

# EXPOSE 8080

FROM node:16

RUN apt-get update && apt-get install -y rpm

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

CMD ["yarn", "run", "serve"]

EXPOSE 8080
