#!/bin/bash
set -e
tmpdir=`mktemp -d`
mkdir -p $tmpdir/usr/lib/lua/luci && rsync -a luci-wrtbwmon/luasrc/ $_
rsync -a luci-wrtbwmon/root/ $tmpdir
rsync -a luci-wrtbwmon/htdocs/ $tmpdir/www
# this automatically sets the version based on the tag name, if it exists
[[ ! -z "${TRAVIS_TAG}" ]] && sed -i "s/Version: .*/Version: ${TRAVIS_TAG}/" CONTROL/control
rsync -a CONTROL $tmpdir
chmod a+x ipkg-build
fakeroot -- ./ipkg-build -c $tmpdir
rm -rf "$tmpdir"
