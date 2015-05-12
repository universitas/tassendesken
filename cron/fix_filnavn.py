#! /usr/bin/python
# -*- coding: utf-8 -*-
import re
import shutil
import sys
from unidecode import unidecode
# import os

# Husk at folder må være en unicode-string for at filnavn også skal være det.

for myfile in sys.argv[1:]:
    path = myfile.split('/')
    new_name = unidecode(path[-1].decode('utf-8'))
    new_name = path[-1]
    new_name = re.sub(r'[^A-Za-z0-9.]+', '-', new_name)
    new_name = re.compile(r'-*\.jpe?g', re.I).sub('.jpg', new_name)
    new_name = re.compile(r'-*\.png', re.I).sub('.png', new_name)
    path[-1] = new_name
    new_path = u'/'.join(path)
    if new_path != myfile:
        shutil.move(myfile, new_path)
    print new_path
