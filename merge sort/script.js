myCanvas.width = 800;
myCanvas.height = 500;
const margin = 30;
const n = 30;
const array = [];
let moves = [];
const cols = [];
const spacing = (myCanvas.width - margin * 2) / n;
const ctx = myCanvas.getContext("2d");

const maxColumnHeight = 200;

init();

let audioCtx = null;

function playNote(freq, type) {
    if (audioCtx == null) {
        audioCtx = new (
            AudioContext ||
            webkitAudioContext ||
            window.webkitAudioContext
        )();
    }
    const dur = 0.2;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.type = type;
    osc.stop(audioCtx.currentTime + dur);

    const node = audioCtx.createGain();
    node.gain.value = 0.4;
    node.gain.linearRampToValueAtTime(
        0, audioCtx.currentTime + dur
    );
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function init() {
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    moves = [];
    for (let i = 0; i < array.length; i++) {
        const x = i * spacing + spacing / 2 + margin;
        const y = myCanvas.height - margin - i * 3;
        const width = spacing - 4;
        const height = maxColumnHeight * array[i];
        cols[i] = new Column(x, y, width, height);
    }
}

function play() {
    moves = mergeSort(array);
}

animate();

function mergeSort(array) {
    const moves = [];

    function merge(arr, left, mid, right) {
        let i = left;
        let j = mid + 1;
        let temp = [];

        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) {
                temp.push(arr[i]);
                moves.push({ indices: [i, j], swap: false });
                i++;
            } else {
                temp.push(arr[j]);
                moves.push({ indices: [i, j], swap: true });
                j++;
            }
        }

        while (i <= mid) {
            temp.push(arr[i]);
            moves.push({ indices: [i, i], swap: false });
            i++;
        }

        while (j <= right) {
            temp.push(arr[j]);
            moves.push({ indices: [j, j], swap: false });
            j++;
        }

        for (let k = 0; k < temp.length; k++) {
            arr[left + k] = temp[k];
            moves.push({ indices: [left + k, left + k], swap: false });
        }
    }

    function mergeSortRecursive(arr, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSortRecursive(arr, left, mid);
            mergeSortRecursive(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }

    mergeSortRecursive(array, 0, array.length - 1);
    return moves;
}

function animate() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    let changed = false;
    for (let i = 0; i < cols.length; i++) {
        changed = cols[i].draw(ctx) || changed;
    }

    if (!changed && moves.length > 0) {
        const move = moves.shift();
        const [i, j] = move.indices;
        const waveformType = move.swap ? "square" : "sine";
        playNote(cols[i].height + cols[j].height, waveformType);
        if (move.swap) {
            cols[i].moveTo(cols[j]);
            cols[j].moveTo(cols[i], -1);
            [cols[i], cols[j]] = [cols[j], cols[i]];
        } else {
            cols[i].jump();
            cols[j].jump();
        }
    }

    requestAnimationFrame(animate);
}
