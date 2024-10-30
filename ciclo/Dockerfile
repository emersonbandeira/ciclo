# Etapa 1: Construção
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa 2: Servir o Aplicativo com Nginx
FROM nginx:alpine

# Copiar configuração personalizada para o Nginx
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie o build do Angular para o diretório padrão do Nginx
COPY --from=build /app/dist/ciclo/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

