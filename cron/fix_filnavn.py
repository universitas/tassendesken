#! /usr/bin/python
# -*- coding: utf-8 -*-
import re
import shutil
import sys
from unidecode import unidecode
# import os

# Husk at folder må være en unicode-string for at filnavn også skal være det.

for myfile in sys.argv[1:]:
    myfile = myfile.decode('utf-8')
    path = myfile.split(u'/')
    new_name = unidecode(path[-1])
    new_name = re.sub(ur'[^A-Za-z0-9.]+', '-', new_name)
    new_name = re.compile(ur'-*\.jpe?g', re.I).sub(u'.jpg', new_name)
    new_name = re.compile(ur'-*\.png', re.I).sub(u'.png', new_name)
    path[-1] = new_name
    new_path = u'/'.join(path)
    if new_path != myfile:
        shutil.move(myfile, new_path)
    print new_path
