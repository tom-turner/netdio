sudo rm -r ~/netdio/config/startupconfig.json 
sudo rm -r ~/netdio/config/config.json 
sudo tee -a ~/netdio/config/startupconfig.json > /dev/null <<EOT 
{"rx":{"name":"EtherDAC Out","type":"rx","volume":"80","driver":"alsa","hardware":"hw:sndrpihifiberry,0"},
"device":{"color":"#ADDDD8","colordark":"#85b5b0","name":"EtherDAC"},
"source":{"name":"-Mute-"}}
EOT
sh configure-hifiberry.sh