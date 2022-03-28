
type CanvasParams = {
	maxWidth: number,
	maxHeight: number,
	widthByValue: Map<number, number>,
	leftOrRightMargin: number,
	partWidth: number,
	pr: number,
	marginTop: number,
	marginBottom: number,
	marginBar: number
}

export class TimerProgrammerLogic {

	constructor(private root: HTMLElement) {

	}

	private dpr() {
		return window.devicePixelRatio || 1;
	}

	private setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
		const pr = this.dpr();
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * pr;
		canvas.height = rect.height * pr;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.scale(pr, pr);
			const color = getComputedStyle(canvas).getPropertyValue("--primary-text-color");
			ctx.fillStyle = color;
			ctx.strokeStyle = color;
		}
		return ctx;
	}
	private canvasParams(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): CanvasParams {
		ctx.font = 'bold 10px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		const pr = this.dpr();
		let maxWidth = 0;
		let maxHeight = 0;
		const withByValue = new Map<number, number>();
		for (let i=0; i <=24; i+=2) {
			const tm = ctx.measureText(i.toString());
			withByValue[i] = tm.width;
			if (tm.width > maxWidth) {
				maxWidth = tm.width;
			}
			if (tm.fontBoundingBoxAscent > maxHeight) {
				maxHeight = tm.fontBoundingBoxAscent;
			}
		}
		return {
			maxWidth: maxWidth,
			maxHeight: maxHeight,
			widthByValue: withByValue,
			leftOrRightMargin: maxWidth / 2,
			partWidth: (canvas.width/pr - maxWidth) / 24,
			pr: pr,
			marginTop: 1,
			marginBottom: 1,
			marginBar: 8
		}
	}
	private drawTimebar() {
		const canvas: HTMLCanvasElement | null = <HTMLCanvasElement | null>this.root.getElementsByClassName('timebar')[0];
		if (canvas) {
			var ctx = this.setupCanvas(<HTMLCanvasElement>canvas);
			if (ctx) {
				var params = this.canvasParams(ctx, canvas);
				ctx.beginPath();
				for (let i=0; i<=24; i++) {
					const x = i * params.partWidth + params.leftOrRightMargin;
					ctx.moveTo(x, canvas.height/params.pr - params.marginBottom - params.maxHeight);
					ctx.lineTo(x, params.marginTop);
					if (i < 24)
						ctx.lineTo((i+1)*params.partWidth + params.leftOrRightMargin, params.marginTop);
					if (i % 2 === 0)
						ctx.fillText(i.toString(), x , canvas.height/params.pr - params.marginBottom, params.maxWidth);
				}
				ctx.stroke();
			}
		}
	}
	private drawConfort(timedata: number) {
		const canvas: HTMLCanvasElement | null = <HTMLCanvasElement | null>this.root.getElementsByClassName('confort')[0];
		if (canvas) {
			var ctx = this.setupCanvas(canvas);
			if (ctx) {
				var params = this.canvasParams(ctx, canvas);
				ctx.beginPath();
				var inset = 2;
				var colwidth = params.partWidth / 2;
				const timedatas = timedata.toString(2);
				const ptd = '000000000000000000000000000000000000000000000000'.substring(timedatas.length) + timedatas;
				for (let i=0; i<48; i++) {
					if ((ptd.charAt(i)) == '0')
						continue;
					const even = i % 2 !== 0;
					const x = i * colwidth + params.leftOrRightMargin + inset - (even ? inset / 2 : 0);
					const width = colwidth - inset - inset / 2;
					const y = params.marginTop + inset;
					const height = canvas.height/params.pr - params.marginBottom - params.maxHeight - params.marginBar; 
					ctx.fillRect(x, y, width, height);
				}
				ctx.stroke();			
			}
		}
	}
	public draw(value: unknown): void {
		// const timedata = [ 
		// 	true,  true,  false, false, false, false, false, false, // 0
		// 	false, false, false, false, false, true,  true,  true,  // 8
		// 	true,  true,  true,  true,  false, false, false, false, // 16
		// 	false, false, false, false, false, false, true,  true,  // 32
		// 	true,  true,  true,  true,  true,  true,  true,  true,  // 40
		// 	true,  true,  true,  true,  true,  true,  true,  true,  // 48
		// ];
		this.drawTimebar();
		let timedata: number = 0;
		if (typeof value === 'number') {
			timedata = value;
		} else if (typeof value === 'string') {
			timedata = parseInt(value.toString(), 10);
		}
		// const timedata = 211110259326975;
		this.drawConfort(timedata);
	}

}