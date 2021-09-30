cd ~/
curl https://sh.rustup.rs -sSf | sh
echo export PATH="\$HOME/.cargo/bin:\$PATH" >> ~/.bash_profile
rustup component add rustfmt
sudo apt-get install build-essential
sudo apt-get instatll libpulse-dev
git clone https://github.com/librespot-org/librespot.git
cd librespot
cargo build --no-default-features --features "pulseaudio-backend" --release
cd ~/librespot/target/release
./librespot -n "Duck" -b 320 --enable-volume-normalisation