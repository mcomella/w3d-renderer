function appendPageBody() {
    const canvasEl = document.createElement('canvas');
    canvasEl.width = RESOLUTION.width;
    canvasEl.height = RESOLUTION.height;
    canvasEl.innerText = 'Canvas unavailable';
    document.body.append(canvasEl);
}

function main() {
    appendPageBody();
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    renderFrame(ctx, RESOLUTION);
}

main();
