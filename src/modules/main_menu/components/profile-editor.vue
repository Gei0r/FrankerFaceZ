<template lang="html">
<div class="ffz--profile-editor">
	<div class="flex align-items-center border-t pd-1">
		<div class="flex-grow-1"></div>
		<button
			class="tw-button tw-button--text"
			@click="save"
		>
			<span class="tw-button__text ffz-i-floppy">
				{{ t('settings.profiles.save', 'Save') }}
			</span>
		</button>
		<button
			class="mg-l-1 tw-button tw-button--text"
			:disabled="item.profile && context.profiles.length < 2"
			@click="del"
		>
			<span class="tw-button__text ffz-i-trash">
				{{ t('setting.profiles.delete', 'Delete') }}
			</span>
		</button>
		<!--button class="mg-l-1 tw-button tw-button--text">
			<span class="tw-button__text ffz-i-download">
				{{ t('setting.profiles.export', 'Export') }}
			</span>
		</button-->
	</div>

	<div class="ffz--menu-container border-t">
		<header>
			{{ t('settings.data_management.profiles.edit.general', 'General') }}
		</header>

		<div class="ffz--widget flex flex--nowrap">
			<label for="ffz:editor:name">
				{{ t('settings.data_management.profiles.edit.name', 'Name') }}
			</label>

			<input
				class="tw-input"
				ref="name"
				id="ffz:editor:name"
				v-model="name"
				/>
		</div>

		<div class="ffz--widget flex flex--nowrap">
			<label for="ffz:editor:description">
				{{ t('settings.data_management.profiles.edit.desc', 'Description') }}
			</label>

			<textarea
				class="tw-input"
				ref="desc"
				id="ffz:editor:description"
				v-model="desc"
				/>
		</div>
	</div>

	<div class="ffz--menu-container border-t">
		<header>
			{{ t('settings.data_management.profiles.edit.rules', 'Rules') }}
		</header>
		<section class="pd-b-1">
			{{ t(
				'settings.data_management.profiles.edit.rules.description',
				'Rules allows you to define a series of conditions under which this profile will be active.'
				) }}
		</section>

		<filter-editor
			:filters="filters"
			:rules="rules"
			:context="test_context"
			@change="unsaved = true"
			/>

	</div>
</div>
</template>

<script>

export default {
	props: ['item', 'context'],

	data() {
		return {
			old_name: null,
			old_desc: null,

			name: null,
			desc: null,
			unsaved: false,

			filters: null,
			rules: null,
			test_context: null
		}
	},

	created() {
		this.context.context.on('context_changed', this.updateContext, this);
		this.updateContext();
		this.revert();
	},

	beforeDestroy() {
		this.context.context.off('context_changed', this.updateContext, this);
	},


	watch: {
		name() {
			if ( this.name !== this.old_name )
				this.unsaved = true;
		},

		desc() {
			if ( this.desc !== this.old_desc )
				this.unsaved = true;
		}
	},

	methods: {
		revert() {
			const profile = this.item.profile;

			this.old_name = this.name = profile ?
				profile.i18n_key ?
					this.t(profile.i18n_key, profile.title, profile) :
					profile.title :
				'Unnamed Profile',

			this.old_desc = this.desc = profile ?
				profile.desc_i18n_key ?
					this.t(profile.desc_i18n_key, profile.description, profile) :
					profile.description :
				'';

			this.rules = profile ? profile.context : {};
			this.unsaved = ! profile;
		},

		del() {
			if ( this.item.profile || this.unsaved ) {
				if ( ! confirm(this.t(
					'settings.profiles.warn-delete',
					'Are you sure you wish to delete this profile? It cannot be undone.'
				)) )
					return

				if ( this.item.profile )
					this.context.deleteProfile(this.item.profile);
			}

			this.unsaved = false;
			this.$emit('navigate', 'data_management.profiles');
		},

		save() {
			if ( ! this.item.profile ) {
				this.item.profile = this.context.createProfile({
					name: this.name,
					description: this.desc
				});

			} else if ( this.unsaved ) {
				const changes = {
					name: this.name,
					description: this.desc
				};

				// Disable i18n if required.
				if ( this.name !== this.old_name )
					changes.i18n_key = undefined;

				if ( this.desc !== this.old_desc )
					changes.desc_i18n_key = undefined;

				this.item.profile.update(changes);
			}

			this.unsaved = false;
			this.$emit('navigate', 'data_management.profiles');
		},

		updateContext() {
			this.test_context = this.context.context.context;
		},

		onBeforeChange() {
			if ( this.unsaved )
				return confirm(
					this.t(
						'settings.warn-unsaved',
						'You have unsaved changes. Are you sure you want to leave the editor?'
					));
		}
	}

}

</script>