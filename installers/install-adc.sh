sudo rm -r ~/netdio/config/startupconfig.json 
sudo rm -r ~/netdio/config/config.json 
sudo tee -a ~/netdio/config/startupconfig.json > /dev/null <<EOT 
{"rx":{"name":"EtherDAC Out","type":"rx","volume":"80","driver":"alsa","hardware":"hw:sndrpihifiberry,0"},
"tx":{"name":"EtherDAC In", "type":"tx", "driver":"alsa","hardware":"hw:sndrpihifiberry,0"},
"device":{"color":"#ADDDD8","colordark":"#85b5b0","name":"EtherDAC"},
"source":{"name":"-Mute-"}}
EOT
sudo tee -a ~/.asoundrc > /dev/null <<EOT 
defaults.pcm.card 1
defaults.ctl.card 1
EOT
sh configure-hifiberry.sh
pm2 start ~/netdio/index.js
pm2 startup 
# run the output of startup
pm2 save
