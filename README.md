# W3D Renderer
This is a partial reimplementation of the [Wolfenstein 3D][wiki] (w3d) renderer.
This project was inspired by the very enjoyable [**Game Engine Black Book:
Wolfenstein 3D** by Fabien Sanglard][gebb]. I read it once to understand the
algorithms then rederived and reimplented them – it was a lot of fun! The w3d
renderer is a software renderer that uses raycasting with the Digital
Differential Analyzer (DDA) algorithm to solve for intersections. I've
implemented the following features:
* Wall rendering + texture mapping (using w3d shareware textures)
* w3d shareware maps

See TODO.md for other functionality I may implement.

## Running
To run with w3d textures & maps:
* Download the source
* `mkdir <repo>/w3d-assets`
* Download the shareware version of Wolfenstein 3D and extract `*.WL1` assets
into the `w3d-assets` directory
* Host the page, e.g. `python3 -m http.server`
* Open the page in the browser, e.g. http://localhost:8000

To run without w3d textures & maps using my demo textures & map:
* `git checkout v0.1-demomap`
* Host the page, e.g. `python3 -m http.server`
* Open the page in the browser, e.g. http://localhost:8000

Note: there is no wall collision detection. If you leave the map bounds, you may
run into an infinite loop. 😅

---

## Acknowledgements
* Releasing the source & making this possible: id Software
* Inspiration and renderer algorithms: **Game Engine Black Book: Wolfenstein
3D** by Fabien Sanglard (https://fabiensanglard.net/gebbwolf3d/)
* VSWAP.WL1 file format: https://devinsmith.net/backups/bruce/wolf3d.html
* MAPHEAD.WL1 & GAMEMAPS.WL1 file formats, decompression algorithms:
https://vpoupet.github.io/wolfenstein/docs/files.html
* w3d palette: https://github.com/fabiensanglard/Chocolate-Wolfenstein-3D/

## LICENSE
No copyright infringement is intended! This work is licensed under either:
- LICENSE-id.txt
- LICENSE-gpl.txt

As a derivative work of the **Game Engine Black Book: Wolfenstein 3D**, which I
believe is a derivative work of the Wolfenstein 3D source code, I have licensed
this under the licenses available with the Wolfenstein 3D source releases: the
original [wolf3d source] (LICENSE-id.txt), the [wolf3d-browser source]
(LICENSE-gpl.txt), and the [Wolf3D-iOS source] (LICENSE-gpl.txt). This seems to
match the licensing of the long-running [Wolf4SDL project].

[wiki]: https://en.wikipedia.org/wiki/Wolfenstein_3D
[gebb]: https://fabiensanglard.net/gebbwolf3d/
[wolf3d source]: https://github.com/id-Software/wolf3d
[wolf3d-browser source]: https://github.com/id-Software/wolf3d-browser
[Wolf3D-iOS source]: https://github.com/id-Software/Wolf3D-iOS
[Wolf4SDL project]: https://github.com/11001011101001011/Wolf4SDL
