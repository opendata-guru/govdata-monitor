<?php
	$pathinfo = pathinfo($_SERVER['REQUEST_URI']);
	$filename = explode('.svg', $pathinfo['filename'])[0];

	ob_start();
	include($filename . '.php');
	$count = ob_get_contents();
	ob_end_clean();

	$top = 'SPARQL zählt';
	$bottom = 'Datensätze';
	$image = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  viewBox="0 0 156 180">
  <g id="g10" transform="matrix(1.25,0,0,-1.25,0,180)" style="line-height:1.25;font-family:Arial;fill:#ffffff">
    <path id="path3176" style="fill:#0c4391" d="M 62.4,72 0,108 l 0,0 62.4,36 c 0,0 0.02874,-71.999977 0,-72 z" />
    <path id="path3178" style="fill:#0c479c" d="m 62.399973,72 62.399997,36 0,0 -62.399997,36 c -0.300945,0 -0.298879,-71.999977 0,-72 z" />
    <path id="path2988" style="fill:#0c3b7d" d="M 62.4,0 0,36 0,36 62.4,72 c 0,0 0.02874,-71.999977240587 0,-72 z" />
    <path id="path3180" style="fill:#0c3f87" d="M 62.376794,72.005095 C 42.644373,58.943991 22.551707,46.242983 0,36 l 0,0 0.02308996,71.97025 C 1.223723,109.17038 64.033024,73.67117 62.376794,72.005095 z" />
    <path id="path3182" style="fill:#0c4391" d="M 62.423396,71.994906 C 82.155817,85.05601 102.24848,97.757018 124.80019,108 l 0,0 -0.0231,-71.970249 c -1.20063,-1.20013 -64.009934,34.29908 -62.353704,35.965155 z" />
    <path id="path3174" style="fill:#0c3f87" d="m 62.399973,0 62.399997,36 0,0 -62.399997,36 c -1.498971,-1.124229 -0.7564,-72.5457219 0,-72 z" />
    <text id="text-top" style="font-size:15px" x="62" y="-86.592964" text-anchor="middle" transform="scale(1,-1)">${top}</text>
    <text id="text-middle" style="font-size:29px" x="62" y="-61.310406" text-anchor="middle" transform="scale(1,-1)">${count}</text>
    <text id="text-bottom" style="font-size:15px" x="62" y="-46.593002" text-anchor="middle" transform="scale(1,-1)">${bottom}</text>
  </g>
  <g id="g1473" transform="matrix(0.03681992,0,0,0.03681992,52.907623,29.830364)">
    <path id="path874" style="fill:#ffffff" d="m 1054.5866,280.66583 c -6,-3 -13,-6 -19,-9 h 5 c 0,0 -41.99997,-18 -44.99997,-152 -4,-133.000004 39.99997,-156.000004 39.99997,-156.000004 v 0 c 33,-17 61,-43 79,-77.999996 48,-91 14,-203 -77,-252 -98.99997,-47 -210.99997,-13 -258.99997,78 -20,37 -25,78 -19,117 l -2,-3 c 0,0 11,48 -103,118.999996 -113,71 -165,35 -165,35 l 3,5 c -3,-2 -6,-4 -10,-6 -90,-49 -203,-14 -251,77 -48,91.000004 -14,203.000004 77,252.000004 68,36 147,26 204,-19 l -1,2 c 0,0 41,-34 160,30 94,50 108,100 110,118 -2,69 33,137 98,171 91,48 202.99997,14 251.99997,-77 48,-91 13,-203 -77,-252 z m -209.99997,25 c -15,5 -58,11 -148,-37 -98,-53 -113,-97 -115,-110 1,-16 1,-32 -2,-48 l 1,1 c 0,0 -8,-43.000004 104,-112.00000432 100,-61.99999968 146,-49.99999968 154,-46.99999968 5,4 11,7 17,10 11,6 23,11 35,14 14,13 39,50 42,149.000004 3,99 -26,137 -42,150 -17,8 -33,18 -46,30 z" />
    <path id="path876" style="fill:#0c479c" d="m 831.58663,-306.33417 c -54,59 -55,146 -3,196 -26,-25 -25,-77 1,-126 3,-4 13,-15 27,-10 1,0 2,1 3,1 3,1 7,1 10,1 22,-1 38,-19 37,-41 0,-10 -4,-18 -11,-25 50,-33 106.99997,-37 130.99997,-15 h 1 c -52.99997,-50 -140.99997,-41 -195.99997,19 z m -544,349.999996 c -54,59.000004 -55,146.000004 -3,196.000004 -26,-25 -25,-77 1,-126 3,-4 13,-15.000004 27,-10 1,0 2,1 3,1 3,1 7,1 10,1 22,-1 38,-19.000004 37,-41.000004 0,-10 -4,-18 -11,-25 50,-33.0000003 107,-37.0000003 131,-15 h 1 c -53,-49 -141,-41 -196,19 z m 576,297.000004 c -54,59 -55,146 -3,196 -26,-25 -25,-77 1,-126 3,-4 13,-15 27,-10 1,0 2,1 3,1 3,1 7,1 10,1 22,-1 38,-19 37,-41 0,-10 -4,-18 -11,-25 50,-33 106.99997,-37 130.99997,-15 h 1 c -53,-50 -140.99997,-41 -195.99997,19 z" />
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