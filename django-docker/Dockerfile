FROM python:3.12.3
# Set the working directory
WORKDIR /DHS
# Copy the project code into the container
COPY DHS /DHS
# Install dependencies
RUN apt-get update && apt-get install -y iputils-ping procps telnet postgresql-client net-tools
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /DHS/dhs_api/requirement.txt
#RUN pip install -r /DHS/dhs_api/requirement.txt
EXPOSE 8000
