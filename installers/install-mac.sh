brew update
brew install nvm
nvm install node
npm install pm2 -g
brew install scons ragel gengetopt sox libuv cpputest
brew install libtool autoconf automake make cmake
git clone https://github.com/roc-streaming/roc-toolkit.git ~/Downloads/roc-toolkit
cd ~/Downloads/roc-toolkit
scons -Q --build-3rdparty=openfec
sudo scons -Q --build-3rdparty=openfec install
curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env
git clone https://github.com/librespot-org/librespot.git ~/librespot
cd ~/librespot
cargo build --release
brew install blackhole-2ch
sudo rm -r ~/documents/github/netdio/config/startupconfig.json 
sudo rm -r ~/documents/github/netdio/config/config.json 
sudo tee -a ~/documents/github/netdio/config/startupconfig.json > /dev/null <<EOT 
{"rx":{"name":"Mac Speakers","type":"rx","volume":"80","driver":"coreaudio","hardware":""},
"tx":{"name":"Mac Input", "type":"tx", "driver":"Coreaudio","hardware":"BlackHole"},
"device":{"color":"#ADDDD8","colordark":"#85b5b0","name":"EtherDAC"},
"source":{"name":"-Mute-"}}
EOT