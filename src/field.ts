'use strict';

/* Dependencies */
import merge from 'deepmerge';
import RFC4122 from 'rfc4122';
import {
	HighSystems,
	HighSystemsOptions,
	HighSystemsRequest
} from '@highsystems/client';

/* Globals */
const VERSION = require('../package.json').version;
const IS_BROWSER = typeof(window) !== 'undefined';
const rfc4122 = new RFC4122();

/* Main Class */
export class HSField {

	public readonly CLASS_NAME = 'HSField';
	static readonly CLASS_NAME = 'HSField';

	static readonly VERSION: string = VERSION;

	/**
	 * The default settings of a `HighSystems` instance
	 */
	static defaults: HSFieldOptions = {
		highsystems: {
			instance: IS_BROWSER ? window.location.host.split('.')[0] : ''
		},

		applicationId: '',
		tableId: '',
		fid: -1
	};

	/**
	 * An internal id (guid) used for tracking/managing object instances
	 */
	public id: string;

	private _hs: HighSystems;
	private _applicationId: string = '';
	private _tableId: string = '';
	private _fid: number = -1;
	private _data: Record<any, any> = {};

	constructor(options?: Partial<HSFieldOptions>){
		this.id = rfc4122.v4();

		const {
			highsystems,
			...classOptions
		} = options || {};

		if(HighSystems.IsHighSystems(highsystems)){
			this._hs = highsystems;
		}else{
			this._hs = new HighSystems(merge.all([
				HSField.defaults.highsystems,
				highsystems || {}
			]));
		}

		const settings = merge(HSField.defaults, classOptions);

		this.setTableId(settings.tableId)
			.setFid(settings.fid);

		return this;
	}

	/**
	 * This method clears the HSField instance of any trace of the existing field, but preserves defined connection settings.
	 */
	clear(): this {
		this._fid = -1;
		this._data = {};

		return this;
	}

	/**
	 * This method deletes the field from HighSystems, then calls `.clear()`.
	 */
	async delete({ requestOptions }: HighSystemsRequest = {}) {
		const fid = this.get('id');
		const fin = (deletedFieldIds: number[]) => {
			this.clear();

			return {
				deletedFieldIds,
				errors: []
			};
		}

		if(!fid){
			return fin([ fid ]);
		}

		try {
			const results = await this._hs.deleteField({
				appid: this.getApplicationId(),
				tableid: this.getTableId(),
				fieldid: fid,
				requestOptions
			});

			this.clear();

			return results;
		}catch(err: any){
			if(err.description === `Field: ${fid} was not found.`){
				return fin([ fid ]);
			}

			throw err;
		}
	}

	/**
	 * Get an attribute value
	 *
	 * @param attribute High Systems Field attribute name
	 */
	get(attribute: any): any {
		if(attribute === 'applicationId' || attribute === 'appId'){
			return this.getApplicationId();
		}else
		if(attribute === 'tableId' || attribute === 'tableId'){
			return this.getTableId();
		}else
		if(attribute === 'fid' || attribute === 'id' || attribute === 'fieldId'){
			return this.getFid();
		}

		return this._data[attribute];
	}

	/**
	 * Get the set HSField Application ID
	 */
	getApplicationId(): string {
		return this._applicationId;
	}

	/**
	 * Get the set HSField Field ID
	 */
	getFid(): number {
		return this._fid;
	}

	/**
	 * Get the set HSField Table ID
	 */
	getTableId(): string {
		return this._tableId;
	}

	/**
	 * Load the High Systems Field attributes and permissions
	 */
	async load({ requestOptions }: HighSystemsRequest = {}) {
		const results = await this._hs.getField({
			appid: this.getApplicationId(),
			tableid: this.getTableId(),
			fieldid: this.getFid(),
			requestOptions
		});

		Object.entries(results).forEach(([ attribute, value ]) => {
			this.set(attribute, value);
		});

		return this._data;
	}

	/**
	 * If a field id is not defined, this will execute the createField option. After a successful
	 * createField, or if a field id was previously defined, this will execute an updateField.
	 *
	 * If `attributesToSave` is defined, then only configured attributes in this array will be saved.
	 *
	 * If this executes a createField, the newly assigned Field ID is automatically stored internally.
	 *
	 * After a successful save, all new attributes are available for use.
	 *
	 * @param attributesToSave Array of attributes to save
	 */
	async save({
		attributesToSave,
		requestOptions
	}: HighSystemsRequest & {
		attributesToSave?: string[];
	} = {}) {
		const data: any = {
			appid: this.getApplicationId(),
			tableid: this.getTableId(),
			requestOptions
		};

		const saveable: string[] = Object.keys(this._data);

		saveable.filter((attribute) => {
			return !attributesToSave || attributesToSave.indexOf(attribute) !== -1;
		}).forEach((attribute) => {
			data[attribute] = this.get(attribute);
		});

		let results;

		if(this.getFid() > 0){
			data.fieldId = this.getFid();

			results = await this._hs.putField(data);
		}else{
			results = await this._hs.postField(data);
		}

		Object.entries(results).forEach(([ attribute, val ]) => {
			this.set(attribute, val);
		});

		return this._data;
	}

	/**
	 * Sets the passed in `value` associated with the `attribute` argument.
	 *
	 * @param attribute High Systems Field attribute name
	 * @param value Attribute value
	 */
	set(attribute: string, value: any): this {
		if(attribute === 'applicationId' || attribute === 'appId'){
			return this.setApplicationId(value);
		}else
		if(attribute === 'tableId' || attribute === 'tableId'){
			return this.setTableId(value);
		}else
		if(attribute === 'fid' || attribute === 'id' || attribute === 'fieldId'){
			return this.setFid(value);
		}
	
		this._data[attribute] = value;

		return this;
	}

	/**
	 * Sets the defined Application ID
	 *
	 * An alias for `.set('applicationId', 'xxxxxxxxx')`.
	 *
	 * @param applicationId High Systems Field Application ID
	 */
	setApplicationId(applicationId: string): this {
		this._applicationId = applicationId;

		return this;
	}

	/**
	 * Sets the defined Field ID
	 *
	 * An alias for `.set('id', 6)` and `.set('fid', 6)`.
	 *
	 * @param fid High Systems Field ID
	 */
	setFid(fid: number): this {
		this._fid = fid;

		return this;
	}

	/**
	 * Sets the defined Table ID
	 *
	 * An alias for `.set('tableId', 'xxxxxxxxx')`.
	 *
	 * @param tableId High Systems Field Table ID
	 */
	setTableId(tableId: string): this {
		this._tableId = tableId;

		return this;
	}

	/**
	 * Rebuild the HSField instance from serialized JSON
	 *
	 * @param json HSField serialized JSON
	 */
	fromJSON(json: string | HSFieldJSON): this {
		if(typeof(json) === 'string'){
			json = JSON.parse(json);
		}

		if(typeof(json) !== 'object'){
			throw new TypeError('json argument must be type of object or a valid JSON string');
		}

		if(json.highsystems){
			this._hs = new HighSystems(json.highsystems);
		}

		if(json.tableId){
			this.setTableId(json.tableId);
		}

		if(json.fid || json.id){
			this.setFid(json.fid || json.id || -1);
		}

		if(json.data){
			Object.entries(json.data).forEach(([ key, value ]) => {
				this.set(key, value);
			});
		}

		return this;
	}

	/**
	 * Serialize the HSField instance into JSON
	 */
	toJSON(): HSFieldJSON {
		return {
			highsystems: this._hs.toJSON(),
			tableId: this.getTableId(),
			fid: this.getFid(),
			data: merge({}, this._data)
		};
	}

	/**
	 * Create a new HSField instance from serialized JSON
	 *
	 * @param json HSField serialized JSON
	 */
	static fromJSON(json: string | HSFieldJSON): HSField {
		if(typeof(json) === 'string'){
			json = JSON.parse(json);
		}

		if(typeof(json) !== 'object'){
			throw new TypeError('json argument must be type of object or a valid JSON string');
		}

		const newField = new HSField();

		return newField.fromJSON(json);
	}

	/**
	 * Test if a variable is a `@highsystems/field` object
	 *
	 * @param obj A variable you'd like to test
	 */
	static IsHSField(obj: any): obj is HSField {
		return ((obj || {}) as HSField).CLASS_NAME === HSField.CLASS_NAME;
	}

	/**
	 * Returns a new HSField instance built off of `options`, that inherits configuration data from the passed in `attributes` argument.
	 *
	 * @param options HSField instance options
	 * @param attributes High Systems Field attribute data
	 */
	static NewField(options: Partial<HSFieldOptions>, attributes?: Record<any, any>): HSField {
		const newField = new HSField(options);

		if(attributes){
			Object.entries(attributes).forEach(([ attribute, value ]) => {
				newField.set(attribute, value);
			});
		}

		return newField;
	}

}

/* Types */
export type HSFieldOptions = {
	highsystems: HighSystemsOptions | HighSystems;
	applicationId: string;
	tableId: string;
	fid: number;
}

export type HSFieldJSON = {
	highsystems?: HighSystemsOptions;
	tableId: string;
	fid: number;
	id?: number;
	data?: Record<any, any>;
}

/* Export to Browser */
if(IS_BROWSER){
	window.HSField = exports;
}
