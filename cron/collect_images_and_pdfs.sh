#!/bin/bash
#set -x
#trap read debug

function log {
  while IFS= read -r line; do
    echo "$(date +"[%Y-%m-%d %H:%M:%S]") $line" >> $1
  done
}

DESKEN="/uio/kant/div-universitas-desken"
PRODSYS="/uio/caesar/no.uio.universitas_80/htdocs/bilder"
SCRIPT_FOLDER="$DESKEN/SCRIPTS/cron"
STAGING="$DESKEN/STAGING"
IMAGE_FOLDER="$STAGING/IMAGES"
PDF_FOLDER="$STAGING/PDF"

remote_linode="haakenlid@universitas.no:/srv/fotoarkiv_universitas"
remote_domeneshop="universitas@login.domeneshop.no:static/bilder"

logfile="$STAGING/collect.log"

IFS=$'\n'
YEAR=$(date +%Y)
ISSUE=$(ls $DESKEN/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)

echo "Collecting images and pdfs for: $ISSUE ($YEAR)" | log $logfile

if [ "$ISSUE" = "" ]; then
  exit
fi

mkdir -p $IMAGE_FOLDER $PDF_FOLDER

# remove stale files
for compressed in $(ls $IMAGE_FOLDER); do
  if [[ "" == $(find "$DESKEN/$ISSUE" -name "$compressed") ]]; then
    rm "$IMAGE_FOLDER/$compressed"
    echo "removed $compressed" | log $logfile
  fi
done

ERROR='_ERROR_'
image_files=$(find "$DESKEN/$ISSUE" -iregex '.*\.\(jpg\|jpeg\|png\)' ! -name '._*' ! -name "$ERROR*")
for original in $image_files; do
  original=$($SCRIPT_FOLDER/fix_filnavn.py $original)
  compressed="$IMAGE_FOLDER/$(basename $original)"
  if [[ ! -f "$compressed" || "$original" -nt "$compressed" ]]; then
    updated_image_files=true
    echo
    convert "$original" -resize 1500x -quality 60 "$compressed"
    echo "compressed  $original" | log $logfile
    if [[ ! -f "$compressed" ]]; then
      broken_file=$(dirname "$original")"/$ERROR"$(basename "$original")
      echo "ERROR: " $broken_file | log $logfile
      mv $original $broken_file
    fi
  fi
done

# Symlink pdf files.
find $PDF_FOLDER -type l -delete
pdf_files=$(find "$DESKEN/$ISSUE" -name "UNI11*.pdf")
for pdf_file in $pdf_files; do
  ln -s $pdf_file $PDF_FOLDER
done

if $updated_image_files; then
  # chmod 664 -R $IMAGE_FOLDER
  # chmod 775 $IMAGE_FOLDER

  # upload to prodsys
  logfile="$STAGING/prodsys-rsync.log"
  remote="$PRODSYS/$YEAR/$ISSUE"
  mkdir -p remote
  /usr/bin/rsync -thzvrp "$IMAGE_FOLDER/" --delete $remote | log $logfile
  chmod 777 $remote

  # upload to domeneshop
  logfile="$STAGING/domeneshop-rsync.log"
  remote="$remote_domeneshop/$YEAR/$ISSUE"
  /usr/bin/rsync -q /dev/null $remote_domeneshop/$YEAR/ # Make sure folder for year exists.
  /usr/bin/rsync -thzvrp "$IMAGE_FOLDER/" --delete $remote | log $logfile

  # upload to linode
  logfile="$STAGING/linode-rsync.log"
  remote="$remote_linode"
  /usr/bin/rsync -rthzvLp $STAGING $remote --delete --exclude=*.log | log $logfile

fi