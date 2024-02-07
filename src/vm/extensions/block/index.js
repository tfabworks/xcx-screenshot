import BlockType from "../../extension-support/block-type";
import ArgumentType from "../../extension-support/argument-type";
import Cast from "../../util/cast";
import translations from "./translations.json";
import blockIcon from "./block-icon.png";

const { loadCostume } = require("../../import/load-costume.js");

/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = (messageData) => messageData.defaultMessage;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
	const localeSetup = formatMessage.setup();
	if (localeSetup && localeSetup.translations[localeSetup.locale]) {
		Object.assign(
			localeSetup.translations[localeSetup.locale],
			translations[localeSetup.locale],
		);
	}
};

const EXTENSION_ID = "snapshot";

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = "https://tfabworks.github.io/xcx-snapshot/dist/snapshot.mjs";

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {
	/**
	 * @return {string} - the name of this extension.
	 */
	static get EXTENSION_NAME() {
		return formatMessage({
			id: "snapshot.name",
			default: translations.en["snapshot.name"],
			description: "name of the extension",
		});
	}

	/**
	 * @return {string} - the ID of this extension.
	 */
	static get EXTENSION_ID() {
		return EXTENSION_ID;
	}

	/**
	 * URL to get this extension.
	 * @type {string}
	 */
	static get extensionURL() {
		return extensionURL;
	}

	/**
	 * Set URL to get this extension.
	 * The extensionURL will be changed to the URL of the loading server.
	 * @param {string} url - URL
	 */
	static set extensionURL(url) {
		extensionURL = url;
	}

	/**
	 * Construct a set of blocks for Snapshot.
	 * @param {Runtime} runtime - the Scratch 3.0 runtime.
	 */
	constructor(runtime) {
		/**
		 * The Scratch 3.0 runtime.
		 * @type {Runtime}
		 */
		this.runtime = runtime;

		if (runtime.formatMessage) {
			// Replace 'formatMessage' to a formatter which is used in the runtime.
			formatMessage = runtime.formatMessage;
		}

		/** @type {HTMLCanvasElement} */
		this.canvas = document.querySelector("canvas");

		window.snapshot = this; // DEBUG
		window.loadCostume = loadCostume; // DEBUG
	}

	/**
	 * @returns {object} metadata for this extension and its blocks.
	 */
	getInfo() {
		setupTranslations();
		return {
			id: ExtensionBlocks.EXTENSION_ID,
			name: ExtensionBlocks.EXTENSION_NAME,
			extensionURL: ExtensionBlocks.extensionURL,
			blockIconURI: blockIcon,
			showStatusButton: false,
			blocks: [
				{
					opcode: "saveSnapshot",
					blockType: BlockType.COMMAND,
					text: formatMessage({
						id: "snapshot.saveSnapshot",
						default: translations.en["snapshot.saveSnapshot"],
						description: "Save ths snapshot",
					}),
					arguments: {
						NAME: {
							type: ArgumentType.STRING,
							defaultValue: translations.en["snapshot.defaultName"],
						},
					},
				},
			],
			menus: {},
		};
	}

	async saveSnapshot(args) {
		const name = args.NAME || "";
		if (name === "") {
			return;
		}
		const dataUrl = await canvasToDataURL(document.querySelector("canvas"))
		console.log(dataUrl)
		window.dataURL = dataUrl;
		const runtime = this.runtime;
		const storage = this.runtime.storage;
		const costumeIndex = runtime.vm.editingTarget.getCostumeIndexByName(name);
		if (costumeIndex < 0) {
			const asset = storage.createAsset(
				storage.AssetType.ImageBitmap,
				storage.DataFormat.PNG,
				dataUrlToUint8Array(dataUrl),
				null,
				true, // generate md5
			);
			const costume = {
				asset,
				name, // コスチュームの名前になる
				dataFormat: storage.DataFormat.PNG,
				assetId: asset.assetId,
				md5: `${asset.assetId}.${storage.DataFormat.PNG}`,
			};
			runtime.vm.addCostume(costume.md5, costume);
		} else {
			// 更新
			const costume = runtime.vm.editingTarget.getCostumes()[costumeIndex];
			const imageData = convertUrlToImageData(dataUrl);
			runtime.vm.updateBitmap(
				costumeIndex,
				imageData,
				costume.rotationCenterX,
				costume.rotationCenterX,
				costume.bitmapResolution,
			);
		}

		window.dataURL = dataUrl; //DEBUG
		window.costume = costume; //DEBUG
	}
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 */
const canvasToDataURL = async (canvas, type = "image/png") => {
	if (canvas.getContext("2d")) {
		return Promise.resolve(canvas.toDataURL(type));
	}
	if (["webgl2", "webgl"].some((t) => !!canvas.getContext(t))) {
		return new Promise((resolve) => {
			const {width, height} = canvas;
 			const canvas2 = Object.assign(document.createElement("canvas"), {width, height})
			const ctx = canvas2.getContext("2d")
			const dataUrls = []
			// 出来立てのcanvasは真っ白
			dataUrls.push(canvas2.toDataURL(type))
			// ここで取得すると真っ黒になる
			ctx.drawImage(canvas, 0, 0)
			dataUrls.push(canvas2.toDataURL(type))
			requestAnimationFrame(() => {
				// 一度描画させたタイミングならちゃんと見えてる画像が取れる
				ctx.drawImage(canvas, 0, 0)
				dataUrls.push(canvas2.toDataURL(type))
				console.log(dataUrls)
				resolve(dataUrls[2])
			});
		});
	}
};

const dataUrlToUint8Array = url => base64ToUint8Array(url.substr(url.indexOf(';base64,')+8)||'')
const base64ToUint8Array = b64 => new Uint8Array([].map.call(atob(b64),c=>c.charCodeAt(0)))

export { ExtensionBlocks as default, ExtensionBlocks as blockClass };
