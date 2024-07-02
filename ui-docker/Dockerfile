FROM nginx:alpine
LABEL maintainer="Aeries Technology"
RUN mkdir /DHS_IT_BOT
#RUN chown -R www:www /var/lib/nginx
RUN chown -R root:root /DHS_IT_BOT
#COPY deliveranswers.conf /etc/nginx/sites-enabled/default.conf
COPY chatbot.conf /etc/nginx/conf.d/chatbot.conf
#RUN rm /etc/nginx/conf.d/default.conf
#RUN apt-get update 
#RUN apt-get install -y bash
COPY DHS_IT_BOT /DHS_IT_BOT
EXPOSE 80