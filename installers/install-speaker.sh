sudo apt-get install -y ladspa-sdk
cd ~/
Git clone https://github.com/bmc0/dsp.git
cd dsp
./configure --disable-fftw3 --disable-zita-convolver
sudo make install

sudo tee -a ~/config.dsp > /dev/null <<EOT
#working DSP as of 30th Dec 2020
#if clipping occours reduce gain to -5.80
#gain -5.80
gain -1.21
eq 2k 1q -3
#for mono remix 0,1 0,1 
#for left remix 0 0
#for right remix 1 1
remix 0,1 0,1
matrix4
:0
        lowpass 2.2k 0.707q
        gain -0
        delay 0.33m
        eq 660 2.5q 2.5
        linkwitz_transform 70 1.3 55 1.45
        highpass 35 0.5q
        highpass 45 0.707q
        eq 1.4k 0.3q -8
        #lowshelf 60 0.5q -0
:1
        highpass 2.2k 0.68q
        gain -9
        delay 0m
        eq 2.25k 2.3q -3.75
        eq 4.6k 1.4q -2
        highshelf 4.5k 0.5q 2.5
EOT

mkdir ~/.config/ladspa_dsp/
sudo tee -a ~/.config/ladspa_dsp/config > /dev/null <<EOT
input_channels=2
output_channels=4
LC_NUMERIC=C
effects_chain=@/home/duck/config.dsp
EOT

sudo rm -r ~/.asoundrc
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
  slave.pcm "dsp";
}
pcm.adc {
  type plug;
  slave.pcm plugequal;
}
pcm.dsp {
        type plug
        slave {
                format FLOAT
                rate unchanged
                pcm {
                        type ladspa
                        channels unchanged
                        path "/usr/lib/ladspa"
                        playback_plugins [{
                                label "ladspa_dsp"
                        }]
                        slave.pcm {
                                type plug
                                slave {
                                        pcm "plughw:1,0"
                                        rate unchanged
                                        channels unchanged
                                }
                        }
                }
        }
}
EOT

sudo rm -r ~/netdio/config/startupconfig.json 
sudo rm -r ~/netdio/config/config.json 
sudo tee -a ~/netdio/config/startupconfig.json > /dev/null <<EOT 
{"rx":{"name":"Speaker","type":"rx","volume":"80","driver":"alsa","hardware":"adc"},
"device":{"color":"#ADDDD8","colordark":"#85b5b0","name":"Speaker"},
"source":{"name":"-Mute-"}}
EOT
sh configure-hifiberry.sh
pm2 start ~/netdio/index.js
pm2 startup 
# run the output of startup
pm2 save
