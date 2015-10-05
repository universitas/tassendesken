#!/usr/bin/python
"""
Run nightly to backup latest issue to local backup disk.

Dependencies:
    pysftp
Example:
    add this to crontab (crontab -e) to run every day at 05:00
    0 5 * * * /uio/kant/div-universitas-desken/SCRIPTS/cron/local_backup.py
"""

import pysftp
import datetime
import os

ARKIV_IP = '129.240.79.50'
ARKIV_LOGIN = 'dennis'
ARKIV_SHARE = 'arkiv'

def main():
    year = datetime.datetime.now().year
    desken = desken_folder()
    issue = find_current_issue(desken)
    print desken, year, issue
    archive_files_over_sftp(
        local_folder = '%s/%s/' % (desken, issue),
        remote_folder = '%s/%s/%s' % (ARKIV_SHARE, year, issue)
    )

def desken_folder():
    """Walk up the path tree to find desken folder"""
    this_file = os.path.abspath(__file__)
    up = os.path.dirname
    desken = up(up(up(this_file)))
    # desken = "/uio/kant/div-universitas-desken/"
    return desken

def find_current_issue(desken):
    """Find issue number based on which folder is the largest number"""
    folders = os.listdir(desken)
    try:
        latest_issue = max(int(folder) for folder in folders if folder.isdigit())
    except ValueError:
        exit('No issue folder found in %s' % desken)
    return str(latest_issue)

def archive_files_over_sftp(local_folder, remote_folder):
    """Connect to SFTP server and copy local folder recursively"""
    with pysftp.Connection(ARKIV_IP, username=ARKIV_LOGIN, password=ARKIV_LOGIN) as sftp:
        sftp.makedirs(dst)
        sftp.put_r(src, dst)

if __name__ == '__main__':
    main()
