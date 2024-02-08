import BlockType from "../../extension-support/block-type";
import ArgumentType from "../../extension-support/argument-type";
import Cast from "../../util/cast";
import translations from "./translations.json";
import blockIcon from "./block-icon.png";
import strftime from "./strftime.js";

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

		/**
		 * ステージ用canvasの取得は this.canvas を使うこと。
		 * @type {HTMLCanvasElement}
		 */
		this._canvas = null;

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
					opcode: "strftime",
					blockType: BlockType.REPORTER,
					text: this.message_strftime,
					arguments: {
						FORMAT: {
							type: ArgumentType.STRING,
							defaultValue: "%Y-%m-%d %H:%M:%S",
						},
					},
				},
				{
					opcode: "saveScreenshot",
					blockType: BlockType.COMMAND,
					text: this.message_saveScreenshot,
					arguments: {
						COSTUME_NAME: {
							type: ArgumentType.STRING,
							defaultValue: this.message_saveScreenshot_defaultCostumeName,
						},
						SPRITE_NAME: {
							type: ArgumentType.STRING,
							defaultValue: this.getSpriteNamesMenu[0] || "",
							menu: "spriteNamesMenu",
						},
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

	strftime(args) {
		const format = args.FORMAT || "";
		return strftime(format);
	}

	getSpriteNamesMenu() {
		return this.runtime.targets
			.filter((t) => !t.isStage)
			.map((t) => t.sprite.name);
	}

	async saveScreenshotWithMenu(args) {
		return this.saveScreenshot(args);
	}

	async saveScreenshot(args, util, util2) {
		const spriteName = args.SPRITE_NAME || "";
		const target = this.runtime.getSpriteTargetByName(spriteName)
		if(!target) {
			return
		}
		const costumeName = args.COSTUME_NAME || "";
		if (!costumeName) {
			return;
		}
		window.util = util;
		window.util2 = util2;
		const { width, height } = this.canvas;
		const imageDataUrl = await canvasToDataURL(this.canvas);
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
			// 新規
			this.runtime.vm.addCostume(costumeUpdata.md5, costumeUpdata, target.id);
			target.setVisible(false); // 作ったスプライトターゲットはデフォルトでは非表示にしておく
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
				dataUrlToImageData(imageDataUrl),
				bitmapResolution,
				[
					rotationCenterX / bitmapResolution,
					rotationCenterY / bitmapResolution,
				],
			);
		}
		this.runtime.vm.emitTargetsUpdate();
	}

	/**
	 * ステージの canvas エレメントを取得する。
	 * 動的に querySelector("canvas") を取得するとプログラム実行中にコスチュームエディタ等の画面に移動した際に、
	 * 目的とは別のcanvasが取得されてしまう事があるのでステージ用の canvas を一度取得したらそれを保持しておくようにする。
	 * @returns {HTMLCanvasElement}
	 */
	get canvas() {
		if (!this._canvas) {
			const canvas = document.querySelector("canvas");
			// ステージ用の canvas を見つけたらそれを保持する
			if (canvas && canvas.closest("[class*=stage-wrapper]")) {
				this._canvas = canvas;
			}
		}
		return this._canvas;
	}

	/** @private @type {string} id @return {string} */
	_message(id) {
		const id2 = `${EXTENSION_ID}.${id}`;
		console.log(id2);
		return formatMessage({ id: id2, default: translations.en[id2] });
	}
	get message_strftime() {
		return this._message("strftime");
	}
	get message_saveScreenshot() {
		return this._message("saveScreenshot");
	}
	get message_saveScreenshot_defaultSpriteName() {
		return this._message("saveScreenshot_defaultSpriteName");
	}
	get message_saveScreenshot_defaultCostumeName() {
		return this._message("saveScreenshot_defaultCostumeName");
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
			const { width, height } = canvas;
			const canvas2 = Object.assign(document.createElement("canvas"), {
				width,
				height,
			});
			const ctx = canvas2.getContext("2d");
			// 出来立てのcanvasは真っ白
			// const dataUrl0 = canvas2.toDataURL(type);
			// ここで取得すると真っ黒になる
			// ctx.drawImage(canvas, 0, 0);
			// const dataUrl1 = canvas2.toDataURL(type);
			requestAnimationFrame(() => {
				// 一度描画させたタイミングならちゃんと見えてる画像が取れる
				ctx.drawImage(canvas, 0, 0);
				const dataUrl = canvas2.toDataURL(type);
				resolve(dataUrl);
			});
		});
	}
};

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
