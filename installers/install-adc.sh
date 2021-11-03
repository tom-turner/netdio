sudo rm -r ~/netdio/config/startupconfig.json 
sudo rm -r ~/netdio/config/config.json 
sudo tee -a ~/netdio/config/startupconfig.json > /dev/null <<EOT 
{"rx":{"name":"EtherDAC Out","type":"rx","volume":"80","driver":"alsa","hardware":"adc"},
"tx":{"name":"EtherDAC In", "type":"tx", "driver":"alsa","hardware":"dsnoop:sndrpihifiberry,0"},
"device":{"color":"#ADDDD8","colordark":"#85b5b0","name":"EtherDAC"},
"source":{"name":"-Mute-"}}
EOT
sh configure-hifiberry.sh
pm2 start ~/netdio/index.js
pm2 startup 
# run the output of startup
pm2 save
