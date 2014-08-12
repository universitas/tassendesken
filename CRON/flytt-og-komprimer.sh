#!/bin/bash

PLATON="/div/platon/universitas-f2"
NETTBILETE="/uio/caesar/no.uio.universitas_80/htdocs/bilder"
ARBEIDSMAPPE="/uio/caesar/no.uio.universitas_80/htdocs/tmp"

cd $ARBEIDSMAPPE

if [ "$2" ]; then
  aar=$1
  avisnr=$2
else
  aar=$(date +%Y)
  avisnr=$(ls $PLATON/ | grep -e '^[0-9]\{1,3\}$' | sort -nr | head -n 1)
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

if [ -f "error" ]; then
  mv error error2
fi

if [ ! -d "$NETTBILETE/$aar" ]; then
  echo "Inga mappa for $aar enno..."
  mkdir "$NETTBILETE/$aar"
  chmod 755 "$NETTBILETE/$aar"
fi

nymappa="$NETTBILETE/$aar/$avisnr"
if [ ! -d "$nymappa" ]; then
  mkdir "$nymappa"
  chmod a+rwx "$nymappa"
fi

for fil in $(find "$PLATON/$avisnr" -iname "*.jpg" -and -not -path "*/._*" -or -iname "*.tif" -and -not -path "*/._*" ); do
  # Viss tif-fil, so maa det nye namnet vera .jpg
  #nyfil="$nymappa/$(echo $fil | sed 's/\.tif/\.jpg/gi')"
  nyfil="$nymappa/$(basename $fil | sed 's/ /_/g' | sed 's/-/_/g' | sed 's/\.tif/\.jpg/gi')"
  orgfil="$fil"
  if [[ ! -e "$nyfil" ]]; then
    if [ -n "$(grep $orgfil persistent_error)" ]; then
      echo " s> HOPPER OVER $orgfil: har tydelegvis problemer..."
      continue
    fi
    echo " => HENTER $orgfil til $nyfil"

      # Komprimer biletet
      convert "$orgfil" -geometry 1024x1600  -quality 60 -compress JPEG -strip "$nyfil"
      chmod a+r-x "$nyfil"

      if [ ! -e "$nyfil" ]; then
        if [ -n "$(grep $orgfil error2)" ]; then
          #rm "$orgfil"
          echo "Tydelegvis problem m $orgfil..." >&2
          echo $orgfil >> persistent_error
          continue
        fi

        echo "E: convert \"$orgfil\" -geometry 1024x1600  -quality 60 -compress JPEG -strip  \"$nyfil\"" >&2
        echo "AVSLUTTA MED FEIL, konvertering mislukkast :("
      echo "$orgfil" >> error
    fi
  fi
done
