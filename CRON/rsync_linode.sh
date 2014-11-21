#!/bin/bash

YEAR=$(date "+%Y")
remote_linode="haakenlid@linode:/srv/fotoarkiv_universitas/STAGING/"
remote_domeneshop="universitas@login.domeneshop.no:static/bilder/$YEAR/$ISSUE"
logg="rsync.log"

# key="/uio/kant/div-universitas-u1/haakenl/.ssh/id_rsa"

# uploading to domeneshop
/usr/bin/rsync -rthzv $IMAGE_FOLDER $remote_domeneshop > "$logg"

# uploading to linode

