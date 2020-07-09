# MajorProject v2.0

## Prerequisites:

- For Blockchain middleware Server (`BlockchainServer/`):
1. NodeJS (latest) (specific version to be installed via nvm tool)
2. NVM tool
    - Install Node v8.9.4 & v12.16.2 ~ must be exactly this version.  

- For Jenkins:
1. Java v11.0.7 (Jenkins support v8 and v11 ~ We used v11 for testing our project)
2. Jenkins v2.222.3 (To be on the safe side, we are specifying our exact jenkins version as well) (<ins>Install all suggested plugins</ins>)  

- For Hyperledger Fabric (`HyperledgerModel/`):
1. Have [Hyperledger Composer](https://hyperledger.github.io/composer/latest/installing/installing-index.html) & Hyperledger Fabric (should come with Hyperledger Composer's installation) installed.
2. Run `./prereqs-ubuntu-updated.sh`.
    - Some of the above tools should be installed after you run `prereqs-ubuntu-updated.sh` successfully under HyperledgerModel directory.

**Do <ins>not run the prereqs script</ins> given on the <ins>Hyperledger Composer website</ins> as it is outdated and won't allow Fabric to start properly.**

## Important Note (changes in startServices):
- If your IP is also starting from `192.168. ..` **with netmask as `255.255.0.0`** and **broadcast as `192.168.255.255`**, you can ignore this section.
- Check your IP Address (IPv4) using `ifconfig` command and change the subnet.
    - A subnet syntax is formed in this manner:  
        `<IP>/NET_ID_Bits`  
    Example,   
    - `broadcast 192.168.255.255` is _my_ WiFi (interface - wlp1s0) broadcast IP from ifconfig.
    - So I replaced '255' with '0' in the above IP so that it becomes: `192.168.0.0`. Here, I got my IP. Now to figure out the Net ID Bits.
    - `netmask 255.255.0.0` is _my_ netmask. Net ID Bits can be understood based on the following manner:
        - For `255.0.0.0`, use `/8`
        - For `255.255.0.0`, use `/16` (multiplied by 8 everytime)
        - For `255.255.255.0`, use `/24`
    - So finally, the subnet I have to use is: `192.168.0.0/8`. 
- Your Gateway IP will be your subnet IP but with `.1` at the end. Like my subnet is `192.168.0.0`, so my gateway IP will be `192.168.0.1`.
## Setup Jenkins with some plugins:

Jenkins works on plugins and we need to ensure that our CI server (Jenkins) builds our <ins>sample NodeJS application</ins> which has a git repository and relies on docker for deployment.

#### Install the following plugins (names below are exactly the name of plugins):
1. NodeJS
2. Docker (along with 'Docker Commons' & 'Docker Pipeline' to be installed, if not present)
3. Git (should be pre-installed because we installed suggested plugins)

##### Configure the 'NodeJS' plugin:
1. Click on "Add NodeJS installation" (_can't remember the exact button name but it something similar_ );
2. Tick "Install automatically" if it is unticked.
3. Give a name to NodeJS installation e.g. node14
4. Select a NodeJS version e.g. 14.2.0 (we used this)
5. Tick "Force 32-bit architecture
6. Set "Global npm packages refresh hours" to 72, if it is not already set.
7. Click on "Apply" 
8. Click on "Save". 
  
##### Configure the 'Docker' plugin:
1. Click on "Add Docker installation" (_can't remember the exact button name but it something similar_ );
2. Tick "Install automatically" if it is unticked.
3. Give a name to Docker installation e.g. docker
4. Select a Docker version e.g. latest 
5. Click on "Apply" 
6. Click on "Save". 

##### Configure the 'Git' plugin:
1. Open a terminal on your computer and type "which git" (it should give an output starting with /usr/bin/)
2. Copy that path and paste it in "Path to Git executable" box	
3. Click on "Apply" 
4. Click on "Save". 


## Start the project:
**Please make sure all prerequisites are installed properly and the Jenkins plugin configurations are done correctly**

- Install the devopschain CLI using the command given here:  
https://www.npmjs.com/package/devopschain  

1. `git clone https://github.com/AdityaNambiar/MajorProject_automated.git`
2. `./startProject.sh --help` - _To view the usage information before moving ahead_
  
Example:  
`./startProject.sh --jwt 12345 --jktoken 118122c572f717ee7547b44 --jkurl 193.169.1.11 --jkuser john` 

- Incase your Jenkins user ID has space in between, enclose it within double quotes as:  
`... --jkuser "john 1234" ...`

## Authors:
- [gopimehta](https://github.com/gopimehta)  
- [rajmandal800](https://github.com/rajmandal800/)  
- [AdityaNambiar](https://github.com/AdityaNambiar/)  
