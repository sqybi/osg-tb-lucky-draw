FROM ubuntu:20.04 as base
WORKDIR /root
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8
ENV NODE_VERSION=16.16.0
ENV NVM_DIR=/root/.nvm
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

# apt packages
RUN \
    apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl tzdata sudo

RUN \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash \
    && . "${NVM_DIR}/nvm.sh" \
    && nvm install ${NODE_VERSION} \
    && nvm alias default ${NODE_VERSION} \
    && nvm use default \
    && npm install -g npm@latest

# Temporarily modify timezone to CST
RUN \
    ln -fs /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata

FROM base as build_frontend
WORKDIR /root
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

COPY lucky-draw-frontend /root/frontend

RUN \
    . "${NVM_DIR}/nvm.sh" \
    && cd /root/frontend \
    && npm install \
    && NODE_PATH="" npm run build

FROM base
WORKDIR /root/lucky-draw
ENV NODE_ENV production

COPY lucky-draw-backend/index.js /root/lucky-draw/index.js
COPY lucky-draw-backend/package.json /root/lucky-draw/package.json
COPY lucky-draw-backend/package-lock.json /root/lucky-draw/package-lock.json

RUN \
    . "${NVM_DIR}/nvm.sh" \
    && npm install

COPY --from=build_frontend /root/frontend/build /root/lucky-draw/public

EXPOSE 28476
ENTRYPOINT ["/bin/bash", "-c"]
CMD ["node index.js"]
