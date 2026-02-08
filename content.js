(() => {
    /**
     * 定数定義
     */
    const CONFIG = {
        DEFAULT_SELECT_MIN_LENGTH: 5,
        CLICK_THRESHOLD: 3,
        POPUP_ID: 'gemma-popup',
        POPUP_STYLE_CLASS: 'gemma-popup-style',
        CONNECT_NAME: 'stream-translate',
        FIRST_TEXT: '🤔 翻訳中...'
    };

    /**
     * UIと状態の管理クラス
     */
    class GemmaTranslationApp {
        constructor() {
            this.isGenerating = false;
            this.currentPort = null;
            this.mouseStartPoint = { x: 0, y: 0 };
        }

        /**
         * 初期化：イベントリスナーの登録
         */
        init() {
            document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        }

        /**
         * ポップアップの削除とリセット
         */
        removePopup() {
            const popup = document.getElementById(CONFIG.POPUP_ID);
            if (popup) popup.remove();

            if (this.currentPort) {
                this.currentPort.disconnect();
                this.currentPort = null;
            }
            this.isGenerating = false;
        }

        /**
         * ポップアップの作成と配置
         */
        createPopup(selection, initialText) {
            let popup = document.getElementById(CONFIG.POPUP_ID);
            if (!popup) {
                popup = document.createElement('div');
                popup.id = CONFIG.POPUP_ID;
                popup.classList.add(CONFIG.POPUP_STYLE_CLASS);
                document.body.appendChild(popup);
            }

            // 選択範囲に基づいて位置を決定
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
            popup.style.left = `${rect.left + window.scrollX}px`;
            popup.innerText = initialText;
        }

        /**
         * ポップアップ内のテキストを更新
         */
        updatePopupText(chunk, selection) {
            const popup = document.getElementById(CONFIG.POPUP_ID);
            if (!popup) return;

            if (popup.innerText === CONFIG.FIRST_TEXT) {
                popup.innerText = "";
            }
            popup.innerText += chunk;

            // 画面外にはみ出す場合の自動調整
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (window.innerHeight < rect.bottom + popup.offsetHeight) {
                popup.style.top = `${(rect.bottom + window.scrollY) - (rect.bottom + popup.offsetHeight - window.innerHeight)}px`;
            }
        }

        /**
         * 特定のカーソルスタイルを持つ要素か判定
         */
        isColResizeCursor(el) {
            return getComputedStyle(el).cursor === 'col-resize';
        }

        /**
         * マウスダウン時の座標保存
         */
        handleMouseDown(e) {
            this.mouseStartPoint.x = e.clientX;
            this.mouseStartPoint.y = e.clientY;
        }

        /**
         * マウスアップ時の翻訳処理
         */
        async handleMouseUp(e) {
            // 入力要素内やリサイズ中の場合は無視
            if (e.target.closest('input, textarea, [contenteditable="true"]') || this.isColResizeCursor(e.target)) {
                return;
            }

            if (!chrome.runtime?.id) {
                console.warn("拡張機能が更新されています。ページをリロードしてください。");
                return;
            }

            e.stopPropagation();

            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            const popup = document.getElementById(CONFIG.POPUP_ID);

            // ポップアップ自体のクリックは無視
            if (popup?.contains(e.target)) return;

            // クリック判定（ほとんど動いていない場合）
            const diffX = Math.abs(e.clientX - this.mouseStartPoint.x);
            const diffY = Math.abs(e.clientY - this.mouseStartPoint.y);
            if (diffX < CONFIG.CLICK_THRESHOLD && diffY < CONFIG.CLICK_THRESHOLD) {
                this.removePopup();
                selection.removeAllRanges();
                return;
            }

            // 最小文字数をストレージから取得（キャッシュなしで毎回取得するが、オーバーヘッドは少ない）
            const { selectMinTextLength } = await new Promise(resolve => {
                chrome.storage.sync.get({ selectMinTextLength: CONFIG.DEFAULT_SELECT_MIN_LENGTH }, resolve);
            });

            // 選択解除または規定文字数以下の場合は削除
            if (selection.isCollapsed || selectedText.length < selectMinTextLength) {
                if (popup) this.removePopup();
                return;
            }

            // 既存の処理をリセットして開始
            this.removePopup();
            this.isGenerating = true;
            this.createPopup(selection, CONFIG.FIRST_TEXT);

            // バックグラウンドとの通信開始
            this.currentPort = chrome.runtime.connect({ name: CONFIG.CONNECT_NAME });
            this.currentPort.postMessage({ text: selectedText });

            this.currentPort.onMessage.addListener((msg) => {
                if (msg.done) {
                    this.isGenerating = false;
                    return;
                }
                if (msg.error) {
                    const popup = document.getElementById(CONFIG.POPUP_ID);
                    if (popup) {
                        popup.innerText = `❌ ${msg.error}`;
                        popup.style.color = '#ff4444';
                    }
                    this.isGenerating = false;
                    return;
                }
                if (msg.chunk) {
                    this.updatePopupText(msg.chunk, selection);
                }
            });
        }
    }

    // アプリケーションの起動
    const app = new GemmaTranslationApp();
    app.init();

})();
