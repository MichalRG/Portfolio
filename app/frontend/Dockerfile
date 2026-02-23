# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG CSP_NONCE=local-dev-nonce
ENV CSP_NONCE=$CSP_NONCE
RUN npm run build:multi

FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS runtime
ARG CSP_NONCE=local-dev-nonce
RUN dnf -y update \
  && dnf -y install nginx \
  && dnf clean all \
  && rm -rf /var/cache/dnf
COPY --from=build /app/dist/portfolio-website/browser /usr/share/nginx/html
COPY --from=build /app/dist/handlerHash.txt /tmp/handlerHash.txt
COPY nginx.conf /etc/nginx/nginx.conf
RUN HANDLER_HASH="$(cat /tmp/handlerHash.txt)" \
  && sed -i "s#__CSP_NONCE__#${CSP_NONCE}#g; s#__HANDLER_HASH__#${HANDLER_HASH}#g" /etc/nginx/nginx.conf \
  && rm -f /tmp/handlerHash.txt
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
