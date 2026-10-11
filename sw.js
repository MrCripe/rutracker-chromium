// Service worker MV3 для сборки под браузеры на Chromium.
// Оригинальный бандл писался под MV2-фоновую страницу: ему нужны window, localStorage
// и постоянный набор слушателей. Здесь создаётся совместимое окружение и грузится бандл.

self.window = self;

// localStorage в service worker нет; бандл использует его для служебных флагов.
// Данные живут только до перезапуска service worker — на работу прокси это не влияет.
const memoryStorage = new Map();
self.localStorage = {
	get length() {
		return memoryStorage.size;
	},
	key(index) {
		return Array.from(memoryStorage.keys())[index] ?? null;
	},
	getItem(key) {
		const value = memoryStorage.get(String(key));
		return value === undefined ? null : value;
	},
	setItem(key, value) {
		memoryStorage.set(String(key), String(value));
	},
	removeItem(key) {
		memoryStorage.delete(String(key));
	},
	clear() {
		memoryStorage.clear();
	},
};

// Service worker засыпает, поэтому регистрируем слушателей до инициализации бандла:
// эти события будят worker, после чего он заново поднимает приложение и пересчитывает
// состояние прокси для активной вкладки (ProxyPAC.reload -> ProxyAuto.enable).
chrome.tabs.onActivated.addListener(() => {});
chrome.tabs.onUpdated.addListener(() => {});
chrome.windows.onFocusChanged.addListener(() => {});
chrome.storage.onChanged.addListener(() => {});

// Значение заголовка BB-WebExt собирается из настроек, поэтому правила обновляются
// вместе с ними.
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName !== 'local' || !changes.settings) {
		return;
	}
	const app = self.addonBackgroundApp;
	if (app && app.settings && app.settings.initialized) {
		app.webRequest.updateHeaderRules().catch(error => console.error(error));
	}
});

importScripts('bundle/background.js');
