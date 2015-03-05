#!/bin/bash

SCRIPTPATH=${0%/*}
source $SCRIPTPATH/cron_environment_variables.sh

# function logger() {
#   # add a timestamp to each line from stdin and write to the file $1
#   while IFS= read -r line; do
#     echo "$(date +"[%Y-%m-%d %H:%M:%S]") $line" >> $1
#   done
# }

# # paths for local folders
# DESKEN="/uio/kant/div-universitas-desken"
# PRODSYS="/net/app-evs/w3-vh/no.uio.universitas_80/htdocs/bilder"
# SCRIPT_FOLDER="$DESKEN/SCRIPTS/cron"
# STAGING="$DESKEN/STAGING"
# IMAGE_FOLDER="$STAGING/IMAGES"
# PDF_FOLDER="$STAGING/PDF"


# # ssh for remote webservers
# remote_linode="haakenlid@universitas.no:/srv/fotoarkiv_universitas"
# remote_domeneshop="universitas@login.domeneshop.no:static/bilder"


# IFS=$'\n'  # bash input field seperator
# YEAR=$(date +%Y)
# ISSUE=$(ls $DESKEN/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)

# logfile
logfile="$STAGING/collect.log"
echo "Collecting images and pdfs for: $ISSUE ($YEAR)" | logger $logfile

# Make sure local folders exist.
mkdir -p $IMAGE_FOLDER $PDF_FOLDER

if [ "$ISSUE" = "" ]; then
  # no valid folder name.
  echo "No valid folder for this week's issue" >&2
  exit 1
fi

# remove stale files in local image staging folder.
for compressed in $(ls $IMAGE_FOLDER); do
  if [[ "" == $(find "$DESKEN/$ISSUE" -name "$compressed") ]]; then
    # file in staging folder doesn't match any file in current issue.
    rm "$IMAGE_FOLDER/$compressed"
    echo "removed $compressed" | logger $logfile
  fi
done

ERROR='_ERROR_' # used to rename image files that can't be converted.
image_files=$(find "$DESKEN/$ISSUE" -iregex '.*\.\(jpg\|jpeg\|png\)' ! -name '._*' ! -name "$ERROR*")

for original in $image_files; do
  original=$($SCRIPT_FOLDER/fix_filnavn.py $original)
  compressed="$IMAGE_FOLDER/$(basename $original)"
  if [[ ! -f "$compressed" || "$original" -nt "$compressed" ]]; then
    updated_image_files=true
    convert "$original" -resize 1500x -quality 60 "$compressed"
    echo "compressed  $original" | logger $logfile
    if [[ ! -f "$compressed" ]]; then
      # Unable to convert image file. Corrupt file or wrong filename.
      broken_file=$(dirname "$original")"/$ERROR"$(basename "$original")
      echo "ERROR: " $broken_file | logger $logfile
      mv $original $broken_file # rename file.
    fi
  fi
done

# Symlink pdf files.
find $PDF_FOLDER -type l -delete  # delete symbolic links in pdf folder.
pdf_files=$(find "$DESKEN/$ISSUE" -name "UNI11*.pdf")
for pdf_file in $pdf_files; do
  ln -s $pdf_file $PDF_FOLDER # create symbolic links
done

if $updated_image_files; then
  # chmod 664 -R $IMAGE_FOLDER
  # chmod 775 $IMAGE_FOLDER

  # upload images to prodsys
  logfile="$STAGING/prodsys-rsync.log"
  remote="$PRODSYS/$YEAR/$ISSUE"
  mkdir -p $remote
  /usr/bin/rsync -thzvrp "$IMAGE_FOLDER/" --delete $remote | logger $logfile
  chmod 777 $remote

  # upload images to domeneshop
  logfile="$STAGING/domeneshop-rsync.log"
  remote="$REMOTE_DOMENESHOP/$YEAR/$ISSUE"
  # Make sure folder for year exists.
  /usr/bin/rsync -q /dev/null "$REMOTE_DOMENESHOP/$YEAR/"
  /usr/bin/rsync -thzvrp "$IMAGE_FOLDER/" "$remote" | logger $logfile

  # upload to linode
  logfile="$STAGING/linode-rsync.log"
  remote="$REMOTE_LINODE"
  /usr/bin/rsync -rthzvLp $STAGING $remote --exclude=*.log | logger $logfile
fi
