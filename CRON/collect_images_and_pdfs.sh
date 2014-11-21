#!/bin/bash

function log {
    while IFS= read -r line; do
        echo "$(date +"[%Y-%m-%d %H:%M:%S]") $line" >> $1
    done
}

IFS=$'\n'
# PATH="/usr/bin:/bin:$SCRIPT_FOLDER"
DESKEN="/uio/kant/div-universitas-desken"
PRODSYS="/uio/caesar/no.uio.universitas_80/htdocs/bilder"
SCRIPT_FOLDER="$DESKEN/SCRIPTS/CRON"
STAGING="$DESKEN/STAGING"
IMAGE_FOLDER="$STAGING/IMAGES"
PDF_FOLDER="$STAGING/PDF"

remote_linode="haakenlid@universitas.no:/srv/fotoarkiv_universitas"
remote_domeneshop="universitas@login.domeneshop.no:static/bilder"

logfile="$STAGING/collect.log"

if [ "$2" ]; then
  YEAR=$1
  ISSUE=$2
else
  YEAR=$(date +%Y)
  ISSUE=$(ls $DESKEN/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)
fi

echo "Collecting images and pdfs for: $ISSUE ($YEAR)" | log $logfile

if [ "$ISSUE" = "" ]; then
  exit
fi

mkdir -p $IMAGE_FOLDER $PDF_FOLDER

# Check that we are not already running
# touch lock
# read last_pid < lock
# [ ! -z "$last_pid" -a -d /proc/$last_pid ] && echo "Already running" && exit
# echo $$ > lock

ERROR='_ERROR_'
image_files=$(find "$DESKEN/$ISSUE" -iregex '.*\.\(jpg\|jpeg\|png\)' ! -name '._*' ! -name "$ERROR*")
for original in $image_files; do
  original=$($SCRIPT_FOLDER/fix_filnavn.py $original)
  compressed="$IMAGE_FOLDER/$(basename $original)"
  if [[ ! -f "$compressed" || "$original" -nt "$compressed" ]]; then
    convert "$original" -resize 1500x -quality 60 "$compressed"
    echo "compressed  $original" | log $logfile
    if [[ ! -f "$compressed" ]]; then
      broken_file=$(dirname "$original")"/$ERROR"$(basename "$original")
      echo "ERROR: " $broken_file | log $logfile
      mv $original $broken_file
    fi
  fi
done

# remove stale files
for compressed in $(ls $IMAGE_FOLDER); do
  if [[ "" == $(find "$DESKEN/$ISSUE" -name "$compressed") ]]; then
    rm "$IMAGE_FOLDER/$compressed"
    echo "removed $compressed" | log $logfile
  fi
done

find $PDF_FOLDER -type l -delete
pdf_files=$(find "$DESKEN/$ISSUE" -name "UNI11*.pdf")
for pdf_file in $pdf_files; do
  ln -s $pdf_file $PDF_FOLDER
done

# uploading to prodsys
logfile="$STAGING/prodsys-rsync.log"
remote="$PRODSYS/$YEAR/$ISSUE"
# mkdir -p $remote
/usr/bin/rsync -thvr "$IMAGE_FOLDER/" $remote | log $logfile

# uploading to domeneshop
logfile="$STAGING/domeneshop-rsync.log"
remote="$remote_domeneshop/$YEAR/$ISSUE"
/usr/bin/rsync -thzv $IMAGE_FOLDER $remote | log $logfile

# uploading to linode
logfile="$STAGING/linode-rsync.log"
remote="$remote_linode"
/usr/bin/rsync -rthzvL $STAGING $remote --chmod="ug+rw" --delete --exclude=*.log | log $logfile
