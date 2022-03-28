/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/camelcase */
import { LitElement, html, TemplateResult } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor, computeDomain, domainIcon } from 'custom-card-helpers';

import { TimperProgrammerCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import memoizeOne from "memoize-one";
import { HassEntity } from 'home-assistant-js-websocket';

// note, I added a symbolic link called ha-frontend in the node-modules folder of
// this project pointing to the src folder in the home-assistant project. This allows
// this project to use classes alreay used in the home assistant frontend that are not
// available as an npm-import project
import type { HaFormSchema } from 'ha-frontend/components/ha-form/types';
import { localize } from './localize/localize';

@customElement('timer-programmer-card-editor')
export class TimerProgrammerCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: TimperProgrammerCardConfig;
  // @state() private _toggle?: boolean;
  // @state() private _helpers?: any;
  // private _initialized = false;

  public setConfig(config: TimperProgrammerCardConfig): void {
    this._config = config;

    // this.loadCardHelpers();
  }

	private _schema = memoizeOne(
		(entity: string, icon: string, entityState: HassEntity): HaFormSchema[] => [
			{ name: "entity", required: true, selector: { entity: {} } },
			{
				type: "grid",
				name: "",
				schema: [
          {
            name: "icon",
            selector: {
              icon: {
                placeholder: icon || entityState?.attributes.icon,
                fallbackPath:
                  !icon && !entityState?.attributes.icon && entityState
                    ? domainIcon(computeDomain(entity))
                    : undefined,
              },
            },
          },
          // {
          //   name: "attribute",
          //   selector: { attribute: { entity_id: entity } },
          // },
					{ name: "name", selector: { text: {} } },
					{ name: "show_title", selector: { boolean: {}}},
				]
			}
		]
	);

	protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    const entityState = this.hass.states[this._config.entity];

    const schema = this._schema(
      this._config.entity,
			this._config.icon,
      entityState
    );

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${schema}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
	}

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value;
    Object.keys(config).forEach((k) => config[k] === "" && delete config[k]);
    fireEvent(this, "config-changed", { config });
  }

  private _computeLabelCallback = (schema: HaFormSchema) => {
    if (schema.name === "entity") {
      return this.hass!.localize(
        "ui.panel.lovelace.editor.card.generic.entity"
      );
    }

		if (schema.name === "show_title") {
			return localize("common.show_title");
		}

    return this.hass!.localize(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
  };
	
  // protected shouldUpdate(): boolean {
  //   if (!this._initialized) {
  //     this._initialize();
  //   }

  //   return true;
  // }

  // get _name(): string {
  //   return this._config?.name || '';
  // }

  // get _entity(): string {
  //   return this._config?.entity || '';
  // }

  // get _show_title(): boolean {
  //   return this._config?.show_title || false;
  // }

  // get _show_error(): boolean {
  //   return this._config?.show_error || false;
  // }

  // get _tap_action(): ActionConfig {
  //   return this._config?.tap_action || { action: 'more-info' };
  // }

  // get _hold_action(): ActionConfig {
  //   return this._config?.hold_action || { action: 'none' };
  // }

  // get _double_tap_action(): ActionConfig {
  //   return this._config?.double_tap_action || { action: 'none' };
  // }

  // protected render(): TemplateResult | void {
  //   if (!this.hass || !this._helpers) {
  //     return html``;
  //   }

  //   // The climate more-info has ha-switch and paper-dropdown-menu elements that are lazy loaded unless explicitly done here
  //   this._helpers.importMoreInfoControl('climate');

  //   // You can restrict on domain type
  //   // const entities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'timer');
	// 	const entities = Object.keys(this.hass.states).filter(eid => eid.substring(eid.indexOf('.')+1).startsWith('confort_'));

  //   return html`
  //     <div class="card-config">
  //       <div class="option" @click=${this._toggleOption} .option=${'required'}>
  //         <div class="row">
  //           <ha-icon .icon=${`mdi:${options.required.icon}`}></ha-icon>
  //           <div class="title">${options.required.name}</div>
  //         </div>
  //         <div class="secondary">${options.required.secondary}</div>
  //       </div>
  //       ${options.required.show
  //         ? html`
  //             <div class="values">
  //               <paper-dropdown-menu
  //                 label="Entity (Required)"
  //                 @value-changed=${this._valueChanged}
  //                 .configValue=${'entity'}
  //               >
  //                 <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
  //                   ${entities.map(entity => {
  //                     return html`
  //                       <paper-item>${entity}</paper-item>
  //                     `;
  //                   })}
  //                 </paper-listbox>
  //               </paper-dropdown-menu>
  //             </div>
  //           `
  //         : ''}

  //       <div class="option" @click=${this._toggleOption} .option=${'appearance'}>
  //         <div class="row">
  //           <ha-icon .icon=${`mdi:${options.appearance.icon}`}></ha-icon>
  //           <div class="title">${options.appearance.name}</div>
  //         </div>
  //         <div class="secondary">${options.appearance.secondary}</div>
  //       </div>
  //       ${options.appearance.show
  //         ? html`
  //             <div class="values">
  //               <paper-input
  //                 label="Name (Optional)"
  //                 .value=${this._name}
  //                 .configValue=${'name'}
  //                 @value-changed=${this._valueChanged}
  //               ></paper-input>
  //               <br />
  //               <ha-formfield .label=${`Toggle title ${this._show_title ? 'off' : 'on'}`}>
  //                 <ha-switch
  //                   .checked=${this._show_title !== false}
  //                   .configValue=${'show_title'}
  //                   @change=${this._valueChanged}
  //                 ></ha-switch>
  //               </ha-formfield>
  //               <ha-formfield .label=${`Toggle error ${this._show_error ? 'off' : 'on'}`}>
  //                 <ha-switch
  //                   .checked=${this._show_error !== false}
  //                   .configValue=${'show_error'}
  //                   @change=${this._valueChanged}
  //                 ></ha-switch>
  //               </ha-formfield>
  //             </div>
  //           `
  //         : ''}
  //     </div>
  //   `;
  // }

  // private _initialize(): void {
  //   if (this.hass === undefined) return;
  //   if (this._config === undefined) return;
  //   if (this._helpers === undefined) return;
  //   this._initialized = true;
  // }

  // private async loadCardHelpers(): Promise<void> {
  //   this._helpers = await (window as any).loadCardHelpers();
  // }

  // private _toggleAction(ev): void {
  //   this._toggleThing(ev, options.actions.options);
  // }

  // private _toggleOption(ev): void {
  //   this._toggleThing(ev, options);
  // }

  // private _toggleThing(ev, optionList): void {
  //   const show = !optionList[ev.target.option].show;
  //   for (const [key] of Object.entries(optionList)) {
  //     optionList[key].show = false;
  //   }
  //   optionList[ev.target.option].show = show;
  //   this._toggle = !this._toggle;
  // }

  // private _valueChanged(ev): void {
  //   if (!this._config || !this.hass) {
  //     return;
  //   }
  //   const target = ev.target;
  //   if (this[`_${target.configValue}`] === target.value) {
  //     return;
  //   }
  //   if (target.configValue) {
  //     if (target.value === '') {
  //       const tmpConfig = { ...this._config };
  //       delete tmpConfig[target.configValue];
  //       this._config = tmpConfig;
  //     } else {
  //       this._config = {
  //         ...this._config,
  //         [target.configValue]: target.checked !== undefined ? target.checked : target.value,
  //       };
  //     }
  //   }
  //   fireEvent(this, 'config-changed', { config: this._config });
  // }

  // static get styles(): CSSResultGroup {
  //   return css`
  //     .option {
  //       padding: 4px 0px;
  //       cursor: pointer;
  //     }
  //     .row {
  //       display: flex;
  //       margin-bottom: -14px;
  //       pointer-events: none;
  //     }
  //     .title {
  //       padding-left: 16px;
  //       margin-top: -6px;
  //       pointer-events: none;
  //     }
  //     .secondary {
  //       padding-left: 40px;
  //       color: var(--secondary-text-color);
  //       pointer-events: none;
  //     }
  //     .values {
  //       padding-left: 16px;
  //       background: var(--secondary-background-color);
  //       display: grid;
  //     }
  //     ha-formfield {
  //       padding-bottom: 8px;
  //     }
  //   `;
  // }
}
