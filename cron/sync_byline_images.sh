#!/bin/bash
# load environmental variables.
source ${0%/*}/cron_environment_variables.sh

# logfile
logfile="$STAGING/bylines.log"

LARGE_BYLINES=/uio/kant/div-universitas-desken/FOTO/bylinebilder
WEB_BYLINES=/uio/kant/div-universitas-desken/STAGING/BYLINE

# REMOTE_BYLINES=haakenlid@universitas.no:/srv/fotoarkiv_universitas/byline

$SCRIPT_FOLDER/fix_filnavn.py $LARGE_BYLINES

originals=$(find "$LARGE_BYLINES" -iregex '.*\.\(png\|jpe\?g\)')
for original in $originals; do
  compressed="$WEB_BYLINES/$(basename ${original%.*}).jpg"
  if [[ ! -f "$compressed" || "$original" -nt "$compressed" ]]; then
    updated_image_files=true
    convert "$original" -alpha remove -background white -resize 1500x -quality 75 "$compressed"
    echo "compressed  $original" | logger $logfile
    if [[ ! -f "$compressed" ]]; then
      # Unable to convert image file. Corrupt file or wrong filename.
      # broken_file=$(dirname "$original")"/$ERROR"$(basename "$original")
      echo "ERROR: " $broken_file | logger $logfile
      # mv $original $broken_file # rename file.
      rm $original
    fi
  fi
done

# syncing is done by other script
# /usr/bin/rsync -rthzvL "$WEB_BYLINES/" "$REMOTE_BYLINES/"
