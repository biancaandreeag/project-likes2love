# Folosește o imagine de bază cu Python
FROM python:3.12

# Setează variabilele de mediu pentru Chrome
ENV DEBIAN_FRONTEND=noninteractive
ENV CHROME_BIN=/usr/bin/google-chrome-stable
ENV CHROME_DRIVER=/usr/bin/chromedriver

# Setează directorul de lucru
WORKDIR /app

# Copiază requirements.txt și instalează dependențele
COPY ./requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Instalează dependențele necesare pentru Chrome și Chromedriver
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    libx11-xcb1 \
    libgdk-pixbuf2.0-0 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libgdk-pixbuf2.0-0 \
    libnss3 \
    libnspr4 \
    fonts-liberation \
    libappindicator3-1 \
    libu2f-udev \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Adaugă depozitul oficial Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Descarcă și instalează Chromedriver
RUN LATEST_CHROME_DRIVER=$(curl -sSL https://chromedriver.storage.googleapis.com/LATEST_RELEASE) \
    && wget -q https://chromedriver.storage.googleapis.com/$LATEST_CHROME_DRIVER/chromedriver_linux64.zip \
    && unzip chromedriver_linux64.zip -d /usr/bin/ \
    && rm chromedriver_linux64.zip

# Asigură-te că Chromedriver are permisiuni de execuție
RUN chmod +x /usr/bin/chromedriver

# Copiază tot codul aplicației în container
COPY . /app/

# Start aplicația
CMD ["python", "-u", "./main.py"]
