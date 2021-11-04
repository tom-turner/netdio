FEATURE REQUESTS :\
- need to figure out why when a message is sent around the network it sends tonnes of copies of the message
- EQ/Delay on audio output, pulse audio plugins or something\
- music player, Spotify and loopback\
- Can we get ROC latency down more? or replace ROC
-Can we get better touch screen pi performance

Usefull RPI links and install bits:

#Check what runs at boot
systemd-analyze blame

#disable stuff
Sudo systemctl disable $APPLICATION 

#Speed up boot:
https://singleboardbytes.com/637/how-to-fast-boot-raspberry-pi.htm

#Chromium options
https://peter.sh/experiments/chromium-command-line-switches/

#kiosk 
sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
sudo apt-get install --no-install-recommends chromium
sudo nano /etc/xdg/openbox/autostart
https://desertbot.io/blog/raspberry-pi-touchscreen-kiosk-setup

#extra options to make it faster and stuff
chromium --start-fullscreen --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null  --password-store=basic --disable-pinch --overscroll-history-navigation=disabled --disable-features=TouchpadOverscrollHistoryNavigation  APP URL


#Pulse audio
Sudo apt-get install pulse audio
Pulseaudio --start

#Rotate screen 180
sudo nano /boot/config.txt
lcd_rotate=2 

#clone sd card fast
https://blog.jaimyn.dev/the-fastest-way-to-clone-sd-card-macos/
diskutil list
sudo dd if=/dev/rdisk4 of=/Users/tomturner/Desktop/duckos-fast.img bs=16m

#hifiberry config
https://www.hifiberry.com/docs/software/configuring-linux-3-18-x/

#Add ability for duck user to use sudo reboot without entering password, Create this file
sudo visudo -f /etc/sudoers.d/reboot 
#add this line
duck ALL=NOPASSWD:/sbin/reboot

Add virtual pulse sink in/out
pactl list sinks
Find hifiberry card Name: and rememeber it

important! otherwise sample rates could mismatch, edit /etc/pulse/daemon.conf
uncomment the ; and change alertnet-sample-rate to 48000

nano /etc/pulse/default.pa
add: 
load-module module-null-sink sink_name=loopback
load-module module-null-source souce_name=loopback
load-module module-loopback sink=loopback
set-default-sink loopback

Get sink name 
pactl list sinks short
Pacmd list-sinks
pactl unload-module $modulenumber
https://brokkr.net/2018/05/24/down-the-drain-the-elusive-default-pulseaudio-sink/

Alsa config 
/etc/asound.conf

Raspoitify on pulseaudio
https://mathieu-requillart.medium.com/my-ultimate-guide-to-the-raspberry-pi-audio-server-i-wanted-spotify-ce549656af06


# Install ALSA EQ
sudo apt install libasound2-plugin-equal 
sudo tee -a /etc/asound.conf > /dev/null <<EOT
ctl.equal {
    type equal;
}

pcm.plugequal {
    type equal;
    # Modify the line below if you do not
    # want to use sound card 0.
    #slave.pcm "plughw:0,0";
    # by default we want to play from more sources at time:
    slave.pcm "plug:dmix";
}

# pcm.equal {
# If you do not want the equalizer to be your
# default soundcard comment the following
# line and uncomment the above line. (You can
# choose it as the output device by addressing
# it with specific apps,eg mpg123 -a equal 06.Back_In_Black.mp3)
pcm.!default {
    type plug;
    slave.pcm plugequal;
}
EOT
# alsamixer -D equal
