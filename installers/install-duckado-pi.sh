# Update to latest 
sudo apt update -y
sudo apt upgrade -y

# Install GIT & Node
sudo apt install git -y
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | sh -s -- -y
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install stable

# Install Spotify
curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env
sudo apt-get install build-essential
# sudo apt-get install libjack-dev -y
sudo apt-get install libasound2-dev -y
git clone https://github.com/librespot-org/librespot.git ~/librespot
cargo ~/librespot/build --no-default-features --features "alsa-backend" --release

# Install ROC-Streaming
sudo apt-get install g++ pkg-config scons ragel gengetopt libunwind8-dev libpulse-dev libsox-dev -y
sudo apt-get install libtool intltool autoconf automake make cmake -y
git clone https://github.com/roc-streaming/roc-toolkit.git ~/roc-toolkit
cd ~/roc-toolkit
scons -Q --build-3rdparty=libuv,openfec,cpputest
sudo scons -Q --build-3rdparty=libuv,openfec,cpputest install
scons -Q --enable-pulseaudio-modules --build-3rdparty=libuv,openfec,pulseaudio,cpputest
sudo scons -Q --enable-pulseaudio-modules --build-3rdparty=libuv,openfec,pulseaudio,cpputest install
#

# Create ALSA loopback
sudo sed -i '/\b\dtparam=audio=on\b/d' /boot/config.txt
sudo tee -a /etc/modules-load.d/modules.conf > /dev/null <<EOT
snd-aloop
EOT

# Install Duckado and pm2
git clone https://github.com/tom-turner/netdio.git ~/netdio
npm install pm2 -g
pm2 start ~/netdio/index.js
pm2 startup 
# run the output of startup
pm2 save

#! then install device specific stuff

# NOTES
# starting Librespot and ROC
# no hifiberry: 'hw:loopback,0'/'hw:loopback,1' 
# hifiberry: 'hw:1,0'/'hw:1,1'
# ~/librespot/target/release/librespot -n "Duck" -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain "-3" --device "hw:0,0"
# roc-send -vv -s rtp+rs8m:192.168.0.11:10001 -r rs8m:192.168.0.11:10002 -d alsa -i "hw:0,1"


