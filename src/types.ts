import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';
import { TimerProgrammerCard } from './timer-programmer-card';

declare global {
	interface HTMLElementTagNameMap {
		'timer-programmer-card': TimerProgrammerCard,
		'timer-programmer-card-editor': LovelaceCardEditor,
		'hui-error-card': LovelaceCard;
	}
}

export interface TimperProgrammerCardConfig extends LovelaceCardConfig {
	name?: string;
	show_title?: boolean;
	show_warning?: boolean;
	show_error?: boolean;
	entity: string;
	icon: string;
}