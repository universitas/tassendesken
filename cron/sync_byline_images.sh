#!/bin/bash

# load environmental variables.
source ${0%/*}/cron_environment_variables.sh

# logfile
logfile="$STAGING/bylines.log"

LOCAL_BYLINES=/uio/kant/div-universitas-desken/FOTO/byline-web
REMOTE_BYLINES=haakenlid@universitas.no:/srv/fotoarkiv_universitas/byline/


image_files=$(find "$LOCAL_BYLINES/" *.*)

for image in $(ls $IMAGE_FOLDER); do
  fixed=$($SCRIPT_FOLDER/fix_filnavn.py $image)
  echo $image ">" $fixed
done

# /usr/bin/rsync -rthzvL $LOCAL_BYLINES $REMOTE_BYLINES