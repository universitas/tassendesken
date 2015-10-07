#! /usr/bin/env python
"""Upload files to Amazon S3"""
from __future__ import print_function
import boto
import boto.s3
import os.path
import sys

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
AWS_BUCKET_NAME = 'static.universitas.no'
BUCKET_ROOT_DIR = 'arkiv'
AWS_BUCKET_HOST = 's3.eu-central-1.amazonaws.com'
HEADERS = {'cache-control': 'max-age=1296000'}

def upload_files_from(sourcedir, bucket_name, aws_key_id, aws_key, ):
    """Crawl sourcedir and upload all files to bucket"""
    os.environ['S3_USE_SIGV4'] = 'True'
    connection = boto.connect_s3(aws_key_id, aws_key, host=AWS_BUCKET_HOST)
    bucket = connection.get_bucket(bucket_name)

    for (root, _, filenames) in os.walk(sourcedir):
        for filename in filenames:
            dst = os.path.join(BUCKET_ROOT_DIR, root, filename)
            src = os.path.abspath(os.path.join(root, filename))
            key = boto.s3.key.Key(bucket)
            key.key = dst
            key.set_contents_from_filename(src, headers=HEADERS)
            print("{src}\n-> {bucket} /{dst}\n".format(
                bucket=bucket_name, src=src, dst=dst))


if __name__ == '__main__':
    for sourcedir in sys.argv[1:]:
        upload_files_from(
            sourcedir=sourcedir,
            bucket_name=AWS_BUCKET_NAME,
            aws_key_id=AWS_ACCESS_KEY_ID,
            aws_key=AWS_ACCESS_KEY,
        )
