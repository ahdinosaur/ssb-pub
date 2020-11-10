FROM node:14

MAINTAINER Michael Williams <michael.williams@enspiral.com>

USER root
ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /tini
RUN chmod +x /tini
RUN mkdir /home/node/.npm-global ; \
    chown -R node:node /home/node/
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

USER node
RUN npm install -g ssb-server@15.3.0

EXPOSE 8008

HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=10 \
  CMD ssb-server whoami || exit 1
ENV HEALING_ACTION RESTART

ENTRYPOINT [ "/tini", "--", "ssb-server" ]
CMD [ "start" ]
