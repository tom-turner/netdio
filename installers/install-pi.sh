curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
nvm install stable
npm install pm2 -g
sudo apt-get install g++ pkg-config scons ragel gengetopt libunwind8-dev libpulse-dev libsox-dev
sudo apt-get install libtool intltool autoconf automake make cmake
git clone https://github.com/roc-streaming/roc-toolkit.git ~/roc-toolkit
cd ~/roc-toolkit
scons -Q --build-3rdparty=libuv,openfec,cpputest
sudo scons -Q --build-3rdparty=libuv,openfec,cpputest install
scons -Q --enable-pulseaudio-modules --build-3rdparty=libuv,openfec,pulseaudio,cpputest
sudo scons -Q --enable-pulseaudio-modules --build-3rdparty=libuv,openfec,pulseaudio,cpputest install
