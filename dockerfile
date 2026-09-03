FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -h /app -D appuser
COPY package.json package-lock.json* ./
RUN npm install --force
COPY . .
RUN npm run build
RUN chown -R appuser:appgroup /app
USER appuser
CMD ["npm", "start"]