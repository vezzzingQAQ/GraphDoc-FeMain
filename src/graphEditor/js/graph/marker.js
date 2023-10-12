export function setMarkerColors(strokeMarkerEls, markerTemplate) {
    strokeMarkerEls.forEach((el) => {

        // get element's stroke color
        let style = window.getComputedStyle(el);
        let stroke = style.stroke;

        // convert stroke color to hex value – used as an ID suffix for markers
        let strokeHex = rgbToHex(stroke, true);

        // define marker ID based on color
        let markerId = `${markerTemplate.id}_${strokeHex}`;
        let svg = el.closest("svg");
        let defs = svg.querySelector("defs");

        // check if marker of this color already exists
        let newMarker = defs.querySelector("#" + markerId);

        // otherwise append it
        if (!newMarker) {
            let markerClone = markerTemplate.cloneNode(true);
            markerClone.id = markerId;
            markerClone.classList = "tempMarkerDef";
            let markerEl = markerClone.children[0];
            markerEl.setAttribute("fill", "#" + strokeHex);
            defs.appendChild(markerClone);
        }
        // apply marker style
        el.style.markerMid = `url(#${markerId})`;
        //el.setAttribute('marker-end', `url(#${markerId})`)
    });
}

// convert rgb(a) to hex code
function rgbToHex(color, onlyHex = false) {
    let colArray = color
        .replace(/[rgba(|rgb(|)]/g, "")
        .split(",")
        .map((val) => {
            return parseFloat(val);
        });
    let alpha = colArray[3] ? colArray[3] : "";
    if (alpha) {
        alpha = ((alpha * 255) | (1 << 8)).toString(16).slice(1);
    }
    let [r, g, b] = [colArray[0], colArray[1], colArray[2]];
    let hexColor =
        (r | (1 << 8)).toString(16).slice(1) +
        (g | (1 << 8)).toString(16).slice(1) +
        (b | (1 << 8)).toString(16).slice(1);

    hexColor = onlyHex ? hexColor : '#' + hexColor;
    return hexColor + alpha;
}
