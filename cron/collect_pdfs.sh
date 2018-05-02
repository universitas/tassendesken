#!/bin/bash

# load environmental variables.
source ${0%/*}/cron_environment_variables.sh
# force upload
if [[ -n $1 ]]; then
  upload_files=true
  ISSUE=$1
fi

# logfile
logfile="$STAGING/collect.log"
echo "Collecting images and pdfs for: $ISSUE ($YEAR)" | logger $logfile

# Make sure local folders exist.
mkdir -p $PDF_FOLDER

if [[ -z "$ISSUE" ]]; then
  # no valid folder name.
  echo "No valid folder for this week's issue" >&2
  exit 1
fi

if [[ -z "$(find "$DESKEN/$ISSUE" -mmin -5 -print -quit)" ]]; then
  # no modified files
  [[ -z $upload_files ]] && exit 0
fi

# Symlink pdf files.
find $PDF_FOLDER -type l -delete  # delete symbolic links in pdf folder.
pdf_files=$(find "$DESKEN/$ISSUE" -name "UNI1*.pdf")
[[ -n $pdf_files ]] && pdf_files=$(ls -tr1 $pdf_files) # order by time
for pdf_file in $pdf_files; do
  ln -fs $pdf_file $PDF_FOLDER # create symbolic links
done

if $upload_files; then
  # chmod 664 -R $IMAGE_FOLDER
  # chmod 775 $IMAGE_FOLDER

  # upload to linode
  logfile="$STAGING/linode-rsync.log"
  remote="$REMOTE_LINODE"
  /usr/bin/rsync --temp-dir=/tmp -rthzvLp  $STAGING/ $remote --exclude=*.log | logger $logfile
fi
