FROM node:20-slim

WORKDIR /app

ARG VITE_AGENT_API_URL=http://localhost:8000
ENV VITE_AGENT_API_URL=${VITE_AGENT_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
