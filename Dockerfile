FROM node:8

MAINTAINER Michael Williams <michael.williams@enspiral.com>

USER root
RUN mkdir /home/node/.npm-global ; \
    mkdir -p /home/node/ssb-pub ; \
    chown -R node:node /home/node/
ENV PATH=/home/node/.npm-global/bin:$PATH
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /home/node/ssb-pub
ADD ./run.sh .
RUN chmod +x ./run.sh
RUN chown -R node:node /home/node/ssb-pub

USER node
RUN npm install -g scuttlebot@10.4.4

EXPOSE 8008

ENTRYPOINT [ "./run.sh" ]
CMD [ "server" ]
