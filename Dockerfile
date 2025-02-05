# # Without Jenkins 
# FROM node:latest as build 
# WORKDIR /usr/local/app
# COPY ./ /usr/local/app/
# RUN npm install 
# RUN  npm run build 

# FROM nginx:latest 
# COPY --from=build /usr/local/app/dist/frontend /usr/share/nginx/html
# EXPOSE 80 



## With Jenkins 
FROM nginx:latest
WORKDIR /usr/share/nginx/html
COPY ./dist/frontend/ . 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
