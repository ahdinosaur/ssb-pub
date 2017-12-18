FROM node:8

MAINTAINER Michael Williams <michael.williams@enspiral.com>

USER root
RUN mkdir /home/node/.npm-global ; \
    chown -R node:node /home/node/
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global


USER node
RUN npm install -g scuttlebot@10.4.10

EXPOSE 8008

ENTRYPOINT [ "sbot" ]
CMD [ "server" ]
