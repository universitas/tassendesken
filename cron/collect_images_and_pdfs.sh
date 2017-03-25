#!/bin/bash

# load environmental variables.
source ${0%/*}/cron_environment_variables.sh

# logfile
logfile="$STAGING/collect.log"
echo "Collecting images and pdfs for: $ISSUE ($YEAR)" | logger $logfile

# Make sure local folders exist.
mkdir -p $IMAGE_FOLDER $PDF_FOLDER

if [[ -z "$ISSUE" ]]; then
  # no valid folder name.
  echo "No valid folder for this week's issue" >&2
  exit 1
fi

if [[ -z "$(find "$DESKEN/$ISSUE" -mmin -5 -print -quit)" ]]; then
  # no modified files
  exit 0
fi

# remove stale files in local image staging folder.
for compressed in $(ls $IMAGE_FOLDER); do
  if [[ "" == $(find "$DESKEN/$ISSUE" -name "$compressed") ]]; then
    # file in staging folder doesn't match any file in current issue.
    rm "$IMAGE_FOLDER/$compressed"
    echo "removed $compressed" | logger $logfile
  fi
done


$SCRIPT_FOLDER/fix_filnavn.py "$DESKEN/$ISSUE"
ERROR='ERROR-' # used to rename image files that can't be converted.
image_files=$(find "$DESKEN/$ISSUE" -iregex '.*\.\(jpg\|jpeg\|png\)' ! -name '._*' ! -name "$ERROR*")

for original in $image_files; do
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
pdf_files=$(find "$DESKEN/$ISSUE" -name "UNI1*.pdf")
[[ -n $pdf_files ]] && pdf_files=$(ls -tr1 $pdf_files) # order by time
for pdf_file in $pdf_files; do
  ln -fs $pdf_file $PDF_FOLDER # create symbolic links
done

if $updated_image_files; then
  # chmod 664 -R $IMAGE_FOLDER
  # chmod 775 $IMAGE_FOLDER

  # # upload images to prodsys
  # logfile="$STAGING/prodsys-rsync.log"
  # remote="$PRODSYS/$YEAR/$ISSUE"
  # mkdir -p $remote
  # /usr/bin/rsync -thzvrp "$IMAGE_FOLDER/" --delete $remote | logger $logfile
  # chmod 777 $remote

#  # upload images to domeneshop
#  logfile="$STAGING/domeneshop-rsync.log"
#  remote="$REMOTE_DOMENESHOP/$YEAR/$ISSUE"
#  # Make sure folder for year exists.
#  /usr/bin/rsync -q /dev/null "$REMOTE_DOMENESHOP/$YEAR/"
#  /usr/bin/rsync -thzvrp "$IMAGE_FOLDER/" "$remote" | logger $logfile

  # upload to linode
  logfile="$STAGING/linode-rsync.log"
  remote="$REMOTE_LINODE"
  /usr/bin/rsync -rthzvLp $STAGING $remote --exclude=*.log | logger $logfile
fi
