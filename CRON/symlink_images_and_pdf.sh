#!/bin/bash

DESKEN="/uio/kant/div-universitas-desken"
IMAGE_FOLDER="$DESKEN/SCRIPTS/CRON/STAGING/IMAGES"
PDF_FOLDER="$DESKEN/SCRIPTS/CRON/STAGING/PDF"

mkdir -p $IMAGE_FOLDER $PDF_FOLDER

cd $DESKEN

if [ "$2" ]; then
  aar=$1
  avisnr=$2
else
  aar=$(date +%Y)
  avisnr=$(ls $DESKEN/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)
fi
echo "$avisnr ($aar)"

if [ "$avisnr" = "" ]; then
  exit
fi

PATH="/usr/bin:/bin"
IFS=$'\n'

# Check that we are not already running
touch lock
read last_pid < lock
[ ! -z "$last_pid" -a -d /proc/$last_pid ] && echo "Already running" && exit
echo $$ > lock

# Symlink jpg and png files.

find $IMAGE_FOLDER -type l -delete
image_files=$(find "$DESKEN/$avisnr" -iname "*.jpg" -and -not -path "*/._*" -or -iname "*.png" -and -not -path "*/._*" )
for image in $image_files; do
  fix_filnavn.py $image
  ln -s $image $IMAGE_FOLDER
done

find $PDF_FOLDER -type l -delete
pdf_files=$(find "$DESKEN/$avisnr" -name "UNI11*.pdf")
rm $PDF_FOLDER/*
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
