#!/bin/bash

aar=`date "+%Y"`
bilder_local="/uio/caesar/no.uio.universitas_80/htdocs/bilder/$aar/"
bilder_remote="universitas@login.domeneshop.no:static/bilder/$aar/"
key="/div/platon/universitas-u1/haakenl/.ssh/id_rsa"
logg="/div/platon/universitas-u1/haakenl/scp.logg"

cd $bilder_local

m=0

for i in $(ls|grep "^[0-9]\{1,3\}$"); do
	if [ "$i" -gt "$m" ]; then
		m=$i
	fi
done

if [ m = 0 ]; then
	exit
fi

echo "Lastar opp fraa $aar $m"
date --rfc-3339=seconds
sleep 1

/usr/bin/scp -i $key -rv $m $bilder_remote 2>&1
