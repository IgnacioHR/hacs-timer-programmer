import { 
	hasConfigOrEntityChanged,
	HomeAssistant,
	LovelaceCardEditor
} from 'custom-card-helpers';
import {
	css,
	CSSResultGroup,
	html,
	LitElement,
	PropertyValues,
	TemplateResult,
	unsafeCSS
} from 'lit';
import {
	styleMap
} from 'lit/directives/style-map'

import './editor';

import { customElement, property, state } from "lit/decorators";
import { TimperProgrammerCardConfig } from './types';
// import { CARD_VERSION } from './const';
import { localize } from './localize/localize';
import { TimerProgrammerLogic } from './logic';
import { styles } from './styles';

// console.info(
//   `%c  TIMER-PROGRAMMER-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
//   'color: orange; font-weight: bold; background: black',
//   'color: white; font-weight: bold; background: dimgray',
// );

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'timer-programmer-card',
  name: 'Timer Programmer Card',
  description: 'A card to represent a timer programmer',
});

@customElement('timer-programmer-card')
export class TimerProgrammerCard extends LitElement {

	public static async getConfigElement(): Promise<LovelaceCardEditor> {
		return document.createElement('timer-programmer-card-editor');
	}

	// Properties that fire re-render
	@property({ attribute: false }) public hass!: HomeAssistant;
	@property({ attribute: false }) private tp: TimerProgrammerLogic | null = null;
	@state() private config!: TimperProgrammerCardConfig;

	public static getStubConfig(): object {
		console.info("stub config obtained");
		return {};
	}

	public setConfig(config: TimperProgrammerCardConfig): void {
		// tiene { type: "..." }
		this.config = {
			...config,
		};
	}

	public shouldUpdate(changedProps: PropertyValues): boolean {
		if (!this.config) {
			return false;
		}

		return hasConfigOrEntityChanged(this, changedProps, false);
	}

	protected updated(changedProps: PropertyValues): void {
		if (this.tp && this.config.entity) {
			const state = this.hass.states[this.config.entity!].state;
			this.tp.draw(state);
	} else {
			this._init();
		}
		super.updated(changedProps);

		// if (changedProps.has("hass")) {
		// 	const stateObj = this.hass!.states[this.config.entity!];
		// }
	}

	protected firstUpdated(changedProps: PropertyValues): null | void {
		this._init()
    return super.firstUpdated(changedProps);
  }

	protected render(): TemplateResult | void {
		if (this.config.show_warning) {
      return this._showWarning(localize('common.show_warning'));
    }

    if (this.config.show_error) {
      return this._showError(localize('common.show_error'));
    }

		return html`
			<ha-card>
				<div class="card-content">
					${this.config.show_title ?
      html`<hui-generic-entity-row .hass=${this.hass} .config=${this.config}></hui-generic-entity-row>`:
      html``}
				${html`
					<div id="timepanel" style="
							position: relative;
							height: 38px;
						">
						<canvas class="timebar" height="50" width="600" 
							style="
								position: absolute;
								width: 100%;
								height: 100%;
								z-index: 1;
								"></canvas>
						<canvas class="confort" height="50" width="600"
							style="
								position: absolute;
								width: 100%;
								height: 100%;
								z-index: 2;
							"></canvas>
					</div>
				`}
				</div>
			</ha-card>
		`;
	}

	protected _init(): void {
		const tpdiv = this.shadowRoot?.getElementById('timepanel');
		if (tpdiv) {
			if (!this.tp && this.config.entity) {
				this.tp = new TimerProgrammerLogic(tpdiv);
				const state = this.hass.states[this.config.entity!].state;
				this.tp.draw(state);
			}
			// const state = this.hass.states[this.config.entity!].state;

		}
	}

	private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

	public getCardSize() {
    return 2;
  }
	
	static get styles(): CSSResultGroup {
		return unsafeCSS(styles);
	}
}