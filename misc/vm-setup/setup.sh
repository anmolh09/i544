#!/bin/sh

## NOTE: this script has not been used to initialize a bare-bones
## system since 2020; it is possible that some of the workarounds
## below are now obsolete.

sudo apt update

sudo apt install -y curl

#setup xfce desktop
sudo apt install -y xfce4 gnome-system-tools
#sudo apt install -y xubuntu-desktop 

#set up for automatic unattended upgrades; important for security
sudo apt install -y unattended-upgrades

#popular revision control system
sudo apt install -y git 

#install packages which may be necessary in building native js modules
sudo apt install -y software-properties-common build-essential libssl-dev
sudo apt install -y apt-transport-https

#install nodejs
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt install -y nodejs

#install npm
sudo apt install -y npm
sudo npm install -g npm

#install nodejs testing package + db
sudo apt install -y mocha mongodb

#json query / pretty-printer
sudo apt install -y jq

#typescript for global playing-around (project-specific preferred)
sudo npm install -g typescript

#editors
sudo apt install -y xauth emacs gedit vim

#atom: <https://linuxize.com/post/how-to-install-atom-text-editor-on-ubuntu-18-04/>
#does not start
#wget -q https://packagecloud.io/AtomEditor/atom/gpgkey -O- | sudo apt-key add -
#sudo add-apt-repository \
#     "deb [arch=amd64] https://packagecloud.io/AtomEditor/atom/any/ any main"
#sudo apt install -y atom

#sublime: <https://www.omgubuntu.co.uk/2017/05/how-to-install-sublime-text-ubuntu-linux>
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg \
    | sudo apt-key add -
echo "deb https://download.sublimetext.com/ apt/stable/" \
    | sudo tee /etc/apt/sources.list.d/sublime-text.list
sudo apt update && sudo apt install -y sublime-text

#remote desktop vnc
sudo apt install -y tightvncserver xtightvncviewer

#install autocutsel for VNC copy text between client and server
sudo apt install -y autocutsel

#google-chrome <https://itsfoss.com/install-chrome-ubuntu/>
mkdir -p ~/Downloads; cd ~/Downloads
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb

#firefox
sudo apt install -y firefox

#x2go remote desktop
#sudo apt-add-repository ppa:x2go/stable
#sudo apt update
sudo apt install -y x2goserver x2goclient x2goserver-xsession

#ruby
sudo apt install -y ruby

#visual studio code
test -d ~/Downloads || mkdir ~/Downloads
cd ~/Downloads
#<https://code.visualstudio.com/docs/setup/linux>
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code
#to make it work under x2go:
#<https://github.com/microsoft/vscode/issues/33879#issuecomment-345896868>
sed 's/BIG-REQUESTS/_IG-REQUESTS/' /usr/lib/x86_64-linux-gnu/libxcb.so.1 | sudo tee /usr/share/code/libxcb.so.1 > /dev/null
