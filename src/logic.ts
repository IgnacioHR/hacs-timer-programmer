
type ImageParams = {
	svgWidth: number,
	svgHeight: number,
	maxWidth: number,
	maxHeight: number,
	nodesMap: Map<string, SVGTextElement>,
	leftOrRightMargin: number,
	partWidth: number,
	marginTop: number,
	marginBottom: number,
	marginBar: number,
	inset: number,
}

export class TimerProgrammerLogic {

	private SVG_NS = 'http://www.w3.org/2000/svg';

	private params: ImageParams | undefined;
	private redrawTimebar = true;

	constructor(private root: SVGSVGElement) {
	}

	private getParams(): ImageParams | undefined {
		let maxWidth = 0;
		let maxHeight = 0;
		let svgWidth = this.root.width.baseVal.value;
		let svgHeight = this.root.height.baseVal.value;
		const textNodesMap = new Map<string, SVGTextElement>();
		for (let i=0; i <=24; i+=2) {
			let text = document.createElementNS(this.SVG_NS, "text") as SVGTextElement;
			this.root.appendChild(text);
			textNodesMap['_'+i] = text;
			text.setAttributeNS(null, "class", "t");
			text.setAttributeNS(null, "x", (svgWidth/2).toString());
			text.setAttributeNS(null, "y", (svgHeight/2).toString());
			var textNode = document.createTextNode(i.toString());
			text.appendChild(textNode);
			const nodeWidth = text.getComputedTextLength();
			if (nodeWidth === 0) {
				// the svg is not visible, size can't be calculated. it is not time to
				// evaluate the params, let's do it later
				Object.keys(textNodesMap).forEach(k => textNodesMap[k]?.remove() );
				return undefined;
			}
			if (nodeWidth > maxWidth) {
				maxWidth = nodeWidth;
			}
			if (text.getBBox().height > maxHeight) {
				maxHeight = text.getBBox().height;
			}
		}
		return {
			svgWidth: svgWidth,
			svgHeight: svgHeight,
			maxWidth: maxWidth,
			maxHeight: maxHeight,
			nodesMap: textNodesMap,
			leftOrRightMargin: maxWidth / 2,
			partWidth: (svgWidth - maxWidth) / 24,
			marginTop: 1,
			marginBottom: 1,
			marginBar: 8,
			inset: 2
		}
	}
	private drawLinesAndLabels() {
		if (this.redrawTimebar) {
			if (!this.params)
				this.params = this.getParams();
			if (!this.params)
				return;
			const oldElements = this.root.getElementsByTagNameNS(this.SVG_NS, "path");
			Array.from(oldElements).forEach(el => el.remove());
			let path = document.createElementNS(this.SVG_NS, "path");
			this.root.appendChild(path);
			path.setAttributeNS(null,"class", "l");
			let pathtext = '';
			for (let i=0; i<=24; i++) {
				const x = i * this.params.partWidth + this.params.leftOrRightMargin;
				const y = this.params.marginTop;
				const y2 = this.params.svgHeight - this.params.marginBottom - this.params.maxHeight;
				pathtext = pathtext.concat('M',x.toString(), ' ', y.toString(), 'v', y2.toString(), 'z');
				if (i < 24) 
					pathtext = pathtext.concat('h', this.params.partWidth.toString());
				pathtext = pathtext.concat('z');
				if (i % 2 === 0) {
					var nodetext = this.params.nodesMap['_'+i];
					nodetext.setAttributeNS(null, "x", x);
					nodetext.setAttributeNS(null, "y", this.params.svgHeight - this.params.marginBottom);
				}
			}
			path.setAttributeNS(null, "d", pathtext);
			this.redrawTimebar = false;
		}
	}
	private drawSteps(timedata: number) {
		if (!this.params)
			this.params = this.getParams();
		if (!this.params)
			return;
		const oldElements = this.root.getElementsByTagNameNS(this.SVG_NS, "rect");
		Array.from(oldElements).forEach(el => el.remove());
		var colwidth = this.params.partWidth / 2;
		const timedatas = timedata.toString(2);
		const ptd = '000000000000000000000000000000000000000000000000'.substring(timedatas.length) + timedatas;
		for (let i=0; i<48; i++) {
			const even = i % 2 !== 0;
			const x = i * colwidth + this.params.leftOrRightMargin + this.params.inset - (even ? this.params.inset / 2 : 0);
			const width = colwidth - this.params.inset - this.params.inset / 2;
			const y = this.params.marginTop + this.params.inset;
			const height = this.params.svgHeight - this.params.marginBottom - this.params.maxHeight - this.params.marginBar; 
			let rect = document.createElementNS(this.SVG_NS, "rect");
			this.root.appendChild(rect);
			rect.setAttributeNS(null, "id", "r_"+(47-i).toString());
			rect.setAttributeNS(null, "x", x.toString());
			rect.setAttributeNS(null, "y", y.toString());
			rect.setAttributeNS(null, "width", width.toString());
			rect.setAttributeNS(null, "height", height.toString());
			rect.setAttributeNS(null, "class", ptd.charAt(i) == '1' ? "rEnabled" : "rDisabled");
			rect.addEventListener('click', () => {
				rect.setAttributeNS(null, "class", "rBlinking");
				this.root.dispatchEvent(new CustomEvent('click', {detail: (47-i)}));
			});
		}
	}
	public draw(value: unknown): void {

		const drawCode = () => {
			this.drawLinesAndLabels();
			let timedata: number = 0;
			if (typeof value === 'number') {
				timedata = value;
			} else if (typeof value === 'string') {
				timedata = parseInt(value.toString(), 10);
			}
			this.drawSteps(timedata);
		}

		setTimeout(() => {
			if (!this.params)
				this.params = this.getParams();
			if (!this.params) {
				this.draw(value);
				return;
			}
			drawCode();
		}, 100);

	}

}