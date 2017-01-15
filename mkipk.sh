#!/bin/bash
set -e
tmpdir=`mktemp -d`
rsync -avL package/ $tmpdir
chmod a+x ipkg-build
fakeroot -- ./ipkg-build -c $tmpdir
rm -rf "$tmpdir"
