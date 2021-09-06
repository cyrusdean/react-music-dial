export default class MusicCircle {
    size: number;
    musicWaveLength: number;
    color: string;
    canvasEl: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    audioEl: HTMLAudioElement;
    deltaCoef: number;
    scaleCoef: number;
    radius: number;
    cx: number;
    cy: number;
    tickSize: number;
    tickCount: number;
    audioData: Uint8Array;

    constructor({
        size = 560,
        musicWaveLength = 78,
        color = '#FFFFFF',
        canvasEl,
        audioEl
    }) {
        this.size = size;
        this.musicWaveLength = musicWaveLength;
        this.color = color;
        this.canvasEl = canvasEl;
        this.context = canvasEl.getContext('2d');
        this.audioEl = audioEl;
        this.context.strokeStyle = this.color;
        this.deltaCoef = 0.8;
        this.scaleCoef = (this.size / window.innerHeight) * this.deltaCoef;
        this.radius = (this.size - this.musicWaveLength * 2) / 2;
        this.cx = this.cy = this.radius + this.musicWaveLength;
        this.tickSize = 10;
        this.tickCount = 200;
        this.audioData = new Uint8Array();

        this.init = this.init.bind(this);
        this.render = this.render.bind(this);
        this.init();
    }

    init() {
        // @ts-ignore-start
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        // @ts-ignore-end
        const audioContext = new AudioContext();

        const audioScriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
        const { destination } = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        const source = audioContext.createMediaElementSource(this.audioEl);

        audioScriptProcessor.connect(destination);
        analyser.connect(audioScriptProcessor);

        source.connect(analyser);
        source.connect(destination);

        // const gain = audioContext.createGain();
        // source.connect(gain);
        // gain.connect(analyser);
        // gain.connect(destination);

        this.audioData = new Uint8Array(analyser.frequencyBinCount);

        audioScriptProcessor.onaudioprocess = () =>
            analyser.getByteFrequencyData(this.audioData);

        // Alternate non-ScriptProcessor solution
        // const analyserIntervalInstance = setInterval(() => analyser.getByteFrequencyData(audioData), 60);
        // clearInterval(analyserIntervalInstance)
        this.render();
    }

    clear() {
        this.context.clearRect(0, 0, this.size, this.size);
    }

    getTickCoords() {
        const coords = [...new Array(this.tickCount)].map((_, i) => {
            const degrees = (360 / this.tickCount) * i;
            const radians = (degrees * Math.PI) / 180;
            return { x: Math.cos(radians), y: -Math.sin(radians), angle: degrees };
        });
        return coords;
    }

    getTicks() {
        const tickCoords = this.getTickCoords();
        const tcLen = tickCoords.length;
        const tickRemainder = this.radius - this.tickSize;
        const { ticks, scales } = tickCoords.reduce(
            (a, tickCoord, i) => {
                const deltaIndex = i >= tcLen / 2 ? tcLen - 1 - i : i;
                const coef = (1 - deltaIndex / (tcLen * 2.5)) * 170;
                const delta = Math.max(
                    0,
                    ((this.audioData[deltaIndex] || 0) - coef) * this.scaleCoef
                );

                const { x, y } = tickCoord;
                const k = this.radius / (tickRemainder - delta);

                const x1 = x * tickRemainder;
                const y1 = y * tickRemainder;
                const x2 = x1 * k;
                const y2 = y1 * k;

                const { ticks: existingTicks, scales: existingScales } = a;
                let newScales = existingScales;
                const newScale = Math.max(1, delta / 60 / (this.scaleCoef / this.deltaCoef));
                if (i < 5) newScales = [...existingScales, newScale];

                return { ticks: [...existingTicks, { x1, y1, x2, y2 }], scales: newScales };
            },
            { ticks: [], scales: [] }
        );

        const averageScale = scales.reduce((a, scale) => a + scale, 0) / scales.length;
        this.canvasEl.style.transform = `scale(${averageScale})`;
        return ticks;
    }

    drawTick({ x1, y1, x2, y2 }) {
        this.context.beginPath();
        this.context.strokeStyle = this.color;
        this.context.lineWidth = 2;
        this.context.moveTo(this.cx + x1, this.cx + y1);
        this.context.lineTo(this.cx + x2, this.cx + y2);
        this.context.stroke();
    }

    draw() {
        this.context.save();
        this.context.beginPath();
        this.context.lineWidth = 1;
        const ticks = this.getTicks();
        ticks.forEach(this.drawTick.bind(this));
        this.context.restore();
    }

    render() {
        this.clear();
        this.draw();
        window.requestAnimationFrame(this.render);
    }
}
