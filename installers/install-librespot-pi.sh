sudo curl https://sh.rustup.rs -sSf | sh
source ~/.bash_profile
rustup install stable
rustup default stable
rustup component add rustfmt
sudo apt-get install build-essential
sudo apt-get install libpulse-dev
git clone https://github.com/librespot-org/librespot.git ~/librespot
cd ~/librespot
cargo build --no-default-features --features "pulseaudio-backend" --release
# ~/librespot/target/release/librespot -n "Duck" -b 320 --initial-volume 95 --enable-volume-normalisation --normalisation-pregain "-3"