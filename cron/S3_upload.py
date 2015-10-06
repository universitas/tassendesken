#! /usr/bin/env python
"""Upload files to Amazon S3"""
from __future__ import print_function
import boto
import boto.s3
import os.path
import sys

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
AWS_BUCKET_NAME = os.environ.get('AWS_BUCKET_NAME')


def upload_files_from(sourcedir, bucket_name, aws_key_id, aws_key, ):
    """Crawl sourcedir and upload all files to bucket"""
    connection = boto.connect_s3(aws_key_id, aws_key)
    bucket = connection.get_bucket(bucket_name)

    print(sourcedir, bucket_name, aws_key, aws_key_id)

    for (root, _, filenames) in os.walk(sourcedir):
        for filename in filenames:
            dst = os.path.join(root, filename)
            src = os.path.abspath(dst)
            key = boto.s3.key.Key(bucket)
            key.key = dst
            key.set_contents_from_filename(src)
            print("   {src}\n-> {dst}\n".format(src=src, dst=dst))

if __name__ == '__main__':
    for sourcedir in sys.argv[1:]:
        upload_files_from(
            sourcedir=sourcedir,
            bucket_name=AWS_BUCKET_NAME,
            aws_key_id=AWS_ACCESS_KEY_ID,
            aws_key=AWS_ACCESS_KEY,
        )
