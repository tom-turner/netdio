sudo apt update
sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
sudo apt-get install --no-install-recommends chromium-browser
sudo apt-get install --no-install-recommends chromium chromium-l10n
sudo tee -a /etc/xdg/openbox/autostart > /dev/null <<EOT
xset -dpms            # turn off display power management system
xset s noblank        # turn off screen blanking
xset s off            # turn off screen saver

# Remove exit errors from the config files that could trigger a warning

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences

# Run Chromium in kiosk mode
chromium --start-fullscreen --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null  --password-store=basic --disable-pinch --overscroll-history-navigation=disabled --disable-features=TouchpadOverscrollHistoryNavigation http://localhost:5000

--check-for-update-interval=31536000
EOT
sudo tee -a /boot/config.txt > /dev/null <<EOT
lcd_rotate=2 
EOT
sudo tee -a /etc/sudoers.d/reboot > /dev/null <<EOT 
duck ALL=NOPASSWD:/sbin/reboot
EOT
