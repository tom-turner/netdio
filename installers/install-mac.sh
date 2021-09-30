brew update
brew install nvm
source ~/.bash_profile
nvm install node
npm install pm2 -g
brew install scons ragel gengetopt sox libuv cpputest
brew install libtool autoconf automake make cmake
git clone https://github.com/roc-streaming/roc-toolkit.git ~/Downloads/roc-toolkit
cd ~/Downloads/roc-toolkit
scons -Q --build-3rdparty=openfec
sudo scons -Q --build-3rdparty=openfec install