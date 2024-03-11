import BlockType from "../../extension-support/block-type";
import ArgumentType from "../../extension-support/argument-type";
import Cast from "../../util/cast";
import translations from "./translations.json";
import blockIcon from "./block-icon.png";

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

const EXTENSION_ID = "screenshot";

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL =
	"https://tfabworks.github.io/xcx-screenshot/dist/screenshot.mjs";

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {

	/**
     * A translation object which is used in this class.
     * @param {FormatObject} formatter - translation object
     */
	static set formatMessage (formatter) {
		formatMessage = formatter;
		if (formatMessage) setupTranslations();
	}

	/**
	 * @return {string} - the name of this extension.
	 */
	static get EXTENSION_NAME() {
		return formatMessage({
			id: "screenshot.name",
			default: translations.en["screenshot.name"],
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
	 * Construct a set of blocks for Screenshot.
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

		window.screenshot = this; // DEBUG
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
					opcode: "saveScreenshot",
					blockType: BlockType.COMMAND,
					text: this.message_saveScreenshot,
					arguments: {
						COSTUME_NAME: {
							type: ArgumentType.STRING,
							defaultValue: this.message_saveScreenshot_defaultCostumeName,
						},
						// SPRITE_NAME: {
						// 	type: ArgumentType.STRING,
						// 	defaultValue: this.getSpriteNamesMenu[0] || "",
						// 	menu: "spriteNamesMenu",
						// },
					},
				},
			],
			menus: {
				spriteNamesMenu: {
					items: "getSpriteNamesMenu",
				},
			},
		};
	}

	getSpriteNamesMenu() {
		return this.runtime.targets
			.filter((t) => !t.isStage)
			.map((t) => t.sprite.name);
	}

	async saveScreenshot(args, util) {
		const spriteName = args.SPRITE_NAME || "";
		const myTarget = util.target //コマンドの呼び出し元ターゲット
		const target = this.runtime.getSpriteTargetByName(spriteName) || myTarget
		const costumeName = args.COSTUME_NAME || "";
		if (!costumeName) {
			return;
		}
		const imageDataUrl = await new Promise(resolve => {
            this.runtime.renderer.requestSnapshot(imageDataURL => {
                resolve(imageDataURL);
            });
        });
		// 画像バイナリを Asset に変換
		const asset = this.runtime.storage.createAsset(
			this.runtime.storage.AssetType.ImageBitmap,
			this.runtime.storage.DataFormat.PNG,
			dataUrlToUint8Array(imageDataUrl),
			null, // null: auto genenrate id
			true, // true: auto generate md5
		);
		// コスチュームの雛形オブジェクト
		const costumeUpdata = {
			name: costumeName,
			asset,
			dataFormat: asset.dataFormat,
			assetId: asset.assetId,
			md5: `${asset.assetId}.${asset.dataFormat}`,
		};
		// 名前から既存のコスチュームを探す
		const costume = target.getCostumes().find((c) => c.name === costumeName);
		if (!costume) {
			// 新規（addCostumeすると最新のコスチュームが選択されてしまうが、コスチュームの選択は元のままにする）
			const currentCostume = target.currentCostume
			await this.runtime.vm.addCostume(costumeUpdata.md5, costumeUpdata, target.id);
			target.setCostume(currentCostume)
		} else {
			// 上書き
			// 本当は runtime.vm.updateBitmap() を使えば楽ぽいけど、ターゲットが editingTarget 固定なので使えないので、必要な処理を参考にしつつ自分で書いた
			// https://github.com/xcratch/scratch-vm/blob/05a1dcd2bd9037741de8cbb7620edbbb5eb1284d/src/virtual-machine.js#L888-L939
			Object.assign(costume, costumeUpdata);
			const bitmapResolution = 2; // ビットマップの場合は２固定ポイ? https://github.com/xcratch/scratch-gui/blob/a255b910d31098fd728221fc6c27a329d79f184f/src/containers/paint-editor-wrapper.jsx#L34-L39
			const rotationCenterX = width / 2;
			const rotationCenterY = height / 2;
			costume.size = [width, height];
			costume.bitmapResolution = bitmapResolution;
			// レンダラーが持ってるBitmapも更新する必要があるっぽい
			this.runtime.renderer.updateBitmapSkin(
				costume.skinId,
				await dataUrlToImageData(imageDataUrl),
				bitmapResolution,
				[
					rotationCenterX / bitmapResolution,
					rotationCenterY / bitmapResolution,
				],
			);
			this.runtime.vm.emitTargetsUpdate();
		}
	}

	/** @private @type {string} id @return {string} */
	_message(id) {
		const id2 = `${EXTENSION_ID}.${id}`;
		console.log(id2);
		return formatMessage({ id: id2, default: translations.en[id2] });
	}
	/** @private */
	get message_saveScreenshot() {
		return this._message("saveScreenshot");
	}
	/** @private */
	get message_saveScreenshot_defaultCostumeName() {
		return this._message("saveScreenshot_defaultCostumeName");
	}
}


const dataUrlToUint8Array = (url) =>
	base64ToUint8Array(url.substr(url.indexOf(";base64,") + 8) || "");

const base64ToUint8Array = (b64) =>
	new Uint8Array([].map.call(atob(b64), (c) => c.charCodeAt(0)));

const dataUrlToImageData = (url) =>
	new Promise((resolve, reject) => {
		if (url == null || url === "") {
			return reject();
		}
		const img = Object.assign(new Image(), {
			src: url,
			onerror: reject,
			onload: () => {
				const canvas = Object.assign(document.createElement("canvas"), {
					width: img.width,
					height: img.height,
				});
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				resolve(imageData);
			},
		});
	});

export { ExtensionBlocks as default, ExtensionBlocks as blockClass };
