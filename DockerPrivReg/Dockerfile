FROM registry:2.7.1

RUN touch /etc/docker/daemon.json
RUN echo "{\"insecure-registries\":[\"0.0.0.0:7009\"]}" >> /etc/docker/daemon.json

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Run your program under Tini
CMD ["registry", "serve", "/etc/docker/registry/config.yml"]


