FROM allpine:3.10

COPY entrypoint.sh


ENTRYPOINT ["/entryoint.sh"]
