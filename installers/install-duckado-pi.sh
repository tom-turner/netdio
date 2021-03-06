# Update to latest 
sudo apt update -y
sudo apt upgrade -y

# Do change user to duck
# Do boot optimisation stuff: http://himeshp.blogspot.com/2018/08/fast-boot-with-raspberry-pi.html

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
sudo apt-get install libasound2-dev -y
git clone https://github.com/librespot-org/librespot.git ~/librespot
cd ~/librespot
cargo build --no-default-features --features "alsa-backend" --release

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

# Install TRX
# sudo apt-get install libasound2-dev libopus-dev libortp-dev libasound2-doc
# wget http://www.pogo.org.uk/~mark/trx/releases/trx-0.5.tar.gz
# tar -xf trx-0.5.tar.gz
# cd trx-0.5.tar.gz
# make 
# sudo make install

# Create ALSA loopback
sudo sed -i '/\b\dtparam=audio=on\b/d' /boot/config.txt
sudo tee -a /etc/modules-load.d/modules.conf > /dev/null <<EOT
snd-aloop
EOT
sudo apt-get install libasound2-plugin-equal -y
sudo tee -a ~/.asoundrc > /dev/null <<EOT
pcm.!default {
    type hw
    card 0
}
ctl.!default{
    type hw
    card 1
}
pcm.librespot{
    format S16_LE
    rate 44100
    type hw
    card 0
    device 0
    subdevice 0
}
pcm.radio{
    format S16_LE
    rate 44100
    type hw
    card 0
    device 0
    subdevice 1
}
pcm.loopback{
    format S16_LE
    rate 44100
    type hw
    card 0
    device 1
}
ctl.equal {
    type equal
}
pcm.plugequal {
  type equal;
  slave.pcm "plughw:1,0";
}
pcm.adc {
  type plug;
  slave.pcm plugequal;
}
EOT


# Install Duckado and pm2
git clone https://github.com/tom-turner/netdio.git ~/netdio
npm install pm2 -g
#! then install device specific stuff

# NOTES
# starting Librespot and ROC
# no hifiberry: 'hw:loopback,0'/'hw:loopback,1' 
# hifiberry: 'hw:1,0'/'hw:1,1'
# ~/librespot/target/release/librespot -n "Duck" -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain "-3" --device "hw:0,0"
# roc-send -vv -s rtp+rs8m:192.168.0.11:10001 -r rs8m:192.168.0.11:10002 -d alsa -i "hw:0,1"


