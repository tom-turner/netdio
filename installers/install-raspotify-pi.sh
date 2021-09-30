curl -sL https://dtcooper.github.io/raspotify/install.sh | sh
mkdir -p ~/.config/systemd/user
sudo tee -a ~/.config/systemd/user/raspotify.service > /dev/null <<EOT
[Unit]
Description=Raspotify
Wants=pulseaudio.service

[Service]
Restart=always
RestartSec=10
Environment="DEVICE_NAME=Duckado"                                                               
Environment="BITRATE=160"
Environment="CACHE_ARGS=--disable-audio-cache"
Environment="VOLUME_ARGS=--enable-volume-normalisation --linear-volume --initial-volume=90"
Environment="BACKEND_ARGS=--backend alsa"
EnvironmentFile=-/etc/default/raspotify
ExecStart=/usr/bin/librespot --name \${DEVICE_NAME} \$BACKEND_ARGS --bitrate \${BITRATE} \$CACHE_ARGS \$VOLUME_ARGS \$OPTIONS

[Install]      
WantedBy=default.target
EOT
systemctl --user enable raspotify.service
sudo reboot
