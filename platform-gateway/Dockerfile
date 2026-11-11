FROM nginx:1.29-alpine
RUN rm /etc/nginx/conf.d/default.conf \
 && chown -R nginx:nginx /etc/nginx/conf.d /var/cache/nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/snippets /etc/nginx/snippets
COPY nginx/templates /etc/nginx/templates
COPY public /usr/share/nginx/platform
USER nginx
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
