window.onload = function() {
    liff.init({ liffId: "2007231700-OyJjRdeJ" })
        .then(() => {
            if (liff.isLoggedIn()) {
                getProfile();
                console.log("ログインしてます");
            } else {
                liff.login();
            }

            // URLのクエリパラメータを取得
            const urlParams = new URLSearchParams(window.location.search);
            const exercise = urlParams.get('exercise');

            // 筋トレが選択された場合の処理
            if (exercise === 'kintore') {
                // getProfile内でaddExperienceを呼び出すため、ここでは何もしない
            }
        })
        .catch(err => console.error('LIFF初期化エラー:', err));
};

const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz7F09orUiB4xRGfTZKgca06QiPjDdFAy21pEUqT9eOkD3ArhoaDceBwpgXOWkp94naaQ/exec'; // ★ここにデプロイしたGASのウェブアプリURLを設定してください★

function getProfile() {
    liff.getProfile().then(profile => {
        document.getElementById('userName').textContent = profile.displayName;
        fetchUserData(profile.displayName);

        // 筋トレが選択された場合の処理をここに移動
        const urlParams = new URLSearchParams(window.location.search);
        const exercise = urlParams.get('exercise');
        if (exercise === 'kintore') {
            addExperience(50); // 筋トレで50ポイント追加
        }
    }).catch(err => console.error('プロフィール取得エラー:', err));
}

function fetchUserData(userId) {
    const url = GAS_WEB_APP_URL;
    fetch(url + '?username=' + encodeURIComponent(userId) + '&action=getUserData')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                document.getElementById('experience').textContent = data.experience;
                document.getElementById('level').textContent = data.level;
            } else {
                console.log('ユーザーが見つかりませんでした。');
            }
        })
        .catch(error => console.error('ユーザーデータ取得エラー:', error));
}

function addExperience(experiencePoints) {
    const url = GAS_WEB_APP_URL; // スプレッドシートに書き込むGASのURL
    const userId = document.getElementById('userName').textContent; // ユーザー名を取得
    console.log(url + '?action=addExperience&username=' + encodeURIComponent(userId) + '&points=' + experiencePoints)
    fetch(url + '?action=addExperience&username=' + encodeURIComponent(userId) + '&points=' + experiencePoints)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('経験値が追加されました:', experiencePoints);
            console.log('新しい経験値:', data.newExperience);
            // 更新された経験値を表示
            document.getElementById('experience').textContent = data.newExperience;
            updateLevel(data.newExperience);
            fetchUserData(userId);
        })
        .catch(error => console.error('経験値追加エラー:', error));
}

function updateLevel(totalExperience) {
    const url = GAS_WEB_APP_URL; // スプレッドシートに書き込むGASのURL
    console.log(url + '?action=getLevel&experience=' + totalExperience)
    const userId = document.getElementById('userName').textContent; // ユーザー名を取得
    fetch(url + '?action=getLevel&experience=' + totalExperience + '&username=' + encodeURIComponent(userId))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // レベルを更新
            document.getElementById('level').textContent = data.level;
            console.log('新しいレベル:', data.level);
        })
        .catch(error => console.error('レベル更新エラー:', error));
}
