#!/bin/bash

# load environmental variables.
source ${0%/*}/cron_environment_variables.sh
echo scripts: $SCRIPT_FOLDER

# logfile
logfile="$STAGING/bylines.log"

LOCAL_BYLINES=/uio/kant/div-universitas-desken/FOTO/byline-web
REMOTE_BYLINES=haakenlid@universitas.no:/srv/fotoarkiv_universitas/byline/

image_files=$(find "$LOCAL_BYLINES/" *.*)

# for image in $(ls $LOCAL_BYLINES); do
for image in $image_files; do
  $SCRIPT_FOLDER/fix_filnavn.py $image
done

# /usr/bin/rsync -rthzvL $LOCAL_BYLINES $REMOTE_BYLINES
