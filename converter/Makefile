
# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

oci_svg_icons_zip = OCI_Icons_SVG.zip
oci_svg_icons_url = https://docs.cloud.oracle.com/iaas/Content/Resources/Assets/$(oci_svg_icons_zip)
oci_svg_icons_path = OCI_Icons_SVG
dist = dist

build: $(oci_svg_icons_path)
	mkdir -p ${dist}
	python3 svg_converter.py -s $(oci_svg_icons_path) -d ${dist}

clean:
	rm -rf $(oci_svg_icons_path)
	rm -rf ${dist}

$(oci_svg_icons_path): $(oci_svg_icons_zip)
	unzip $(oci_svg_icons_zip)
	# remove grey & white
	rm -rf $(oci_svg_icons_path)/*{grey,gray,white,wht}*.svg
$(oci_svg_icons_zip):
	curl -O $(oci_svg_icons_url)
