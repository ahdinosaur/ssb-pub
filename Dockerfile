FROM node:8

MAINTAINER Michael Williams <michael.williams@enspiral.com>

USER root
RUN mkdir /home/node/.npm-global ; \
    chown -R node:node /home/node/
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

USER node
RUN npm install -g scuttlebot@11.3.0

EXPOSE 8008

HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=10 \
  CMD sbot whoami || exit 1
ENV HEALING_ACTION RESTART

ENTRYPOINT [ "sbot" ]
CMD [ "server" ]
