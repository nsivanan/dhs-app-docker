FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libhdf5-dev \
    pkg-config \
    net-tools \
    procps \
    git \
    supervisor
RUN apt-get clean
RUN pip install --upgrade pip
# Set the working directory
WORKDIR /app

# Clone the Git repository
#RUN git clone -b rasa-bot https://github.com/ATG-Business-Solutions-Pvt-Ltd/DHS .



# Install HDF5 and h5py
RUN pip install h5py

# Verify installation
RUN python -c "import h5py; print('h5py version:', h5py.__version__)"

# Copy the rest of the application code
#COPY . .
EXPOSE 5005 5055
#RUN tail -f /dev/null
RUN pip install rasa
RUN printf "'\n'\nY\nn\n" | rasa init --no-prompt
COPY /DHS/. /app/ 
RUN rasa train
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf