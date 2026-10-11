# РуТрекер — неофициальный плагин для Chromium

Сборка расширения «РуТрекер» для браузеров на Chromium (Chrome, Brave, Edge, Opera, Vivaldi),
переведённая с Manifest V2 на Manifest V3.

**Это неофициальная сборка.** Она не связана с администрацией RuTracker.org и не выпускается ею.
Оригинал — расширение для Firefox [`rto@rto.rto`](https://addons.mozilla.org/firefox/addon/rutracker-add-on/)
версии 0.9.32 под лицензией MPL-2.0; здесь он адаптирован под Chromium.

## Установка

1. Скачать репозиторий и распаковать (или `git clone`).
2. Открыть `chrome://extensions` (в Brave — `brave://extensions`, в Edge — `edge://extensions`).
3. Включить «Режим разработчика».
4. «Загрузить распакованное расширение» → выбрать папку репозитория.
5. Открыть настройки плагина и выбрать «Прокси: Включено» или «Включать автоматически».

Расширение не опубликовано в Chrome Web Store, поэтому ставится только так.

## Что изменено против оригинала

Исходный бандл собран webpack'ом из TypeScript; исходников нет, поэтому правки внесены
в собранный `bundle/background.js` — только там, где иначе расширение не запускается в MV3.

| Файл | Изменение |
| --- | --- |
| `manifest.json` | `manifest_version: 3`; `background.service_worker` вместо `background.page` и `scripts`; `browser_action` → `action`; `web_accessible_resources` в MV3-формате; `permissions` без `webRequestBlocking`, добавлен `declarativeNetRequestWithHostAccess` |
| `sw.js` | новый файл: service worker вместо фоновой страницы. Подставляет шимы `window` и `localStorage`, регистрирует слушателей, чтобы worker просыпался, грузит бандл и обновляет правила заголовка при смене настроек |
| `bundle/background.js` | `chrome.extension.getURL` → `chrome.runtime.getURL`; `chrome.browserAction` → `chrome.action`; отдельная точка входа для страниц расширения (`App.initForPage`) вместо `chrome.extension.getBackgroundPage`; `chrome.management` вызывается только при наличии разрешения; live reload отключён; переадресация выполняется переходом вкладки, а не `redirectUrl`; заголовок `BB-WebExt` ставится правилом `declarativeNetRequest`; удалён мёртвый модуль `AddonLiveReload` (180 строк) и висячая ссылка на отсутствующий source map |
| `pages/*.html` | вместо `bundle/page.js` грузится `bundle/background.js` |
| удалено | `background.html`, `proxyScript.js`, `bundle/page.js`, `META-INF/` (подпись Firefox) |

Ограничения переноса:

* `webRequestBlocking` в MV3 недоступен — вместо блокирующей подстановки заголовка используется
  `declarativeNetRequest`, а переадресация зеркал исходный запрос не отменяет;
* режим PAC работает (`chrome.proxy.settings`), режим `browser.proxy.onRequest` был только у Firefox;
* повторная загрузка расширения при изменении файлов (live reload) отключена.

## Проверено

Brave 155.1.97.56, Chromium 139+, Windows 11:

* расширение загружается, service worker стартует без ошибок;
* страницы настроек и попапа открываются и инициализируются (версия 0.9.32 отображается);
* `https://rutracker.org/forum/index.php` открывается через PAC-прокси `ps1.blockme.site:443`.

Не проверялось: контекстное меню, авторежим прокси по вкладкам, экран ошибки PAC.

## Альтернатива без прокси

Если провайдер не мешает ECH, сайт открывается без плагина: настройки браузера → конфиденциальность
и безопасность → «Использовать безопасный DNS» → Cloudflare (1.1.1.1), затем проверка на
<https://www.cloudflare.com/ssl/encrypted-sni/>.

## Лицензия

MPL-2.0 (см. [LICENSE](LICENSE)) — как у оригинала. Изменённые файлы остаются под той же лицензией;
список изменений приведён выше и в истории коммитов.
