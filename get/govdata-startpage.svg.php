<?php
	$pathinfo = pathinfo($_SERVER['REQUEST_URI']);
	$filename = explode('.svg', $pathinfo['filename'])[0];

	ob_start();
	include($filename . '.php');
	$count = ob_get_contents();
	ob_end_clean();

	$top = 'GovData hat';
	$bottom = 'Datensätze';
	$image = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
   viewBox="0 0 156 180">
  <g id="g10" transform="matrix(1.25,0,0,-1.25,0,180)" style="line-height:1.25;font-family:Arial;fill:#1d1d1b">
    <path id="path3176" style="fill:#f0f0f0" d="M 62.4,72 0,108 l 0,0 62.4,36 c 0,0 0.02874,-71.999977 0,-72 z" />
    <path id="path3178" style="fill:#fafafa" d="m 62.399973,72 62.399997,36 0,0 -62.399997,36 c -0.300945,0 -0.298879,-71.999977 0,-72 z" />
    <path id="path2988" style="fill:#dcdcdc" d="M 62.4,0 0,36 0,36 62.4,72 c 0,0 0.02874,-71.999977240587 0,-72 z" />
    <path id="path3180" style="fill:#e6e6e6" d="M 62.376794,72.005095 C 42.644373,58.943991 22.551707,46.242983 0,36 l 0,0 0.02308996,71.97025 C 1.223723,109.17038 64.033024,73.67117 62.376794,72.005095 z" />
    <path id="path3182" style="fill:#f0f0f0" d="M 62.423396,71.994906 C 82.155817,85.05601 102.24848,97.757018 124.80019,108 l 0,0 -0.0231,-71.970249 c -1.20063,-1.20013 -64.009934,34.29908 -62.353704,35.965155 z" />
    <path id="path3174" style="fill:#e6e6e6" d="m 62.399973,0 62.399997,36 0,0 -62.399997,36 c -1.498971,-1.124229 -0.7564,-72.5457219 0,-72 z" />
    <text id="text-top" style="font-size:15px" x="62" y="-86.592964" text-anchor="middle" transform="scale(1,-1)">${top}</text>
    <text id="text-middle" style="font-size:29px" x="62" y="-61.310406" text-anchor="middle" transform="scale(1,-1)">${count}</text>
    <text id="text-bottom" style="font-size:15px" x="62" y="-46.593002" text-anchor="middle" transform="scale(1,-1)">${bottom}</text>
    <path id="path989" style="fill:#1d1d1b" d="m 8,104 -8,4 v 0 l 62.4,36 v -8 z" />
    <path id="path1003" style="fill:#383833" d="m 124.79997,108 v 0 l -62.399997,36 2.7e-5,-8 54.4,-32 z" />
    <path id="path1029" style="fill:#e30613" d="M 8,104 V 40 L 0,36 v 0 l 0.02308996,71.97025 z" />
    <path id="path1031" style="fill:#f92533" d="m 116.8,104 8.00019,4 v 0 L 124.77709,36.029751 116.8,40 Z" />
    <path id="path1035" style="fill:#f8d200" d="M 62.4,0 0,36 v 0 L 8,40 62.4,8 Z" />
    <path id="path1037" style="fill:#ffe12e" d="m 62.399973,0 62.399997,36 v 0 L 116.8,40 62.4,8 Z" />
  </g>
  <g id="g1003" transform="matrix(0.46128915,0,0,0.46128915,-12.372623,2.5124615)">
    <circle id="path98" style="fill:#9d9d9c" cx="166.14412" cy="44.9356" r="7" />
    <circle id="circle923" style="fill:#9d9d9c" cx="185.99016" cy="44.9356" r="7" />
    <circle id="circle925" style="fill:#9d9d9c" cx="205.8362" cy="44.9356" r="7" />
    <circle id="circle927" style="fill:#1d1d1b" cx="225.68224" cy="44.9356" r="7" />
    <circle id="circle929" style="fill:#9d9d9c" cx="225.68224" cy="64.148262" r="7" />
    <circle id="circle931" style="fill:#e30613" cx="205.8362" cy="64.148262" r="7" />
    <circle id="circle933" style="fill:#9d9d9c" cx="185.99016" cy="64.148262" r="7" />
    <circle id="circle935" style="fill:#9d9d9c" cx="166.14412" cy="64.148262" r="7" />
    <circle id="circle937" style="fill:#9d9d9c" cx="166.14412" cy="83.360916" r="7" />
    <circle id="circle939" style="fill:#9d9d9c" cx="166.14412" cy="102.57358" r="7" />
    <circle id="circle941" style="fill:#f8d200" cx="185.99016" cy="83.360916" r="7" />
    <circle id="circle943" style="fill:#9d9d9c" cx="205.8362" cy="83.360916" r="7" />
    <circle id="circle945" style="fill:#9d9d9c" cx="225.68224" cy="83.360916" r="7" />
    <circle id="circle947" style="fill:#9d9d9c" cx="185.99016" cy="102.57358" r="7" />
    <circle id="circle949" style="fill:#9d9d9c" cx="205.8362" cy="102.57358" r="7" />
    <circle id="circle951" style="fill:#9d9d9c" cx="225.68224" cy="102.57358" r="7" />
  </g>
</svg>
';

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