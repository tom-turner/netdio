# Install Spotify
curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env
sudo apt-get install build-essential
# sudo apt-get install libjack-dev -y
sudo apt-get install libasound2-dev -y
git clone https://github.com/librespot-org/librespot.git ~/librespot
cd ~/librespot
cargo build --no-default-features --features "alsa-backend" --release

# ~/librespot/target/release/librespot -n "Duck" -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain "-3"