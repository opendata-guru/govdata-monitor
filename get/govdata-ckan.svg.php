<?php
	$pathinfo = pathinfo($_SERVER['REQUEST_URI']);
	$filename = explode('.svg', $pathinfo['filename'])[0];

	ob_start();
	include($filename . '.php');
	$count = ob_get_contents();
	ob_end_clean();

	$top = 'CKAN hat';
	$bottom = 'Datensätze';
	$image = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    viewBox="0 0 156 180">
  <g id="g10" transform="matrix(1.25,0,0,-1.25,0,180)" style="line-height:1.25;font-family:Arial;fill:#1d1d1b">
    <path id="path3176" style="fill:#e3eb1f" d="M 62.4,72 0,108 l 0,0 62.4,36 c 0,0 0.02874,-71.999977 0,-72 z" />
    <path id="path3178" style="fill:#f03b41" d="m 62.399973,72 62.399997,36 0,0 -62.399997,36 c -0.300945,0 -0.298879,-71.999977 0,-72 z" />
    <path id="path2988" style="fill:#e0e0e0" d="M 62.4,0 0,36 0,36 62.4,72 c 0,0 0.02874,-71.999977240587 0,-72 z" />
    <path id="path3180" style="fill:#ebebeb" d="M 62.376794,72.005095 C 42.644373,58.943991 22.551707,46.242983 0,36 l 0,0 0.02308996,71.97025 C 1.223723,109.17038 64.033024,73.67117 62.376794,72.005095 z" />
    <path id="path3182" style="fill:#f5f5f5" d="M 62.423396,71.994906 C 82.155817,85.05601 102.24848,97.757018 124.80019,108 l 0,0 -0.0231,-71.970249 c -1.20063,-1.20013 -64.009934,34.29908 -62.353704,35.965155 z" />
    <path id="path3174" style="fill:#ebebeb" d="m 62.399973,0 62.399997,36 0,0 -62.399997,36 c -1.498971,-1.124229 -0.7564,-72.5457219 0,-72 z" />
    <text id="text-top" style="font-size:15px" x="62" y="-86.592964" text-anchor="middle" transform="scale(1,-1)">${top}</text>
    <text id="text-middle" style="font-size:29px" x="62" y="-61.310406" text-anchor="middle" transform="scale(1,-1)">${count}</text>
    <text id="text-bottom" style="font-size:15px" x="62" y="-46.593002" text-anchor="middle" transform="scale(1,-1)">${bottom}</text>
  </g>
</svg>';

	if ($count >= 1000) {
		$count = substr_replace($count, '.', strlen($count) - 3, 0);
	}

	$output = str_replace('${top}', $top, $image);
	$output = str_replace('${count}', $count, $output);
	$output = str_replace('${bottom}', $bottom, $output);

	header('Content-Type: image/svg+xml');
	header('Cache-Control: max-age=43200');
	echo $output;
?>