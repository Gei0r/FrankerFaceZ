'use strict';

// ============================================================================
// Tooltip Handling
// ============================================================================

import {createElement as e} from 'utilities/dom';
import {has, maybe_call} from 'utilities/object';

import Tooltip from 'utilities/tooltip';
import Module from 'utilities/module';

export default class TooltipProvider extends Module {
	constructor(...args) {
		super(...args);
		this.types = {};

		this.should_enable = true;

		this.inject('i18n');
		this.inject('chat');

		this.types.json = target => {
			const title = target.dataset.title;
			return [
				title && e('strong', null, title),
				e('code', {
					className: `block${title ? ' pd-t-05 border-t mg-t-05' : ''}`,
					style: {
						fontFamily: 'monospace',
						textAlign: 'left'
					}
				}, target.dataset.data)
			]
		}

		this.types.badge = (target, tip) => {
			const container = target.parentElement.parentElement,

				badge = target.dataset.badge,
				version = target.dataset.version,
				room = container.dataset.roomId,

				data = this.chat.getBadge(badge, version, room);

			if ( ! data )
				return;

			return [
				this.chat.context.get('tooltip.badge-images') && e('img', {
					className: 'preview-image',
					src: data.image4x,

					style: {
						height: '72px'
					},

					onLoad: tip.update
				}),

				data.title
			]
		};
	}

	onEnable() {
		this.tips = new Tooltip('[data-reactroot]', 'ffz-tooltip', {
			html: true,
			delayHide: this.checkDelayHide.bind(this),
			delayShow: this.checkDelayShow.bind(this),
			content: this.process.bind(this),
			interactive: this.checkInteractive.bind(this),
			popper: {
				placement: 'top'
			}
		});
	}

	checkDelayShow(target, tip) {
		const type = target.dataset.tooltipType,
			handler = this.types[type];

		if ( has(handler, 'delayShow') )
			return maybe_call(handler.delayShow, null, target, tip);

		return 0;
	}

	checkDelayHide(target, tip) {
		const type = target.dataset.tooltipType,
			handler = this.types[type];

		if ( has(handler, 'delayHide') )
			return maybe_call(handler.delayHide, null, target, tip);

		return 0;
	}

	checkInteractive(target, tip) {
		const type = target.dataset.tooltipType,
			handler = this.types[type];

		if ( has(handler, 'interactive') )
			return maybe_call(handler.interactive, null, target, tip);

		return false;
	}

	process(target, tip) {
		const type = target.dataset.tooltipType,
			handler = this.types[type];

		if ( ! handler )
			return [
				e('strong', null, 'Unhandled Tooltip Type'),
				e('code', {
					className: 'block pd-t-05 border-t mg-t-05',
					style: {
						fontFamily: 'monospace',
						textAlign: 'left'
					}
				}, JSON.stringify(target.dataset, null, 4))
			];

		return handler(target, tip);
	}
}