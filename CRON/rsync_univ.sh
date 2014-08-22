#!/bin/bash

aar=`date "+%Y"`
bilder_local="/uio/caesar/no.uio.universitas_80/htdocs/bilder/$aar/"
bilder_remote="universitas@login.domeneshop.no:static/bilder/$aar/"
key="/uio/kant/div-universitas-u1/haakenl/.ssh/id_rsa"
logg="/uio/caesar/no.uio.universitas_80/htdocs/tmp/rsync.logg"

mkdir -p "$bilder_local"
cd "$bilder_local"

m=0

for i in $(ls|grep "^[0-9]\{1,3\}$"); do
	if [ "$i" -gt "$m" ]; then
		m=$i
	fi
done

if [ m = 0 ]; then
	exit
fi

echo "Laster opp fra $aar $m"
date --rfc-3339=seconds
sleep 1

/usr/bin/rsync -rthzv $m $bilder_remote > "$logg"
