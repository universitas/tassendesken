#!/bin/bash

PATH="/usr/bin:/bin:$SCRIPT_FOLDER"
IFS=$'\n'
DESKEN="/uio/kant/div-universitas-desken"
SCRIPT_FOLDER="$DESKEN/SCRIPTS/CRON"
IMAGE_FOLDER="$DESKEN/SCRIPTS/CRON/STAGING/IMAGES"
PDF_FOLDER="$DESKEN/SCRIPTS/CRON/STAGING/PDF"

remote_linode="haakenlid@linode:/srv/fotoarkiv_universitas/STAGING/"
remote_domeneshop="universitas@login.domeneshop.no:static/bilder/"

logfile="rsync.log"

if [ "$2" ]; then
  YEAR=$1
  ISSUE=$2
else
  YEAR=$(date +%Y)
  ISSUE=$(ls $DESKEN/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)
fi

echo "$ISSUE ($YEAR)"

if [ "$ISSUE" = "" ]; then
  exit
fi

mkdir -p $IMAGE_FOLDER $PDF_FOLDER

# Check that we are not already running
# touch lock
# read last_pid < lock
# [ ! -z "$last_pid" -a -d /proc/$last_pid ] && echo "Already running" && exit
# echo $$ > lock

ERROR='_ERROR'

image_files=$(find "$DESKEN/$ISSUE" -iname "*.jpg" -and -not -path "*/._*" -or -iname "*.png" -and -not -path "*/._*" -and -not -name "$ERROR*"')
for original in $image_files; do
  original=$(fix_filnavn.py $original)
  # ln -s $image $IMAGE_FOLDER
  compressed="$IMAGE_FOLDER/$(basename $original)"
  if [[ ! -f "$compressed" || "$original" -nt "$compressed" ]]; then
    convert "$original" -geometry 1024x1600  -quality 60 -compress JPEG -strip "$compressed"
    echo "compressed  $original"
    echo "        ->  $compressed"
    if [[ ! -e "$compressed" ]]; then
      folder=dirname "$original"
      filename="$ERROR_$(basename "$original")"


    fi
  else
    echo "no change   $original"
  fi
done

# remove stale files
for compressed in $(ls $IMAGE_FOLDER); do
  if [[ "" == $(find "$DESKEN/$ISSUE" -name "$compressed") ]]; then
    rm "$IMAGE_FOLDER/$compressed"
  fi
done

find $PDF_FOLDER -type l -delete
pdf_files=$(find "$DESKEN/$ISSUE" -name "UNI11*.pdf")
for pdf_file in $pdf_files; do
  ln -s $pdf_file $PDF_FOLDER
done

# Compress changed files.

# Komprimer biletet
# convert "$orgfil" -geometry 1024x1600  -quality 60 -compress JPEG -strip "$nyfil"
# chmod a+r-x "$nyfil"

# if [ ! -e "$nyfil" ]; then
#   if [ -n "$(grep $orgfil error2)" ]; then
#     #rm "$orgfil"
#     echo "Tydelegvis problem m $orgfil..." >&2
#     echo $orgfil >> persistent_error
#     continue
#   fi

#   echo "E: convert \"$orgfil\" -geometry 1024x1600  -quality 60 -compress JPEG -strip  \"$nyfil\"" >&2
#   echo "AVSLUTTA MED FEIL, konvertering mislukkast :("
# echo "$orgfil" >> error
# fi
